import {
  getCctvProxyBase,
  getCctvProxyType,
  isValidRtspUrl,
  isWebPlayableUrl,
} from '@/lib/cctv';
import type { CCTVStatus } from '@/types/cctv';

export interface CctvStatusResult {
  status: CCTVStatus;
  message?: string;
}

async function probeGo2RtcStream(rtspLink: string): Promise<CCTVStatus> {
  const proxyBase = getCctvProxyBase();
  if (!proxyBase) {
    return isValidRtspUrl(rtspLink) ? 'active' : 'inactive';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const probeUrl = `${proxyBase}/api/stream.m3u8?src=${encodeURIComponent(rtspLink)}`;
    const response = await fetch(probeUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok ? 'active' : 'inactive';
  } catch {
    clearTimeout(timeoutId);
    return 'inactive';
  }
}

async function probeApiStream(cameraId: string): Promise<CCTVStatus> {
  const proxyBase = getCctvProxyBase();
  if (!proxyBase) return 'inactive';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${proxyBase}/cctv/${cameraId}/status`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return 'inactive';

    const data = (await response.json()) as { status?: string; active?: boolean };
    if (data.active === true || data.status === 'online' || data.status === 'active') {
      return 'active';
    }
    return 'inactive';
  } catch {
    clearTimeout(timeoutId);
    return 'inactive';
  }
}

export async function checkRTSPStatus(
  rtspLink: string,
  cameraId?: string
): Promise<CctvStatusResult> {
  const trimmed = rtspLink.trim();

  if (isWebPlayableUrl(trimmed)) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(trimmed, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return {
        status: response.ok ? 'active' : 'inactive',
        message: response.ok ? 'Stream reachable' : 'Stream unreachable',
      };
    } catch {
      clearTimeout(timeoutId);
      return { status: 'inactive', message: 'Stream unreachable' };
    }
  }

  if (!isValidRtspUrl(trimmed)) {
    return { status: 'inactive', message: 'Invalid RTSP URL format' };
  }

  if (getCctvProxyType() === 'api' && cameraId) {
    const status = await probeApiStream(cameraId);
    return {
      status,
      message: status === 'active' ? 'Camera online' : 'Camera offline',
    };
  }

  const status = await probeGo2RtcStream(trimmed);
  return {
    status,
    message:
      status === 'active'
        ? 'Stream online'
        : getCctvProxyBase()
          ? 'Stream offline or proxy unreachable'
          : 'Valid RTSP URL (configure VITE_CCTV_PROXY_URL for live check)',
  };
}
