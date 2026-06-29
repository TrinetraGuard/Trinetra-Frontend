import {
  Activity,
  Brain,
  LayoutGrid,
  MonitorPlay,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
  Loader2,
} from 'lucide-react';

import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { useHlsStreamStatus } from '@/hooks/useHlsStreamStatus';
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

/** Full AI analytics card — shown when live video is not yet ready */
function AiAnalyticsCard({
  camera,
  analytics,
  hlsLoading,
  onSelect,
}: {
  camera: CCTV;
  analytics?: LiveCameraAnalytics;
  hlsLoading?: boolean;
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
      className="group w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950 text-left shadow-lg transition hover:ring-2 hover:ring-blue-500/70"
      onClick={onSelect}
    >
      <div className="relative flex aspect-video flex-col justify-between p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-blue-300">
              AI Analytics
            </span>
          </div>
          {hlsLoading ? (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading video…
            </span>
          ) : analytics?.is_active ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              LIVE
            </span>
          ) : (
            <span className="text-[10px] text-gray-500">Initializing…</span>
          )}
        </div>

        {/* Centre — people count */}
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
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-semibold text-white ${styles?.bg ?? 'bg-gray-700'}`}
              >
                {analytics.density_level.charAt(0).toUpperCase() +
                  analytics.density_level.slice(1)}
              </span>
              <p className="mt-1 flex items-center justify-end gap-0.5 text-xs capitalize text-gray-400">
                <TrendIcon className="h-3 w-3" />
                {analytics.trend}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading data…</p>
          </div>
        )}

        {/* Bottom — density bar + camera name */}
        <div>
          {analytics && (
            <div className="mb-2">
              <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                <span>Crowd capacity</span>
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

/** Live video tile with analytics overlay */
function LiveVideoCard({
  camera,
  analytics,
  startupDelayMs,
  onSelect,
}: {
  camera: CCTV;
  analytics?: LiveCameraAnalytics;
  startupDelayMs?: number;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className="group w-full overflow-hidden rounded-xl border border-gray-800 bg-black text-left shadow-lg transition hover:ring-2 hover:ring-orange-500/70"
      onClick={onSelect}
    >
      <div className="relative aspect-video">
        <CCTVStreamPlayer
          camera={camera}
          className="h-full w-full"
          autoPlay
          muted
          showControls={false}
          showLiveBadge
          compact
          startupDelayMs={startupDelayMs ?? 0}
        />

        {/* Analytics overlay at the bottom of the video */}
        {analytics && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-semibold text-white">{camera.placeName}</p>
              <div className="flex items-center gap-2 text-xs text-white">
                <Users className="h-3 w-3" />
                <span className="font-bold">{analytics.people_count}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${densityStyles(analytics.density_level as DensityLevel).bg}`}
                >
                  {analytics.density_level}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

export function CameraMonitorWall({
  cameras,
  streamsEnabled = false,
  analyticsMap,
  onSelectCamera,
}: CameraMonitorWallProps) {
  const orderedCameras = sortCamerasByChannel(cameras);
  const { readyChannels, anyReady, checked } = useHlsStreamStatus();

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

  const liveCount = readyChannels.size;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <LayoutGrid className="h-4 w-4" />
        <span>{orderedCameras.length} cameras</span>

        {anyReady ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {liveCount} LIVE VIDEO
          </span>
        ) : checked ? (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
            <Brain className="h-3 w-3" />
            AI analytics active · run start-hls.sh for live video
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            checking streams…
          </span>
        )}

        <span className="ml-auto flex items-center gap-1 text-xs text-blue-600">
          <Video className="h-3 w-3" />
          {anyReady ? 'Live video + AI overlay' : 'YOLO crowd analytics'}
        </span>
      </div>

      {/* Camera grid */}
      <div className={`grid gap-4 ${gridClass}`}>
        {orderedCameras.map((camera) => {
          const channel = getCameraChannelOrder(camera);
          const startupDelayMs = channel < 999 ? (channel - 1) * 400 : 0;

          // Look up analytics by place name or camera id
          const analytics =
            analyticsMap?.get(camera.placeName?.toLowerCase() ?? '') ??
            analyticsMap?.get(camera.id ?? '');

          // Show live video only if this specific channel's HLS is ready
          const channelReady = readyChannels.has(channel);

          if (streamsEnabled && channelReady) {
            return (
              <LiveVideoCard
                key={camera.id ?? camera.placeName}
                camera={camera}
                analytics={analytics}
                startupDelayMs={startupDelayMs}
                onSelect={() => onSelectCamera?.(camera)}
              />
            );
          }

          return (
            <AiAnalyticsCard
              key={camera.id ?? camera.placeName}
              camera={camera}
              analytics={analytics}
              hlsLoading={streamsEnabled && !channelReady}
              onSelect={() => onSelectCamera?.(camera)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CameraMonitorWall;
