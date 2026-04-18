import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase/firebase";
import {
  collection,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle2,
  DoorClosed,
  Loader2,
  MapPin,
  Save,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ClosureRow = {
  id: string;
  name: string;
  categories: string[];
  isClosed: boolean;
  closedReason: string;
  closedAtLabel: string;
  closureUpdatedLabel: string;
};

function formatTs(value: unknown): string {
  if (value == null) return "—";
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().toLocaleString();
    } catch {
      return "—";
    }
  }
  return "—";
}

function rowFromDoc(d: QueryDocumentSnapshot): ClosureRow {
  const x = d.data() as Record<string, unknown>;
  const cats = Array.isArray(x.categories) ? x.categories.map((c) => String(c)) : [];
  return {
    id: d.id,
    name: String(x.name ?? "Unnamed"),
    categories: cats,
    isClosed: x.isClosed === true,
    closedReason: String(x.closedReason ?? "").trim(),
    closedAtLabel: formatTs(x.closedAt),
    closureUpdatedLabel: formatTs(x.closureUpdatedAt),
  };
}

export default function PlaceClosureAdmin() {
  const [rows, setRows] = useState<ClosureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftClosed, setDraftClosed] = useState(false);
  const [draftReason, setDraftReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "places"),
      (snap) => {
        setError(null);
        const list = snap.docs.map((docSnap) => rowFromDoc(docSnap));
        list.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        setRows(list);
        setLoading(false);
      },
      (err) => {
        console.error("PlaceClosureAdmin:", err);
        setError(err.message || "Could not load places.");
        setRows([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const selected = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId]
  );

  useEffect(() => {
    if (!selected) {
      setDraftClosed(false);
      setDraftReason("");
      setSaveMsg(null);
      return;
    }
    setDraftClosed(selected.isClosed);
    setDraftReason(selected.closedReason);
    setSaveMsg(null);
  }, [selected]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === "open") list = list.filter((r) => !r.isClosed);
    if (filter === "closed") list = list.filter((r) => r.isClosed);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.closedReason.toLowerCase().includes(q) ||
        r.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [rows, filter, search]);

  const stats = useMemo(() => {
    const closed = rows.filter((r) => r.isClosed).length;
    return { total: rows.length, closed, open: rows.length - closed };
  }, [rows]);

  const handleSave = async () => {
    if (!selectedId) return;
    if (draftClosed && !draftReason.trim()) {
      setSaveMsg("Add a short reason for visitors before marking this place as closed.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const ref = doc(db, "places", selectedId);
      if (draftClosed) {
        await updateDoc(ref, {
          isClosed: true,
          closedReason: draftReason.trim(),
          closedAt: serverTimestamp(),
          closureUpdatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          isClosed: false,
          closedReason: deleteField(),
          closedAt: deleteField(),
          closureUpdatedAt: serverTimestamp(),
        });
      }
      setSaveMsg("Saved. The mobile app will update within a few seconds.");
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-red-700 text-white shadow-md">
              <DoorClosed className="h-6 w-6" />
            </span>
            Place closures
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            When a pilgrimage site is temporarily unavailable (renovation, weather, festival controls, etc.), mark it
            closed and add a clear reason. Visitors see this on the place screen and in lists, sorted with your other
            places.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200">
          {stats.total} places
        </Badge>
        <Badge className="bg-emerald-600 hover:bg-emerald-600">{stats.open} open</Badge>
        <Badge variant="outline" className="border-amber-300 text-amber-900 bg-amber-50">
          {stats.closed} marked closed
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <strong>Could not load places.</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <Card className="xl:col-span-3 border-amber-100 shadow-md overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-amber-50/90 to-orange-50/50">
            <CardTitle className="text-lg text-gray-900">All places (A–Z)</CardTitle>
            <CardDescription>Filter and select a place to edit closure status.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: "all" as const, label: "All" },
                    { key: "open" as const, label: "Open" },
                    { key: "closed" as const, label: "Closed" },
                  ] as const
                ).map(({ key, label }) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={filter === key ? "default" : "outline"}
                    className={
                      filter === key ? "bg-amber-700 hover:bg-amber-800" : "border-amber-200 text-amber-950"
                    }
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, category, reason, or ID…"
                  className="pl-9 h-10 border-amber-100"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {rows.length} places
              {search.trim() ? ` matching “${search.trim()}”` : ""}
            </p>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                Loading places…
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-x-auto max-h-[min(70vh,560px)] overflow-y-auto shadow-sm">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="sticky top-0 z-10 bg-amber-100/95 border-b border-amber-200/80 backdrop-blur-sm">
                    <tr className="text-left">
                      <th className="px-3 py-3 font-semibold text-gray-800">Place</th>
                      <th className="px-3 py-3 font-semibold text-gray-800 whitespace-nowrap">Status</th>
                      <th className="px-3 py-3 font-semibold text-gray-800">Reason (preview)</th>
                      <th className="px-3 py-3 font-semibold text-gray-800 whitespace-nowrap w-36">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                          No places match this filter or search.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const active = selectedId === r.id;
                        return (
                          <tr
                            key={r.id}
                            className={`cursor-pointer transition-colors ${
                              active ? "bg-amber-50" : "hover:bg-gray-50/80"
                            }`}
                            onClick={() => setSelectedId(r.id)}
                          >
                            <td className="px-3 py-3 align-top">
                              <p className="font-semibold text-gray-900 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-gray-400 font-mono truncate max-w-[220px]" title={r.id}>
                                {r.id}
                              </p>
                              {r.categories.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.categories.join(" · ")}</p>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top whitespace-nowrap">
                              {r.isClosed ? (
                                <Badge variant="destructive" className="font-medium bg-red-700 hover:bg-red-700">
                                  <DoorClosed className="h-3 w-3 mr-1" />
                                  Closed
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Open
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top text-gray-600 max-w-xs">
                              {r.isClosed ? (
                                <span className="line-clamp-2">{r.closedReason || "—"}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top text-xs text-gray-500 whitespace-nowrap">
                              {r.closureUpdatedLabel}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border-amber-200 shadow-lg overflow-hidden sticky top-4">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-700" />
              Closure details
            </CardTitle>
            <CardDescription>
              Toggle closed, enter the visitor-facing reason, then save. Reopening clears the notice in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {!selected ? (
              <div className="text-sm text-gray-500 py-8 text-center border border-dashed border-amber-200 rounded-lg bg-amber-50/30">
                Select a place from the table to manage closure status.
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selected</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selected.name}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5 break-all">{selected.id}</p>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-950 leading-relaxed">
                    The <strong>reason</strong> is shown to pilgrims in the mobile app. Keep it factual, short, and
                    respectful (e.g. “Closed for monsoon maintenance until 15 Oct.”).
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3">
                  <div>
                    <Label htmlFor="closed-toggle" className="text-base font-semibold text-gray-900">
                      Currently closed
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">When off, the place shows as open in the app.</p>
                  </div>
                  <button
                    id="closed-toggle"
                    type="button"
                    role="switch"
                    aria-checked={draftClosed}
                    onClick={() => setDraftClosed((v) => !v)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                      draftClosed ? "bg-red-600" : "bg-emerald-500"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition ${
                        draftClosed ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closed-reason">Reason for visitors {draftClosed && <span className="text-red-600">*</span>}</Label>
                  <Textarea
                    id="closed-reason"
                    value={draftReason}
                    onChange={(e) => setDraftReason(e.target.value)}
                    disabled={!draftClosed}
                    placeholder={
                      draftClosed
                        ? "e.g. Temple closed for annual cleaning — expected to reopen 20 March."
                        : "Enable “Currently closed” to edit the reason."
                    }
                    className="min-h-[120px] border-amber-100 focus-visible:ring-amber-500/30 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  {draftClosed && (
                    <p className="text-xs text-gray-500">Required while closed. This text is shown in the app.</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-amber-700 hover:bg-amber-800 h-11"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save to Firestore
                </Button>

                {saveMsg && (
                  <p
                    className={`text-sm ${saveMsg.includes("Saved") || saveMsg.includes("within") ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {saveMsg}
                  </p>
                )}

                <div className="text-xs text-gray-500 border-t pt-4 space-y-1">
                  <p>
                    <strong>Firestore fields:</strong> <code className="bg-gray-100 px-1 rounded">isClosed</code>{" "}
                    (bool), <code className="bg-gray-100 px-1 rounded">closedReason</code> (string),{" "}
                    <code className="bg-gray-100 px-1 rounded">closedAt</code>,{" "}
                    <code className="bg-gray-100 px-1 rounded">closureUpdatedAt</code>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
