import type { LayerGroup, Map, Marker, TileLayer } from "leaflet";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

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

  const markersByIdRef = useRef<
    Record<string, Marker | undefined>
  >({});

  const [loading, setLoading] = useState<boolean>(true);
  const [baseLayer, setBaseLayer] = useState<"standard" | "satellite">("standard");
  const [usersState, setUsersState] = useState<UserPoint[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        await loadLeafletAssets();
        const L = window.L;
        if (!L) return;

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
        }

        const usersRef = collection(db, "users");
        const qUsers = query(
          usersRef,
          where("appName", "==", "Trinetra"),
          where("role", "==", "user")
        );

        unsub = onSnapshot(qUsers, (snap) => {
          if (!mounted) return;
          setLoading(false);
          const L2 = window.L;
          if (!L2 || !markersLayerRef.current || !clustersLayerRef.current) return;

          markersLayerRef.current.clearLayers();
          clustersLayerRef.current.clearLayers();

          const points: UserPoint[] = snap.docs.map((d) => ({
            uid: d.id,
            ...(d.data() as Record<string, unknown>),
          })) as UserPoint[];
          setUsersState(points);

          const coords = points
            .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
            .map((p) => [p.latitude as number, p.longitude as number] as [number, number]);

          if (coords.length > 0 && leafletMapRef.current) {
            const b = L2.latLngBounds(coords.map(([la, lo]) => L2.latLng(la, lo)));
            leafletMapRef.current.fitBounds(b.pad(0.2));
          }

          // Place markers
          markersByIdRef.current = {};
          points.forEach((p) => {
            if (typeof p.latitude !== "number" || typeof p.longitude !== "number") return;
            const m = L2.marker([p.latitude, p.longitude]).addTo(markersLayerRef.current!);
            markersByIdRef.current[p.uid] = m;
            if (p.name) m.bindTooltip(p.name, { permanent: true, direction: "top" });
            m.bindPopup(
              `<div style="min-width:200px">
                <div style="font-weight:600;margin-bottom:4px">${p.name || "User"}</div>
                <div>${p.email || "—"}</div>
              </div>`
            );
          });

          // Build clusters
          const RADIUS_KM = 2;
          const remaining = points.filter(
            (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
          );
          const clusters: { center: [number, number]; members: UserPoint[] }[] = [];
          const visited = new Set<string>();

          for (let i = 0; i < remaining.length; i += 1) {
            const a = remaining[i];
            if (!a || visited.has(a.uid)) continue;
            const group: UserPoint[] = [a];
            visited.add(a.uid);
            for (let j = i + 1; j < remaining.length; j += 1) {
              const b = remaining[j];
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
            const lat = group.reduce((s, g) => s + (g.latitude as number), 0) / group.length;
            const lng = group.reduce((s, g) => s + (g.longitude as number), 0) / group.length;
            clusters.push({ center: [lat, lng], members: group });
          }

          const maxCluster = clusters.reduce(
            (acc, c) => (acc && acc.members.length >= c.members.length ? acc : c),
            clusters[0]
          );

          clusters.forEach((c) => {
            const isMax =
              maxCluster &&
              maxCluster.center[0] === c.center[0] &&
              maxCluster.center[1] === c.center[1];
            L2.circle(c.center, {
              radius: 2000,
              color: isMax ? "#ef4444" : "#2563eb",
              weight: isMax ? 3 : 2,
              fillColor: isMax ? "#fecaca" : "#bfdbfe",
              fillOpacity: 0.25,
            }).addTo(clustersLayerRef.current!);

            const labelHtml = `<div style="background:${isMax ? "#991b1b" : "#1f2937"};color:#fff;padding:2px 6px;border-radius:999px;font-size:12px;box-shadow:0 1px 2px rgba(0,0,0,.25)"> ${c.members.length} users </div>`;
            L2.marker(c.center, {
              icon: L2.divIcon({
                className: "cluster-count",
                html: labelHtml,
                iconSize: [60, 20],
                iconAnchor: [30, 10],
              }),
            }).addTo(clustersLayerRef.current!);
          });
        });
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsub) unsub();
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{loading ? "Loading users map…" : ""}</div>
        <div className="flex items-center gap-2">
          <select
            value={baseLayer}
            onChange={(e) => {
              const L = window.L;
              const choice = e.target.value as "standard" | "satellite";
              setBaseLayer(choice);
              const map = leafletMapRef.current;
              if (!map || !L) return;
              const next = choice === "satellite" ? satLayerRef.current : osmLayerRef.current;
              if (activeBaseRef.current && activeBaseRef.current !== next) {
                activeBaseRef.current.remove();
              }
              if (next && activeBaseRef.current !== next) {
                next.addTo(map);
                activeBaseRef.current = next;
              }
            }}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name/email/uid"
            className="h-10 w-64 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400"
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="">Select user…</option>
            {usersState
              .filter((u) => {
                const t = search.trim().toLowerCase();
                if (!t) return true;
                return [u.name, u.email, u.uid]
                  .filter(Boolean)
                  .map((v) => String(v).toLowerCase())
                  .some((v) => v.includes(t));
              })
              .map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name || u.email || u.uid}
                </option>
              ))}
          </select>
          <button
            onClick={() => {
              const map = leafletMapRef.current;
              if (!map) return;
              if (selectedUserId && markersByIdRef.current[selectedUserId]) {
                const m = markersByIdRef.current[selectedUserId]!;
                const ll = m.getLatLng();
                if (ll) map.setView([ll.lat, ll.lng], 14);
                m.openPopup();
              }
            }}
            className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white shadow hover:bg-black"
          >
            Locate
          </button>
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-200"
        style={{ height: "70vh" }}
      />
    </div>
  );
};

export default UsersMap;