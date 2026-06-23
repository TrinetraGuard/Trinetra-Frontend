import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Timestamp,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Navigation2,
  Phone,
  Radio,
  Search,
  ShieldAlert,
  User,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { admin } from "@/lib/adminTheme";
import L from "leaflet";
import { db } from "../../firebase/firebase";

(L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const createSOSIcon = () =>
  L.divIcon({
    className: "sos-marker",
    html: `<div style="
      width: 44px; height: 44px; background: #111827;
      border: 3px solid #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      animation: sos-pulse 2s infinite;
    "><span style="color: white; font-size: 18px;">!</span></div>
    <style>@keyframes sos-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(17,24,39,0.5); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(17,24,39,0); }
    }</style>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const createVolunteerIcon = () =>
  L.divIcon({
    className: "volunteer-marker",
    html: `<div style="
      width: 36px; height: 36px; background: #4b5563;
      border: 2px solid white; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "><span style="color: white; font-size: 14px;">V</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  activatedAt: Timestamp;
  resolvedAt?: Timestamp;
  status: "active" | "resolved";
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: Timestamp;
  authorizedVolunteers?: string[];
}

interface Volunteer {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  role?: string;
  appName?: string;
}

const MapUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card className={`${admin.statCard} overflow-hidden`}>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accent ? "bg-red-600 text-white" : admin.statIcon
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className={admin.iconWrap}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {inner}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-800">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
    </div>
  );
}

const SosAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [newAlerts, setNewAlerts] = useState<Set<string>>(new Set());
  const mapRef = useRef<L.Map | null>(null);
  const previousAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, "sos_alerts"), orderBy("activatedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const alertsData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SOSAlert[];

        const currentAlertIds = new Set(alertsData.map((a) => a.id));
        const newAlertIds = new Set(
          Array.from(currentAlertIds).filter((id) => !previousAlertsRef.current.has(id))
        );

        if (newAlertIds.size > 0) {
          setNewAlerts(newAlertIds);
          setTimeout(() => {
            setNewAlerts((prev) => {
              const updated = new Set(prev);
              newAlertIds.forEach((id) => updated.delete(id));
              return updated;
            });
          }, 5000);
        }

        previousAlertsRef.current = currentAlertIds;
        setAlerts(alertsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to SOS alerts:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const volunteersData = snapshot.docs
          .map((d) => ({ uid: d.id, ...d.data() }) as Volunteer)
          .filter((v) => v.role === "volunteer" && v.appName === "Trinetra");
        setVolunteers(volunteersData);
      },
      (error) => console.error("Error listening to volunteers:", error)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedAlert && alerts.length > 0) {
      const activeAlert = alerts.find((a) => a.status === "active");
      if (activeAlert) setSelectedAlert(activeAlert);
    }
  }, [alerts, selectedAlert]);

  useEffect(() => {
    if (!selectedAlert || selectedAlert.status !== "active") return;
    const alertRef = doc(db, "sos_alerts", selectedAlert.id);
    const unsubscribe = onSnapshot(alertRef, (snap) => {
      if (snap.exists()) {
        const updatedData = { id: snap.id, ...snap.data() } as SOSAlert;
        setSelectedAlert(updatedData);
        setAlerts((prev) => prev.map((a) => (a.id === updatedData.id ? updatedData : a)));
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlert?.id]);

  const nearestVolunteers = useMemo(() => {
    if (!selectedAlert?.latitude || !selectedAlert?.longitude) return [];
    return volunteers
      .filter((v) => v.latitude && v.longitude)
      .map((v) => ({
        ...v,
        distance: calculateDistance(
          selectedAlert.latitude!,
          selectedAlert.longitude!,
          v.latitude!,
          v.longitude!
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }, [selectedAlert, volunteers]);

  const volunteersWithLocation = useMemo(
    () => volunteers.filter((v) => v.latitude && v.longitude).length,
    [volunteers]
  );

  const handleResolveAlert = async (alertId: string) => {
    if (!window.confirm("Mark this emergency as resolved? Volunteer access will be revoked.")) return;
    try {
      await updateDoc(doc(db, "sos_alerts", alertId), {
        status: "resolved",
        resolvedAt: Timestamp.now(),
        authorizedVolunteers: [],
      });
      if (selectedAlert?.id === alertId) {
        const nextActive = alerts.find((a) => a.id !== alertId && a.status === "active");
        setSelectedAlert(nextActive || null);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
      alert("Failed to resolve alert. Please try again.");
    }
  };

  const handleGrantAccess = async (alertId: string, volunteerId: string) => {
    try {
      const alertRef = doc(db, "sos_alerts", alertId);
      const alertDoc = await getDoc(alertRef);
      const currentAuthorized = alertDoc.data()?.authorizedVolunteers || [];
      if (!currentAuthorized.includes(volunteerId)) {
        await updateDoc(alertRef, { authorizedVolunteers: arrayUnion(volunteerId) });
      }
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access. Please try again.");
    }
  };

  const handleRevokeAccess = async (alertId: string, volunteerId: string) => {
    try {
      await updateDoc(doc(db, "sos_alerts", alertId), {
        authorizedVolunteers: arrayRemove(volunteerId),
      });
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access. Please try again.");
    }
  };

  const handleAlertSelect = (alert: SOSAlert) => {
    setSelectedAlert(alert);
    setNewAlerts((prev) => {
      const updated = new Set(prev);
      updated.delete(alert.id);
      return updated;
    });
  };

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
        return b.activatedAt.toMillis() - a.activatedAt.toMillis();
      }),
    [alerts]
  );

  const filteredAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedAlerts.filter((alert) => {
      if (filter === "active" && alert.status !== "active") return false;
      if (filter === "resolved" && alert.status !== "resolved") return false;
      if (!q) return true;
      return [alert.userName, alert.userEmail, alert.userPhone, alert.id]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [sortedAlerts, filter, searchQuery]);

  const activeAlerts = useMemo(() => alerts.filter((a) => a.status === "active"), [alerts]);
  const resolvedAlerts = useMemo(() => alerts.filter((a) => a.status === "resolved"), [alerts]);

  const formatTime = (timestamp: Timestamp) =>
    new Date(timestamp.toDate()).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTimeAgo = (timestamp: Timestamp) => {
    const diffInSeconds = Math.floor(
      (Date.now() - timestamp.toDate().getTime()) / 1000
    );
    if (diffInSeconds < 10) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getLocationUpdateTime = (alert: SOSAlert) => {
    if (!alert.lastLocationUpdate) return "Never";
    return getTimeAgo(alert.lastLocationUpdate);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className={admin.page}>
      {/* Page header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={admin.iconWrapSolid}>
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={admin.title}>SOS Alerts</h1>
              {activeAlerts.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  {activeAlerts.length} live
                </span>
              )}
            </div>
            <p className={admin.subtitle}>
              Real-time emergency monitoring, volunteer dispatch, and live location tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[420px]">
          <StatTile label="Active" value={activeAlerts.length} icon={AlertCircle} accent />
          <StatTile label="Resolved" value={resolvedAlerts.length} icon={CheckCircle2} />
          <StatTile label="Volunteers" value={volunteersWithLocation} icon={Users} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Alerts sidebar */}
        <div className="xl:col-span-4">
          <Card className={`${admin.card} overflow-hidden`}>
            <CardHeader className={`space-y-4 ${admin.cardHeader}`}>
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radio className="h-5 w-5 text-gray-700" />
                  Alert queue
                </CardTitle>
                <CardDescription className="mt-1">
                  {filteredAlerts.length} {filter === "all" ? "total" : filter} alert
                  {filteredAlerts.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, phone…"
                  className={`h-10 pl-9 ${admin.input}`}
                />
              </div>

              <div className="flex gap-2">
                {(["active", "resolved", "all"] as const).map((key) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 capitalize ${filter === key ? admin.cta : "border-gray-300"}`}
                    onClick={() => setFilter(key)}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                {filteredAlerts.length === 0 ? (
                  <EmptyState
                    icon={AlertCircle}
                    title={`No ${filter === "all" ? "" : filter} alerts`}
                    description="New SOS activations from pilgrims will appear here instantly."
                  />
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filteredAlerts.map((alert) => {
                      const isNew = newAlerts.has(alert.id);
                      const isSelected = selectedAlert?.id === alert.id;
                      const isActive = alert.status === "active";

                      return (
                        <li key={alert.id}>
                          <button
                            type="button"
                            onClick={() => handleAlertSelect(alert)}
                            className={`w-full p-4 text-left transition-all ${
                              isSelected
                                ? "bg-gray-100 ring-1 ring-inset ring-gray-300"
                                : "hover:bg-gray-50"
                            } ${isNew ? "bg-red-50/80" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                                  isActive ? "bg-red-600" : "bg-gray-500"
                                }`}
                              >
                                {initials(alert.userName)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                  {isNew && (
                                    <Badge className="bg-red-600 text-white shadow-sm">
                                      <Zap className="mr-1 h-3 w-3" />
                                      NEW
                                    </Badge>
                                  )}
                                  <Badge
                                    className={
                                      isActive
                                        ? "bg-red-600 text-white hover:bg-red-600"
                                        : "bg-gray-600 text-white hover:bg-gray-600"
                                    }
                                  >
                                    {isActive ? "ACTIVE" : "RESOLVED"}
                                  </Badge>
                                  {isActive && (
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                  )}
                                </div>
                                <p className="truncate font-semibold text-gray-900">{alert.userName}</p>
                                <p className="truncate text-sm text-gray-500">{alert.userEmail}</p>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {getTimeAgo(alert.activatedAt)}
                                  </span>
                                  {isActive && alert.latitude && alert.longitude && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      GPS {getLocationUpdateTime(alert)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0 border-gray-300 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleResolveAlert(alert.id);
                                  }}
                                >
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="space-y-6 xl:col-span-8">
          {selectedAlert ? (
            <>
              {/* User summary */}
              <Card className={admin.card}>
                <CardHeader
                  className={`${admin.cardHeader} ${
                    selectedAlert.status === "active" ? "border-l-4 border-l-red-600" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md ${
                          selectedAlert.status === "active" ? "bg-red-600" : "bg-gray-600"
                        }`}
                      >
                        {initials(selectedAlert.userName)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{selectedAlert.userName}</CardTitle>
                        <CardDescription>{selectedAlert.userEmail}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`px-3 py-1.5 text-sm font-semibold ${
                          selectedAlert.status === "active"
                            ? "bg-red-600 text-white hover:bg-red-600"
                            : "bg-gray-600 text-white hover:bg-gray-600"
                        }`}
                      >
                        {selectedAlert.status === "active" ? (
                          <>
                            <AlertCircle className="mr-1.5 h-4 w-4" />
                            Active emergency
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Resolved
                          </>
                        )}
                      </Badge>
                      {selectedAlert.status === "active" && (
                        <Button
                          className={admin.cta}
                          onClick={() => void handleResolveAlert(selectedAlert.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
                  <DetailTile
                    icon={Phone}
                    label="Phone"
                    value={selectedAlert.userPhone || "—"}
                    href={
                      selectedAlert.userPhone
                        ? `tel:${selectedAlert.userPhone.replace(/\s/g, "")}`
                        : undefined
                    }
                  />
                  <DetailTile
                    icon={Mail}
                    label="Email"
                    value={selectedAlert.userEmail || "—"}
                    href={
                      selectedAlert.userEmail
                        ? `mailto:${selectedAlert.userEmail}`
                        : undefined
                    }
                  />
                  <DetailTile
                    icon={Clock}
                    label="Activated"
                    value={formatTime(selectedAlert.activatedAt)}
                    sub={getTimeAgo(selectedAlert.activatedAt)}
                  />
                  {selectedAlert.resolvedAt && (
                    <DetailTile
                      icon={CheckCircle2}
                      label="Resolved"
                      value={formatTime(selectedAlert.resolvedAt)}
                    />
                  )}
                  {selectedAlert.status === "active" && selectedAlert.lastLocationUpdate && (
                    <DetailTile
                      icon={Navigation2}
                      label="Last GPS update"
                      value={getLocationUpdateTime(selectedAlert)}
                      sub={
                        selectedAlert.latitude && selectedAlert.longitude
                          ? `${selectedAlert.latitude.toFixed(5)}, ${selectedAlert.longitude.toFixed(5)}`
                          : undefined
                      }
                    />
                  )}
                  {selectedAlert.authorizedVolunteers &&
                    selectedAlert.authorizedVolunteers.length > 0 && (
                      <DetailTile
                        icon={Users}
                        label="Volunteers with access"
                        value={String(selectedAlert.authorizedVolunteers.length)}
                      />
                    )}
                </CardContent>
              </Card>

              {/* Map */}
              <Card className={`${admin.card} overflow-hidden`}>
                <CardHeader className={admin.cardHeader}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={admin.iconWrapSolid}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Live location</CardTitle>
                        <CardDescription>
                          {selectedAlert.latitude && selectedAlert.longitude
                            ? "Real-time coordinates from the pilgrim device"
                            : "Waiting for GPS from device"}
                        </CardDescription>
                      </div>
                    </div>
                    {selectedAlert.status === "active" &&
                      selectedAlert.latitude &&
                      selectedAlert.longitude && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                          Live tracking
                        </span>
                      )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="relative h-[420px] bg-gray-100">
                    {selectedAlert.latitude && selectedAlert.longitude ? (
                      <MapContainer
                        center={[selectedAlert.latitude, selectedAlert.longitude]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                        ref={(map) => {
                          if (map) mapRef.current = map;
                        }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapUpdater
                          lat={selectedAlert.latitude}
                          lng={selectedAlert.longitude}
                        />
                        <Marker
                          position={[selectedAlert.latitude, selectedAlert.longitude]}
                          icon={createSOSIcon()}
                        >
                          <Popup>
                            <div className="p-1 text-sm">
                              <p className="font-semibold">{selectedAlert.userName}</p>
                              <p className="text-gray-600">{selectedAlert.userEmail}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                Updated {getLocationUpdateTime(selectedAlert)}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                        {nearestVolunteers
                          .filter(
                            (v) =>
                              v.latitude &&
                              v.longitude &&
                              selectedAlert.authorizedVolunteers?.includes(v.uid)
                          )
                          .map((volunteer) => (
                            <Marker
                              key={volunteer.uid}
                              position={[volunteer.latitude!, volunteer.longitude!]}
                              icon={createVolunteerIcon()}
                            >
                              <Popup>
                                <div className="p-1 text-sm">
                                  <p className="font-semibold">
                                    {volunteer.name || "Volunteer"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {volunteer.distance.toFixed(2)} km away
                                  </p>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                      </MapContainer>
                    ) : (
                      <EmptyState
                        icon={MapPin}
                        title="Location unavailable"
                        description="The device has not shared GPS coordinates yet."
                      />
                    )}

                    {selectedAlert.latitude && selectedAlert.longitude && (
                      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 px-4 py-2 text-xs text-gray-600 backdrop-blur-sm">
                        <span className="font-mono">
                          {selectedAlert.latitude.toFixed(6)}, {selectedAlert.longitude.toFixed(6)}
                        </span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span>Last update: {getLocationUpdateTime(selectedAlert)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Volunteers */}
              {selectedAlert.status === "active" &&
                selectedAlert.latitude &&
                selectedAlert.longitude && (
                  <Card className={admin.card}>
                    <CardHeader className={admin.cardHeader}>
                      <div className="flex items-center gap-3">
                        <div className={admin.iconWrapSolid}>
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Nearby volunteers</CardTitle>
                          <CardDescription>
                            Grant map access to the closest volunteers for coordinated response
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      {nearestVolunteers.length === 0 ? (
                        <EmptyState
                          icon={Users}
                          title="No volunteers with location"
                          description="Volunteers appear when they share GPS in the Trinetra app."
                        />
                      ) : (
                        <ul className="space-y-3">
                          {nearestVolunteers.map((volunteer, index) => {
                            const hasAccess =
                              selectedAlert.authorizedVolunteers?.includes(volunteer.uid) ||
                              false;

                            return (
                              <li
                                key={volunteer.uid}
                                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                                  hasAccess
                                    ? "border-gray-400 bg-gray-50"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                                      hasAccess ? "bg-gray-900" : "bg-gray-500"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-gray-900">
                                      {volunteer.name || "Unknown volunteer"}
                                    </p>
                                    <p className="truncate text-sm text-gray-500">
                                      {volunteer.email}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {volunteer.distance.toFixed(2)} km
                                    </p>
                                  </div>
                                  {hasAccess && (
                                    <Badge className={`ml-1 shrink-0 ${admin.badge}`}>
                                      <Eye className="mr-1 h-3 w-3" />
                                      Access
                                    </Badge>
                                  )}
                                </div>

                                {hasAccess ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 border-gray-400"
                                    onClick={() =>
                                      void handleRevokeAccess(selectedAlert.id, volunteer.uid)
                                    }
                                  >
                                    <EyeOff className="mr-1.5 h-4 w-4" />
                                    Revoke
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className={`shrink-0 ${admin.cta}`}
                                    onClick={() =>
                                      void handleGrantAccess(selectedAlert.id, volunteer.uid)
                                    }
                                  >
                                    <Eye className="mr-1.5 h-4 w-4" />
                                    Grant access
                                  </Button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                )}
            </>
          ) : (
            <Card className={`${admin.card} min-h-[520px]`}>
              <CardContent className="flex h-full min-h-[520px] items-center justify-center">
                <EmptyState
                  icon={User}
                  title="Select an alert"
                  description="Choose an emergency from the queue to view contact details, live map, and nearby volunteers."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SosAlerts;
