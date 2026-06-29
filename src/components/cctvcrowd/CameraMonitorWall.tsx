import { Activity, Brain, LayoutGrid, MonitorPlay, TrendingDown, TrendingUp, Users } from 'lucide-react';

import { densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { getCameraChannelOrder, sortCamerasByChannel } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import type { LiveCameraAnalytics } from '@/lib/trinetraApi';

interface CameraMonitorWallProps {
  cameras: CCTV[];
  streamsEnabled?: boolean;
  nvrMessage?: string;
  onSelectCamera?: (camera: CCTV) => void;
  analyticsMap?: Map<string, LiveCameraAnalytics>;
}

function AiCameraCard({
  camera,
  analytics,
  onSelect,
}: {
  camera: CCTV;
  analytics?: LiveCameraAnalytics;
  onSelect?: () => void;
}) {
  const styles = analytics ? densityStyles(analytics.density_level as DensityLevel) : null;
  const barWidth = analytics ? Math.min(100, analytics.density_percentage) : 0;
  const barColor =
    analytics?.density_level === 'critical'
      ? 'bg-red-500'
      : analytics?.density_level === 'high'
        ? 'bg-orange-400'
        : analytics?.density_level === 'medium'
          ? 'bg-amber-400'
          : 'bg-emerald-500';

  const TrendIcon =
    analytics?.trend === 'increasing'
      ? TrendingUp
      : analytics?.trend === 'decreasing'
        ? TrendingDown
        : Activity;

  return (
    <button
      type="button"
      className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-950 text-left shadow-lg transition hover:ring-2 hover:ring-blue-500/70"
      onClick={onSelect}
    >
      <div className="relative aspect-video flex flex-col justify-between p-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] font-medium text-blue-300 uppercase tracking-wide">
              AI Analytics
            </span>
          </div>
          {analytics?.is_active ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              LIVE
            </span>
          ) : (
            <span className="text-[10px] text-gray-500">Inactive</span>
          )}
        </div>

        {/* Center — people count */}
        {analytics ? (
          <div className="flex items-end justify-between text-white">
            <div>
              <p className="text-4xl font-bold leading-none">{analytics.people_count}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <Users className="h-3 w-3" />
                people detected
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold text-white ${styles?.bg ?? 'bg-gray-700'}`}>
                {analytics.density_level.charAt(0).toUpperCase() + analytics.density_level.slice(1)}
              </span>
              <p className="mt-1 flex items-center justify-end gap-0.5 text-xs capitalize text-gray-400">
                <TrendIcon className="h-3 w-3" />
                {analytics.trend}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">No data yet</p>
          </div>
        )}

        {/* Bottom — density bar + camera name */}
        <div>
          {analytics && (
            <div className="mb-2">
              <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                <span>Capacity</span>
                <span>{analytics.density_percentage.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-800">
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )}
          <p className="truncate text-sm font-semibold text-white">{camera.placeName}</p>
        </div>
      </div>
    </button>
  );
}

export function CameraMonitorWall({
  cameras,
  analyticsMap,
  onSelectCamera,
}: CameraMonitorWallProps) {
  const orderedCameras = sortCamerasByChannel(cameras);

  if (orderedCameras.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
        <MonitorPlay className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="font-medium text-gray-600">No cameras configured</p>
        <p className="mt-2 text-sm text-gray-400">
          Site cameras load automatically on first visit, or add them in CCTV Management.
        </p>
      </div>
    );
  }

  const gridClass =
    orderedCameras.length === 1
      ? 'grid-cols-1'
      : orderedCameras.length <= 4
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <LayoutGrid className="h-4 w-4" />
        <span>
          Showing {orderedCameras.length} camera{orderedCameras.length === 1 ? '' : 's'} — Live AI analytics
        </span>
        <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          YOLO detection active
        </span>
      </div>
      <div className={`grid gap-4 ${gridClass}`}>
        {orderedCameras.map((camera) => {
          const analytics =
            analyticsMap?.get(camera.placeName?.toLowerCase() ?? '') ??
            analyticsMap?.get(camera.id ?? '');

          return (
            <AiCameraCard
              key={camera.id ?? camera.placeName}
              camera={camera}
              analytics={analytics}
              onSelect={() => onSelectCamera?.(camera)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CameraMonitorWall;
