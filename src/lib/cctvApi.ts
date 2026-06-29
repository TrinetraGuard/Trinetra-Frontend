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
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Derive the Python backend camera ID from an RTSP URL.
 * Cameras are seeded as "default-c1" … "default-c8".
 */
function rtspToBackendCameraId(rtspUrl: string): string | null {
  const m = /\/unicast\/c(\d+)\//i.exec(rtspUrl);
  if (m) return `default-c${m[1]}`;
  return null;
}

/**
 * Check camera status via the Trinetra AI Python backend.
 * Works in both simulation and real RTSP mode.
 */
async function checkStatusViaTrinetraAI(rtspLink: string, _cameraId?: string): Promise<CctvStatusResult | null> {
  const backendId = rtspToBackendCameraId(rtspLink);
  if (!backendId) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`/trinetra-api/api/v1/cameras/${encodeURIComponent(backendId)}/status`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as { online: boolean; people_count?: number; density_level?: string };
    return {
      status: data.online ? 'active' : 'inactive',
      message: data.online
        ? `AI: ${data.people_count ?? 0} people · ${data.density_level ?? 'low'} density`
        : 'Camera inactive in AI backend',
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/** Legacy: check via Go backend CCTV relay (port 8081). */
async function checkStatusViaGoBackend(
  streamUrl: string,
  cameraId?: string
): Promise<CctvStatusResult | null> {
  const apiBase = getTrinetraApiBase();
  if (!apiBase) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const body: { stream_url: string; camera_id?: string } = { stream_url: streamUrl.trim() };
    if (cameraId) body.camera_id = cameraId;
    const response = await fetch(`${apiBase}/v1/cctv/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = (await response.json()) as CctvStatusResult;
    if (data.status === 'active' || data.status === 'inactive') return data;
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function checkRTSPStatus(
  rtspLink: string,
  cameraId?: string
): Promise<CctvStatusResult> {
  const trimmed = normalizeRtspUrl(rtspLink.trim());

  // 1️⃣ Try Trinetra AI backend first (works in simulation + real mode)
  const aiResult = await checkStatusViaTrinetraAI(trimmed, cameraId);
  if (aiResult) return aiResult;

  // 2️⃣ Try legacy Go backend relay
  const goResult = await checkStatusViaGoBackend(trimmed, cameraId);
  if (goResult) return goResult;

  // 3️⃣ Direct URL probe (HLS/web-playable URLs only)
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

  // 4️⃣ No relay available — mark as saved (optimistic)
  if (!getCctvProxyBase()) {
    return { status: 'active', message: 'RTSP URL saved — AI backend offline' };
  }

  const relayOnline = await probeCctvProxy();
  if (!relayOnline) {
    return { status: 'active', message: 'RTSP URL saved — stream relay offline' };
  }

  const hlsUrl = buildGo2RtcHlsUrl(trimmed);
  if (!hlsUrl) return { status: 'active', message: 'RTSP URL saved' };

  const online = await probeStreamUrl(hlsUrl);
  return {
    status: online ? 'active' : 'inactive',
    message: online ? 'Camera online' : 'Camera offline or unreachable',
  };
}
