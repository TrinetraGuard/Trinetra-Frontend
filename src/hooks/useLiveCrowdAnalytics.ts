import { useCallback, useEffect, useRef, useState } from 'react';

import {
  analyzeSnapshotWithGemini,
  buildAnalyticsFromAnalysis,
  buildOfflineAnalytics,
  DEFAULT_CAMERA_MAX_CAPACITY,
  ensureCameraStreamReady,
  fetchCameraSnapshotBlob,
  getGo2RtcStreamName,
  isAnalyticsConfigured,
} from '@/lib/cctvAnalytics';
import { appendCrowdLog } from '@/lib/crowdAnalyticsStore';
import { sortCamerasByChannel } from '@/lib/cctv';
import type { CameraAnalytics } from '@/types/cctvAnalytics';
import type { CCTV } from '@/types/cctv';

const SCAN_INTERVAL_MS = 20_000;
const CAMERA_GAP_MS = 2_500;

export function useLiveCrowdAnalytics(cameras: CCTV[], autoRefresh: boolean) {
  const [analytics, setAnalytics] = useState<Map<string, CameraAnalytics>>(new Map());
  const [scanning, setScanning] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const historyRef = useRef<Map<string, number[]>>(new Map());
  const scanningRef = useRef(false);

  const runScan = useCallback(async () => {
    if (scanningRef.current || cameras.length === 0) return;

    if (!isAnalyticsConfigured()) {
      setConfigError(
        'Live detection requires VITE_GEMINI_API_KEY and the Trinetra CCTV backend with stream relay.'
      );
      return;
    }

    setConfigError(null);
    scanningRef.current = true;
    setScanning(true);

    const ordered = sortCamerasByChannel(cameras);
    const nextAnalytics = new Map<string, CameraAnalytics>();

    for (const camera of ordered) {
      const cameraKey = camera.id ?? camera.placeName;
      const maxCapacity = DEFAULT_CAMERA_MAX_CAPACITY;

      if (camera.status !== 'active') {
        nextAnalytics.set(cameraKey, buildOfflineAnalytics(camera, maxCapacity));
        continue;
      }

      try {
        const streamReady = await ensureCameraStreamReady(camera);
        if (!streamReady) {
          nextAnalytics.set(cameraKey, {
            ...buildOfflineAnalytics(camera, maxCapacity),
            detectionMessage: 'Stream unavailable — could not capture frame',
          });
          continue;
        }

        const blob = await fetchCameraSnapshotBlob(getGo2RtcStreamName(camera));
        if (!blob) {
          nextAnalytics.set(cameraKey, {
            ...buildOfflineAnalytics(camera, maxCapacity),
            detectionMessage: 'Could not fetch camera snapshot',
          });
          continue;
        }

        const analysis = await analyzeSnapshotWithGemini(blob);
        if (!analysis) {
          nextAnalytics.set(cameraKey, {
            ...buildOfflineAnalytics(camera, maxCapacity),
            detectionMessage: 'AI analysis failed for this frame',
          });
          continue;
        }

        const history = historyRef.current.get(cameraKey) ?? [];
        history.push(analysis.people);
        if (history.length > 8) history.shift();
        historyRef.current.set(cameraKey, history);

        nextAnalytics.set(
          cameraKey,
          buildAnalyticsFromAnalysis(camera, analysis, history, maxCapacity)
        );
        appendCrowdLog({
          cameraId: cameraKey,
          placeName: camera.placeName,
          peopleCount: analysis.people,
        });
      } catch (error) {
        console.error('[live-analytics] scan failed for', camera.placeName, error);
        nextAnalytics.set(cameraKey, {
          ...buildOfflineAnalytics(camera, maxCapacity),
          detectionMessage: 'Detection error for this camera',
        });
      }

      await new Promise((resolve) => setTimeout(resolve, CAMERA_GAP_MS));
    }

    setAnalytics(nextAnalytics);
    setLastScanAt(new Date());
    scanningRef.current = false;
    setScanning(false);
  }, [cameras]);

  useEffect(() => {
    if (cameras.length === 0) {
      setAnalytics(new Map());
      return;
    }

    void runScan();

    if (!autoRefresh) return;

    const intervalId = window.setInterval(() => {
      void runScan();
    }, SCAN_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [autoRefresh, cameras, runScan]);

  return {
    analytics,
    scanning,
    lastScanAt,
    configError,
    rescan: runScan,
  };
}
