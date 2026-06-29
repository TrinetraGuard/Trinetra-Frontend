import type { CCTV, StreamPlayback } from '@/types/cctv';
import { enqueueCctvPlayback } from '@/lib/cctvPlaybackQueue';

const RTSP_PROXY_DEV_PATH = '/cctv-proxy';

/**
 * Normalizes RTSP URLs so passwords with `@` (e.g. cctv@0099) parse correctly.
 * rtsp://admin:cctv@0099@192.168.1.30:554/path → rtsp://admin:cctv%400099@192.168.1.30:554/path
 */
export function normalizeRtspUrl(url: string): string {
  const trimmed = url.trim();
  if (!/^rtsp:\/\//i.test(trimmed)) return trimmed;

  const rest = trimmed.slice(7);
  const lastAt = rest.lastIndexOf('@');
  if (lastAt <= 0) return trimmed;

  const creds = rest.slice(0, lastAt);
  const remainder = rest.slice(lastAt + 1);
  const colonIdx = creds.indexOf(':');
  if (colonIdx <= 0) return trimmed;

  let user = creds.slice(0, colonIdx);
  let pass = creds.slice(colonIdx + 1);
  try {
    user = decodeURIComponent(user);
    pass = decodeURIComponent(pass);
  } catch {
    // keep raw values
  }

  const slashIdx = remainder.indexOf('/');
  const host = slashIdx >= 0 ? remainder.slice(0, slashIdx) : remainder;
  const path = slashIdx >= 0 ? remainder.slice(slashIdx) : '';

  return `rtsp://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}${path}`;
}

export function isValidRtspUrl(url: string): boolean {
  const trimmed = normalizeRtspUrl(url.trim());
  if (!/^rtsp:\/\//i.test(trimmed)) return false;

  const rest = trimmed.slice(7);
  const lastAt = rest.lastIndexOf('@');
  if (lastAt <= 0) return false;

  const hostPart = rest.slice(lastAt + 1);
  return /^[\w.-]+(:\d+)?(\/.*)?$/i.test(hostPart);
}

export function isWebPlayableUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.includes('.m3u8') ||
    /\.(mp4|webm)(\?|$)/.test(trimmed)
  );
}

export function isValidStreamUrl(url: string): boolean {
  const trimmed = url.trim();
  return isValidRtspUrl(trimmed) || isWebPlayableUrl(trimmed);
}

export function maskRtspCredentials(url: string): string {
  const normalized = normalizeRtspUrl(url);
  return normalized.replace(/^(rtsp:\/\/)([^@/]+)@/i, '$1****@');
}

/** Normalizes server origin or API prefix to `.../api`. */
export function normalizeTrinetraApiRoot(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '/api';
  if (trimmed.endsWith('/api')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  try {
    const url = new URL(trimmed);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/' || path === '') {
      return `${url.origin}/api`;
    }
  } catch {
    // Relative or non-URL path.
  }
  return `${trimmed}/api`;
}

/** Trinetra Go backend API root (e.g. /api or https://host/api). */
export function getTrinetraApiBase(): string | null {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configured) return normalizeTrinetraApiRoot(configured);
  if (import.meta.env.DEV) return '/api';
  return null;
}

/**
 * Base URL for RTSP→HLS relay traffic (go2rtc).
 * go2rtc is optional — the AI backend handles all analytics without it.
 */
export function getCctvProxyBase(): string | null {
  const directRelay = (import.meta.env.VITE_CCTV_PROXY_URL as string | undefined)?.trim();
  if (directRelay) return directRelay.replace(/\/$/, '');
  // Do NOT fall back to Go backend or dev proxy — go2rtc is no longer required.
  return null;
}

export function isStreamProxyConfigured(): boolean {
  return getCctvProxyBase() !== null;
}

export function buildGo2RtcHlsUrl(rtspLink: string): string | null {
  const proxyBase = getCctvProxyBase();
  if (!proxyBase) return null;
  return `${proxyBase}/api/stream.m3u8?src=${encodeURIComponent(rtspLink.trim())}`;
}

/** Stable go2rtc stream id — prefer NVR channel (c1…c8) over Firestore doc id. */
export function getStableStreamId(camera: CCTV, source?: string): string {
  const link = normalizeRtspUrl((source ?? camera.rtspLink).trim());
  const channelMatch = link.match(/\/unicast\/c(\d+)\//i);
  if (channelMatch) return `c${channelMatch[1]}`;

  if (camera.id?.startsWith('default-c')) {
    return camera.id.replace('default-', '');
  }
  if (camera.id) return camera.id;

  return `stream-${link.slice(-16)}`;
}

/** Channel number for sort order (1–8), or 999 if unknown. */
export function getCameraChannelOrder(camera: CCTV): number {
  const match = normalizeRtspUrl(camera.rtspLink).match(/\/unicast\/c(\d+)\//i);
  return match ? Number.parseInt(match[1], 10) : 999;
}

export function sortCamerasByChannel(cameras: CCTV[]): CCTV[] {
  return [...cameras].sort(
    (a, b) => getCameraChannelOrder(a) - getCameraChannelOrder(b)
  );
}

function toDate(value: CCTV['lastStatusCheck'] | CCTV['updatedAt']): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && 'toDate' in value) return value.toDate();
  return new Date(value as Date);
}

function cameraRecencyScore(camera: CCTV): number {
  let score = 0;
  if (camera.status === 'active') score += 1_000_000;
  const lastCheck = toDate(camera.lastStatusCheck);
  if (lastCheck) score += lastCheck.getTime();
  const updated = toDate(camera.updatedAt);
  if (updated) score += updated.getTime() / 1000;
  return score;
}

/** Stable key for deduplicating site NVR cameras (one row per channel). */
export function getCameraDedupeKey(camera: CCTV): string {
  const channel = getCameraChannelOrder(camera);
  if (channel < 999) return `channel:c${channel}`;
  return `url:${normalizeRtspUrl(camera.rtspLink)}`;
}

/** Keeps the best Firestore record when the same NVR channel was imported twice. */
export function dedupeCamerasByChannel(cameras: CCTV[]): CCTV[] {
  const bestByKey = new Map<string, CCTV>();

  for (const camera of cameras) {
    const key = getCameraDedupeKey(camera);
    const existing = bestByKey.get(key);
    if (!existing || cameraRecencyScore(camera) > cameraRecencyScore(existing)) {
      bestByKey.set(key, camera);
    }
  }

  return sortCamerasByChannel([...bestByKey.values()]);
}

export function getStreamPlaybackUrl(camera: CCTV): StreamPlayback | null {
  const source = camera.rtspLink.trim();

  if (isWebPlayableUrl(source)) {
    if (source.toLowerCase().includes('.m3u8')) {
      return { url: source, type: 'hls' };
    }
    return { url: source, type: 'native' };
  }

  if (!isValidRtspUrl(source)) {
    return null;
  }

  // RTSP requires backend registration with go2rtc — use resolveStreamPlayback().
  return null;
}

/** Rewrites backend proxy URLs to match the configured API host (avoids 127.0.0.1 vs localhost mismatches). */
export function normalizePlaybackUrl(url: string): string {
  const apiBase = getTrinetraApiBase();
  if (!apiBase || !url) return url;

  try {
    const playback = new URL(url);
    const match = playback.pathname.match(/\/api\/v1\/cctv\/proxy\/.*$/);
    if (!match) return url;

    if (apiBase.startsWith('/')) {
      return `${match[0]}${playback.search}`;
    }

    const apiRoot = new URL(apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`);
    return `${apiRoot.origin}${match[0]}${playback.search}`;
  } catch {
    return url;
  }
}

export function formatCctvTimestamp(
  value: Date | { toDate: () => Date } | undefined
): string {
  if (!value) return 'Never';
  const date =
    typeof value === 'object' && 'toDate' in value
      ? value.toDate()
      : new Date(value as Date);
  return date.toLocaleTimeString();
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function probeCctvProxy(): Promise<boolean> {
  const health = await fetchCctvRelayHealth();
  return health.online;
}

export interface CctvRelayHealth {
  online: boolean;
  message?: string;
}

export interface CctvNvrHealth {
  online: boolean;
  host?: string;
  port?: string;
  message?: string;
}

/**
 * Check Trinetra AI backend health.
 * Replaces go2rtc relay check — all camera status now comes from the Python backend.
 */
export async function fetchCctvRelayHealth(): Promise<CctvRelayHealth> {
  try {
    const response = await fetchWithTimeout('/trinetra-api/api/v1/health', { method: 'GET' }, 5000);
    if (response.ok) {
      const data = (await response.json()) as { status: string; cameras_live: number; cameras_total: number };
      if (data.status === 'ok') {
        return {
          online: true,
          message: `AI Backend online · ${data.cameras_live}/${data.cameras_total} cameras live`,
        };
      }
    }
    return { online: false, message: 'AI Backend returned an error' };
  } catch {
    return { online: false, message: 'AI Backend unreachable — start Trinetra-backend' };
  }
}

/**
 * Check NVR / camera reachability via AI backend camera status endpoint.
 * Replaces Go backend NVR health check.
 */
export async function probeCctvNvr(rtspSource: string): Promise<CctvNvrHealth> {
  const source = normalizeRtspUrl(rtspSource.trim());
  const channelMatch = /\/unicast\/c(\d+)\//i.exec(source);
  const cameraId = channelMatch ? `default-c${channelMatch[1]}` : null;

  if (!cameraId) {
    return { online: false, message: 'Could not determine camera ID from RTSP URL' };
  }

  try {
    const response = await fetchWithTimeout(
      `/trinetra-api/api/v1/cameras/${encodeURIComponent(cameraId)}/status`,
      { method: 'GET' },
      5000
    );
    if (response.ok) {
      const data = (await response.json()) as { online: boolean; people_count?: number };
      return {
        online: data.online,
        message: data.online
          ? `Camera active · ${data.people_count ?? 0} people detected`
          : 'Camera inactive in AI backend',
      };
    }
    return { online: false, message: 'Camera status unavailable' };
  } catch {
    return { online: false, message: 'AI Backend unreachable' };
  }
}

export type StreamPlaybackResult = {
  playback: StreamPlayback | null;
  errorMessage?: string;
};

/**
 * Resolves HLS playback URL via the Trinetra AI backend's FFmpeg HLS streamer.
 * The backend converts each RTSP stream to HLS using ffmpeg subprocesses.
 */
export async function resolveStreamPlayback(camera: CCTV): Promise<StreamPlaybackResult> {
  const source = normalizeRtspUrl(camera.rtspLink.trim());
  if (!source) return { playback: null, errorMessage: 'Missing stream URL' };

  // Prefer direct web-playable URLs (HTTP HLS/MP4)
  const direct = getStreamPlaybackUrl({ ...camera, rtspLink: source });
  if (direct) return { playback: direct };

  // Extract channel number from RTSP URL (e.g. /unicast/c3/s0/live → 3)
  const channelMatch = /\/unicast\/c(\d+)\//i.exec(source);
  if (!channelMatch) {
    return { playback: null, errorMessage: 'Cannot determine camera channel from RTSP URL' };
  }
  const channel = channelMatch[1];

  try {
    // Check if this channel's HLS stream is ready
    const statusRes = await fetchWithTimeout(
      `/trinetra-api/api/v1/streams/${channel}/status`,
      { method: 'GET' },
      5000
    );

    if (statusRes.ok) {
      const status = (await statusRes.json()) as { ready: boolean; hls_url: string | null };
      if (status.ready && status.hls_url) {
        // Proxy through Vite /trinetra-api so CORS is handled correctly
        const hlsUrl = `/trinetra-api${status.hls_url}`;
        return { playback: { url: hlsUrl, type: 'hls' } };
      }
      // Stream not ready yet — still starting up
      return {
        playback: null,
        errorMessage: `Camera ${channel} stream is starting up — please wait a few seconds and retry`,
      };
    }

    return {
      playback: null,
      errorMessage: 'AI backend stream endpoint not reachable',
    };
  } catch {
    return {
      playback: null,
      errorMessage: 'Could not reach Trinetra AI backend — make sure it is running on port 8000',
    };
  }
}
