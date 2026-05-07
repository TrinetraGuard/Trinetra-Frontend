import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/firebase/firebase";
import {
  fetchTrainFare,
  getRailwayApiBase,
  loadAllStations,
  pickBestDirectTrain,
  pickClassForFare,
  rankStationsByDistance,
  searchTrainsBetween,
  validCoord,
  type RailwayStation,
  type TrainSearchTrain,
} from "@/lib/railwayApi";
import { AlertCircle, Loader2, MapPin, RefreshCw, Train } from "lucide-react";

/** Nashik Road — IRCTC station code used as the common gathering point. */
const GATHER_STATION_CODE = "NK";
const GATHER_LABEL = "Nashik Road";

type PilgrimUser = {
  uid: string;
  name?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
};

export type UserRoutePlanStatus =
  | "idle"
  | "no_location"
  | "already_in_nashik"
  | "pending"
  | "searching"
  | "ok"
  | "no_direct_train"
  | "error";

export interface UserRoutePlanRow {
  uid: string;
  name: string;
  email: string;
  lat?: number;
  lng?: number;
  status: UserRoutePlanStatus;
  nearestCode?: string;
  nearestName?: string;
  nearestKm?: number;
  train?: TrainSearchTrain;
  weekDaysAvailable?: string[];
  weekDatesAvailable?: string[];
  chosenJourneyDate?: string;
  classForFare?: string;
  totalFare?: string;
  upstreamNote?: string;
  error?: string;
}

function ymdToday(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function weekDatesFrom(startYmd: string, count = 7): { ymd: string; weekday: string }[] {
  const base = new Date(`${startYmd}T00:00:00`);
  if (Number.isNaN(base.getTime())) return [];
  const out: { ymd: string; weekday: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push({
      ymd: `${d.getFullYear()}-${m}-${day}`,
      weekday: WEEKDAY_SHORT[d.getDay()],
    });
  }
  return out;
}

function statusBadge(status: UserRoutePlanStatus) {
  switch (status) {
    case "ok":
      return <Badge className="bg-emerald-600">Train found this week</Badge>;
    case "no_location":
      return <Badge variant="secondary">No GPS location</Badge>;
    case "already_in_nashik":
      return <Badge variant="secondary">Nearest station is Nashik</Badge>;
    case "no_direct_train":
      return <Badge variant="destructive">No direct train from nearest station</Badge>;
    case "searching":
      return <Badge variant="outline">Searching…</Badge>;
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
}

const UserRoutesToNashikAdmin = () => {
  const [users, setUsers] = useState<PilgrimUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [stations, setStations] = useState<RailwayStation[] | null>(null);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [rows, setRows] = useState<UserRoutePlanRow[]>([]);
  const [computeRunning, setComputeRunning] = useState(false);
  const [journeyDate, setJourneyDate] = useState(ymdToday());
  const [quota, setQuota] = useState("GN");
  const [parallelRequests, setParallelRequests] = useState("8");

  const apiBaseDisplay = useMemo(() => {
    try {
      return getRailwayApiBase();
    } catch {
      return "(not configured)";
    }
  }, []);

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
        const list: PilgrimUser[] = snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Record<string, unknown>),
        })) as PilgrimUser[];
        setUsers(list);
        setUsersLoading(false);
        setRows((prev) => {
          const byUid = new Map(prev.map((r) => [r.uid, r]));
          return list.map((u) => {
            const old = byUid.get(u.uid);
            if (old) return { ...old, name: u.name || old.name, email: u.email || old.email, lat: u.latitude, lng: u.longitude };
            return {
              uid: u.uid,
              name: u.name || "—",
              email: u.email || "—",
              lat: u.latitude,
              lng: u.longitude,
              status: "idle" as const,
            };
          });
        });
      },
      () => {
        if (mounted) setUsersLoading(false);
      }
    );
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const loadStations = useCallback(async () => {
    setStationsLoading(true);
    setStationsError(null);
    try {
      const list = await loadAllStations();
      setStations(list);
    } catch (e) {
      setStationsError(e instanceof Error ? e.message : String(e));
      setStations(null);
    } finally {
      setStationsLoading(false);
    }
  }, []);

  const runPlanning = useCallback(async () => {
    if (!stations?.length) {
      setStationsError("Load the station directory first.");
      return;
    }
    const parallelLimit = Math.max(1, Math.min(24, parseInt(parallelRequests, 10) || 8));
    const quotaCode = quota === "__none__" ? "" : quota;
    const weekWindow = weekDatesFrom(journeyDate, 7);
    if (!weekWindow.length) {
      setStationsError("Invalid week start date.");
      return;
    }

    setComputeRunning(true);
    setStationsError(null);

    const nextRows: UserRoutePlanRow[] = users.map((u) => ({
      uid: u.uid,
      name: u.name || "—",
      email: u.email || "—",
      lat: u.latitude,
      lng: u.longitude,
      status:
        u.latitude != null && u.longitude != null && validCoord(u.latitude, u.longitude)
          ? ("pending" as const)
          : ("no_location" as const),
    }));

    setRows(nextRows);
    const rowIndexByUid = new Map(nextRows.map((r, i) => [r.uid, i]));
    const pendingRows = nextRows.filter((r) => r.status === "pending");
    let cursor = 0;

    const processSingleUser = async (row: UserRoutePlanRow): Promise<UserRoutePlanRow> => {
      const lat = row.lat as number;
      const lng = row.lng as number;
      const ranked = rankStationsByDistance(lat, lng, stations, 1);
      if (!ranked.length) {
        return { ...row, status: "error", error: "No stations with coordinates in directory." };
      }
      const nearest = ranked[0];
      const baseRow: UserRoutePlanRow = {
        ...row,
        nearestCode: nearest.code,
        nearestName: nearest.name,
        nearestKm: Math.round(nearest.distanceKm * 10) / 10,
      };

      if (nearest.code === GATHER_STATION_CODE) {
        return {
          ...baseRow,
          status: "already_in_nashik",
          upstreamNote: "User's nearest station is already Nashik Road.",
        };
      }

      try {
        const weekSearches = await Promise.all(
          weekWindow.map(async (w) => {
            const search = await searchTrainsBetween(nearest.code, GATHER_STATION_CODE, w.ymd, {
              quotaCode: quotaCode || undefined,
            });
            const directs = Array.isArray(search.trains) ? search.trains : [];
            const best = pickBestDirectTrain(directs);
            return { ...w, search, best };
          })
        );

        const found = weekSearches.filter(
          (w): w is typeof w & { best: TrainSearchTrain } => !!w.best?.trainNumber
        );
        if (!found.length) {
          return {
            ...baseRow,
            status: "no_direct_train",
            weekDaysAvailable: [],
            weekDatesAvailable: [],
            upstreamNote: "No direct train found from nearest station in selected week.",
          };
        }

        const bestTrain = pickBestDirectTrain(found.map((w) => w.best as TrainSearchTrain));
        const selected = found.find((w) => w.best?.trainNumber === bestTrain?.trainNumber) || found[0];
        const availableWeekdays = Array.from(new Set(found.map((w) => w.weekday)));
        const availableDates = found.map((w) => w.ymd);
        const cls = pickClassForFare(selected.best?.classes);
        let totalFare: string | undefined;
        let upstreamNote = selected.search.upstreamMessage;

        if (cls && selected.best?.trainNumber) {
          const fareRes = await fetchTrainFare({
            trainNumber: selected.best.trainNumber,
            journeyDate: selected.ymd,
            fromStation: selected.best.fromStnCode || nearest.code,
            toStation: selected.best.toStnCode || GATHER_STATION_CODE,
            classCode: cls,
            quotaCode: quotaCode || undefined,
          });
          totalFare = fareRes.result?.fare?.totalFare || fareRes.result?.fare?.totalCollectibleAmount || undefined;
          if (!totalFare && fareRes.upstreamMessage) upstreamNote = fareRes.upstreamMessage;
          if (!totalFare && fareRes.error) upstreamNote = fareRes.error;
        }

        return {
          ...baseRow,
          status: "ok",
          train: selected.best,
          weekDaysAvailable: availableWeekdays,
          weekDatesAvailable: availableDates,
          chosenJourneyDate: selected.ymd,
          classForFare: cls || undefined,
          totalFare,
          upstreamNote,
        };
      } catch (e) {
        return {
          ...baseRow,
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        };
      }
    };

    const workers = Array.from({ length: Math.min(parallelLimit, pendingRows.length) }, async () => {
      for (let next = cursor++; next < pendingRows.length; next = cursor++) {
        const row = pendingRows[next];

        setRows((prev) => prev.map((r) => (r.uid === row.uid ? { ...r, status: "searching" } : r)));
        const resolved = await processSingleUser(row);
        const idx = rowIndexByUid.get(resolved.uid);
        if (idx != null) nextRows[idx] = resolved;
        setRows((prev) => prev.map((r) => (r.uid === resolved.uid ? resolved : r)));
      }
    });

    await Promise.all(workers);

    setComputeRunning(false);
  }, [users, stations, journeyDate, quota, parallelRequests]);

  const withLocationCount = users.filter(
    (u) => u.latitude != null && u.longitude != null && validCoord(u.latitude, u.longitude)
  ).length;
  const alreadyInNashikRows = rows.filter((r) => r.status === "already_in_nashik");
  const travelRows = rows.filter((r) => r.status !== "already_in_nashik");

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Train className="h-7 w-7 text-gray-800" />
            User routes to Nashik
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Uses each user&apos;s last known GPS position (same source as User&apos;s Map), finds the closest stations in
            the railway directory, then searches for a <strong>direct</strong> train to {GATHER_LABEL} (
            <code className="text-xs bg-muted px-1 rounded">{GATHER_STATION_CODE}</code>
            ) from the user&apos;s <strong>nearest station only</strong> across a <strong>7-day window</strong>. Users
            already nearest to Nashik are excluded from search. Fares use IRCTC via your backend — verify before booking.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API & directory</CardTitle>
          <CardDescription>
            Resolved API prefix (calls go to <code className="text-xs">{apiBaseDisplay}/v1/…</code>
            ). Set <code className="text-xs">VITE_RAILWAY_API_BASE_URL</code> to override{" "}
            <code className="text-xs">VITE_API_BASE_URL</code>. You may use the server origin (
            <code className="text-xs">http://localhost:8080</code>) or the full prefix (
            <code className="text-xs">http://localhost:8080/api</code>) — both work.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <Button type="button" variant="secondary" onClick={loadStations} disabled={stationsLoading}>
            {stationsLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading stations…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load station directory
              </>
            )}
          </Button>
          {stations && (
            <Badge variant="outline" className="font-mono text-xs">
              {stations.length} stations
            </Badge>
          )}
          {stationsError && (
            <span className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {stationsError}
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Journey & search</CardTitle>
          <CardDescription>
            Uses your reference train search payload for each day in the next 7 days, then reports weekday availability
            and best train from nearest station to Nashik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="journeyDate">Week start date</Label>
            <Input id="journeyDate" type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Quota (optional)</Label>
            <Select value={quota} onValueChange={setQuota}>
              <SelectTrigger>
                <SelectValue placeholder="Quota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Default / empty</SelectItem>
                <SelectItem value="GN">GN — General</SelectItem>
                <SelectItem value="TQ">TQ — Tatkal</SelectItem>
                <SelectItem value="PT">PT — Premium Tatkal</SelectItem>
                <SelectItem value="LD">LD — Ladies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parallelReq">Parallel user requests</Label>
            <Input
              id="parallelReq"
              inputMode="numeric"
              value={parallelRequests}
              onChange={(e) => setParallelRequests(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-2 items-center">
            <Button type="button" onClick={runPlanning} disabled={computeRunning || !stations?.length || usersLoading}>
              {computeRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Computing routes…
                </>
              ) : (
                "Compute weekly routes for all users"
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              {usersLoading ? "Loading users…" : `${users.length} users · ${withLocationCount} with valid coordinates`}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User-wise plan</CardTitle>
          <CardDescription>
            Each row is searched from the user&apos;s nearest station directly to {GATHER_LABEL}; no alternate boarding
            station is used. Availability is evaluated across the selected week.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start stop (nearest)</TableHead>
                <TableHead>End stop</TableHead>
                <TableHead>Train</TableHead>
                <TableHead>Week availability</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Total fare</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {travelRows.length === 0 && !usersLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-muted-foreground text-center py-8">
                    No users currently require travel planning.
                  </TableCell>
                </TableRow>
              ) : (
                travelRows.map((r) => (
                  <TableRow key={r.uid}>
                    <TableCell className="align-top min-w-[140px]">
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground break-all">{r.email}</div>
                      {r.lat != null && r.lng != null && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">{statusBadge(r.status)}</TableCell>
                    <TableCell className="align-top text-sm">
                      {r.nearestCode ? (
                        <>
                          <span className="font-mono font-semibold">{r.nearestCode}</span>
                          <div className="text-xs text-muted-foreground">{r.nearestName}</div>
                          {r.nearestKm != null && <div className="text-xs">{r.nearestKm} km from user</div>}
                        </>
                      ) : r.status === "no_location" ? (
                        "—"
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      <span className="font-mono font-semibold">{GATHER_STATION_CODE}</span>
                      <div className="text-xs text-muted-foreground">{GATHER_LABEL}</div>
                    </TableCell>
                    <TableCell className="align-top text-sm min-w-[120px]">
                      {r.train?.trainNumber ? (
                        <>
                          <div className="font-mono font-bold">{r.train.trainNumber}</div>
                          <div className="text-xs text-muted-foreground leading-snug">{r.train.trainName}</div>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      {r.weekDaysAvailable?.length ? (
                        <>
                          <div className="font-mono">{r.weekDaysAvailable.join(", ")}</div>
                          {r.weekDatesAvailable?.length ? (
                            <div className="text-muted-foreground mt-1">{r.weekDatesAvailable.join(", ")}</div>
                          ) : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs font-mono whitespace-nowrap">
                      {r.train ? (
                        <>
                          <div>Dep {r.train.departureTime ?? "—"}</div>
                          <div>Arr {r.train.arrivalTime ?? "—"}</div>
                          <div className="text-muted-foreground">{r.train.duration ?? "—"}</div>
                          {r.train.distance != null && r.train.distance !== "" && (
                            <div className="text-muted-foreground">{r.train.distance} km</div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="align-top font-mono text-sm">{r.classForFare ?? "—"}</TableCell>
                    <TableCell className="align-top font-mono text-sm">{r.totalFare ?? "—"}</TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground max-w-[220px]">
                      {r.error && <span className="text-destructive">{r.error}</span>}
                      {!r.error && r.upstreamNote && <span>{r.upstreamNote}</span>}
                      {!r.error && !r.upstreamNote && r.status === "no_direct_train" && (
                        <span>No direct train found in selected week.</span>
                      )}
                      {!r.error && r.status === "ok" && r.chosenJourneyDate && (
                        <div className="mt-1">Fare checked for: {r.chosenJourneyDate}</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Already in Nashik</CardTitle>
          <CardDescription>
            Users whose nearest railway station is {GATHER_LABEL} ({GATHER_STATION_CODE}) are excluded from route
            search and listed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nearest station</TableHead>
                <TableHead>End stop</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alreadyInNashikRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-6">
                    No users currently fall under this category.
                  </TableCell>
                </TableRow>
              ) : (
                alreadyInNashikRows.map((r) => (
                  <TableRow key={r.uid}>
                    <TableCell className="align-top min-w-[140px]">
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground break-all">{r.email}</div>
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">{statusBadge(r.status)}</TableCell>
                    <TableCell className="align-top text-sm">
                      <span className="font-mono font-semibold">{r.nearestCode || GATHER_STATION_CODE}</span>
                      <div className="text-xs text-muted-foreground">{r.nearestName || GATHER_LABEL}</div>
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      <span className="font-mono font-semibold">{GATHER_STATION_CODE}</span>
                      <div className="text-xs text-muted-foreground">{GATHER_LABEL}</div>
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground max-w-[220px]">
                      {r.upstreamNote || "No inter-city train route required."}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoutesToNashikAdmin;
