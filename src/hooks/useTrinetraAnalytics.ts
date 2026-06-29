/**
 * Real-time crowd analytics hook.
 *
 * Strategy:
 *  1. On mount, fetch initial snapshot via REST GET /api/v1/analytics/live
 *  2. Open WebSocket and apply patch updates as they arrive
 *  3. Re-sync from REST every 30 s as a safety fallback
 *  4. Gracefully falls back to empty state if backend is unreachable
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createAnalyticsWebSocket,
  getLiveAnalytics,
  type LiveAnalyticsResponse,
  type LiveCameraAnalytics,
  type SiteSummary,
  type WsMessage,
} from '@/lib/trinetraApi';

const REST_REFRESH_MS = 30_000;

const EMPTY_SUMMARY: SiteSummary = {
  total_people: 0,
  active_cameras: 0,
  total_cameras: 0,
  high_density_count: 0,
  critical_count: 0,
  last_update: new Date().toISOString(),
};

export function useTrinetraAnalytics() {
  const [cameras, setCameras] = useState<LiveCameraAnalytics[]>([]);
  const [summary, setSummary] = useState<SiteSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyResponse = useCallback((data: LiveAnalyticsResponse) => {
    setCameras(data.cameras);
    setSummary(data.summary);
    setLastUpdate(new Date());
    setLoading(false);
    setError(null);
  }, []);

  const fetchRest = useCallback(async () => {
    try {
      const data = await getLiveAnalytics();
      applyResponse(data);
    } catch (err) {
      setError('Cannot reach Trinetra AI backend. Showing cached data.');
    }
  }, [applyResponse]);

  const handleWsMessage = useCallback(
    (msg: WsMessage) => {
      if (msg.event === 'analytics_update') {
        const cam = msg.data as LiveCameraAnalytics;
        setCameras((prev) => {
          const idx = prev.findIndex((c) => c.camera_id === cam.camera_id);
          if (idx === -1) return [...prev, cam];
          const next = [...prev];
          next[idx] = cam;
          return next;
        });
        setLastUpdate(new Date());
      }

      if (msg.event === 'initial_state') {
        const cams = (msg.data as { cameras: LiveCameraAnalytics[] }).cameras;
        if (cams?.length) {
          setCameras(cams);
          setLastUpdate(new Date());
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    // Initial REST fetch
    void fetchRest();

    // Open WebSocket
    const ws = createAnalyticsWebSocket(
      handleWsMessage,
      () => setWsConnected(true),
      () => setWsConnected(false),
    );
    wsRef.current = ws;

    // REST fallback timer
    timerRef.current = setInterval(() => {
      void fetchRest();
    }, REST_REFRESH_MS);

    return () => {
      ws.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchRest, handleWsMessage]);

  // Recompute summary from cameras state when cameras change (WS patch mode)
  useEffect(() => {
    if (!cameras.length) return;
    setSummary({
      total_people: cameras.reduce((s, c) => s + c.people_count, 0),
      active_cameras: cameras.filter((c) => c.is_active).length,
      total_cameras: cameras.length,
      high_density_count: cameras.filter((c) => c.density_level === 'high').length,
      critical_count: cameras.filter((c) => c.density_level === 'critical').length,
      last_update: new Date().toISOString(),
    });
  }, [cameras]);

  return {
    cameras,
    summary,
    loading,
    error,
    wsConnected,
    lastUpdate,
    refresh: fetchRest,
  };
}
