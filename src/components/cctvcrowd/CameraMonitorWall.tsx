import { LayoutGrid, MonitorPlay } from 'lucide-react';

import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import type { CCTV } from '@/types/cctv';

interface CameraMonitorWallProps {
  cameras: CCTV[];
  onSelectCamera?: (camera: CCTV) => void;
}

export function CameraMonitorWall({ cameras, onSelectCamera }: CameraMonitorWallProps) {
  const activeCameras = cameras.filter((camera) => camera.status === 'active');

  if (activeCameras.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
        <MonitorPlay className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="font-medium text-gray-600">No active cameras for the monitor wall</p>
        <p className="mt-2 text-sm text-gray-400">
          Add cameras in CCTV Management and ensure their RTSP streams are online.
        </p>
      </div>
    );
  }

  const gridClass =
    activeCameras.length === 1
      ? 'grid-cols-1'
      : activeCameras.length <= 4
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <LayoutGrid className="h-4 w-4" />
        <span>
          Showing {activeCameras.length} live feed{activeCameras.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className={`grid gap-4 ${gridClass}`}>
        {activeCameras.map((camera) => (
          <button
            key={camera.id}
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
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <p className="truncate text-sm font-semibold text-white">{camera.placeName}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CameraMonitorWall;
