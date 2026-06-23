import type { CCTV, StreamPlayback } from '@/types/cctv';

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

/** Resolves playback URL via backend (registers RTSP streams with go2rtc). */
export async function resolveStreamPlayback(camera: CCTV): Promise<StreamPlayback | null> {
  const source = normalizeRtspUrl(camera.rtspLink.trim());
  if (!source) return null;

  const direct = getStreamPlaybackUrl({ ...camera, rtspLink: source });
  if (direct) return direct;

  const apiBase = getTrinetraApiBase();
  if (!apiBase) return null;

  const params = new URLSearchParams({ src: source });
  const streamId = camera.id ?? `cam-${source.slice(-12)}`;
  params.set('camera_id', streamId);

  try {
    const response = await fetchWithTimeout(
      `${apiBase}/v1/cctv/stream/playback?${params.toString()}`,
      { method: 'GET' },
      45000
    );
    if (!response.ok) {
      const err = (await response.json().catch(() => null)) as { error?: string } | null;
      console.error('[cctv] playback failed:', err?.error ?? response.status);
      return null;
    }
    const data = (await response.json()) as StreamPlayback;
    if (!data.url || !data.type) return null;
    return data;
  } catch (error) {
    console.error('[cctv] playback request failed:', error);
    return null;
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
  const apiBase = getTrinetraApiBase();
  if (apiBase) {
    try {
      const response = await fetchWithTimeout(`${apiBase}/v1/cctv/relay/health`, { method: 'GET' }, 4000);
      if (response.ok) {
        const data = (await response.json()) as { online?: boolean };
        return data.online === true;
      }
    } catch {
      // Fall through to direct relay probe.
    }
  }

  const proxyBase = getCctvProxyBase();
  if (!proxyBase) return false;

  try {
    const response = await fetchWithTimeout(`${proxyBase}/api/config`, { method: 'GET' }, 4000);
    return response.ok;
  } catch {
    return false;
  }
}
