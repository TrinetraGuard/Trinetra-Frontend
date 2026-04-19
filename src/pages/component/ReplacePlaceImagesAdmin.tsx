import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSlotStatus,
  mediaSlotKey,
  saveCategoryIcon,
  saveEventImage,
  saveFeatureImageAtIndex,
  saveHeritageHero,
  savePlaceUrl,
  slotNeedsListing,
  type SlotStatus,
} from "@/lib/appImageMediaRepair";
import {
  collection,
  doc,
  onSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { AlertTriangle, CheckCircle2, ImageIcon, ImageOff, Loader2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "../../firebase/firebase";

type PlaceRow = { id: string; name: string; urls: string[] };
type HeritageRow = { id: string; placeName: string; heroImageUrl: string };
type EventRow = { id: string; eventName: string; imageUrl: string };
type CategoryRow = { id: string; name: string; icon: string };
type FeatureSlideMeta = { headline: string; placeName: string };

type FeatureRow = {
  images: string[];
  title: string;
  placeId?: string;
  placeName?: string;
  /** Per slide (aligned with `images` indices) for labels and search. */
  slideMeta: FeatureSlideMeta[];
  /** Flattened strings for search (includes root title and each slide field). */
  searchParts: string[];
};

function normalizePlace(d: QueryDocumentSnapshot): PlaceRow {
  const raw = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    name: String(raw.name ?? ""),
    urls: Array.isArray(raw.urls) ? raw.urls.map((u) => String(u)) : [],
  };
}

function normalizeHeritage(d: QueryDocumentSnapshot): HeritageRow {
  const raw = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    placeName: String(raw.placeName ?? "Untitled place"),
    heroImageUrl: String(raw.heroImageUrl ?? ""),
  };
}

function normalizeEvent(d: QueryDocumentSnapshot): EventRow {
  const raw = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    eventName: String(raw.eventName ?? "Untitled event"),
    imageUrl: String(raw.imageUrl ?? ""),
  };
}

function normalizeCategory(d: QueryDocumentSnapshot): CategoryRow {
  const raw = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    name: String(raw.name ?? ""),
    icon: String(raw.icon ?? ""),
  };
}

function matchesSearch(term: string, ...parts: string[]): boolean {
  if (!term) return true;
  const t = term.toLowerCase();
  return parts.some((p) => (p || "").toLowerCase().includes(t));
}

function placeHasAnyIssue(p: PlaceRow, goodKeys: Set<string>, brokenKeys: Set<string>): boolean {
  if (p.urls.length === 0) return true;
  for (let i = 0; i < p.urls.length; i++) {
    const url = (p.urls[i] ?? "").trim();
    const key = mediaSlotKey.place(p.id, i);
    if (slotNeedsListing(url, key, goodKeys, brokenKeys)) return true;
  }
  return false;
}

function heritageHasIssue(h: HeritageRow, goodKeys: Set<string>, brokenKeys: Set<string>): boolean {
  const url = h.heroImageUrl.trim();
  const key = mediaSlotKey.heritage(h.id);
  return slotNeedsListing(url, key, goodKeys, brokenKeys);
}

function eventHasIssue(ev: EventRow, goodKeys: Set<string>, brokenKeys: Set<string>): boolean {
  const url = ev.imageUrl.trim();
  const key = mediaSlotKey.event(ev.id);
  return slotNeedsListing(url, key, goodKeys, brokenKeys);
}

function featureHasIssue(f: FeatureRow, goodKeys: Set<string>, brokenKeys: Set<string>): boolean {
  if (f.images.length === 0) return true;
  for (let i = 0; i < f.images.length; i++) {
    const url = (f.images[i] ?? "").trim();
    const key = mediaSlotKey.feature(i);
    if (slotNeedsListing(url, key, goodKeys, brokenKeys)) return true;
  }
  return false;
}

function categoryHasIssue(c: CategoryRow, goodKeys: Set<string>, brokenKeys: Set<string>): boolean {
  const url = c.icon.trim();
  const key = mediaSlotKey.category(c.id);
  return slotNeedsListing(url, key, goodKeys, brokenKeys);
}

type ProbeItem = { key: string; url: string };

function buildAllProbes(
  places: PlaceRow[],
  heritage: HeritageRow[],
  events: EventRow[],
  feature: FeatureRow | null,
  categories: CategoryRow[]
): ProbeItem[] {
  const out: ProbeItem[] = [];
  places.forEach((p) => {
    p.urls.forEach((raw, index) => {
      const url = raw.trim();
      if (!url) return;
      out.push({ key: mediaSlotKey.place(p.id, index), url });
    });
  });
  heritage.forEach((h) => {
    const url = h.heroImageUrl.trim();
    if (url) out.push({ key: mediaSlotKey.heritage(h.id), url });
  });
  events.forEach((ev) => {
    const url = ev.imageUrl.trim();
    if (url) out.push({ key: mediaSlotKey.event(ev.id), url });
  });
  if (feature) {
    feature.images.forEach((raw, index) => {
      const url = raw.trim();
      if (!url) return;
      out.push({ key: mediaSlotKey.feature(index), url });
    });
  }
  categories.forEach((c) => {
    const url = c.icon.trim();
    if (url) out.push({ key: mediaSlotKey.category(c.id), url });
  });
  return out;
}

function ImageProbes({
  probes,
  goodKeys,
  brokenKeys,
  onGood,
  onBroken,
}: {
  probes: ProbeItem[];
  goodKeys: Set<string>;
  brokenKeys: Set<string>;
  onGood: (key: string) => void;
  onBroken: (key: string) => void;
}) {
  return (
    <div className="sr-only" aria-hidden>
      {probes.map(({ key, url }) => {
        if (goodKeys.has(key) || brokenKeys.has(key)) return null;
        return (
          <img
            key={key}
            src={url}
            alt=""
            width={1}
            height={1}
            decoding="async"
            onLoad={() => onGood(key)}
            onError={() => onBroken(key)}
          />
        );
      })}
    </div>
  );
}

function SlotBlock(props: {
  slotKey: string;
  label: string;
  stored: string;
  status: SlotStatus;
  replaceUrlDrafts: Record<string, string>;
  setReplaceUrlDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  savingKey: string | null;
  onBroken: (k: string) => void;
  onSave: () => void;
}) {
  const {
    slotKey: k,
    label,
    stored,
    status,
    replaceUrlDrafts,
    setReplaceUrlDrafts,
    savingKey,
    onBroken,
    onSave,
  } = props;
  const draft = replaceUrlDrafts[k];
  const inputValue = draft !== undefined ? draft : stored;
  const previewUrl = (inputValue || "").trim() || stored.trim() || "";
  const needsFix = status === "empty" || status === "broken";

  return (
    <div
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
              onError={status === "ok" ? undefined : () => onBroken(k)}
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
            onChange={(e) => setReplaceUrlDrafts((prev) => ({ ...prev, [k]: e.target.value }))}
            className="font-mono text-xs h-10"
            readOnly={status === "ok"}
            title={status === "ok" ? "This URL loaded OK." : undefined}
          />
          {needsFix || status === "probing" ? (
            <Button
              type="button"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={savingKey === k || !(inputValue || "").trim()}
              onClick={onSave}
            >
              {savingKey === k ? "Saving…" : "Save image URL"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              No change needed. If this link breaks later, it will show here again after reload.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReplacePlaceImagesAdmin() {
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [heritage, setHeritage] = useState<HeritageRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [feature, setFeature] = useState<FeatureRow | null>(null);
  const [featureDocExists, setFeatureDocExists] = useState(false);

  const [errPlaces, setErrPlaces] = useState<string | null>(null);
  const [errHeritage, setErrHeritage] = useState<string | null>(null);
  const [errEvents, setErrEvents] = useState<string | null>(null);
  const [errCategories, setErrCategories] = useState<string | null>(null);
  const [errFeature, setErrFeature] = useState<string | null>(null);
  const [goodKeys, setGoodKeys] = useState<Set<string>>(() => new Set());
  const [brokenKeys, setBrokenKeys] = useState<Set<string>>(() => new Set());
  const [replaceUrlDrafts, setReplaceUrlDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const prevUrlBySlotRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const unsubPlaces = onSnapshot(
      collection(db, "places"),
      (snap) => {
        setErrPlaces(null);
        setPlaces(snap.docs.map(normalizePlace));
      },
      (err) => {
        console.error("ReplacePlaceImages places:", err);
        setErrPlaces(err.message || "Failed to load places.");
        setPlaces([]);
      }
    );
    const unsubStories = onSnapshot(
      collection(db, "place_stories"),
      (snap) => {
        setErrHeritage(null);
        setHeritage(snap.docs.map(normalizeHeritage));
      },
      (err) => {
        console.error("ReplacePlaceImages place_stories:", err);
        setErrHeritage(err.message || "Failed to load heritage narratives.");
        setHeritage([]);
      }
    );
    const unsubEvents = onSnapshot(
      collection(db, "events"),
      (snap) => {
        setErrEvents(null);
        setEvents(snap.docs.map(normalizeEvent));
      },
      (err) => {
        console.error("ReplacePlaceImages events:", err);
        setErrEvents(err.message || "Failed to load events.");
        setEvents([]);
      }
    );
    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snap) => {
        setErrCategories(null);
        setCategories(snap.docs.map(normalizeCategory));
      },
      (err) => {
        console.error("ReplacePlaceImages categories:", err);
        setErrCategories(err.message || "Failed to load categories.");
        setCategories([]);
      }
    );
    const unsubFeature = onSnapshot(
      doc(db, "feature", "highlight"),
      (snap) => {
        setErrFeature(null);
        setFeatureDocExists(snap.exists());
        if (!snap.exists()) {
          setFeature({
            images: [],
            title: "",
            placeId: "",
            placeName: "",
            slideMeta: [],
            searchParts: [],
          });
          return;
        }
        const raw = snap.data() as Record<string, unknown>;
        const imgs = Array.isArray(raw.images) ? raw.images.map((u) => String(u)) : [];
        const searchParts: string[] = [String(raw.title ?? ""), String(raw.placeId ?? ""), String(raw.placeName ?? "")];
        const slideMeta: FeatureSlideMeta[] = [];
        const slidesRaw = raw.slides;
        if (Array.isArray(slidesRaw)) {
          for (const item of slidesRaw) {
            if (item == null || typeof item !== "object") continue;
            const x = item as Record<string, unknown>;
            const headline = String(x.headline ?? "").trim();
            const placeName = String(x.placeName ?? "").trim();
            slideMeta.push({ headline, placeName });
            searchParts.push(headline, placeName, String(x.placeId ?? ""));
          }
        }
        while (slideMeta.length < imgs.length) {
          slideMeta.push({ headline: "", placeName: "" });
        }
        setFeature({
          images: imgs,
          title: String(raw.title ?? ""),
          placeId: String(raw.placeId ?? ""),
          placeName: String(raw.placeName ?? ""),
          slideMeta,
          searchParts,
        });
      },
      (err) => {
        console.error("ReplacePlaceImages feature:", err);
        setErrFeature(err.message || "Failed to load home feature.");
        setFeature(null);
        setFeatureDocExists(false);
      }
    );

    return () => {
      unsubPlaces();
      unsubStories();
      unsubEvents();
      unsubCategories();
      unsubFeature();
    };
  }, []);

  const probes = useMemo(
    () => buildAllProbes(places, heritage, events, feature, categories),
    [places, heritage, events, feature, categories]
  );

  useEffect(() => {
    const keysSeen = new Set<string>();
    const register = (key: string, url: string) => {
      keysSeen.add(key);
      const prev = prevUrlBySlotRef.current[key];
      if (prev !== undefined && prev !== url) {
        setGoodKeys((s) => {
          const n = new Set(s);
          n.delete(key);
          return n;
        });
        setBrokenKeys((s) => {
          const n = new Set(s);
          n.delete(key);
          return n;
        });
        setReplaceUrlDrafts((d) => {
          const x = { ...d };
          delete x[key];
          return x;
        });
      }
      prevUrlBySlotRef.current[key] = url;
    };

    places.forEach((p) => {
      p.urls.forEach((raw, i) => register(mediaSlotKey.place(p.id, i), raw.trim()));
    });
    heritage.forEach((h) => register(mediaSlotKey.heritage(h.id), h.heroImageUrl.trim()));
    events.forEach((ev) => register(mediaSlotKey.event(ev.id), ev.imageUrl.trim()));
    if (feature) {
      feature.images.forEach((raw, i) => register(mediaSlotKey.feature(i), raw.trim()));
    }
    categories.forEach((c) => register(mediaSlotKey.category(c.id), c.icon.trim()));

    for (const k of Object.keys(prevUrlBySlotRef.current)) {
      if (!keysSeen.has(k)) delete prevUrlBySlotRef.current[k];
    }
  }, [places, heritage, events, feature, categories]);

  const onGood = useCallback((key: string) => {
    setGoodKeys((prev) => new Set(prev).add(key));
  }, []);

  const onBroken = useCallback((key: string) => {
    setBrokenKeys((prev) => new Set(prev).add(key));
  }, []);

  const term = search.trim().toLowerCase();

  const displayPlaces = useMemo(
    () =>
      places.filter(
        (p) => matchesSearch(term, p.name) && placeHasAnyIssue(p, goodKeys, brokenKeys)
      ),
    [places, goodKeys, brokenKeys, term]
  );

  const displayHeritage = useMemo(
    () =>
      heritage.filter(
        (h) => matchesSearch(term, h.placeName) && heritageHasIssue(h, goodKeys, brokenKeys)
      ),
    [heritage, goodKeys, brokenKeys, term]
  );

  const displayEvents = useMemo(
    () =>
      events.filter(
        (ev) => matchesSearch(term, ev.eventName) && eventHasIssue(ev, goodKeys, brokenKeys)
      ),
    [events, goodKeys, brokenKeys, term]
  );

  const displayFeature = useMemo(() => {
    if (!feature) return false;
    if (!matchesSearch(term, ...feature.searchParts, "feature", "highlight", "home")) return false;
    return featureHasIssue(feature, goodKeys, brokenKeys);
  }, [feature, goodKeys, brokenKeys, term]);

  const displayCategories = useMemo(
    () =>
      categories.filter(
        (c) => matchesSearch(term, c.name) && categoryHasIssue(c, goodKeys, brokenKeys)
      ),
    [categories, goodKeys, brokenKeys, term]
  );

  const probingCount = useMemo(() => {
    return probes.filter(({ key }) => !goodKeys.has(key) && !brokenKeys.has(key)).length;
  }, [probes, goodKeys, brokenKeys]);

  const anyIssue =
    displayPlaces.length > 0 ||
    displayHeritage.length > 0 ||
    displayEvents.length > 0 ||
    displayFeature ||
    displayCategories.length > 0;

  const hasAnyFirestoreData =
    places.length > 0 ||
    heritage.length > 0 ||
    events.length > 0 ||
    categories.length > 0 ||
    featureDocExists;

  const loadErrorMessages = useMemo(
    () =>
      [errPlaces, errHeritage, errEvents, errCategories, errFeature].filter(
        (m): m is string => Boolean(m)
      ),
    [errPlaces, errHeritage, errEvents, errCategories, errFeature]
  );

  const saveSlot = async (
    key: string,
    newUrl: string,
    action: () => Promise<void>
  ) => {
    if (!newUrl.trim()) {
      alert("Enter a working direct image URL.");
      return;
    }
    setSavingKey(key);
    try {
      await action();
      setReplaceUrlDrafts((prev) => {
        const x = { ...prev };
        delete x[key];
        return x;
      });
      setBrokenKeys((prev) => {
        const s = new Set(prev);
        s.delete(key);
        return s;
      });
      setGoodKeys((prev) => {
        const s = new Set(prev);
        s.delete(key);
        return s;
      });
    } catch (e) {
      console.error("saveSlot:", e);
      alert("Could not save. Check Firestore permissions and try again.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <ImageProbes
        probes={probes}
        goodKeys={goodKeys}
        brokenKeys={brokenKeys}
        onGood={onGood}
        onBroken={onBroken}
      />

      {loadErrorMessages.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 space-y-1" role="alert">
          {loadErrorMessages.map((msg, i) => (
            <p key={i}>
              <strong>Could not load:</strong> {msg}
            </p>
          ))}
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
                <CardTitle className="text-2xl">Fix broken images</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base">
                  Checks image URLs across <strong>places</strong> (gallery list), <strong>heritage narratives</strong>{" "}
                  (hero image), <strong>events</strong>, the <strong>home feature</strong> carousel (
                  <code className="text-xs">feature/highlight</code>), and <strong>category</strong> icons. Anything
                  missing, empty, or failing to load appears here with the rest of that item&apos;s images for context.
                  Paste a working URL and save.
                </CardDescription>
              </div>
            </div>
            <div className="w-full lg:w-72 shrink-0 space-y-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, title…"
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
        <CardContent className="pt-6 space-y-10">
          {!hasAnyFirestoreData && loadErrorMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading content…</p>
          ) : !anyIssue ? (
            <div className="rounded-xl border border-green-200 bg-green-50/60 px-6 py-10 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-green-700 mb-3" />
              <p className="font-semibold text-green-900">No broken or missing images</p>
              <p className="text-sm text-green-800/90 mt-1 max-w-lg mx-auto">
                All checked URLs in places, heritage stories, events, home feature images, and category icons loaded
                successfully (or your search / filters hide the rest).
              </p>
            </div>
          ) : null}

          {displayPlaces.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Places</h2>
              <div className="space-y-6">
                {displayPlaces.map((place) => {
                  const indices = place.urls.length === 0 ? [0] : place.urls.map((_, i) => i);
                  return (
                    <div
                      key={place.id}
                      className="rounded-xl border-2 border-amber-200 bg-card p-4 sm:p-5 shadow-sm space-y-4"
                    >
                      <h3 className="font-semibold text-base text-gray-900 border-b border-amber-100 pb-2">
                        {place.name || "Unnamed place"}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({place.urls.length === 0 ? "no images yet" : `${place.urls.length} image URL(s)`})
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {indices.map((index) => {
                          const k = mediaSlotKey.place(place.id, index);
                          const stored = place.urls[index] ?? "";
                          const st =
                            place.urls.length === 0
                              ? getSlotStatus("", k, goodKeys, brokenKeys)
                              : getSlotStatus(stored.trim(), k, goodKeys, brokenKeys);
                          const label =
                            index === 0 ? `Image ${index + 1} (primary)` : `Image ${index + 1}`;
                          return (
                            <SlotBlock
                              key={k}
                              slotKey={k}
                              label={label}
                              stored={stored}
                              status={st}
                              replaceUrlDrafts={replaceUrlDrafts}
                              setReplaceUrlDrafts={setReplaceUrlDrafts}
                              savingKey={savingKey}
                              onBroken={onBroken}
                              onSave={() => {
                                const draft = replaceUrlDrafts[k];
                                const v = (draft !== undefined ? draft : stored).trim();
                                void saveSlot(k, v, () =>
                                  savePlaceUrl(db, place.id, index, place.urls, v)
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {displayHeritage.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Heritage narratives</h2>
              <div className="space-y-6">
                {displayHeritage.map((h) => {
                  const k = mediaSlotKey.heritage(h.id);
                  const st = getSlotStatus(h.heroImageUrl.trim(), k, goodKeys, brokenKeys);
                  return (
                    <div
                      key={h.id}
                      className="rounded-xl border-2 border-amber-200 bg-card p-4 sm:p-5 shadow-sm space-y-4"
                    >
                      <h3 className="font-semibold text-base text-gray-900 border-b border-amber-100 pb-2">
                        {h.placeName}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">(place_stories / hero)</span>
                      </h3>
                      <SlotBlock
                        slotKey={k}
                        label="Hero image URL"
                        stored={h.heroImageUrl}
                        status={st}
                        replaceUrlDrafts={replaceUrlDrafts}
                        setReplaceUrlDrafts={setReplaceUrlDrafts}
                        savingKey={savingKey}
                        onBroken={onBroken}
                        onSave={() => {
                          const draft = replaceUrlDrafts[k];
                          const v = (draft !== undefined ? draft : h.heroImageUrl).trim();
                          void saveSlot(k, v, () => saveHeritageHero(db, h.id, v));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {displayEvents.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Events</h2>
              <div className="space-y-6">
                {displayEvents.map((ev) => {
                  const k = mediaSlotKey.event(ev.id);
                  const st = getSlotStatus(ev.imageUrl.trim(), k, goodKeys, brokenKeys);
                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl border-2 border-amber-200 bg-card p-4 sm:p-5 shadow-sm space-y-4"
                    >
                      <h3 className="font-semibold text-base text-gray-900 border-b border-amber-100 pb-2">
                        {ev.eventName}
                      </h3>
                      <SlotBlock
                        slotKey={k}
                        label="Event image URL"
                        stored={ev.imageUrl}
                        status={st}
                        replaceUrlDrafts={replaceUrlDrafts}
                        setReplaceUrlDrafts={setReplaceUrlDrafts}
                        savingKey={savingKey}
                        onBroken={onBroken}
                        onSave={() => {
                          const draft = replaceUrlDrafts[k];
                          const v = (draft !== undefined ? draft : ev.imageUrl).trim();
                          void saveSlot(k, v, () => saveEventImage(db, ev.id, v));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {displayFeature && feature && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Home feature carousel</h2>
              <div className="rounded-xl border-2 border-amber-200 bg-card p-4 sm:p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-base text-gray-900 border-b border-amber-100 pb-2">
                  {feature.title || "Home feature carousel"}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({feature.images.length === 0 ? "no images" : `${feature.images.length} slide(s)`})
                  </span>
                </h3>
                <div className="space-y-4">
                  {(feature.images.length === 0 ? [0] : feature.images.map((_, i) => i)).map((index) => {
                    const k = mediaSlotKey.feature(index);
                    const stored = feature.images[index] ?? "";
                    const meta = feature.slideMeta[index];
                    const slideLabel =
                      meta?.headline || meta?.placeName
                        ? `Slide ${index + 1}: ${[meta.headline, meta.placeName].filter(Boolean).join(" · ")}`
                        : `Slide ${index + 1}`;
                    const st =
                      feature.images.length === 0
                        ? getSlotStatus("", k, goodKeys, brokenKeys)
                        : getSlotStatus(stored.trim(), k, goodKeys, brokenKeys);
                    return (
                      <SlotBlock
                        key={k}
                        slotKey={k}
                        label={slideLabel}
                        stored={stored}
                        status={st}
                        replaceUrlDrafts={replaceUrlDrafts}
                        setReplaceUrlDrafts={setReplaceUrlDrafts}
                        savingKey={savingKey}
                        onBroken={onBroken}
                        onSave={() => {
                          const draft = replaceUrlDrafts[k];
                          const v = (draft !== undefined ? draft : stored).trim();
                          void saveSlot(k, v, () => saveFeatureImageAtIndex(db, index, v));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {displayCategories.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Categories</h2>
              <div className="space-y-6">
                {displayCategories.map((c) => {
                  const k = mediaSlotKey.category(c.id);
                  const st = getSlotStatus(c.icon.trim(), k, goodKeys, brokenKeys);
                  return (
                    <div
                      key={c.id}
                      className="rounded-xl border-2 border-amber-200 bg-card p-4 sm:p-5 shadow-sm space-y-4"
                    >
                      <h3 className="font-semibold text-base text-gray-900 border-b border-amber-100 pb-2">
                        {c.name || "Unnamed category"}
                      </h3>
                      <SlotBlock
                        slotKey={k}
                        label="Icon URL"
                        stored={c.icon}
                        status={st}
                        replaceUrlDrafts={replaceUrlDrafts}
                        setReplaceUrlDrafts={setReplaceUrlDrafts}
                        savingKey={savingKey}
                        onBroken={onBroken}
                        onSave={() => {
                          const draft = replaceUrlDrafts[k];
                          const v = (draft !== undefined ? draft : c.icon).trim();
                          void saveSlot(k, v, () => saveCategoryIcon(db, c.id, v));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
