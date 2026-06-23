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
 * Base URL for RTSP→HLS relay traffic.
 * Prefers Trinetra backend proxy, then direct go2rtc, then dev vite proxy.
 */
export function getCctvProxyBase(): string | null {
  const directRelay = (import.meta.env.VITE_CCTV_PROXY_URL as string | undefined)?.trim();
  if (directRelay) return directRelay.replace(/\/$/, '');

  const apiBase = getTrinetraApiBase();
  if (apiBase) return `${apiBase}/v1/cctv/proxy`;

  if (import.meta.env.DEV) return RTSP_PROXY_DEV_PATH;

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

export async function fetchCctvRelayHealth(): Promise<CctvRelayHealth> {
  const apiBase = getTrinetraApiBase();
  if (apiBase) {
    try {
      const response = await fetchWithTimeout(`${apiBase}/v1/cctv/relay/health`, { method: 'GET' }, 4000);
      if (response.ok) {
        return (await response.json()) as CctvRelayHealth;
      }
    } catch {
      // Fall through to direct relay probe.
    }
  }

  const proxyBase = getCctvProxyBase();
  if (!proxyBase) {
    return { online: false, message: 'Stream relay is not configured' };
  }

  try {
    const response = await fetchWithTimeout(`${proxyBase}/api/config`, { method: 'GET' }, 4000);
    return response.ok
      ? { online: true, message: 'Stream relay online' }
      : { online: false, message: 'Stream relay returned an error' };
  } catch {
    return { online: false, message: 'Stream relay unreachable' };
  }
}

export async function probeCctvNvr(rtspSource: string): Promise<CctvNvrHealth> {
  const source = normalizeRtspUrl(rtspSource.trim());
  if (!isValidRtspUrl(source)) {
    return { online: false, message: 'Invalid RTSP URL' };
  }

  const apiBase = getTrinetraApiBase();
  if (!apiBase) {
    return { online: false, message: 'Backend required to probe NVR reachability' };
  }

  try {
    const params = new URLSearchParams({ src: source });
    const response = await fetchWithTimeout(
      `${apiBase}/v1/cctv/nvr/health?${params.toString()}`,
      { method: 'GET' },
      8000
    );
    if (response.ok) {
      return (await response.json()) as CctvNvrHealth;
    }
    const err = (await response.json().catch(() => null)) as { error?: string } | null;
    return { online: false, message: err?.error ?? 'NVR health check failed' };
  } catch {
    return { online: false, message: 'Could not reach backend for NVR health check' };
  }
}

export type StreamPlaybackResult = {
  playback: StreamPlayback | null;
  errorMessage?: string;
};

/** Resolves playback URL via backend (registers RTSP streams with go2rtc). */
export async function resolveStreamPlayback(camera: CCTV): Promise<StreamPlaybackResult> {
  const source = normalizeRtspUrl(camera.rtspLink.trim());
  if (!source) return { playback: null, errorMessage: 'Missing stream URL' };

  const direct = getStreamPlaybackUrl({ ...camera, rtspLink: source });
  if (direct) return { playback: direct };

  const apiBase = getTrinetraApiBase();
  if (!apiBase) {
    return {
      playback: null,
      errorMessage: 'Start the Trinetra backend and stream relay to play RTSP cameras in the browser.',
    };
  }

  const params = new URLSearchParams({ src: source });
  params.set('camera_id', getStableStreamId(camera, source));

  try {
    const response = await enqueueCctvPlayback(() =>
      fetchWithTimeout(
        `${apiBase}/v1/cctv/stream/playback?${params.toString()}`,
        { method: 'GET' },
        45000
      )
    );
    if (!response.ok) {
      const err = (await response.json().catch(() => null)) as { error?: string } | null;
      const message = err?.error ?? `Playback request failed (${response.status})`;
      console.error('[cctv] playback failed:', message);
      return { playback: null, errorMessage: message };
    }
    const data = (await response.json()) as StreamPlayback;
    if (!data.url || !data.type) {
      return { playback: null, errorMessage: 'Backend returned an invalid playback response' };
    }
    return { playback: { ...data, url: normalizePlaybackUrl(data.url) } };
  } catch (error) {
    console.error('[cctv] playback request failed:', error);
    return { playback: null, errorMessage: 'Could not reach the Trinetra backend for stream playback' };
  }
}
