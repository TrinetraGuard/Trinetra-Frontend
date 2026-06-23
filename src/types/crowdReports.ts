import type { DensityLevel } from '@/lib/adminTheme';
import type { CrowdTrend } from '@/types/cctvAnalytics';
import type { CCTVStatus } from '@/types/cctv';

export interface CrowdLogEntry {
  id: string;
  cameraId: string;
  placeName: string;
  timestamp: string;
  peopleCount: number;
  densityPercentage: number;
  densityLevel: DensityLevel;
  hour: number;
  dayOfWeek: string;
}

export interface DensityReport {
  cameraId: string;
  placeName: string;
  currentDensity: number;
  densityLevel: DensityLevel;
  densityPercentage: number;
  peopleCount: number;
  maxCapacity: number;
  peakDensity: number;
  averageDensity: number;
  trend: CrowdTrend;
  lastHourChange: number;
  status: CCTVStatus;
  detectionAvailable: boolean;
  lastUpdate: Date;
  coordinates: { lat: number; lng: number };
}

export interface TimeSlotAnalysis {
  hour: number;
  averagePeople: number;
  peakPeople: number;
  averageDensity: number;
  occurrences: number;
  label: string;
}

export interface CameraLogSummary {
  cameraId: string;
  placeName: string;
  totalVisits: number;
  averagePeople: number;
  peakPeople: number;
  peakTime: string;
  quietTime: string;
  busiestDay: string;
  coordinates: { lat: number; lng: number };
  timeSlots: TimeSlotAnalysis[];
}

export interface CrowdPrediction {
  cameraId: string;
  placeName: string;
  predictedPeople: number;
  predictedDensity: number;
  densityLevel: DensityLevel;
  confidence: number;
  timeSlot: string;
  date: Date;
  trend: CrowdTrend;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  coordinates: { lat: number; lng: number };
  historicalAverage: number;
  predictedChange: number;
}

export type CrowdDateRange = 'today' | 'week' | 'month' | 'all';
export type CrowdTimeWindow = '1h' | '6h' | '24h' | '7d';
export type PredictionTimeframe = 'today' | 'tomorrow' | 'week';
