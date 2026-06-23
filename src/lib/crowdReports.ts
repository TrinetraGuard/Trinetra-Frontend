import {
  computeDensityLevel,
  computeDensityPercentage,
  computeTrend,
  DEFAULT_CAMERA_MAX_CAPACITY,
} from '@/lib/cctvAnalytics';
import type { CameraAnalytics } from '@/types/cctvAnalytics';
import type { CCTV } from '@/types/cctv';
import type {
  CameraLogSummary,
  CrowdDateRange,
  CrowdLogEntry,
  CrowdPrediction,
  CrowdTimeWindow,
  DensityReport,
  PredictionTimeframe,
  TimeSlotAnalysis,
} from '@/types/crowdReports';
import { filterLogsByDateRange, filterLogsByTimeWindow } from '@/lib/crowdAnalyticsStore';

const PREDICTION_SLOTS = [
  { hour: 8, label: '8:00 AM - 10:00 AM' },
  { hour: 10, label: '10:00 AM - 12:00 PM' },
  { hour: 12, label: '12:00 PM - 2:00 PM' },
  { hour: 14, label: '2:00 PM - 4:00 PM' },
  { hour: 16, label: '4:00 PM - 6:00 PM' },
  { hour: 18, label: '6:00 PM - 8:00 PM' },
  { hour: 20, label: '8:00 PM - 10:00 PM' },
];

function cameraKey(camera: CCTV): string {
  return camera.id ?? camera.placeName;
}

function logsForCamera(logs: CrowdLogEntry[], cameraId: string): CrowdLogEntry[] {
  return logs.filter((entry) => entry.cameraId === cameraId);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function recommendationForDensity(density: number): string {
  if (density >= 85) return 'Consider crowd control measures. High density expected.';
  if (density >= 60) return 'Monitor closely. Moderate crowd expected.';
  return 'Normal operations. Low to moderate crowd expected.';
}

export function buildDensityReports(
  cameras: CCTV[],
  analytics: Map<string, CameraAnalytics>,
  logs: CrowdLogEntry[],
  timeWindow: CrowdTimeWindow
): DensityReport[] {
  const windowLogs = filterLogsByTimeWindow(logs, timeWindow);

  return cameras.map((camera) => {
    const key = cameraKey(camera);
    const live = analytics.get(key);
    const cameraLogs = logsForCamera(windowLogs, key);
    const densities = cameraLogs.map((entry) => entry.densityPercentage);
    const peopleCounts = cameraLogs.map((entry) => entry.peopleCount);

    const peopleCount = live?.detectionAvailable ? live.totalPeople : 0;
    const densityPercentage = live?.detectionAvailable ? live.densityPercentage : 0;
    const densityLevel = live?.detectionAvailable
      ? live.crowdDensity
      : computeDensityLevel(0, DEFAULT_CAMERA_MAX_CAPACITY);

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentLogs = cameraLogs.filter(
      (entry) => new Date(entry.timestamp).getTime() >= oneHourAgo
    );
    const hourAgoAvg = average(recentLogs.slice(0, -1).map((entry) => entry.densityPercentage));
    const lastHourChange =
      live?.detectionAvailable && hourAgoAvg > 0
        ? Math.round(densityPercentage - hourAgoAvg)
        : recentLogs.length >= 2
          ? Math.round(
              recentLogs[recentLogs.length - 1].densityPercentage -
                recentLogs[0].densityPercentage
            )
          : 0;

    const history = peopleCounts.slice(-8);
    if (live?.detectionAvailable) history.push(live.totalPeople);

    return {
      cameraId: key,
      placeName: camera.placeName,
      currentDensity: densityPercentage,
      densityLevel,
      densityPercentage,
      peopleCount,
      maxCapacity: DEFAULT_CAMERA_MAX_CAPACITY,
      peakDensity: densities.length > 0 ? Math.max(...densities, densityPercentage) : densityPercentage,
      averageDensity:
        densities.length > 0
          ? Math.round(average([...densities, densityPercentage]))
          : densityPercentage,
      trend: live?.detectionAvailable ? live.trend : computeTrend(history, peopleCount),
      lastHourChange,
      status: camera.status,
      detectionAvailable: live?.detectionAvailable ?? false,
      lastUpdate: live?.lastUpdate ?? new Date(),
      coordinates: { lat: camera.latitude, lng: camera.longitude },
    };
  });
}

export function buildCameraLogSummaries(
  cameras: CCTV[],
  logs: CrowdLogEntry[],
  dateRange: CrowdDateRange
): CameraLogSummary[] {
  const filtered = filterLogsByDateRange(logs, dateRange);

  return cameras
    .map((camera) => {
      const key = cameraKey(camera);
      const cameraLogs = logsForCamera(filtered, key);
      if (cameraLogs.length === 0) return null;

      const hourGroups = new Map<number, number[]>();
      const dayGroups = new Map<string, number[]>();

      cameraLogs.forEach((entry) => {
        if (!hourGroups.has(entry.hour)) hourGroups.set(entry.hour, []);
        hourGroups.get(entry.hour)!.push(entry.peopleCount);

        if (!dayGroups.has(entry.dayOfWeek)) dayGroups.set(entry.dayOfWeek, []);
        dayGroups.get(entry.dayOfWeek)!.push(entry.peopleCount);
      });

      let peakHour = 12;
      let peakAvg = 0;
      hourGroups.forEach((counts, hour) => {
        const value = average(counts);
        if (value > peakAvg) {
          peakAvg = value;
          peakHour = hour;
        }
      });

      let quietHour = 6;
      let quietAvg = Infinity;
      hourGroups.forEach((counts, hour) => {
        const value = average(counts);
        if (value < quietAvg) {
          quietAvg = value;
          quietHour = hour;
        }
      });

      let busiestDay = 'Monday';
      let busiestAvg = 0;
      dayGroups.forEach((counts, day) => {
        const value = average(counts);
        if (value > busiestAvg) {
          busiestAvg = value;
          busiestDay = day;
        }
      });

      const timeSlots: TimeSlotAnalysis[] = [];
      for (let hour = 6; hour < 22; hour += 2) {
        const slotLogs = cameraLogs.filter((entry) => entry.hour >= hour && entry.hour < hour + 2);
        if (slotLogs.length === 0) continue;

        timeSlots.push({
          hour,
          averagePeople: Math.round(average(slotLogs.map((entry) => entry.peopleCount))),
          peakPeople: Math.max(...slotLogs.map((entry) => entry.peopleCount)),
          averageDensity: Math.round(average(slotLogs.map((entry) => entry.densityPercentage))),
          occurrences: slotLogs.length,
          label: `${hour}:00 - ${hour + 2}:00`,
        });
      }

      return {
        cameraId: key,
        placeName: camera.placeName,
        totalVisits: cameraLogs.length,
        averagePeople: Math.round(average(cameraLogs.map((entry) => entry.peopleCount))),
        peakPeople: Math.max(...cameraLogs.map((entry) => entry.peopleCount)),
        peakTime: `${peakHour}:00`,
        quietTime: `${quietHour}:00`,
        busiestDay,
        coordinates: { lat: camera.latitude, lng: camera.longitude },
        timeSlots,
      };
    })
    .filter((summary): summary is CameraLogSummary => summary !== null);
}

export function buildCrowdPredictions(
  cameras: CCTV[],
  analytics: Map<string, CameraAnalytics>,
  logs: CrowdLogEntry[],
  timeframe: PredictionTimeframe
): Map<string, CrowdPrediction[]> {
  const predictions = new Map<string, CrowdPrediction[]>();
  const targetDay = new Date();
  if (timeframe === 'tomorrow') targetDay.setDate(targetDay.getDate() + 1);
  if (timeframe === 'week') targetDay.setDate(targetDay.getDate() + 7);

  const targetDayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][targetDay.getDay()];

  cameras.forEach((camera) => {
    if (camera.status !== 'active') return;

    const key = cameraKey(camera);
    const live = analytics.get(key);
    const cameraLogs = logsForCamera(logs, key);
    const cameraPredictions: CrowdPrediction[] = [];

    PREDICTION_SLOTS.forEach((slot) => {
      const sameHourLogs = cameraLogs.filter(
        (entry) => entry.hour >= slot.hour && entry.hour < slot.hour + 2
      );
      const sameDayLogs = sameHourLogs.filter((entry) => entry.dayOfWeek === targetDayName);
      const sampleLogs = sameDayLogs.length >= 2 ? sameDayLogs : sameHourLogs;

      const historicalAverage =
        sampleLogs.length > 0
          ? average(sampleLogs.map((entry) => entry.peopleCount))
          : live?.detectionAvailable
            ? live.totalPeople
            : average(cameraLogs.map((entry) => entry.peopleCount));

      const currentPeople = live?.detectionAvailable ? live.totalPeople : historicalAverage;
      const trendFactor =
        live?.trend === 'increasing' ? 1.08 : live?.trend === 'decreasing' ? 0.92 : 1;

      let predictedPeople = Math.round(
        (sampleLogs.length > 0 ? historicalAverage : currentPeople) * trendFactor
      );

      if (
        (timeframe === 'tomorrow' || timeframe === 'week') &&
        (targetDayName === 'Saturday' || targetDayName === 'Sunday')
      ) {
        predictedPeople = Math.round(predictedPeople * 1.1);
      }

      predictedPeople = Math.max(0, predictedPeople);
      const predictedDensity = computeDensityPercentage(
        predictedPeople,
        DEFAULT_CAMERA_MAX_CAPACITY
      );
      const densityLevel = computeDensityLevel(predictedPeople, DEFAULT_CAMERA_MAX_CAPACITY);
      const predictedChange =
        historicalAverage > 0
          ? Math.round(((predictedPeople - historicalAverage) / historicalAverage) * 100)
          : 0;

      const confidence = Math.min(95, Math.round(35 + sampleLogs.length * 8));
      const trend =
        predictedChange > 5 ? 'increasing' : predictedChange < -5 ? 'decreasing' : 'stable';
      const riskLevel =
        predictedDensity >= 85 ? 'high' : predictedDensity >= 60 ? 'medium' : 'low';

      cameraPredictions.push({
        cameraId: key,
        placeName: camera.placeName,
        predictedPeople,
        predictedDensity,
        densityLevel,
        confidence,
        timeSlot: slot.label,
        date: new Date(targetDay),
        trend,
        riskLevel,
        recommendation: recommendationForDensity(predictedDensity),
        coordinates: { lat: camera.latitude, lng: camera.longitude },
        historicalAverage: Math.round(historicalAverage),
        predictedChange,
      });
    });

    if (cameraPredictions.length > 0) {
      predictions.set(key, cameraPredictions);
    }
  });

  return predictions;
}

export function exportCrowdLogsCsv(logs: CrowdLogEntry[]): string {
  const header = 'camera,place,timestamp,people,density_pct,density_level,hour,day_of_week';
  const rows = logs.map(
    (entry) =>
      `"${entry.cameraId}","${entry.placeName}","${entry.timestamp}",${entry.peopleCount},${entry.densityPercentage},${entry.densityLevel},${entry.hour},"${entry.dayOfWeek}"`
  );
  return [header, ...rows].join('\n');
}
