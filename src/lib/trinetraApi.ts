/**
 * Trinetra AI Backend API client.
 * Base URL: /trinetra-api (proxied to http://localhost:8000 in dev).
 */

const API_BASE = import.meta.env.VITE_TRINETRA_API_URL ?? '/trinetra-api';
const WS_BASE = import.meta.env.VITE_TRINETRA_WS_URL ?? (
  typeof window !== 'undefined'
    ? `ws://${window.location.hostname}:8000/api/v1/ws`
    : 'ws://localhost:8000/api/v1/ws'
);

// ── Types ────────────────────────────────────────────────────────────────

export interface LiveCameraAnalytics {
  camera_id: string;
  place_name: string;
  channel: number;
  people_count: number;
  density_level: 'low' | 'medium' | 'high' | 'critical';
  density_percentage: number;
  high_crowd_zones: number;
  trend: 'stable' | 'increasing' | 'decreasing';
  detection_available: boolean;
  detection_message?: string;
  is_active: boolean;
  last_update: string;
  latitude: number;
  longitude: number;
}

export interface SiteSummary {
  total_people: number;
  active_cameras: number;
  total_cameras: number;
  high_density_count: number;
  critical_count: number;
  last_update: string;
}

export interface LiveAnalyticsResponse {
  summary: SiteSummary;
  cameras: LiveCameraAnalytics[];
}

export interface CrowdLogEntry {
  id: number;
  camera_id: string;
  place_name: string;
  people_count: number;
  density_level: 'low' | 'medium' | 'high' | 'critical';
  density_percentage: number;
  high_crowd_zones: number;
  trend: string;
  detection_confidence: number;
  timestamp: string;
}

export interface DensityBucket {
  hour: string;
  avg_people: number;
  max_people: number;
  min_people: number;
}

export interface CrowdDensityReport {
  camera_id: string;
  place_name: string;
  today_buckets: DensityBucket[];
  weekly_avg: number[];
  peak_hour: string | null;
  current_count: number;
  density_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface PredictionPoint {
  time_label: string;
  predicted_people: number;
  confidence: number;
}

export interface CrowdPrediction {
  camera_id: string;
  place_name: string;
  next_1h: PredictionPoint[];
  next_6h: PredictionPoint[];
  next_24h: PredictionPoint[];
  recommendation: string;
}

export interface LostPerson {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  description?: string;
  last_seen_location?: string;
  contact_name?: string;
  contact_phone?: string;
  photo_url?: string;
  status: 'missing' | 'found' | 'closed';
  found_camera_id?: string;
  found_at?: string;
  reported_at: string;
  updated_at: string;
  detections: FaceDetection[];
}

export interface FaceDetection {
  id: number;
  camera_id: string;
  camera_name?: string;
  similarity_score: number;
  snapshot_path?: string;
  detected_at: string;
  verified: boolean;
}

export interface AlertEntry {
  id: number;
  camera_id: string;
  alert_type: string;
  message: string;
  people_count: number;
  density_level: string;
  resolved: boolean;
  created_at: string;
}

export interface WsMessage {
  event: 'analytics_update' | 'alert' | 'face_match' | 'initial_state' | 'ping';
  data: Record<string, unknown>;
  timestamp: string;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Analytics ─────────────────────────────────────────────────────────────

export const getLiveAnalytics = (): Promise<LiveAnalyticsResponse> =>
  apiGet('/api/v1/analytics/live');

export const getCrowdLogs = (cameraId?: string, hours = 24, limit = 500): Promise<CrowdLogEntry[]> =>
  apiGet(`/api/v1/analytics/logs?hours=${hours}&limit=${limit}${cameraId ? `&camera_id=${cameraId}` : ''}`);

export const getCrowdDensity = (dateStr?: string): Promise<CrowdDensityReport[]> =>
  apiGet(`/api/v1/analytics/density${dateStr ? `?date_str=${dateStr}` : ''}`);

export const getCrowdPredictions = (): Promise<CrowdPrediction[]> =>
  apiGet('/api/v1/analytics/predictions');

// ── Alerts ────────────────────────────────────────────────────────────────

export const getAlerts = (resolved?: boolean, hours = 24): Promise<AlertEntry[]> =>
  apiGet(`/api/v1/alerts?hours=${hours}${resolved !== undefined ? `&resolved=${resolved}` : ''}`);

// ── Lost & Found ──────────────────────────────────────────────────────────

export const getLostPersons = (status?: string): Promise<LostPerson[]> =>
  apiGet(`/api/v1/lost-found${status ? `?status_filter=${status}` : ''}`);

export async function createLostPerson(formData: FormData): Promise<LostPerson> {
  const res = await fetch(`${API_BASE}/api/v1/lost-found`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Create lost person → ${res.status}`);
  return res.json() as Promise<LostPerson>;
}

export async function uploadLostPersonPhoto(personId: number, file: File): Promise<LostPerson> {
  const fd = new FormData();
  fd.append('photo', file);
  const res = await fetch(`${API_BASE}/api/v1/lost-found/${personId}/photo`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload photo → ${res.status}`);
  return res.json() as Promise<LostPerson>;
}

export async function triggerFaceScan(personId: number): Promise<FaceDetection[]> {
  const res = await fetch(`${API_BASE}/api/v1/lost-found/${personId}/scan`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Face scan → ${res.status}`);
  return res.json() as Promise<FaceDetection[]>;
}

export async function updateLostPersonStatus(personId: number, status: string): Promise<LostPerson> {
  const res = await fetch(`${API_BASE}/api/v1/lost-found/${personId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Update lost person → ${res.status}`);
  return res.json() as Promise<LostPerson>;
}

export async function deleteLostPerson(personId: number): Promise<void> {
  await fetch(`${API_BASE}/api/v1/lost-found/${personId}`, { method: 'DELETE' });
}

// ── Health ────────────────────────────────────────────────────────────────

export const getBackendHealth = (): Promise<{
  status: string;
  cameras_live: number;
  cameras_total: number;
  ws_connections: number;
}> => apiGet('/api/v1/health');

// ── WebSocket ─────────────────────────────────────────────────────────────

export function createAnalyticsWebSocket(
  onMessage: (msg: WsMessage) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const ws = new WebSocket(WS_BASE);

  ws.onopen = () => {
    onOpen?.();
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data as string) as WsMessage;
      if (msg.event === 'ping') {
        ws.send(JSON.stringify({ event: 'pong' }));
        return;
      }
      onMessage(msg);
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => onClose?.();

  return ws;
}
