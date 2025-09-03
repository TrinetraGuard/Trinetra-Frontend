import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import { db } from "@/firebase/firebase";

type Volunteer = {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  lastUpdated?: unknown;
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

const VolunteersMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  interface LeafletBounds { pad: (factor: number) => LeafletBounds }
  interface LeafletLayer {
    addTo: (target: LeafletMap | LeafletLayer) => LeafletLayer
    clearLayers: () => void
    bindPopup?: (html: string) => void
  }
  interface LeafletMap {
    setView: (coords: [number, number], zoom: number) => LeafletMap
    fitBounds: (bounds: LeafletBounds) => void
    remove: () => void
  }
  interface Leaflet {
    map: (el: HTMLElement) => LeafletMap
    tileLayer: (url: string, opts: { maxZoom?: number; attribution?: string }) => { addTo: (target: LeafletMap) => void }
    layerGroup: () => LeafletLayer
    marker: (coords: [number, number]) => LeafletLayer & { addTo: (target: LeafletLayer | LeafletMap) => LeafletLayer & { bindPopup: (html: string) => void } }
    latLngBounds: (points: unknown[]) => LeafletBounds
    latLng: (lat: number, lng: number) => unknown
  }
  interface LeafletTileLayer {
    addTo: (map: LeafletMap) => void
    remove: () => void
  }
  interface LeafletMarker {
    getLatLng?: () => { lat: number; lng: number }
    openPopup?: () => void
    bindTooltip?: (text: string, opts?: unknown) => void
    bindPopup?: (html: string) => void
  }
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LeafletLayer | null>(null);
  const markersByIdRef = useRef<Record<string, LeafletMarker>>({});
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [volunteersState, setVolunteersState] = useState<Volunteer[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");
  const [baseLayer, setBaseLayer] = useState<"standard" | "satellite">("standard");
  const osmLayerRef = useRef<LeafletTileLayer | null>(null);
  const satLayerRef = useRef<LeafletTileLayer | null>(null);
  const activeBaseRef = useRef<LeafletTileLayer | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    (async () => {
      try {
        await loadLeafletAssets();
        const L = (window as unknown as { L?: Leaflet }).L;
        if (!L) {
          // Leaflet not yet available; try again shortly without showing red error
          setTimeout(() => setLoading(true), 250);
          return;
        }

        if (mapRef.current && !leafletMapRef.current) {
          const mapInstance = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
          leafletMapRef.current = mapInstance;

          // Prepare base layers
          osmLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
          }) as unknown as LeafletTileLayer;
          satLayerRef.current = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 19, attribution: "Tiles © Esri" }
          ) as unknown as LeafletTileLayer;

          // Default to OSM
          osmLayerRef.current.addTo(mapInstance);
          activeBaseRef.current = osmLayerRef.current;

          markersLayerRef.current = L.layerGroup().addTo(mapInstance);
        }

        const usersRef = collection(db, "users");
        const qUsers = query(
          usersRef,
          where("appName", "==", "Trinetra"),
          where("role", "==", "volunteer")
        );

        unsubscribe = onSnapshot(
          qUsers,
          (snap) => {
            if (!isMounted) return;
            setLoading(false);
            const L2 = (window as unknown as { L?: Leaflet }).L;
            if (!markersLayerRef.current || !L2) {
              return;
            }
            markersLayerRef.current.clearLayers();

            const volunteers: Volunteer[] = snap.docs.map((d) => ({
              uid: d.id,
              ...(d.data() as Record<string, unknown>),
            })) as Volunteer[];
            setVolunteersState(volunteers);

            const points: [number, number][] = [];

            markersByIdRef.current = {};
            volunteers.forEach((v) => {
              if (typeof v.latitude === "number" && typeof v.longitude === "number") {
                points.push([v.latitude, v.longitude]);
                const lu = v.lastUpdated;
                const isTimestamp = (x: unknown): x is { toDate: () => Date } => {
                  return typeof x === "object" && x !== null && "toDate" in (x as Record<string, unknown>);
                };
                const formatRelative = (d: Date) => {
                  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
                  if (diffSec < 60) return `${diffSec}s ago`;
                  const diffMin = Math.floor(diffSec / 60);
                  if (diffMin < 60) return `${diffMin}m ago`;
                  const diffHr = Math.floor(diffMin / 60);
                  if (diffHr < 24) return `${diffHr}h ago`;
                  const diffDay = Math.floor(diffHr / 24);
                  return `${diffDay}d ago`;
                };
                const lastDate = lu ? (isTimestamp(lu) ? lu.toDate() : new Date(typeof lu === "string" ? lu : (lu as Date))) : null;
                const lastUpdatedStr = lastDate ? formatRelative(lastDate) : "—";
                const popupHtml = `
                  <div style="min-width:200px">
                    <div style="font-weight:600;margin-bottom:4px">${v.name || "Volunteer"}</div>
                    <div><strong>Email:</strong> ${v.email || "—"}</div>
                    <div><strong>Phone:</strong> ${v.phone || "—"}</div>
                    <div><strong>Last Updated:</strong> ${lastUpdatedStr}</div>
                    <a href="https://www.google.com/maps?q=${v.latitude},${v.longitude}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
                  </div>
                `;
                const m = L2.marker([v.latitude, v.longitude]).addTo(markersLayerRef.current!) as unknown as LeafletMarker;
                markersByIdRef.current[v.uid] = m;
                if (v.name) {
                  // show name on pin
                  m.bindTooltip?.(v.name, { permanent: true, direction: "top" });
                }
                m.bindPopup?.(popupHtml);
              }
            });

            if (points.length > 0 && leafletMapRef.current) {
              const bounds = L2.latLngBounds(points.map(([lat, lng]) => L2.latLng(lat, lng)));
              leafletMapRef.current.fitBounds(bounds.pad(0.2));
            }
          },
          (err) => {
            if (!isMounted) return;
            console.warn("Map stream error", err);
            setError("");
            setLoading(false);
          }
        );
      } catch (e: unknown) {
        if (!isMounted) return;
        console.warn("Map init error", e);
        setError("")
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{loading ? "Loading volunteers map…" : ""}</div>
        <div className="flex items-center gap-2">
          <select
            value={baseLayer}
            onChange={(e) => {
              const choice = (e.target.value as "standard" | "satellite");
              setBaseLayer(choice);
              const map = leafletMapRef.current;
              if (!map) return;
              const next = choice === "satellite" ? satLayerRef.current : osmLayerRef.current;
              if (activeBaseRef.current && (activeBaseRef.current !== next)) {
                activeBaseRef.current.remove();
              }
              if (next && (activeBaseRef.current !== next)) {
                next.addTo(map);
                activeBaseRef.current = next;
              }
            }}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
          </select>
          <select
            value={selectedVolunteerId}
            onChange={(e) => setSelectedVolunteerId(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="">All volunteers</option>
            {volunteersState.map((v) => (
              <option key={v.uid} value={v.uid}>{v.name || v.email || v.uid}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const map = leafletMapRef.current;
              if (!map) return;
              const Lg = (window as unknown as { L?: Leaflet }).L;
              if (!Lg) return;
              if (selectedVolunteerId && markersByIdRef.current[selectedVolunteerId]) {
                const m = markersByIdRef.current[selectedVolunteerId];
                const ll = m.getLatLng?.();
                if (ll) map.setView([ll.lat, ll.lng], 14);
                m.openPopup?.();
              } else {
                const latLngs = Object.values(markersByIdRef.current)
                  .map((mk: LeafletMarker) => mk.getLatLng?.())
                  .filter((ll): ll is { lat: number; lng: number } => Boolean(ll));
                const points: [number, number][] = latLngs.map((ll) => [ll.lat, ll.lng]);
                if (points.length > 0) {
                  const bounds = Lg.latLngBounds(points.map(([lat, lng]) => Lg.latLng(lat, lng)));
                  map.fitBounds(bounds.pad(0.2));
                }
              }
            }}
            className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white shadow hover:bg-black"
          >
            Recenter
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}
      <div ref={mapRef} className="w-full rounded-lg border border-gray-200" style={{ height: "70vh" }} />
    </div>
  );
};

export default VolunteersMap;