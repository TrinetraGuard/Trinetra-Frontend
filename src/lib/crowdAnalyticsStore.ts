import {
  computeDensityLevel,
  computeDensityPercentage,
  DEFAULT_CAMERA_MAX_CAPACITY,
} from '@/lib/cctvAnalytics';
import type { CrowdLogEntry } from '@/types/crowdReports';

const STORAGE_KEY = 'trinetra_crowd_logs_v1';
const MAX_ENTRIES = 5000;
const DAYS_TO_KEEP = 90;

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function loadRawLogs(): CrowdLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CrowdLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRawLogs(logs: CrowdLogEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  notifyListeners();
}

function pruneLogs(logs: CrowdLogEntry[]): CrowdLogEntry[] {
  const cutoff = Date.now() - DAYS_TO_KEEP * 24 * 60 * 60 * 1000;
  return logs
    .filter((entry) => new Date(entry.timestamp).getTime() >= cutoff)
    .slice(-MAX_ENTRIES);
}

export function getCrowdLogs(): CrowdLogEntry[] {
  return loadRawLogs();
}

export function subscribeCrowdLogs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function appendCrowdLog(input: {
  cameraId: string;
  placeName: string;
  peopleCount: number;
  timestamp?: Date;
}): CrowdLogEntry {
  const timestamp = input.timestamp ?? new Date();
  const maxCapacity = DEFAULT_CAMERA_MAX_CAPACITY;
  const densityPercentage = computeDensityPercentage(input.peopleCount, maxCapacity);
  const entry: CrowdLogEntry = {
    id: `${input.cameraId}-${timestamp.getTime()}`,
    cameraId: input.cameraId,
    placeName: input.placeName,
    timestamp: timestamp.toISOString(),
    peopleCount: input.peopleCount,
    densityPercentage,
    densityLevel: computeDensityLevel(input.peopleCount, maxCapacity),
    hour: timestamp.getHours(),
    dayOfWeek: DAYS_OF_WEEK[timestamp.getDay()],
  };

  const next = pruneLogs([...loadRawLogs(), entry]);
  saveRawLogs(next);
  return entry;
}

export function filterLogsByDateRange(
  logs: CrowdLogEntry[],
  range: 'today' | 'week' | 'month' | 'all'
): CrowdLogEntry[] {
  if (range === 'all') return logs;

  const now = Date.now();
  const ms =
    range === 'today'
      ? 24 * 60 * 60 * 1000
      : range === 'week'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

  return logs.filter((entry) => now - new Date(entry.timestamp).getTime() <= ms);
}

export function filterLogsByTimeWindow(
  logs: CrowdLogEntry[],
  window: '1h' | '6h' | '24h' | '7d'
): CrowdLogEntry[] {
  const ms =
    window === '1h'
      ? 60 * 60 * 1000
      : window === '6h'
        ? 6 * 60 * 60 * 1000
        : window === '24h'
          ? 24 * 60 * 60 * 1000
          : 7 * 24 * 60 * 60 * 1000;

  const cutoff = Date.now() - ms;
  return logs.filter((entry) => new Date(entry.timestamp).getTime() >= cutoff);
}
