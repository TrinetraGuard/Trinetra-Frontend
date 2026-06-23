import type { CCTV } from '@/types/cctv';
import { normalizeRtspUrl } from '@/lib/cctv';

/** Site NVR at 192.168.1.30 — password contains @, stored URL-encoded. */
const NVR_HOST = '192.168.1.30:554';
const NVR_USER = 'admin';
const NVR_PASS = 'cctv@0099';

function buildNvrRtspUrl(channel: number): string {
  const raw = `rtsp://${NVR_USER}:${NVR_PASS}@${NVR_HOST}/unicast/c${channel}/s0/live`;
  return normalizeRtspUrl(raw);
}

/** Default pilgrimage-site cameras (seeded into Firestore when collection is empty). */
export const DEFAULT_CCTV_CAMERAS: Omit<
  CCTV,
  'createdAt' | 'updatedAt' | 'lastStatusCheck'
>[] = Array.from({ length: 8 }, (_, index) => {
  const channel = index + 1;
  return {
    id: `default-c${channel}`,
    placeName: `Site Camera ${channel}`,
    rtspLink: buildNvrRtspUrl(channel),
    latitude: 19.9975,
    longitude: 73.7898,
    status: 'active' as const,
  };
});

export function getDefaultCamerasForDisplay(): CCTV[] {
  return DEFAULT_CCTV_CAMERAS.map((camera) => ({ ...camera }));
}
