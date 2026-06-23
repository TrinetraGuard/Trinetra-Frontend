import { useMemo } from 'react';

import {
  buildDummyCameraAnalytics,
  buildDummyCrowdLogs,
  buildDummyDensityReports,
  buildDummyLogSummaries,
  buildDummyPredictions,
  getDummyAnalyticsSummary,
} from '@/lib/dummyCrowdAnalytics';
import type { CCTV } from '@/types/cctv';
import type { PredictionTimeframe } from '@/types/crowdReports';

/** Stable demo analytics for Live Analytics & Reports (no API / Gemini calls). */
export function useDummyCrowdAnalytics(cameras: CCTV[]) {
  const analytics = useMemo(() => buildDummyCameraAnalytics(cameras), [cameras]);
  const summary = useMemo(() => getDummyAnalyticsSummary(analytics), [analytics]);

  return { analytics, summary };
}

export function useDummyDensityReports(cameras: CCTV[]) {
  return useMemo(() => buildDummyDensityReports(cameras), [cameras]);
}

export function useDummyLogSummaries(cameras: CCTV[]) {
  return useMemo(() => buildDummyLogSummaries(cameras), [cameras]);
}

export function useDummyCrowdLogs(cameras: CCTV[]) {
  return useMemo(() => buildDummyCrowdLogs(cameras), [cameras]);
}

export function useDummyPredictions(cameras: CCTV[], timeframe: PredictionTimeframe) {
  return useMemo(() => buildDummyPredictions(cameras, timeframe), [cameras, timeframe]);
}
