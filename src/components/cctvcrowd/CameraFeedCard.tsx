import { Activity, Brain, MapPin, Maximize2, RefreshCw, TrendingDown, TrendingUp, Users, Video, Wifi, WifiOff } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { formatCctvTimestamp, maskRtspCredentials } from '@/lib/cctv';
import { densityStyles, type DensityLevel } from '@/lib/adminTheme';
import type { CCTV } from '@/types/cctv';
import type { LiveCameraAnalytics } from '@/lib/trinetraApi';

interface CameraFeedCardProps {
  camera: CCTV;
  onViewLive: (camera: CCTV) => void;
  variant?: 'grid' | 'list';
  startupDelayMs?: number;
  streamsEnabled?: boolean;
  nvrMessage?: string;
  analyticsData?: LiveCameraAnalytics;
}

export function CameraFeedCard({
  camera,
  onViewLive,
  variant = 'grid',
  startupDelayMs = 0,
  streamsEnabled = true,
  analyticsData,
}: CameraFeedCardProps) {
  if (variant === 'list') {
    return (
      <Card className="border-gray-200 transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-lg sm:h-36 sm:w-64">
              {streamsEnabled ? (
                <CCTVStreamPlayer
                  camera={camera}
                  className="h-full w-full"
                  autoPlay
                  muted
                  showControls={false}
                  showLiveBadge
                  compact
                  startupDelayMs={startupDelayMs}
                />
              ) : (
                <AiAnalyticsOverlay analytics={analyticsData} compact />
              )}
              <div className="absolute left-3 top-3">
                <StatusBadge status={camera.status} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{camera.placeName}</h3>
                  <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-xs text-gray-700">
                        {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                      </span>
                    </div>
                    {camera.lastStatusCheck && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5">
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          Checked: {formatCctvTimestamp(camera.lastStatusCheck)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-1.5 text-xs font-semibold text-gray-500">Stream URL</p>
                    <p className="break-all font-mono text-sm text-gray-900">
                      {maskRtspCredentials(camera.rtspLink)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewLive(camera)}
                  className="ml-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Video className="mr-2 h-4 w-4" />
                  View Live
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-gray-200 transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <div className="relative aspect-video overflow-hidden bg-black">
          {streamsEnabled ? (
            <CCTVStreamPlayer
              camera={camera}
              className="h-full w-full"
              autoPlay
              muted
              showControls={false}
              showLiveBadge
              compact
              startupDelayMs={startupDelayMs}
            />
          ) : (
            <AiAnalyticsOverlay analytics={analyticsData} />
          )}

          <div className="absolute left-3 top-3 z-10">
            <StatusBadge status={camera.status} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <p className="truncate text-lg font-bold text-white drop-shadow-lg">{camera.placeName}</p>
          </div>

          <div className="absolute right-3 top-3 z-10">
            <Button
              size="sm"
              onClick={() => onViewLive(camera)}
              className="bg-white text-gray-900 shadow-lg hover:bg-gray-100"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="space-y-3 bg-white p-5">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span className="truncate font-mono text-xs">
            {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
          </span>
        </div>

        {camera.lastStatusCheck && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500">
            <RefreshCw className="h-3 w-3 text-gray-400" />
            <span>Last checked: {formatCctvTimestamp(camera.lastStatusCheck)}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-blue-600 text-blue-600 transition-all hover:border-blue-700 hover:bg-blue-50"
          onClick={() => onViewLive(camera)}
        >
          <Video className="mr-2 h-4 w-4" />
          View Live Feed
        </Button>
      </CardContent>
    </Card>
  );
}

/** Shown in place of a video feed when go2rtc relay is offline. */
function AiAnalyticsOverlay({
  analytics,
  compact = false,
}: {
  analytics?: LiveCameraAnalytics;
  compact?: boolean;
}) {
  if (!analytics) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-900 px-3 text-center text-white">
        <WifiOff className="h-8 w-8 text-gray-500" />
        <p className="text-xs text-gray-400">No data yet</p>
      </div>
    );
  }

  const styles = densityStyles(analytics.density_level as DensityLevel);
  const TrendIcon =
    analytics.trend === 'increasing'
      ? TrendingUp
      : analytics.trend === 'decreasing'
        ? TrendingDown
        : Activity;

  const barWidth = Math.min(100, analytics.density_percentage);
  const barColor =
    analytics.density_level === 'critical'
      ? 'bg-red-500'
      : analytics.density_level === 'high'
        ? 'bg-orange-400'
        : analytics.density_level === 'medium'
          ? 'bg-amber-400'
          : 'bg-emerald-500';

  if (compact) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gray-950 px-3 text-white">
        <Brain className="h-5 w-5 text-blue-400" />
        <div className="flex items-center gap-1 text-xl font-bold">
          <Users className="h-4 w-4 text-gray-400" />
          {analytics.people_count}
        </div>
        <Badge className={`${styles.bg} text-white text-[10px] px-1.5`}>
          {analytics.density_level}
        </Badge>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-gray-950 p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-medium text-blue-300">AI Analytics</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          LIVE
        </span>
      </div>

      {/* People count */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400">People detected</p>
          <p className="text-3xl font-bold leading-none">{analytics.people_count}</p>
        </div>
        <div className="text-right">
          <Badge className={`${styles.bg} text-white text-xs`}>
            {analytics.density_level.charAt(0).toUpperCase() + analytics.density_level.slice(1)}
          </Badge>
          <div className="mt-1 flex items-center justify-end gap-1 text-xs capitalize text-gray-300">
            <TrendIcon className="h-3 w-3" />
            {analytics.trend}
          </div>
        </div>
      </div>

      {/* Density bar */}
      <div>
        <div className="mb-1 flex justify-between text-[10px] text-gray-400">
          <span>Capacity</span>
          <span>{analytics.density_percentage.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-700">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CCTV['status'] }) {
  const isActive = status === 'active';

  return (
    <Badge
      variant={isActive ? 'default' : 'outline'}
      className={`flex items-center gap-1.5 px-3 py-1 ${
        isActive
          ? 'border-green-600 bg-green-600 text-white shadow-lg'
          : 'border-gray-600 bg-gray-600 text-white'
      }`}
    >
      {isActive ? (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          <Wifi className="h-3 w-3" />
          <span className="font-semibold">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="font-semibold">Offline</span>
        </>
      )}
    </Badge>
  );
}

export default CameraFeedCard;
