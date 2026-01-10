import { Card, CardContent } from "@/components/ui/card";
import type { LayerGroup, Map, Marker, TileLayer } from "leaflet";
import { Loader2, MapPin, Users as UsersIcon } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { db } from "@/firebase/firebase";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

type UserPoint = {
  uid: string;
  name?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
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
  const R = 6371; // km
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

const UsersMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  // Leaflet refs with correct types
  const leafletMapRef = useRef<Map | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const clustersLayerRef = useRef<LayerGroup | null>(null);
  const osmLayerRef = useRef<TileLayer | null>(null);
  const satLayerRef = useRef<TileLayer | null>(null);
  const activeBaseRef = useRef<TileLayer | null>(null);

  const markersByIdRef = useRef<Record<string, Marker | undefined>>({});
  const renderTimeoutRef = useRef<number | null>(null);

  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [baseLayer, setBaseLayer] = useState<"standard" | "satellite">("standard");
  const [usersState, setUsersState] = useState<UserPoint[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [userCount, setUserCount] = useState<number>(0);

  // Initialize map immediately
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await loadLeafletAssets();
        const L = window.L;
        if (!L || !mounted) return;

        if (mapRef.current && !leafletMapRef.current) {
          const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
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

  // Optimized marker rendering with batching
  const renderMarkers = useCallback(
    (points: UserPoint[], L: typeof import("leaflet")) => {
      if (!markersLayerRef.current || !clustersLayerRef.current) return;

      // Clear existing layers
      markersLayerRef.current.clearLayers();
      clustersLayerRef.current.clearLayers();
      markersByIdRef.current = {};

      const validPoints = points.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
      );

      if (validPoints.length === 0) return;

      // Batch marker creation to avoid blocking UI
      const BATCH_SIZE = 50;
      let index = 0;

      const processBatch = () => {
        const end = Math.min(index + BATCH_SIZE, validPoints.length);
        const batch = validPoints.slice(index, end);

        batch.forEach((p) => {
          if (typeof p.latitude !== "number" || typeof p.longitude !== "number") return;
          const m = L.marker([p.latitude, p.longitude]).addTo(markersLayerRef.current!);
          markersByIdRef.current[p.uid] = m;
          if (p.name) m.bindTooltip(p.name, { permanent: false, direction: "top" });
          m.bindPopup(
            `<div style="min-width:200px">
              <div style="font-weight:600;margin-bottom:4px">${p.name || "User"}</div>
              <div>${p.email || "—"}</div>
            </div>`
          );
        });

        index = end;

        if (index < validPoints.length) {
          requestAnimationFrame(processBatch);
        } else {
          // All markers added, now fit bounds and create clusters
          if (leafletMapRef.current) {
            const coords = validPoints.map((p) => [
              p.latitude as number,
              p.longitude as number,
            ] as [number, number]);
            const b = L.latLngBounds(coords.map(([la, lo]) => L.latLng(la, lo)));
            leafletMapRef.current.fitBounds(b.pad(0.2));
          }

          // Create clusters asynchronously
          setTimeout(() => {
            createClusters(validPoints, L);
          }, 100);
        }
      };

      processBatch();
    },
    []
  );

  // Optimized clustering with async processing
  const createClusters = useCallback((points: UserPoint[], L: typeof import("leaflet")) => {
    if (!clustersLayerRef.current) return;

    const RADIUS_KM = 2;
    const clusters: { center: [number, number]; members: UserPoint[] }[] = [];
    const visited = new Set<string>();

    // Process clustering in chunks to avoid blocking
    const processClustering = (startIndex: number) => {
      const CHUNK_SIZE = 100;
      const endIndex = Math.min(startIndex + CHUNK_SIZE, points.length);

      for (let i = startIndex; i < endIndex; i += 1) {
        const a = points[i];
        if (!a || visited.has(a.uid)) continue;
        const group: UserPoint[] = [a];
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
        // All clusters calculated, now render them
        renderClusters(clusters, L);
      }
    };

    processClustering(0);
  }, []);

  const renderClusters = useCallback(
    (clusters: { center: [number, number]; members: UserPoint[] }[], L: typeof import("leaflet")) => {
      if (!clustersLayerRef.current) return;

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
          color: isMax ? "#ef4444" : "#2563eb",
          weight: isMax ? 3 : 2,
          fillColor: isMax ? "#fecaca" : "#bfdbfe",
          fillOpacity: 0.25,
        }).addTo(clustersLayerRef.current!);

        const labelHtml = `<div style="background:${isMax ? "#991b1b" : "#1f2937"};color:#fff;padding:2px 6px;border-radius:999px;font-size:12px;box-shadow:0 1px 2px rgba(0,0,0,.25)"> ${c.members.length} users </div>`;
        L.marker(c.center, {
          icon: L.divIcon({
            className: "cluster-count",
            html: labelHtml,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          }),
        }).addTo(clustersLayerRef.current!);
      });
    },
    []
  );

  // Fetch users data
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let mounted = true;

    const usersRef = collection(db, "users");
    const qUsers = query(
      usersRef,
      where("appName", "==", "Trinetra"),
      where("role", "==", "user")
    );

    unsub = onSnapshot(
      qUsers,
      (snap) => {
        if (!mounted) return;

        const points: UserPoint[] = snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Record<string, unknown>),
        })) as UserPoint[];

        setUsersState(points);
        setUserCount(points.length);
        setDataLoading(false);

        // Render markers after a short delay to ensure map is ready
        const L = window.L;
        if (L && !mapLoading && markersLayerRef.current) {
          if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
          }
          renderTimeoutRef.current = window.setTimeout(() => {
            renderMarkers(points, L);
          }, 100);
        }
      },
      (error) => {
        console.error("Error fetching users:", error);
        if (mounted) setDataLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (unsub) unsub();
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [mapLoading, renderMarkers]);

  // Re-render markers when map is ready
  useEffect(() => {
    if (!mapLoading && usersState.length > 0) {
      const L = window.L;
      if (L && markersLayerRef.current) {
        renderMarkers(usersState, L);
      }
    }
  }, [mapLoading, renderMarkers]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return usersState;
    const t = search.trim().toLowerCase();
    return usersState.filter((u) =>
      [u.name, u.email, u.uid]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(t))
    );
  }, [usersState, search]);

  const handleLayerChange = useCallback(
    (choice: "standard" | "satellite") => {
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
    },
    []
  );

  const handleLocate = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (selectedUserId && markersByIdRef.current[selectedUserId]) {
      const m = markersByIdRef.current[selectedUserId]!;
      const ll = m.getLatLng();
      if (ll) {
        map.setView([ll.lat, ll.lng], 14);
        m.openPopup();
      }
    }
  }, [selectedUserId]);

  const isLoading = mapLoading || dataLoading;

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `${userCount} Users`
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          {!isLoading && (
            <Card className="border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {filteredUsers.filter((u) => u.latitude && u.longitude).length} with location
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={baseLayer}
            onChange={(e) => handleLayerChange(e.target.value as "standard" | "satellite")}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
            disabled={isLoading}
          >
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name/email/uid"
            className="h-10 w-64 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
            disabled={isLoading}
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all min-w-[200px]"
            disabled={isLoading}
          >
            <option value="">Select user…</option>
            {filteredUsers.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name || u.email || u.uid}
              </option>
            ))}
          </select>
          <button
            onClick={handleLocate}
            disabled={!selectedUserId || isLoading}
            className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white shadow hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Locate
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full rounded-lg border border-gray-200 overflow-hidden" style={{ height: "70vh" }}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {mapLoading ? "Loading map..." : "Loading users data..."}
              </p>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ opacity: isLoading ? 0.5 : 1, transition: "opacity 0.3s" }}
        />
      </div>
    </div>
  );
};

export default UsersMap;
