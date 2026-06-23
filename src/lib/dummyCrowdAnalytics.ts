import type { DensityLevel } from '@/lib/adminTheme';
import { getCameraChannelOrder, sortCamerasByChannel } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import type { CameraAnalytics, CrowdTrend } from '@/types/cctvAnalytics';
import type {
  CameraLogSummary,
  CrowdLogEntry,
  CrowdPrediction,
  DensityReport,
  PredictionTimeframe,
} from '@/types/crowdReports';

/** Demo profile per NVR channel — stable, realistic crowd levels for the site. */
const CHANNEL_PROFILES: Array<{
  people: number;
  maxCapacity: number;
  density: DensityLevel;
  trend: CrowdTrend;
  highCrowdAreas: number;
  status: 'active' | 'inactive';
}> = [
  { people: 42, maxCapacity: 120, density: 'medium', trend: 'increasing', highCrowdAreas: 0, status: 'active' },
  { people: 28, maxCapacity: 100, density: 'low', trend: 'stable', highCrowdAreas: 0, status: 'active' },
  { people: 58, maxCapacity: 110, density: 'high', trend: 'increasing', highCrowdAreas: 1, status: 'active' },
  { people: 19, maxCapacity: 90, density: 'low', trend: 'decreasing', highCrowdAreas: 0, status: 'active' },
  { people: 86, maxCapacity: 100, density: 'critical', trend: 'increasing', highCrowdAreas: 2, status: 'active' },
  { people: 34, maxCapacity: 100, density: 'medium', trend: 'stable', highCrowdAreas: 0, status: 'active' },
  { people: 11, maxCapacity: 80, density: 'low', trend: 'stable', highCrowdAreas: 0, status: 'inactive' },
  { people: 47, maxCapacity: 100, density: 'medium', trend: 'decreasing', highCrowdAreas: 0, status: 'active' },
];

function cameraKey(camera: CCTV): string {
  return camera.id ?? camera.placeName;
}

function profileFor(camera: CCTV) {
  const channel = getCameraChannelOrder(camera);
  const index = channel >= 1 && channel <= 8 ? channel - 1 : 0;
  return CHANNEL_PROFILES[index];
}

function densityPct(people: number, maxCapacity: number): number {
  return Math.min(100, Math.round((people / maxCapacity) * 100));
}

function densityFromPct(pct: number): DensityLevel {
  if (pct >= 85) return 'critical';
  if (pct >= 65) return 'high';
  if (pct >= 35) return 'medium';
  return 'low';
}

export function buildDummyCameraAnalytics(cameras: CCTV[]): Map<string, CameraAnalytics> {
  const map = new Map<string, CameraAnalytics>();
  const now = new Date();

  for (const camera of sortCamerasByChannel(cameras)) {
    const profile = profileFor(camera);
    const pct = densityPct(profile.people, profile.maxCapacity);
    map.set(cameraKey(camera), {
      cameraId: cameraKey(camera),
      placeName: camera.placeName,
      totalPeople: profile.people,
      crowdDensity: profile.density,
      densityPercentage: pct,
      maxCapacity: profile.maxCapacity,
      highCrowdAreas: profile.highCrowdAreas,
      trend: profile.trend,
      lastUpdate: now,
      status: profile.status,
      detectionAvailable: true,
    });
  }

  return map;
}

export function buildDummyDensityReports(cameras: CCTV[]): DensityReport[] {
  const now = new Date();

  return sortCamerasByChannel(cameras).map((camera) => {
    const profile = profileFor(camera);
    const pct = densityPct(profile.people, profile.maxCapacity);
    const peak = Math.min(100, pct + 12);
    const average = Math.max(0, pct - 8);

    return {
      cameraId: cameraKey(camera),
      placeName: camera.placeName,
      currentDensity: pct,
      densityLevel: profile.density,
      densityPercentage: pct,
      peopleCount: profile.people,
      maxCapacity: profile.maxCapacity,
      peakDensity: peak,
      averageDensity: average,
      trend: profile.trend,
      lastHourChange: profile.trend === 'increasing' ? 8 : profile.trend === 'decreasing' ? -5 : 0,
      status: profile.status,
      detectionAvailable: true,
      lastUpdate: now,
      coordinates: { lat: camera.latitude, lng: camera.longitude },
    };
  });
}

/** Compact recent log — one entry per camera for the demo. */
export function buildDummyCrowdLogs(cameras: CCTV[]): CrowdLogEntry[] {
  const now = new Date();

  return sortCamerasByChannel(cameras).map((camera, index) => {
    const profile = profileFor(camera);
    const pct = densityPct(profile.people, profile.maxCapacity);
    const ts = new Date(now.getTime() - index * 12 * 60 * 1000);

    return {
      id: `demo-log-${cameraKey(camera)}`,
      cameraId: cameraKey(camera),
      placeName: camera.placeName,
      timestamp: ts.toISOString(),
      peopleCount: profile.people,
      densityPercentage: pct,
      densityLevel: profile.density,
      hour: ts.getHours(),
      dayOfWeek: ts.toLocaleDateString(undefined, { weekday: 'short' }),
    };
  });
}

/** Lightweight per-camera summary — 4 time blocks only. */
export function buildDummyLogSummaries(cameras: CCTV[]): CameraLogSummary[] {
  const slots = [
    { hour: 8, label: 'Morning (8–11)', factor: 0.55 },
    { hour: 12, label: 'Midday (12–3)', factor: 0.85 },
    { hour: 16, label: 'Afternoon (4–6)', factor: 1.0 },
    { hour: 19, label: 'Evening (7–9)', factor: 0.45 },
  ];

  return sortCamerasByChannel(cameras).map((camera) => {
    const profile = profileFor(camera);
    const base = profile.people;

    const timeSlots = slots.map((slot) => {
      const avg = Math.max(1, Math.round(base * slot.factor));
      const peak = Math.round(avg * 1.2);
      const density = densityPct(avg, profile.maxCapacity);
      return {
        hour: slot.hour,
        label: slot.label,
        averagePeople: avg,
        peakPeople: peak,
        averageDensity: density,
        occurrences: 3,
      };
    });

    const peakSlot = timeSlots.reduce((best, slot) =>
      slot.averagePeople > best.averagePeople ? slot : best
    );
    const quietSlot = timeSlots.reduce((best, slot) =>
      slot.averagePeople < best.averagePeople ? slot : best
    );

    return {
      cameraId: cameraKey(camera),
      placeName: camera.placeName,
      totalVisits: 12,
      averagePeople: base,
      peakPeople: Math.round(base * 1.25),
      peakTime: `${peakSlot.hour}:00`,
      quietTime: `${quietSlot.hour}:00`,
      busiestDay: 'Saturday',
      coordinates: { lat: camera.latitude, lng: camera.longitude },
      timeSlots,
    };
  });
}

const PREDICTION_SLOTS = [
  { label: 'Next 2 hours', offsetHours: 2, factor: 1.08 },
  { label: 'This evening', offsetHours: 6, factor: 0.72 },
];

export function buildDummyPredictions(
  cameras: CCTV[],
  timeframe: PredictionTimeframe
): Map<string, CrowdPrediction[]> {
  const map = new Map<string, CrowdPrediction[]>();
  const dayOffset = timeframe === 'tomorrow' ? 1 : timeframe === 'week' ? 3 : 0;

  for (const camera of sortCamerasByChannel(cameras)) {
    const profile = profileFor(camera);
    const base = profile.people;
    const key = cameraKey(camera);

    const predictions: CrowdPrediction[] = PREDICTION_SLOTS.map((slot) => {
      const predicted = Math.max(0, Math.round(base * slot.factor));
      const pct = densityPct(predicted, profile.maxCapacity);
      const level = densityFromPct(pct);
      const change = Math.round((slot.factor - 1) * 100);
      const riskLevel: 'low' | 'medium' | 'high' =
        level === 'critical' ? 'high' : level === 'high' ? 'medium' : 'low';

      return {
        cameraId: key,
        placeName: camera.placeName,
        predictedPeople: predicted,
        predictedDensity: pct,
        densityLevel: level,
        confidence: timeframe === 'week' ? 68 : 82,
        timeSlot: slot.label,
        date: new Date(Date.now() + dayOffset * 86400000 + slot.offsetHours * 3600000),
        trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        riskLevel,
        recommendation:
          riskLevel === 'high'
            ? 'Deploy extra volunteers and open overflow route.'
            : 'Routine monitoring is sufficient.',
        coordinates: { lat: camera.latitude, lng: camera.longitude },
        historicalAverage: base,
        predictedChange: change,
      };
    });

    map.set(key, predictions);
  }

  return map;
}

export function getDummyAnalyticsSummary(analytics: Map<string, CameraAnalytics>) {
  const values = Array.from(analytics.values());
  const totalPeople = values.reduce((sum, item) => sum + item.totalPeople, 0);
  const activeCameras = values.filter((item) => item.status === 'active').length;
  const highDensity = values.filter(
    (item) => item.crowdDensity === 'high' || item.crowdDensity === 'critical'
  ).length;
  const critical = values.filter((item) => item.crowdDensity === 'critical').length;

  return { totalPeople, activeCameras, highDensity, critical, cameraCount: values.length };
}
