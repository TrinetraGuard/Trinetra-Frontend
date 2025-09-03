import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { db } from "@/firebase/firebase";

type Volunteer = {
  uid: string;
  name?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  lastUpdated?: unknown;
};

type User = {
  uid: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  lastUpdated?: unknown;
};

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Minimal Leaflet typings to avoid explicit any
type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
};

type LeafletLayer = {
  addTo: (map: LeafletMap) => LeafletLayer;
  remove: () => void;
};

type LeafletMarker = LeafletLayer & {
  bindTooltip: (
    text: string,
    options: { permanent?: boolean; direction?: string }
  ) => LeafletMarker;
  bindPopup: (html: string) => LeafletMarker;
  addTo: (map: LeafletMap) => LeafletMarker;
};

type LeafletCircle = LeafletLayer;

type LeafletNS = {
  map: (el: HTMLElement) => LeafletMap;
  tileLayer: (
    url: string,
    opts: { maxZoom?: number; attribution?: string }
  ) => LeafletLayer;
  marker: (
    coords: [number, number],
    opts: { icon?: unknown }
  ) => LeafletMarker;
  icon: (opts: { iconUrl: string; iconSize: [number, number] }) => unknown;
  circle: (
    coords: [number, number],
    opts: { radius: number; color?: string; weight?: number; fillColor?: string; fillOpacity?: number }
  ) => LeafletCircle;
};

function formatTimeAgo(timestamp?: unknown) {
  const date = parseLastUpdated(timestamp);
  if (!date) return "N/A";
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type FirestoreTimestamp = { seconds: number; nanoseconds: number; toDate?: () => Date };

function parseLastUpdated(value: unknown): Date | null {
  if (!value && value !== 0) return null;
  // Firestore Timestamp object
  if (typeof value === "object" && value !== null) {
    const ts = value as FirestoreTimestamp;
    if (typeof ts.toDate === "function") {
      try { return ts.toDate(); } catch { /* ignore */ }
    }
    if (typeof ts.seconds === "number" && typeof ts.nanoseconds === "number") {
      return new Date(ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1_000_000));
    }
  }
  // Numeric epoch (seconds or milliseconds)
  if (typeof value === "number") {
    // Heuristic: >= 10^12 -> ms, else seconds
    const ms = value >= 1_000_000_000_000 ? value : value * 1000;
    return new Date(ms);
  }
  // ISO/date string
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

type FireUser = Partial<Volunteer & User> & { role?: string };

const VolunteerArea = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const volunteersRef = useRef<
    Record<string, { marker?: LeafletMarker; circle?: LeafletCircle }>
  >({});
  const usersRef = useRef<Record<string, LeafletMarker | undefined>>({});
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(
    null
  );

  const selectedVolunteerObj = useMemo(
    () => volunteers.find((v) => v.uid === selectedVolunteer) || null,
    [volunteers, selectedVolunteer]
  );

  const usersInRadius = useMemo(() => {
    if (
      !selectedVolunteerObj ||
      !selectedVolunteerObj.latitude ||
      !selectedVolunteerObj.longitude
    )
      return [] as User[];
    return users.filter(
      (u) =>
        !!u.latitude &&
        !!u.longitude &&
        haversine(
          selectedVolunteerObj.latitude!,
          selectedVolunteerObj.longitude!,
          u.latitude!,
          u.longitude!
        ) <= 1
    );
  }, [users, selectedVolunteerObj]);

  const usersInRadiusSorted = useMemo(() => {
    if (!usersInRadius.length) return usersInRadius;
    return [...usersInRadius].sort((a, b) => {
      const da = parseLastUpdated(a.lastUpdated)?.getTime() ?? 0;
      const db = parseLastUpdated(b.lastUpdated)?.getTime() ?? 0;
      return db - da;
    });
  }, [usersInRadius]);

  // Fetch all users & volunteers from Firestore
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "users")), (snap) => {
      const all = snap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as FireUser),
      }));
      setVolunteers(all.filter((u) => u.role === "volunteer") as Volunteer[]);
      setUsers(all.filter((u) => u.role === "user") as User[]);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Initialize & update map
  useEffect(() => {
    const initMap = async () => {
      const L = (window as unknown as { L?: LeafletNS }).L;
      if (!L || !mapRef.current) return;

      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current).setView(
          [20.5937, 78.9629],
          5
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(leafletMapRef.current);
      }

      // Clear old markers
      Object.values(volunteersRef.current).forEach((obj) => {
        obj.marker?.remove();
        obj.circle?.remove();
      });
      Object.values(usersRef.current).forEach((m) => m?.remove());
      volunteersRef.current = {};
      usersRef.current = {};

      // Add Users
      users.forEach((u) => {
        if (u.latitude && u.longitude) {
          const m = L.marker([u.latitude, u.longitude], {
            icon: L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              iconSize: [22, 22],
            }),
          });
          m.addTo(leafletMapRef.current as LeafletMap);
          usersRef.current[u.uid] = m as LeafletMarker;
        }
      });

      // Add Volunteers
      volunteers.forEach((v) => {
        if (v.latitude && v.longitude) {
          const marker = L.marker([v.latitude, v.longitude], {
            icon: L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/3106/3106921.png",
              iconSize: [32, 32],
            }),
          });
          marker.bindTooltip(v.name || "Volunteer", {
            permanent: true,
            direction: "top",
          });
          marker.addTo(leafletMapRef.current as LeafletMap);

          let circle: LeafletCircle | null = null;
          if (selectedVolunteer === v.uid) {
            circle = L.circle([v.latitude, v.longitude], {
              radius: 1000, // 1 km
              color: "#2563eb",
              weight: 2,
              fillColor: "#3b82f6",
              fillOpacity: 0.25,
            }).addTo(leafletMapRef.current as LeafletMap);

            const inside = users.filter(
              (u) =>
                u.latitude &&
                u.longitude &&
                haversine(v.latitude!, v.longitude!, u.latitude, u.longitude) <=
                  1
            );
            const abs = parseLastUpdated(v.lastUpdated)?.toLocaleString() ?? "N/A";
            marker.bindPopup(
              `<b>${v.name || "Volunteer"}</b><br/>Users in 1km: ${inside.length}<br/>Last Updated: ${abs}`
            );

            // Focus on selected volunteer
            (leafletMapRef.current as LeafletMap).setView([v.latitude, v.longitude], 15);
          }

          volunteersRef.current[v.uid] = { marker, circle: circle ?? undefined };
        }
      });
    };

    const interval = setTimeout(initMap, 300);
    return () => clearTimeout(interval);
  }, [volunteers, users, selectedVolunteer]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Volunteer Management
          </h2>
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 mr-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />{" "}
              Volunteers: {volunteers.length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-600" />{" "}
              Users: {users.length}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> <span>Loading…</span>
          </div>
        )}

        <div className="space-y-3">
          {volunteers.map((v) => {
            let count = 0;
            if (
              selectedVolunteer === v.uid &&
              v.latitude &&
              v.longitude
            ) {
              count = users.filter(
                (u) =>
                  u.latitude &&
                  u.longitude &&
                  haversine(v.latitude!, v.longitude!, u.latitude, u.longitude) <=
                    1
              ).length;
            }

            return (
              <Card
                key={v.uid}
                className={`border ${
                  selectedVolunteer === v.uid
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200"
                } rounded-xl transition`}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-medium text-gray-800 flex items-center justify-between">
                    <span>{v.name || v.email}</span>
                    <span className="flex items-center gap-2">
                      {selectedVolunteer === v.uid && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          Selected
                        </span>
                      )}
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Last Updated: {formatTimeAgo(v.lastUpdated)}</div>
                    {selectedVolunteer === v.uid && (
                      <div className="text-gray-700 font-medium">Users within 1km: {count}</div>
                    )}
                  </div>
                  {selectedVolunteer === v.uid && (
                    <div className="text-[11px] text-gray-500">
                      Showing 1km service area on map
                    </div>
                  )}

                  <div className="flex items-center justify-between space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => {
                        if (
                          v.latitude &&
                          v.longitude &&
                          leafletMapRef.current
                        ) {
                          leafletMapRef.current.setView(
                            [v.latitude, v.longitude],
                            15
                          );
                          setSelectedVolunteer(v.uid);
                        }
                      }}
                    >
                      <LocateFixed className="h-4 w-4" /> Locate
                    </Button>

                    <Switch
                      checked={selectedVolunteer === v.uid}
                      onCheckedChange={(checked) =>
                        setSelectedVolunteer(checked ? v.uid : null)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-3">
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-[80vh] rounded-2xl border border-gray-200 shadow-md z-0"
          />
          <div className="pointer-events-none absolute top-3 right-3 z-[2000] sm:top-4 sm:right-4 flex flex-col gap-2">
            <div className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur px-3 py-2 shadow-lg border border-gray-100">
              <div className="text-xs text-gray-600">Legend</div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-700">
                <span className="inline-flex items-center gap-1">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3106/3106921.png"
                    className="h-4 w-4"
                    alt="vol"
                  />{" "}
                  Volunteer
                </span>
                <span className="inline-flex items-center gap-1">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    className="h-4 w-4"
                    alt="usr"
                  />{" "}
                  User
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-blue-500/30 ring-1 ring-blue-500" />{" "}
                  1km radius
                </span>
              </div>
            </div>
            <div className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur px-3 py-2 shadow-lg border border-blue-100 w-[280px] max-w-[90vw]">
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-700 font-medium">
                  {selectedVolunteerObj ? (selectedVolunteerObj.name || selectedVolunteerObj.email) : "No volunteer selected"}
                </div>
                <div className="ml-2 inline-flex items-center gap-1 text-[11px] text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  <span>Within 1km:</span>
                  <span className="font-semibold text-gray-800">{selectedVolunteerObj ? usersInRadius.length : 0}</span>
                </div>
              </div>
              {selectedVolunteerObj ? (
                <div className="mt-2 max-h-44 overflow-auto pr-1 space-y-1.5">
                  {usersInRadiusSorted.length === 0 ? (
                    <div className="text-[11px] text-gray-500">No users within 1km</div>
                  ) : (
                    usersInRadiusSorted.slice(0, 6).map((u) => {
                      const dist = haversine(
                        selectedVolunteerObj.latitude!,
                        selectedVolunteerObj.longitude!,
                        u.latitude!,
                        u.longitude!
                      );
                      return (
                        <div key={u.uid} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white/60 px-2 py-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-600" />
                            <span className="text-[11px] text-gray-800">{u.name || u.uid.slice(0, 6)}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {dist.toFixed(2)} km • {formatTimeAgo(u.lastUpdated)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-gray-500">Toggle a volunteer in the sidebar to view nearby users.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerArea;