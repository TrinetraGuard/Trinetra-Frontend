import { LayoutGrid, MonitorPlay, VideoOff } from 'lucide-react';

import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { getCameraChannelOrder, sortCamerasByChannel } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';

interface CameraMonitorWallProps {
  cameras: CCTV[];
  streamsEnabled?: boolean;
  nvrMessage?: string;
  onSelectCamera?: (camera: CCTV) => void;
}

function OfflineFeedPlaceholder({
  camera,
  message,
  onSelect,
}: {
  camera: CCTV;
  message?: string;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className="group overflow-hidden rounded-xl border border-gray-800 bg-black text-left shadow-lg transition hover:ring-2 hover:ring-orange-500/70"
      onClick={onSelect}
    >
      <div className="relative aspect-video">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-900 to-black px-4 text-center text-white">
          <VideoOff className="h-8 w-8 text-red-400" />
          <p className="text-sm font-medium">Feed unavailable</p>
          {!message && (
            <p className="text-xs text-gray-400">Waiting for NVR connection</p>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
          <p className="truncate text-sm font-semibold text-white">{camera.placeName}</p>
        </div>
      </div>
    </button>
  );
}

export function CameraMonitorWall({
  cameras,
  streamsEnabled = true,
  nvrMessage,
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
          Showing {orderedCameras.length} camera feed{orderedCameras.length === 1 ? '' : 's'}
          {!streamsEnabled ? ' — NVR offline, live video paused' : ''}
        </span>
      </div>
      {!streamsEnabled && nvrMessage && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {nvrMessage}
        </p>
      )}
      <div className={`grid gap-4 ${gridClass}`}>
        {orderedCameras.map((camera) => {
          const channel = getCameraChannelOrder(camera);
          const startupDelayMs = channel < 999 ? (channel - 1) * 400 : 0;

          if (!streamsEnabled) {
            return (
              <OfflineFeedPlaceholder
                key={camera.id ?? camera.placeName}
                camera={camera}
                message={nvrMessage}
                onSelect={() => onSelectCamera?.(camera)}
              />
            );
          }

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
