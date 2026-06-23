import {
  getCctvProxyBase,
  getStableStreamId,
  normalizePlaybackUrl,
  normalizeRtspUrl,
  resolveStreamPlayback,
} from '@/lib/cctv';
import { GEMINI_GENERATE_URL, getGeminiApiKey } from '@/lib/gemini';
import type { DensityLevel } from '@/lib/adminTheme';
import type { CrowdTrend, CameraAnalytics } from '@/types/cctvAnalytics';
import type { CCTV } from '@/types/cctv';

/** Estimated max people visible in a single site camera frame. */
export const DEFAULT_CAMERA_MAX_CAPACITY = 150;

export interface SnapshotAnalysis {
  people: number;
  highCrowdAreas: number;
}

export function getGo2RtcStreamName(camera: CCTV, source?: string): string {
  const link = normalizeRtspUrl((source ?? camera.rtspLink).trim());
  const channelMatch = link.match(/\/unicast\/c(\d+)\//i);
  if (channelMatch) return `cam-c${channelMatch[1]}`;

  const stableId = getStableStreamId(camera, link);
  if (stableId.startsWith('c') && stableId.length <= 3) return `cam-${stableId}`;
  return `cam-${stableId}`;
}

export function buildCctvSnapshotUrl(streamName: string): string | null {
  const proxyBase = getCctvProxyBase();
  if (!proxyBase) return null;
  return `${proxyBase}/api/frame.jpeg?src=${encodeURIComponent(streamName)}`;
}

export function computeDensityLevel(peopleCount: number, maxCapacity: number): DensityLevel {
  const densityPercentage = maxCapacity > 0 ? (peopleCount / maxCapacity) * 100 : 0;
  if (densityPercentage < 30) return 'low';
  if (densityPercentage < 60) return 'medium';
  if (densityPercentage < 85) return 'high';
  return 'critical';
}

export function computeDensityPercentage(peopleCount: number, maxCapacity: number): number {
  if (maxCapacity <= 0) return 0;
  return Math.min(100, Math.round((peopleCount / maxCapacity) * 100));
}

export function computeTrend(history: number[], current: number): CrowdTrend {
  if (history.length < 2) return 'stable';

  const previous = history[history.length - 1];
  const sample = history.slice(-3);
  const average = sample.reduce((sum, value) => sum + value, 0) / sample.length;

  if (current > previous + 2 || current > average + 3) return 'increasing';
  if (current < previous - 2 || current < average - 3) return 'decreasing';
  return 'stable';
}

export async function ensureCameraStreamReady(camera: CCTV): Promise<boolean> {
  const { playback } = await resolveStreamPlayback(camera);
  return Boolean(playback?.url);
}

export async function fetchCameraSnapshotBlob(streamName: string): Promise<Blob | null> {
  const snapshotUrl = buildCctvSnapshotUrl(streamName);
  if (!snapshotUrl) return null;

  const response = await fetch(normalizePlaybackUrl(snapshotUrl), {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('image')) return null;

  return response.blob();
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read snapshot'));
        return;
      }
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read snapshot'));
    reader.readAsDataURL(blob);
  });
}

function parseGeminiAnalysis(text: string): SnapshotAnalysis | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      people?: number;
      highCrowdAreas?: number;
      high_density_zones?: number;
    };
    const people = Number(parsed.people);
    if (!Number.isFinite(people) || people < 0) return null;

    const highCrowdAreas = Number(parsed.highCrowdAreas ?? parsed.high_density_zones ?? 0);
    return {
      people: Math.round(people),
      highCrowdAreas: Number.isFinite(highCrowdAreas) && highCrowdAreas >= 0 ? Math.round(highCrowdAreas) : 0,
    };
  } catch {
    return null;
  }
}

export async function analyzeSnapshotWithGemini(blob: Blob): Promise<SnapshotAnalysis | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const base64 = await blobToBase64(blob);
  const response = await fetch(GEMINI_GENERATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                'You analyze CCTV security camera frames for crowd monitoring at a pilgrimage site. ' +
                'Count every visible person (including partial bodies). Divide the frame mentally into a 3x3 grid and count how many grid cells contain 2 or more people (high-density zones). ' +
                'Respond with ONLY valid JSON: {"people": number, "highCrowdAreas": number}. No markdown.',
            },
            {
              inline_data: {
                mime_type: blob.type || 'image/jpeg',
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 128,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return parseGeminiAnalysis(text);
}

export function buildOfflineAnalytics(camera: CCTV, maxCapacity: number): CameraAnalytics {
  return {
    cameraId: camera.id ?? camera.placeName,
    placeName: camera.placeName,
    totalPeople: 0,
    crowdDensity: 'low',
    densityPercentage: 0,
    maxCapacity,
    highCrowdAreas: 0,
    trend: 'stable',
    lastUpdate: new Date(),
    status: camera.status,
    detectionAvailable: false,
    detectionMessage: 'Camera offline — no live detection',
  };
}

export function buildAnalyticsFromAnalysis(
  camera: CCTV,
  analysis: SnapshotAnalysis,
  history: number[],
  maxCapacity: number
): CameraAnalytics {
  const totalPeople = analysis.people;
  const crowdDensity = computeDensityLevel(totalPeople, maxCapacity);
  const densityPercentage = computeDensityPercentage(totalPeople, maxCapacity);

  return {
    cameraId: camera.id ?? camera.placeName,
    placeName: camera.placeName,
    totalPeople,
    crowdDensity,
    densityPercentage,
    maxCapacity,
    highCrowdAreas: analysis.highCrowdAreas,
    trend: computeTrend(history, totalPeople),
    lastUpdate: new Date(),
    status: camera.status,
    detectionAvailable: true,
  };
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(getGeminiApiKey() && getCctvProxyBase());
}
