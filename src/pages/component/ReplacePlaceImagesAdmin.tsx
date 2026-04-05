import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { collection, doc, onSnapshot, updateDoc, type QueryDocumentSnapshot } from "firebase/firestore";
import { AlertTriangle, CheckCircle2, ImageIcon, ImageOff, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "../../firebase/firebase";

type PlaceImageRow = {
  id: string;
  name: string;
  urls: string[];
};

function normalizePlaceImageRow(d: QueryDocumentSnapshot): PlaceImageRow {
  const raw = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    name: String(raw.name ?? ""),
    urls: Array.isArray(raw.urls) ? raw.urls.map((u) => String(u)) : [],
  };
}

function slotKey(placeId: string, index: number): string {
  return `${placeId}|${index}`;
}

/** Non-empty URL at index: probe until good or broken */
function ImageProbes({
  places,
  goodKeys,
  brokenKeys,
  onGood,
  onBroken,
}: {
  places: PlaceImageRow[];
  goodKeys: Set<string>;
  brokenKeys: Set<string>;
  onGood: (key: string) => void;
  onBroken: (key: string) => void;
}) {
  return (
    <div className="sr-only" aria-hidden>
      {places.flatMap((p) =>
        p.urls.map((raw, index) => {
          const url = raw.trim();
          if (!url) return [];
          const key = slotKey(p.id, index);
          if (goodKeys.has(key) || brokenKeys.has(key)) return [];
          return [
            <img
              key={key}
              src={url}
              alt=""
              width={1}
              height={1}
              decoding="async"
              onLoad={() => onGood(key)}
              onError={() => onBroken(key)}
            />,
          ];
        })
      )}
    </div>
  );
}

function placeHasAnyIssue(
  p: PlaceImageRow,
  goodKeys: Set<string>,
  brokenKeys: Set<string>
): boolean {
  if (p.urls.length === 0) return true;
  for (let i = 0; i < p.urls.length; i++) {
    const t = (p.urls[i] ?? "").trim();
    if (!t) return true;
    const key = slotKey(p.id, i);
    if (brokenKeys.has(key)) return true;
    if (!goodKeys.has(key) && !brokenKeys.has(key)) return true;
  }
  return false;
}

function slotStatus(
  place: PlaceImageRow,
  index: number,
  goodKeys: Set<string>,
  brokenKeys: Set<string>
): "empty" | "probing" | "ok" | "broken" {
  const t = (place.urls[index] ?? "").trim();
  if (!t) return "empty";
  const key = slotKey(place.id, index);
  if (goodKeys.has(key)) return "ok";
  if (brokenKeys.has(key)) return "broken";
  return "probing";
}

export default function ReplacePlaceImagesAdmin() {
  const [places, setPlaces] = useState<PlaceImageRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [goodKeys, setGoodKeys] = useState<Set<string>>(() => new Set());
  const [brokenKeys, setBrokenKeys] = useState<Set<string>>(() => new Set());
  /** Draft URL per `placeId|index` */
  const [replaceUrlDrafts, setReplaceUrlDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const prevUrlsSigRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "places"),
      (snap) => {
        setLoadError(null);
        setPlaces(snap.docs.map((d) => normalizePlaceImageRow(d)));
      },
      (err) => {
        console.error("ReplacePlaceImagesAdmin:", err);
        setLoadError(err.message || "Could not load places.");
        setPlaces([]);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    places.forEach((p) => {
      const sig = JSON.stringify(p.urls);
      const prev = prevUrlsSigRef.current[p.id];
      if (prev !== undefined && prev !== sig) {
        const prefix = `${p.id}|`;
        setGoodKeys((s) => new Set([...s].filter((k) => !k.startsWith(prefix))));
        setBrokenKeys((s) => new Set([...s].filter((k) => !k.startsWith(prefix))));
        setReplaceUrlDrafts((d) => {
          const next = { ...d };
          for (const k of Object.keys(next)) {
            if (k.startsWith(prefix)) delete next[k];
          }
          return next;
        });
      }
      prevUrlsSigRef.current[p.id] = sig;
    });
  }, [places]);

  const onGood = useCallback((key: string) => {
    setGoodKeys((prev) => new Set(prev).add(key));
  }, []);

  const onBroken = useCallback((key: string) => {
    setBrokenKeys((prev) => new Set(prev).add(key));
  }, []);

  const displayPlaces = useMemo(() => {
    const term = search.trim().toLowerCase();
    return places.filter((p) => {
      if (term && !(p.name || "").toLowerCase().includes(term)) return false;
      return placeHasAnyIssue(p, goodKeys, brokenKeys);
    });
  }, [places, goodKeys, brokenKeys, search]);

  const probingCount = useMemo(() => {
    let n = 0;
    for (const p of places) {
      for (let i = 0; i < p.urls.length; i++) {
        const t = (p.urls[i] ?? "").trim();
        if (!t) continue;
        const key = slotKey(p.id, i);
        if (!goodKeys.has(key) && !brokenKeys.has(key)) n++;
      }
    }
    return n;
  }, [places, goodKeys, brokenKeys]);

  const saveUrlAtIndex = async (place: PlaceImageRow, index: number) => {
    const k = slotKey(place.id, index);
    const stored = (place.urls[index] ?? "").trim();
    const draft = replaceUrlDrafts[k];
    const newUrl = (draft !== undefined ? draft : stored).trim();
    if (!newUrl) {
      alert("Enter a working direct image URL.");
      return;
    }
    setSavingKey(k);
    try {
      const next = [...place.urls];
      if (next.length === 0) {
        next.push(newUrl);
      } else if (index >= next.length) {
        while (next.length < index) next.push("");
        next.push(newUrl);
      } else {
        next[index] = newUrl;
      }
      await updateDoc(doc(db, "places", place.id), {
        urls: next,
        updatedAt: new Date(),
      });
      setReplaceUrlDrafts((prev) => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
      setBrokenKeys((prev) => {
        const s = new Set(prev);
        s.delete(k);
        return s;
      });
      setGoodKeys((prev) => {
        const s = new Set(prev);
        s.delete(k);
        return s;
      });
    } catch (e) {
      console.error("saveUrlAtIndex:", e);
      alert("Could not save. Check Firestore permissions and try again.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <ImageProbes
        places={places}
        goodKeys={goodKeys}
        brokenKeys={brokenKeys}
        onGood={onGood}
        onBroken={onBroken}
      />

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <strong>Could not load places.</strong> {loadError}
        </div>
      )}

      <Card className="shadow-lg border-amber-100">
        <CardHeader className="border-b bg-amber-50/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                <ImageOff className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl">Replace place images</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base">
                  Every image URL in each place&apos;s list is checked. Places with <strong>any</strong> missing, empty,
                  or broken link appear below. <strong>All</strong> images for that place are shown so you can fix only
                  what failed while seeing the rest.
                </CardDescription>
              </div>
            </div>
            <div className="w-full lg:w-72 shrink-0 space-y-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by place name…"
                className="h-10"
              />
              {probingCount > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking {probingCount} image link{probingCount !== 1 ? "s" : ""}…
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {places.length === 0 && !loadError ? (
            <p className="text-sm text-muted-foreground">No places in the database yet.</p>
          ) : displayPlaces.length === 0 ? (
            <div className="rounded-xl border border-green-200 bg-green-50/60 px-6 py-10 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-green-700 mb-3" />
              <p className="font-semibold text-green-900">No broken or missing images</p>
              <p className="text-sm text-green-800/90 mt-1 max-w-md mx-auto">
                Every place has at least one URL and all stored image links loaded successfully. Broken links will
                appear here when you open this page again.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayPlaces.map((place) => {
                const indices =
                  place.urls.length === 0
                    ? [0]
                    : place.urls.map((_, i) => i);

                return (
                  <div
                    key={place.id}
                    className="rounded-xl border-2 border-amber-200 bg-card p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    <h2 className="font-semibold text-lg text-gray-900 border-b border-amber-100 pb-2">
                      {place.name || "Unnamed place"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({place.urls.length === 0 ? "no images yet" : `${place.urls.length} image URL(s)`})
                      </span>
                    </h2>

                    <div className="space-y-4">
                      {indices.map((index) => {
                        const k = slotKey(place.id, index);
                        const stored = place.urls[index] ?? "";
                        const trimmedStored = stored.trim();
                        const status = place.urls.length === 0 ? "empty" : slotStatus(place, index, goodKeys, brokenKeys);
                        const draft = replaceUrlDrafts[k];
                        const inputValue = draft !== undefined ? draft : stored;
                        const previewUrl = (inputValue || "").trim() || trimmedStored || "";

                        const needsFix = status === "empty" || status === "broken";
                        const label =
                          index === 0
                            ? `Image ${index + 1} (primary)`
                            : `Image ${index + 1}`;

                        return (
                          <div
                            key={k}
                            className={`rounded-lg border p-3 sm:p-4 space-y-3 ${
                              needsFix
                                ? "border-amber-300 bg-amber-50/40"
                                : status === "probing"
                                  ? "border-muted bg-muted/20"
                                  : "border-green-200 bg-green-50/30"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Label className="text-sm font-semibold">{label}</Label>
                              {status === "ok" && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  OK
                                </span>
                              )}
                              {status === "broken" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  Broken link
                                </span>
                              )}
                              {status === "empty" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  Missing / empty URL
                                </span>
                              )}
                              {status === "probing" && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Checking…
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative w-full sm:w-44 shrink-0 aspect-video overflow-hidden rounded-md bg-muted border flex items-center justify-center">
                                {previewUrl ? (
                                  <img
                                    key={previewUrl + k}
                                    src={previewUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    onError={
                                      status === "ok"
                                        ? undefined
                                        : () => onBroken(k)
                                    }
                                  />
                                ) : (
                                  <ImageOff className="h-8 w-8 text-muted-foreground opacity-50" />
                                )}
                              </div>

                              <div className="flex-1 space-y-2 min-w-0">
                                <Input
                                  type="text"
                                  inputMode="url"
                                  autoComplete="off"
                                  placeholder="https://…"
                                  value={inputValue}
                                  onChange={(e) =>
                                    setReplaceUrlDrafts((prev) => ({ ...prev, [k]: e.target.value }))
                                  }
                                  className="font-mono text-xs h-10"
                                  readOnly={status === "ok"}
                                  title={status === "ok" ? "This image loaded OK. Fix another slot if needed." : undefined}
                                />
                                {needsFix || status === "probing" ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700"
                                    disabled={savingKey === k || !(inputValue || "").trim()}
                                    onClick={() => saveUrlAtIndex(place, index)}
                                  >
                                    {savingKey === k ? "Saving…" : "Save this image URL"}
                                  </Button>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    No change needed for this URL. If it breaks later, it will move to &quot;Broken&quot;
                                    after a reload.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
