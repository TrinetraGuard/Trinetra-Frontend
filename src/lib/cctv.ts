import type { CCTV, StreamPlayback } from '@/types/cctv';

const RTSP_PATTERN =
  /^rtsp:\/\/(?:[^@\s]+@)?[\w.-]+(?::\d+)?(?:\/[^\s]*)?$/i;

export function isValidRtspUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith('rtsp://') && RTSP_PATTERN.test(trimmed);
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

export function maskRtspCredentials(url: string): string {
  return url.replace(/^(rtsp:\/\/)([^@/]+)@/i, '$1****@');
}

export function getCctvProxyBase(): string | null {
  const dedicated = (import.meta.env.VITE_CCTV_PROXY_URL as string | undefined)?.trim();
  if (dedicated) return dedicated.replace(/\/$/, '');

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (apiBase) return apiBase.replace(/\/$/, '');

  return null;
}

export function getCctvProxyType(): 'go2rtc' | 'api' {
  const configured = (import.meta.env.VITE_CCTV_PROXY_TYPE as string | undefined)?.trim()?.toLowerCase();
  return configured === 'api' ? 'api' : 'go2rtc';
}

export function getStreamPlaybackUrl(camera: CCTV): StreamPlayback | null {
  const source = camera.rtspLink.trim();

  if (isWebPlayableUrl(source)) {
    if (source.includes('.m3u8')) {
      return { url: source, type: 'hls' };
    }
    return { url: source, type: 'native' };
  }

  if (!isValidRtspUrl(source)) {
    return null;
  }

  const proxyBase = getCctvProxyBase();
  if (!proxyBase) {
    return null;
  }

  if (getCctvProxyType() === 'api') {
    if (!camera.id) return null;
    return {
      url: `${proxyBase}/cctv/${camera.id}/stream.m3u8`,
      type: 'hls',
    };
  }

  return {
    url: `${proxyBase}/api/stream.m3u8?src=${encodeURIComponent(source)}`,
    type: 'hls',
  };
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

export function isStreamProxyConfigured(): boolean {
  return getCctvProxyBase() !== null;
}
