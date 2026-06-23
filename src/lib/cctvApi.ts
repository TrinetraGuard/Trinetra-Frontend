import {
  buildGo2RtcHlsUrl,
  getCctvProxyBase,
  getTrinetraApiBase,
  isValidRtspUrl,
  isWebPlayableUrl,
  normalizeRtspUrl,
  probeCctvProxy,
} from '@/lib/cctv';
import type { CCTVStatus } from '@/types/cctv';

export interface CctvStatusResult {
  status: CCTVStatus;
  message?: string;
}

async function probeStreamUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

async function checkStatusViaBackend(
  streamUrl: string,
  cameraId?: string
): Promise<CctvStatusResult | null> {
  const apiBase = getTrinetraApiBase();
  if (!apiBase) return null;

  try {
    const body: { stream_url: string; camera_id?: string } = {
      stream_url: streamUrl.trim(),
    };
    if (cameraId) body.camera_id = cameraId;

    const response = await fetch(`${apiBase}/v1/cctv/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as CctvStatusResult;
    if (data.status === 'active' || data.status === 'inactive') {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkRTSPStatus(
  rtspLink: string,
  cameraId?: string
): Promise<CctvStatusResult> {
  const trimmed = normalizeRtspUrl(rtspLink.trim());

  const backendResult = await checkStatusViaBackend(trimmed, cameraId);
  if (backendResult) return backendResult;

  if (isWebPlayableUrl(trimmed)) {
    const online = await probeStreamUrl(trimmed);
    return {
      status: online ? 'active' : 'inactive',
      message: online ? 'Stream online' : 'Stream unreachable',
    };
  }

  if (!isValidRtspUrl(trimmed)) {
    return { status: 'inactive', message: 'Invalid stream URL format' };
  }

  if (!getCctvProxyBase()) {
    return {
      status: 'active',
      message: 'RTSP URL saved',
    };
  }

  const relayOnline = await probeCctvProxy();
  if (!relayOnline) {
    return {
      status: 'active',
      message: 'RTSP URL saved — start Trinetra backend and stream relay for live preview',
    };
  }

  const hlsUrl = buildGo2RtcHlsUrl(trimmed);
  if (!hlsUrl) {
    return { status: 'active', message: 'RTSP URL saved' };
  }

  const online = await probeStreamUrl(hlsUrl);
  return {
    status: online ? 'active' : 'inactive',
    message: online ? 'Camera online' : 'Camera offline or unreachable from stream relay',
  };
}
