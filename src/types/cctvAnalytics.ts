import type { DensityLevel } from '@/lib/adminTheme';
import type { CCTVStatus } from '@/types/cctv';

export type CrowdTrend = 'increasing' | 'decreasing' | 'stable';

export interface CameraAnalytics {
  cameraId: string;
  placeName: string;
  totalPeople: number;
  crowdDensity: DensityLevel;
  densityPercentage: number;
  maxCapacity: number;
  highCrowdAreas: number;
  trend: CrowdTrend;
  lastUpdate: Date;
  status: CCTVStatus;
  detectionAvailable: boolean;
  detectionMessage?: string;
}
