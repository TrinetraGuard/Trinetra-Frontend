import { Activity, Camera, Grid, LayoutGrid, List, MapPin, Monitor, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

import { admin } from '@/lib/adminTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CameraFeedCard } from '@/components/cctvcrowd/CameraFeedCard';
import { CameraMonitorWall } from '@/components/cctvcrowd/CameraMonitorWall';
import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { CctvStreamRelayBanner } from '@/components/cctvcrowd/CctvStreamRelayBanner';
import { formatCctvTimestamp, getCameraChannelOrder, sortCamerasByChannel } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import { useCctvCameras } from '@/hooks/useCctvCameras';

type ViewMode = 'grid' | 'list' | 'wall';

const CrowdControl = () => {
  const { cameras, loading } = useCctvCameras();
  const [selectedCamera, setSelectedCamera] = useState<CCTV | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('wall');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCameras = sortCamerasByChannel(
    cameras.filter((camera) => {
      if (filterStatus === 'active') return camera.status === 'active';
      if (filterStatus === 'inactive') return camera.status === 'inactive';
      return true;
    })
  );

  const activeCameras = cameras.filter((camera) => camera.status === 'active').length;
  const inactiveCameras = cameras.filter((camera) => camera.status === 'inactive').length;

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
            <div className="rounded-lg bg-gray-100 p-2">
              <Monitor className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Monitoring</h1>
              <p className="mt-1 text-gray-500">
                Live CCTV feeds from cameras registered in CCTV Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Card className={`${admin.statCard} shadow-sm`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gray-800" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Cameras</p>
                  <p className="text-xl font-bold text-gray-900">{activeCameras}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Offline Cameras</p>
                  <p className="text-xl font-bold text-gray-700">{inactiveCameras}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CctvStreamRelayBanner />

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-lg">Filters & View Options</CardTitle>
              <CardDescription>Filter by status and switch between monitoring layouts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                >
                  All ({cameras.length})
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? 'bg-gray-800 text-white hover:bg-gray-700' : ''}
                >
                  <Wifi className="mr-1 h-3 w-3" />
                  Active ({activeCameras})
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                  className={filterStatus === 'inactive' ? 'bg-gray-600 text-white hover:bg-gray-700' : ''}
                >
                  <WifiOff className="mr-1 h-3 w-3" />
                  Offline ({inactiveCameras})
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Layout:</span>
              <div className="flex gap-2 rounded-lg border border-gray-200 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('wall')}
                  className={viewMode === 'wall' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                  title="Monitor wall"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCameras.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-lg font-medium text-gray-500">No cameras found</p>
              <p className="mt-2 text-sm text-gray-400">
                {filterStatus === 'all'
                  ? 'Add cameras from CCTV Management to start live crowd monitoring.'
                  : `No ${filterStatus} cameras found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'wall' ? (
        <Card>
          <CardHeader>
            <CardTitle>Live Monitor Wall</CardTitle>
            <CardDescription>All active camera feeds in a single operations view</CardDescription>
          </CardHeader>
          <CardContent>
            <CameraMonitorWall
              cameras={filteredCameras}
              onSelectCamera={(camera) => setSelectedCamera(camera)}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCameras.map((camera) => (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              onViewLive={setSelectedCamera}
              variant="grid"
              startupDelayMs={(getCameraChannelOrder(camera) - 1) * 400}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCameras.map((camera) => (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              onViewLive={setSelectedCamera}
              variant="list"
              startupDelayMs={(getCameraChannelOrder(camera) - 1) * 400}
            />
          ))}
        </div>
      )}

      {selectedCamera && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCamera(null)}
        >
          <Card
            className="max-h-[95vh] w-full max-w-7xl overflow-hidden border-gray-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/10 p-2">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">{selectedCamera.placeName}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span className="font-mono text-xs">
                        {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${
                      selectedCamera.status === 'active'
                        ? 'border-gray-400 bg-gray-800'
                        : 'border-gray-500 bg-gray-600'
                    }`}
                  >
                    {selectedCamera.status === 'active' ? (
                      <>
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                        <Wifi className="h-3 w-3" />
                        <span className="font-semibold">LIVE</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" />
                        <span className="font-semibold">OFFLINE</span>
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCamera(null)}
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="bg-black p-0">
              <div className="aspect-video">
                <CCTVStreamPlayer
                  camera={selectedCamera}
                  className="h-full w-full"
                  autoPlay
                  muted={false}
                  showControls
                  showLiveBadge
                />
              </div>
              {selectedCamera.lastStatusCheck && (
                <div className="flex items-center gap-2 border-t border-gray-800 px-4 py-3 text-xs text-gray-400">
                  <RefreshCw className="h-3 w-3" />
                  Last checked: {formatCctvTimestamp(selectedCamera.lastStatusCheck)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CrowdControl;
