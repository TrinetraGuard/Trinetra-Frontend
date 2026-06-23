import { LayoutGrid, MonitorPlay } from 'lucide-react';

import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { getCameraChannelOrder, sortCamerasByChannel } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';

interface CameraMonitorWallProps {
  cameras: CCTV[];
  onSelectCamera?: (camera: CCTV) => void;
}

export function CameraMonitorWall({ cameras, onSelectCamera }: CameraMonitorWallProps) {
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
          Showing {orderedCameras.length} camera feed{orderedCameras.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className={`grid gap-4 ${gridClass}`}>
        {orderedCameras.map((camera) => {
          const channel = getCameraChannelOrder(camera);
          const startupDelayMs = channel < 999 ? (channel - 1) * 400 : 0;

          return (
            <button
              key={camera.id ?? camera.placeName}
              type="button"
              className="group overflow-hidden rounded-xl border border-gray-800 bg-black text-left shadow-lg transition hover:ring-2 hover:ring-orange-500/70"
              onClick={() => onSelectCamera?.(camera)}
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
                  startupDelayMs={startupDelayMs}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                  <p className="truncate text-sm font-semibold text-white">{camera.placeName}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CameraMonitorWall;
