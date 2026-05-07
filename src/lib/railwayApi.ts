/**
 * Client for the same railway HTTP API used in refeance.html (IRCTC proxy).
 *
 * Env:
 * - `VITE_RAILWAY_API_BASE_URL` — optional. Use your **server origin** (`http://localhost:8080`)
 *   or the **API prefix** (`http://localhost:8080/api`). Requests use `${base}/v1/...` so the
 *   backend must expose `/api/v1/stations`, etc.
 * - `VITE_API_BASE_URL` — fallback when railway URL unset (often already `.../api`).
 */

const IRCTC_JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-IRCTC-Timeout-Seconds": "180",
};

/**
 * Resolves the prefix before `/v1/...` so it always matches `GET /api/v1/stations` on the backend.
 * - `http://host:8080` or `http://host:8080/` → `http://host:8080/api`
 * - `http://host:8080/api` → unchanged
 */
export function normalizeRailwayApiRoot(raw: string): string {
  const u = raw.trim().replace(/\/+$/, "");
  if (!u) throw new Error("Railway API base URL is empty.");
  if (u.endsWith("/api")) return u;
  try {
    const url = new URL(u);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/" || path === "") {
      return `${url.origin}/api`;
    }
  } catch {
    // Not a full URL; best-effort append /api (e.g. relative dev setups).
  }
  return `${u}/api`;
}

export function getRailwayApiBase(): string {
  const explicit = (import.meta.env.VITE_RAILWAY_API_BASE_URL as string | undefined)?.trim();
  const fallback = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const raw = (explicit || fallback || "").replace(/\/+$/, "");
  if (!raw) {
    throw new Error("Set VITE_RAILWAY_API_BASE_URL or VITE_API_BASE_URL for railway tools.");
  }
  return normalizeRailwayApiRoot(raw);
}

export interface RailwayStation {
  code: string;
  name: string;
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  trainCount?: number;
  address?: string;
}

export interface TrainClass {
  code?: string;
  label?: string;
}

export interface TrainSearchTrain {
  trainNumber?: string;
  trainName?: string;
  fromStnCode?: string;
  toStnCode?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  distance?: string | number;
  runningDaysLabel?: string;
  classes?: TrainClass[];
  quotaCode?: string;
  quotaLabel?: string;
}

export interface TrainSearchResponse {
  trains?: TrainSearchTrain[] | null;
  connections?: unknown[];
  upstreamMessage?: string;
  upstreamHttpStatus?: number;
  journeyDatePacked?: string;
  irctcTimeoutSeconds?: number;
  request?: Record<string, unknown>;
}

export interface FareAvailabilityResponse {
  result?: {
    trainNumber?: string;
    trainName?: string;
    from?: string;
    to?: string;
    class?: string;
    quota?: string;
    distance?: string;
    fare?: {
      baseFare?: string;
      reservationCharge?: string;
      superfastCharge?: string;
      serviceTax?: string;
      totalFare?: string;
      totalCollectibleAmount?: string;
    };
  };
  upstreamMessage?: string;
  error?: string;
  code?: string;
}

export function validCoord(lat: number, lon: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (Math.abs(lat) < 1e-6 && Math.abs(lon) < 1e-6) return false;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;
  return true;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function dedupeByCode(rows: RailwayStation[]): RailwayStation[] {
  const seen = new Set<string>();
  const out: RailwayStation[] = [];
  for (const r of rows) {
    const k = (r.code || "").toUpperCase().trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push({ ...r, code: k });
  }
  return out;
}

export async function loadAllStations(signal?: AbortSignal): Promise<RailwayStation[]> {
  const base = getRailwayApiBase();
  const limit = 500;
  const merged: RailwayStation[] = [];
  let page = 1;
  let totalExpected: number | null = null;
  let lastPage = 1;

  for (;;) {
    const url = `${base}/v1/stations?page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(`Stations page ${page}: non-JSON response (HTTP ${res.status})`);
    }
    const pageData = data as { stations?: RailwayStation[]; total?: number; pages?: number };
    if (!res.ok || !pageData || !Array.isArray(pageData.stations)) {
      throw new Error(`Stations page ${page}: bad response (HTTP ${res.status})`);
    }
    totalExpected = pageData.total ?? totalExpected;
    for (const s of pageData.stations) {
      merged.push({
        ...s,
        code: String(s.code || "").toUpperCase(),
        latitude: s.latitude != null ? Number(s.latitude) : undefined,
        longitude: s.longitude != null ? Number(s.longitude) : undefined,
      });
    }
    lastPage = pageData.pages != null ? pageData.pages : Math.ceil((totalExpected || merged.length) / limit);
    if (pageData.stations.length < limit || page >= lastPage) break;
    page++;
  }

  return dedupeByCode(merged);
}

export type StationWithDistance = RailwayStation & { distanceKm: number };

export function rankStationsByDistance(
  userLat: number,
  userLon: number,
  stations: RailwayStation[],
  maxCandidates = 40
): StationWithDistance[] {
  const withGeo = stations.filter((s) => {
    const la = s.latitude;
    const lo = s.longitude;
    return la != null && lo != null && validCoord(la, lo);
  });
  const ranked = withGeo
    .map((s) => ({
      ...s,
      distanceKm: haversineKm(userLat, userLon, s.latitude as number, s.longitude as number),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return ranked.slice(0, maxCandidates);
}

function isTrainSearchResponse(d: unknown): d is TrainSearchResponse {
  return !!(d && typeof d === "object" && "request" in d && typeof (d as TrainSearchResponse).request === "object");
}

export async function searchTrainsBetween(
  fromStation: string,
  toStation: string,
  journeyDate: string,
  opts?: { quotaCode?: string; journeyClass?: string; signal?: AbortSignal }
): Promise<TrainSearchResponse> {
  const base = getRailwayApiBase();
  const body: Record<string, string> = {
    fromStation: fromStation.toUpperCase().trim(),
    toStation: toStation.toUpperCase().trim(),
    journeyDate: journeyDate.trim(),
  };
  if (opts?.quotaCode?.trim()) body.quotaCode = opts.quotaCode.trim();
  if (opts?.journeyClass?.trim()) body.journeyClass = opts.journeyClass.trim().toUpperCase();

  const res = await fetch(`${base}/v1/trains/search`, {
    method: "POST",
    headers: IRCTC_JSON_HEADERS,
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    return { upstreamMessage: `Non-JSON (HTTP ${res.status})`, request: {} };
  }
  if (!isTrainSearchResponse(data)) {
    const err = data as { error?: string; code?: string };
    return {
      trains: [],
      upstreamMessage: err?.error || `Unexpected shape (HTTP ${res.status})`,
      request: {},
    };
  }
  return data;
}

const CLASS_PREFERENCE = ["SL", "3A", "2A", "3E", "1A", "CC", "EC", "2S", "GN"];

export function pickClassForFare(classes: TrainClass[] | undefined): string {
  if (!classes?.length) return "";
  const codes = classes.map((c) => String(c.code || "").toUpperCase().trim()).filter(Boolean);
  for (const pref of CLASS_PREFERENCE) {
    if (codes.includes(pref)) return pref;
  }
  return codes[0] || "";
}

export function durationToMinutes(duration: string | undefined): number {
  if (!duration) return 99999;
  const s = duration.toLowerCase().replace(/\s+/g, " ").trim();
  let total = 0;
  const hMatch = s.match(/(\d+)\s*h/);
  const mMatch = s.match(/(\d+)\s*m(?!onth)/i);
  if (hMatch) total += parseInt(hMatch[1], 10) * 60;
  if (mMatch) total += parseInt(mMatch[1], 10);
  if (!hMatch && !mMatch) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 99999;
  }
  return total;
}

export function pickBestDirectTrain(trains: TrainSearchTrain[]): TrainSearchTrain | null {
  const list = (trains || []).filter((t) => t.trainNumber);
  if (!list.length) return null;
  return list.slice().sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration))[0];
}

export async function fetchTrainFare(
  params: {
    trainNumber: string;
    journeyDate: string;
    fromStation: string;
    toStation: string;
    classCode: string;
    quotaCode?: string;
    signal?: AbortSignal;
  }
): Promise<FareAvailabilityResponse> {
  const base = getRailwayApiBase();
  const payload: Record<string, string> = {
    trainNumber: params.trainNumber.trim(),
    journeyDate: params.journeyDate.trim(),
    fromStation: params.fromStation.toUpperCase().trim(),
    toStation: params.toStation.toUpperCase().trim(),
    classCode: params.classCode.toUpperCase().trim(),
  };
  if (params.quotaCode?.trim()) payload.quotaCode = params.quotaCode.trim();

  const res = await fetch(`${base}/v1/trains/fare-availability`, {
    method: "POST",
    headers: IRCTC_JSON_HEADERS,
    body: JSON.stringify(payload),
    signal: params.signal,
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as FareAvailabilityResponse;
  } catch {
    return { error: `Non-JSON (HTTP ${res.status})` };
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
