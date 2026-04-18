import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase/firebase";
import type { LayerGroup, Map, Marker, TileLayer } from "leaflet";
import {
  Calendar,
  Clock,
  Copy,
  Crosshair,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

/** User document fields used on the map (Firestore may include more). */
export type UserMapUser = {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  appName?: string;
  photoURL?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastSeen?: unknown;
  lastLocationUpdate?: unknown;
  locationUpdatedAt?: unknown;
  lastActiveAt?: unknown;
};

function loadLeafletAssets(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]'
    );
    const existingLink = document.querySelector<HTMLLinkElement>(
      'link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]'
    );

    let pending = 0;
    const done = () => {
      pending -= 1;
      if (pending <= 0) resolve();
    };

    if (!existingLink) {
      pending += 1;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.onload = done;
      link.onerror = () => reject(new Error("Failed to load Leaflet CSS"));
      document.head.appendChild(link);
    }

    if (!existingScript) {
      pending += 1;
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = done;
      script.onerror = () => reject(new Error("Failed to load Leaflet JS"));
      document.body.appendChild(script);
    }

    if (pending === 0) resolve();
  });
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}

function formatFirestoreDate(value: unknown): string {
  if (value == null || value === "") return "—";
  let d: Date | null = null;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      d = (value as { toDate: () => Date }).toDate();
    } catch {
      return "—";
    }
  } else if (value instanceof Date) {
    d = value;
  } else if (typeof value === "number" && Number.isFinite(value)) {
    d = new Date(value);
  } else if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) d = new Date(parsed);
  }
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Best-effort “last updated” from common Firestore field names. */
function getLastUpdatedLabel(u: UserMapUser): { label: string; value: string } {
  const candidates: [string, unknown][] = [
    ["Updated (document)", u.updatedAt],
    ["Last seen", u.lastSeen],
    ["Location updated", u.locationUpdatedAt ?? u.lastLocationUpdate],
    ["Last active", u.lastActiveAt],
  ];
  for (const [label, v] of candidates) {
    const formatted = formatFirestoreDate(v);
    if (formatted !== "—") return { label, value: formatted };
  }
  return { label: "Last updated", value: "—" };
}

function initialsForUser(u: UserMapUser): string {
  const base = (u.name || u.email || u.uid || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}

function hueFromUid(uid: string): number {
  let h = 0;
  for (let i = 0; i < uid.length; i += 1) {
    h = (h + uid.charCodeAt(i) * (i + 7)) % 360;
  }
  return h;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildUserMarkerIconHtml(u: UserMapUser, selected: boolean): string {
  const ini = escapeHtml(initialsForUser(u));
  const hue = hueFromUid(u.uid);
  const ring = selected
    ? "0 0 0 4px rgba(59,130,246,.45), 0 6px 20px rgba(0,0,0,.35)"
    : "0 4px 14px rgba(0,0,0,.28), 0 0 0 1px rgba(0,0,0,.06)";
  const scale = selected ? "1.12" : "1";
  const photo = typeof u.photoURL === "string" && u.photoURL.trim().startsWith("http");
  const inner = photo
    ? `<img src="${escapeHtml(u.photoURL!.trim())}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9999px" />`
    : `<span style="font:700 13px/1 system-ui,-apple-system,sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.25)">${ini}</span>`;
  return `<div style="width:44px;height:44px;border-radius:9999px;background:linear-gradient(145deg,hsl(${hue} 72% 42%),hsl(${hue} 65% 32%));border:3px solid #fff;box-shadow:${ring};display:flex;align-items:center;justify-content:center;overflow:hidden;transform:scale(${scale});transform-origin:center bottom;transition:transform .18s ease,box-shadow .18s ease">${inner}</div>`;
}

const UsersMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<Map | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const clustersLayerRef = useRef<LayerGroup | null>(null);
  const osmLayerRef = useRef<TileLayer | null>(null);
  const satLayerRef = useRef<TileLayer | null>(null);
  const activeBaseRef = useRef<TileLayer | null>(null);
  const markersByIdRef = useRef<Record<string, Marker | undefined>>({});
  const renderTimeoutRef = useRef<number | null>(null);
  const didInitialFitRef = useRef(false);

  const [mapLoading, setMapLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [baseLayer, setBaseLayer] = useState<"standard" | "satellite">("standard");
  const [usersState, setUsersState] = useState<UserMapUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [focusedUser, setFocusedUser] = useState<UserMapUser | null>(null);
  const [search, setSearch] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [copyDone, setCopyDone] = useState(false);
  const selectedIdRef = useRef("");
  selectedIdRef.current = selectedUserId;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadLeafletAssets();
        const L = window.L;
        if (!L || !mounted) return;
        if (mapRef.current && !leafletMapRef.current) {
          const map = L.map(mapRef.current, { zoomControl: true }).setView([20.011, 73.789], 11);
          leafletMapRef.current = map;
          osmLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
          });
          satLayerRef.current = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 19, attribution: "Tiles © Esri" }
          );
          osmLayerRef.current.addTo(map);
          activeBaseRef.current = osmLayerRef.current;
          markersLayerRef.current = L.layerGroup().addTo(map);
          clustersLayerRef.current = L.layerGroup().addTo(map);
          setMapLoading(false);
        }
      } catch (e) {
        console.error("Failed to load map:", e);
        if (mounted) setMapLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const renderClusters = useCallback(
    (clusters: { center: [number, number]; members: UserMapUser[] }[], L: typeof import("leaflet")) => {
      if (!clustersLayerRef.current || clusters.length === 0) return;
      const maxCluster = clusters.reduce(
        (acc, c) => (acc && acc.members.length >= c.members.length ? acc : c),
        clusters[0]
      );
      clusters.forEach((c) => {
        const isMax =
          maxCluster &&
          maxCluster.center[0] === c.center[0] &&
          maxCluster.center[1] === c.center[1];
        L.circle(c.center, {
          radius: 2000,
          color: isMax ? "#f97316" : "#6366f1",
          weight: 2,
          fillColor: isMax ? "#ffedd5" : "#e0e7ff",
          fillOpacity: 0.35,
        }).addTo(clustersLayerRef.current!);
        const labelHtml = `<div style="font:600 12px/1.2 system-ui,-apple-system,sans-serif;background:${
          isMax ? "#c2410c" : "#4338ca"
        };color:#fff;padding:6px 10px;border-radius:9999px;box-shadow:0 4px 12px rgba(0,0,0,.2);border:2px solid rgba(255,255,255,.9)">${c.members.length} nearby</div>`;
        L.marker(c.center, {
          icon: L.divIcon({
            className: "users-map-cluster",
            html: labelHtml,
            iconSize: [88, 28],
            iconAnchor: [44, 14],
          }),
        }).addTo(clustersLayerRef.current!);
      });
    },
    []
  );

  const createClusters = useCallback((points: UserMapUser[], L: typeof import("leaflet")) => {
    if (!clustersLayerRef.current) return;
    const RADIUS_KM = 2;
    const clusters: { center: [number, number]; members: UserMapUser[] }[] = [];
    const visited = new Set<string>();

    const processClustering = (startIndex: number) => {
      const CHUNK_SIZE = 100;
      const endIndex = Math.min(startIndex + CHUNK_SIZE, points.length);
      for (let i = startIndex; i < endIndex; i += 1) {
        const a = points[i];
        if (!a || visited.has(a.uid)) continue;
        const group: UserMapUser[] = [a];
        visited.add(a.uid);
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          if (!b || visited.has(b.uid)) continue;
          const d = haversineKm(
            a.latitude as number,
            a.longitude as number,
            b.latitude as number,
            b.longitude as number
          );
          if (d <= RADIUS_KM) {
            group.push(b);
            visited.add(b.uid);
          }
        }
        if (group.length > 1) {
          const lat = group.reduce((s, g) => s + (g.latitude as number), 0) / group.length;
          const lng = group.reduce((s, g) => s + (g.longitude as number), 0) / group.length;
          clusters.push({ center: [lat, lng], members: group });
        }
      }
      if (endIndex < points.length) {
        requestAnimationFrame(() => processClustering(endIndex));
      } else {
        renderClusters(clusters, L);
      }
    };
    processClustering(0);
  }, [renderClusters]);

  const renderMarkers = useCallback(
    (points: UserMapUser[], L: typeof import("leaflet"), selectedId: string) => {
      if (!markersLayerRef.current || !clustersLayerRef.current) return;
      markersLayerRef.current.clearLayers();
      clustersLayerRef.current.clearLayers();
      markersByIdRef.current = {};

      const validPoints = points.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
      );
      if (validPoints.length === 0) return;

      const BATCH_SIZE = 50;
      let index = 0;

      const processBatch = () => {
        const end = Math.min(index + BATCH_SIZE, validPoints.length);
        const batch = validPoints.slice(index, end);

        batch.forEach((p) => {
          if (typeof p.latitude !== "number" || typeof p.longitude !== "number") return;
          const selected = p.uid === selectedId;
          const icon = L.divIcon({
            className: "users-map-pin-wrap",
            html: buildUserMarkerIconHtml(p, selected),
            iconSize: [44, 44],
            iconAnchor: [22, 44],
            popupAnchor: [0, -44],
          });
          const m = L.marker([p.latitude, p.longitude], { icon }).addTo(markersLayerRef.current!);
          markersByIdRef.current[p.uid] = m;
          m.bindTooltip(p.name || p.email || p.uid, {
            permanent: false,
            direction: "top",
            opacity: 0.95,
            className: "rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800 shadow-md",
          });
          m.on("click", () => {
            setFocusedUser(p);
            setSelectedUserId(p.uid);
            const map = leafletMapRef.current;
            if (map) {
              map.flyTo([p.latitude!, p.longitude!], Math.max(map.getZoom(), 14), { duration: 0.55 });
              window.setTimeout(() => {
                map.panBy([-140, 0], { animate: true });
              }, 320);
            }
          });
        });

        index = end;
        if (index < validPoints.length) {
          requestAnimationFrame(processBatch);
        } else {
          const map = leafletMapRef.current;
          if (map && !didInitialFitRef.current && validPoints.length > 0) {
            const coords = validPoints.map(
              (pt) => [pt.latitude as number, pt.longitude as number] as [number, number]
            );
            const b = L.latLngBounds(coords.map(([la, lo]) => L.latLng(la, lo)));
            map.fitBounds(b.pad(0.18));
            didInitialFitRef.current = true;
          }
          window.setTimeout(() => {
            createClusters(validPoints, L);
          }, 80);
        }
      };

      processBatch();
    },
    [createClusters]
  );

  useEffect(() => {
    let mounted = true;
    const qUsers = query(
      collection(db, "users"),
      where("appName", "==", "Trinetra"),
      where("role", "==", "user")
    );
    const unsub = onSnapshot(
      qUsers,
      (snap) => {
        if (!mounted) return;
        const points: UserMapUser[] = snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Record<string, unknown>),
        })) as UserMapUser[];
        setUsersState(points);
        setUserCount(points.length);
        setDataLoading(false);
        const L = window.L;
        if (L && !mapLoading && markersLayerRef.current) {
          if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
          renderTimeoutRef.current = window.setTimeout(() => {
            renderMarkers(points, L, selectedIdRef.current);
          }, 80);
        }
      },
      (error) => {
        console.error("Error fetching users:", error);
        if (mounted) setDataLoading(false);
      }
    );
    return () => {
      mounted = false;
      unsub();
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    };
  }, [mapLoading, renderMarkers]);

  useEffect(() => {
    if (!mapLoading && usersState.length > 0) {
      const L = window.L;
      if (L && markersLayerRef.current) {
        renderMarkers(usersState, L, selectedIdRef.current);
      }
    }
  }, [mapLoading, usersState, selectedUserId, renderMarkers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return usersState;
    const t = search.trim().toLowerCase();
    return usersState.filter((u) =>
      [u.name, u.email, u.phone, u.uid]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(t))
    );
  }, [usersState, search]);

  useEffect(() => {
    if (!selectedUserId) {
      setFocusedUser(null);
      return;
    }
    const u = usersState.find((x) => x.uid === selectedUserId);
    if (u) setFocusedUser(u);
  }, [selectedUserId, usersState]);

  const handleLayerChange = useCallback((choice: "standard" | "satellite") => {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map || !L) return;
    setBaseLayer(choice);
    const next = choice === "satellite" ? satLayerRef.current : osmLayerRef.current;
    if (activeBaseRef.current && activeBaseRef.current !== next) {
      activeBaseRef.current.remove();
    }
    if (next && activeBaseRef.current !== next) {
      next.addTo(map);
      activeBaseRef.current = next;
    }
  }, []);

  const handleLocate = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map || !selectedUserId) return;
    const m = markersByIdRef.current[selectedUserId];
    if (m) {
      const ll = m.getLatLng();
      map.flyTo([ll.lat, ll.lng], Math.max(map.getZoom(), 14), { duration: 0.55 });
      window.setTimeout(() => map.panBy([-140, 0], { animate: true }), 320);
    }
  }, [selectedUserId]);

  const handleFitAll = useCallback(() => {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map || !L || !markersLayerRef.current) return;
    const pts = usersState.filter(
      (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
    );
    if (pts.length === 0) return;
    const coords = pts.map((p) => [p.latitude!, p.longitude!] as [number, number]);
    const b = L.latLngBounds(coords.map(([la, lo]) => L.latLng(la, lo)));
    map.fitBounds(b.pad(0.18));
  }, [usersState]);

  const handleCopyUid = useCallback(async (uid: string) => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  }, []);

  const isLoading = mapLoading || dataLoading;
  const lastUp = focusedUser ? getLastUpdatedLabel(focusedUser) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center gap-2 p-3 sm:px-4">
              <UsersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </span>
                ) : (
                  `${userCount} users`
                )}
              </span>
            </CardContent>
          </Card>
          {!isLoading && (
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-center gap-2 p-3 sm:px-4">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {filteredUsers.filter((u) => u.latitude != null && u.longitude != null).length} with location
                </span>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <Select
            value={baseLayer}
            onValueChange={(v) => handleLayerChange(v as "standard" | "satellite")}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-10">
              <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Map style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard map</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, UID…"
            className="h-10 w-full sm:w-56 lg:w-64"
            disabled={isLoading}
          />
          <Select
            value={selectedUserId || "__none__"}
            onValueChange={(v) => setSelectedUserId(v === "__none__" ? "" : v)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:min-w-[200px] sm:max-w-[280px] h-10">
              <SelectValue placeholder="Select user…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None selected</SelectItem>
              {filteredUsers.map((u) => (
                <SelectItem key={u.uid} value={u.uid}>
                  {u.name || u.email || u.uid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" className="h-10" onClick={handleFitAll} disabled={isLoading}>
              Fit all
            </Button>
            <Button type="button" size="sm" className="h-10 gap-1.5" onClick={handleLocate} disabled={!selectedUserId || isLoading}>
              <Crosshair className="h-4 w-4" />
              Locate
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-inner min-h-[52vh] lg:min-h-[68vh] lg:flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
              <div className="text-center px-4">
                <Loader2 className="h-9 w-9 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {mapLoading ? "Loading map…" : "Loading users…"}
                </p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="h-[52vh] w-full lg:h-full min-h-[52vh] lg:min-h-[68vh]" />
        </div>

        <Card className="w-full shrink-0 border-border shadow-lg lg:w-[380px] xl:w-[400px] flex flex-col lg:min-h-[68vh]">
          {focusedUser ? (
            <>
              <CardHeader className="space-y-1 pb-3 border-b bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold truncate pr-2">
                      {focusedUser.name || "Unnamed user"}
                    </CardTitle>
                    <CardDescription className="truncate">{focusedUser.email || "No email"}</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => {
                      setFocusedUser(null);
                      setSelectedUserId("");
                    }}
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {focusedUser.role && (
                    <Badge variant="secondary" className="font-normal">
                      {focusedUser.role}
                    </Badge>
                  )}
                  {focusedUser.appName && (
                    <Badge variant="outline" className="font-normal">
                      {focusedUser.appName}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ring-2 ring-background"
                    style={{
                      background: `linear-gradient(145deg, hsl(${hueFromUid(focusedUser.uid)} 72% 42%), hsl(${hueFromUid(focusedUser.uid)} 60% 30%))`,
                    }}
                  >
                    {initialsForUser(focusedUser)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last updated</p>
                    {lastUp && (
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {lastUp.value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{lastUp?.label}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-2 items-start">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{focusedUser.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{focusedUser.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Coordinates</p>
                      <p className="font-mono text-xs">
                        {typeof focusedUser.latitude === "number" && typeof focusedUser.longitude === "number"
                          ? `${focusedUser.latitude.toFixed(5)}, ${focusedUser.longitude.toFixed(5)}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Account created</p>
                      <p className="font-medium">{formatFirestoreDate(focusedUser.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Label className="text-xs text-muted-foreground">User ID</Label>
                      <p className="font-mono text-[11px] break-all leading-snug text-muted-foreground">{focusedUser.uid}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-8 gap-1"
                      onClick={() => handleCopyUid(focusedUser.uid)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copyDone ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground border-t pt-3">
                  Tip: click a pin on the map to open this panel. Dates use your browser locale.
                </p>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center text-muted-foreground">
              <MapPin className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium text-foreground">No user selected</p>
              <p className="text-xs max-w-[260px]">
                Select a user from the list or click a map pin to see profile details and last updated time.
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      <style>{`
        .users-map-pin-wrap { background: transparent !important; border: none !important; }
        .users-map-cluster { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default UsersMap;
