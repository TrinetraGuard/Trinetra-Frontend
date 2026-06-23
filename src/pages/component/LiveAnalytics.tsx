import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  BarChart3,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { CctvStreamRelayBanner } from '@/components/cctvcrowd/CctvStreamRelayBanner';
import { useLiveCrowdAnalytics } from '@/hooks/useLiveCrowdAnalytics';
import { useCctvCameras } from '@/hooks/useCctvCameras';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { sortCamerasByChannel } from '@/lib/cctv';
import type { CameraAnalytics } from '@/types/cctvAnalytics';

const LiveAnalytics = () => {
  const { cameras, loading } = useCctvCameras();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { analytics, scanning, lastScanAt, configError, rescan } = useLiveCrowdAnalytics(
    cameras,
    autoRefresh
  );

  const orderedCameras = sortCamerasByChannel(cameras);

  const getDensityColor = (density: DensityLevel) => densityStyles(density).bg;

  const getDensityText = (density: DensityLevel) => {
    switch (density) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-gray-800" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const analyticsValues = Array.from(analytics.values());
  const detectedCameras = analyticsValues.filter((item) => item.detectionAvailable);
  const totalPeople = detectedCameras.reduce((sum, item) => sum + item.totalPeople, 0);
  const activeCameras = cameras.filter((camera) => camera.status === 'active').length;
  const criticalCameras = detectedCameras.filter((item) => item.crowdDensity === 'critical').length;
  const highDensityCameras = detectedCameras.filter(
    (item) => item.crowdDensity === 'high' || item.crowdDensity === 'critical'
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${admin.iconWrap}`}>
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Analytics</h1>
              <p className="mt-1 text-gray-500">
                Real-time crowd analysis from live CCTV snapshots
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void rescan()}
            disabled={scanning}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning…' : 'Scan now'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'border-gray-300 bg-gray-100 text-gray-800' : ''}
          >
            {autoRefresh ? 'Auto refresh ON' : 'Auto refresh OFF'}
          </Button>
        </div>
      </div>

      <CctvStreamRelayBanner />

      {configError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">{configError}</CardContent>
        </Card>
      )}

      {scanning && analyticsValues.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Analyzing live camera snapshots…
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">Total People Detected</p>
                <p className="text-3xl font-bold text-gray-900">{totalPeople.toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">
                  From {detectedCameras.length} live feed{detectedCameras.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${admin.statIcon}`}>
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">Active Cameras</p>
                <p className="text-3xl font-bold text-gray-900">{activeCameras}</p>
                <p className="mt-1 text-xs text-gray-500">Out of {cameras.length} total</p>
              </div>
              <div className="rounded-lg bg-gray-700 p-3">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">High Density Areas</p>
                <p className="text-3xl font-bold text-gray-900">{highDensityCameras}</p>
                <p className="mt-1 text-xs text-gray-500">Requiring attention</p>
              </div>
              <div className="rounded-lg bg-gray-600 p-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">Critical Zones</p>
                <p className="text-3xl font-bold text-gray-900">{criticalCameras}</p>
                <p className="mt-1 text-xs text-gray-500">Immediate action needed</p>
              </div>
              <div className="rounded-lg bg-black p-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lastScanAt && (
        <p className="text-xs text-gray-500">
          Last full scan: {lastScanAt.toLocaleTimeString()}
          {scanning ? ' · scan in progress…' : ''}
        </p>
      )}

      {orderedCameras.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-lg font-medium text-gray-500">No cameras available</p>
              <p className="mt-2 text-sm text-gray-400">
                Add cameras from CCTV Management to see analytics
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {orderedCameras.map((camera) => {
            const cameraAnalytics = analytics.get(camera.id ?? camera.placeName);
            if (!cameraAnalytics) {
              return (
                <Card key={camera.id ?? camera.placeName} className="border-gray-200">
                  <CardContent className="flex items-center gap-3 py-10 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Waiting for live analysis…
                  </CardContent>
                </Card>
              );
            }

            return (
              <AnalyticsCard
                key={camera.id ?? camera.placeName}
                camera={camera}
                cameraAnalytics={cameraAnalytics}
                getDensityColor={getDensityColor}
                getDensityText={getDensityText}
                getTrendIcon={getTrendIcon}
              />
            );
          })}
        </div>
      )}

      {selectedCamera && analytics.has(selectedCamera) && (
        <Card className="border-2 border-gray-300">
          <CardHeader className="bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Detailed Analytics — {analytics.get(selectedCamera)?.placeName}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedCamera(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <DetailedAnalyticsView analytics={analytics.get(selectedCamera)!} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function AnalyticsCard({
  camera,
  cameraAnalytics,
  getDensityColor,
  getDensityText,
  getTrendIcon,
}: {
  camera: { id?: string; placeName: string; latitude: number; longitude: number; status: string };
  cameraAnalytics: CameraAnalytics;
  getDensityColor: (density: DensityLevel) => string;
  getDensityText: (density: DensityLevel) => string;
  getTrendIcon: (trend: string) => ReactNode;
}) {
  return (
    <Card
      className={`border transition-all duration-200 hover:shadow-lg ${densityStyles(cameraAnalytics.crowdDensity).border} ${densityStyles(cameraAnalytics.crowdDensity).light}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                camera.status === 'active' ? 'bg-gray-200' : 'bg-gray-100'
              }`}
            >
              {camera.status === 'active' ? (
                <Wifi className="h-5 w-5 text-gray-800" />
              ) : (
                <WifiOff className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-xl">{camera.placeName}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span className="font-mono text-xs">
                  {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="default"
            className={`${getDensityColor(cameraAnalytics.crowdDensity)} flex items-center gap-1.5 text-white`}
          >
            {getDensityText(cameraAnalytics.crowdDensity)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!cameraAnalytics.detectionAvailable && cameraAnalytics.detectionMessage && (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {cameraAnalytics.detectionMessage}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-600">Total People</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {cameraAnalytics.detectionAvailable ? cameraAnalytics.totalPeople : '—'}
            </p>
            <p className="mt-1 text-xs text-gray-500">Max: {cameraAnalytics.maxCapacity}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-600">Density</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {cameraAnalytics.detectionAvailable ? `${cameraAnalytics.densityPercentage}%` : '—'}
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all ${getDensityColor(cameraAnalytics.crowdDensity)}`}
                style={{ width: `${cameraAnalytics.densityPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              {getTrendIcon(cameraAnalytics.trend)}
              <p className="text-xs font-medium text-gray-600">Trend</p>
            </div>
            <p className="text-sm font-semibold capitalize text-gray-900">
              {cameraAnalytics.detectionAvailable ? cameraAnalytics.trend : 'n/a'}
            </p>
          </div>

          <div
            className={`rounded-lg border p-3 ${
              cameraAnalytics.highCrowdAreas > 0
                ? 'border-gray-400 bg-gray-200'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${
                  cameraAnalytics.highCrowdAreas > 0 ? 'text-gray-800' : 'text-gray-400'
                }`}
              />
              <p className="text-xs font-medium text-gray-600">High Crowd Areas</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {cameraAnalytics.detectionAvailable
                ? `${cameraAnalytics.highCrowdAreas} ${
                    cameraAnalytics.highCrowdAreas === 1 ? 'area' : 'areas'
                  }`
                : '—'}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Capacity Utilization</p>
            <p className="text-xs font-bold text-gray-900">
              {cameraAnalytics.detectionAvailable
                ? `${cameraAnalytics.totalPeople}/${cameraAnalytics.maxCapacity}`
                : '—'}
            </p>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className={`h-3 rounded-full transition-all ${getDensityColor(cameraAnalytics.crowdDensity)}`}
              style={{ width: `${cameraAnalytics.densityPercentage}%` }}
            />
          </div>
          {cameraAnalytics.detectionAvailable && cameraAnalytics.densityPercentage >= 85 && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-800">
              <AlertTriangle className="h-3 w-3" />
              Capacity limit approaching!
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {camera.status === 'active' ? (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-800" />
                <span>Camera online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                <span>Camera offline</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Updated: {cameraAnalytics.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailedAnalyticsView({ analytics }: { analytics: CameraAnalytics }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500">People detected</p>
        <p className="text-2xl font-bold">{analytics.totalPeople}</p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500">Density level</p>
        <p className="text-2xl font-bold capitalize">{analytics.crowdDensity}</p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500">High crowd zones</p>
        <p className="text-2xl font-bold">{analytics.highCrowdAreas}</p>
      </div>
    </div>
  );
}

export default LiveAnalytics;
