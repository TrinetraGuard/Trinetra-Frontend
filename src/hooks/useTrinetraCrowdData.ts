/**
 * Hooks for crowd logs, density reports, and predictions from the real backend.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  getCrowdDensity,
  getCrowdLogs,
  getCrowdPredictions,
  type CrowdDensityReport,
  type CrowdLogEntry,
  type CrowdPrediction,
} from '@/lib/trinetraApi';

// ── Crowd Logs ─────────────────────────────────────────────────────────────

export function useCrowdLogs(cameraId?: string, hours = 24) {
  const [logs, setLogs] = useState<CrowdLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCrowdLogs(cameraId, hours);
      setLogs(data);
      setError(null);
    } catch {
      setError('Failed to load crowd logs');
    } finally {
      setLoading(false);
    }
  }, [cameraId, hours]);

  useEffect(() => {
    void fetch();
    const id = setInterval(() => void fetch(), 60_000);
    return () => clearInterval(id);
  }, [fetch]);

  const totalPeople = logs.reduce((s, l) => s + l.people_count, 0);
  const avgPeople = logs.length > 0 ? Math.round(totalPeople / logs.length) : 0;
  const maxPeople = logs.length > 0 ? Math.max(...logs.map((l) => l.people_count)) : 0;

  return { logs, loading, error, totalPeople, avgPeople, maxPeople, refresh: fetch };
}

// ── Crowd Density ──────────────────────────────────────────────────────────

export function useCrowdDensity(dateStr?: string) {
  const [density, setDensity] = useState<CrowdDensityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCrowdDensity(dateStr);
      setDensity(data);
      setError(null);
    } catch {
      setError('Failed to load crowd density');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    void fetch();
    const id = setInterval(() => void fetch(), 30_000);
    return () => clearInterval(id);
  }, [fetch]);

  const totalPeople = density.reduce((s, d) => s + d.current_count, 0);
  const avgDensity =
    density.length > 0
      ? Math.round(
          density.reduce((s, d) => {
            const maxBucket = d.today_buckets.reduce((m, b) => Math.max(m, b.avg_people), 0);
            const pct = d.today_buckets.some((b) => b.avg_people > 0)
              ? (maxBucket / 150) * 100
              : 0;
            return s + pct;
          }, 0) / density.length,
        )
      : 0;

  return { density, loading, error, totalPeople, avgDensity, refresh: fetch };
}

// ── Crowd Predictions ──────────────────────────────────────────────────────

export type PredictionWindow = '1h' | '6h' | '24h';

export function useCrowdPredictions() {
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCrowdPredictions();
      setPredictions(data);
      setError(null);
    } catch {
      setError('Failed to load crowd predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
    const id = setInterval(() => void fetch(), 120_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { predictions, loading, error, refresh: fetch };
}
