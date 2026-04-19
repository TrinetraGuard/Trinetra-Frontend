import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase/firebase";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type PlaceRow = { id: string; name: string; urls: string[] };

type FeatureSlideDraft = {
  clientId: string;
  placeId: string;
  imageUrl: string;
  /** Shown as the main title on this slide in the app (required). */
  headline: string;
  /** Secondary line under the headline; optional (app falls back to a default). */
  tagline: string;
};

function newSlideId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isValidHttpUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function emptySlide(): FeatureSlideDraft {
  return { clientId: newSlideId(), placeId: "", imageUrl: "", headline: "", tagline: "" };
}

/** Build editable slides from Firestore (supports `slides` or legacy `images` + optional `placeId`). */
function slidesFromDoc(data: Record<string, unknown>, places: PlaceRow[]): FeatureSlideDraft[] {
  const fallbackTitle = String(data.title ?? "");
  const fallbackSubtitle = String(data.subtitle ?? "");
  const slidesRaw = data.slides;
  if (Array.isArray(slidesRaw) && slidesRaw.length > 0) {
    const out: FeatureSlideDraft[] = [];
    for (const item of slidesRaw) {
      if (item == null || typeof item !== "object") continue;
      const x = item as Record<string, unknown>;
      const imageUrl = String(x.imageUrl ?? x.url ?? "").trim();
      if (!imageUrl) continue;
      let placeId = String(x.placeId ?? "").trim();
      let placeName = String(x.placeName ?? "").trim();
      if (placeId && !placeName) {
        placeName = places.find((p) => p.id === placeId)?.name ?? "";
      }
      const headline = String(x.headline ?? "").trim() || fallbackTitle;
      const tagline = String(x.tagline ?? "").trim() || fallbackSubtitle;
      out.push({
        clientId: newSlideId(),
        placeId,
        imageUrl,
        headline,
        tagline,
      });
    }
    if (out.length > 0) return out;
  }

  const imgs = Array.isArray(data.images) ? data.images.map((u) => String(u)).filter(Boolean) : [];
  const rootPlaceId = String(data.placeId ?? "").trim();
  if (imgs.length === 0) {
    return [emptySlide()];
  }
  return imgs.map((url, i) => ({
    clientId: newSlideId(),
    placeId: i === 0 ? rootPlaceId : "",
    imageUrl: url,
    headline: fallbackTitle,
    tagline: fallbackSubtitle,
  }));
}

const FeatureSectionAdmin = () => {
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [loadingFeature, setLoadingFeature] = useState(true);
  const [slides, setSlides] = useState<FeatureSlideDraft[]>([emptySlide()]);
  const [placeSearch, setPlaceSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [previewImageError, setPreviewImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingPlaces(true);
      setLoadingFeature(true);
      try {
        const [placesSnap, featSnap] = await Promise.all([
          getDocs(collection(db, "places")),
          getDoc(doc(db, "feature", "highlight")),
        ]);
        if (cancelled) return;

        const list: PlaceRow[] = placesSnap.docs.map((d) => {
          const x = d.data() as Record<string, unknown>;
          const urls = Array.isArray(x.urls) ? x.urls.map((u) => String(u)) : [];
          return { id: d.id, name: String(x.name ?? "Unnamed"), urls };
        });
        list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        setPlaces(list);

        if (!featSnap.exists()) {
          setSlides([emptySlide()]);
        } else {
          const data = featSnap.data() as Record<string, unknown>;
          const loaded = slidesFromDoc(data, list);
          setSlides(loaded.length > 0 ? loaded : [emptySlide()]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) {
          setLoadingPlaces(false);
          setLoadingFeature(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlaces = useMemo(() => {
    const q = placeSearch.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => p.name.toLowerCase().includes(q));
  }, [places, placeSearch]);

  const updateSlide = (clientId: string, patch: Partial<FeatureSlideDraft>) => {
    setSlides((prev) => prev.map((s) => (s.clientId === clientId ? { ...s, ...patch } : s)));
  };

  const addSlide = () => {
    setSlides((prev) => [...prev, emptySlide()]);
  };

  const removeSlide = (clientId: string) => {
    setSlides((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.clientId !== clientId)));
  };

  const moveSlide = (index: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const placeById = useCallback((id: string) => places.find((p) => p.id === id) ?? null, [places]);

  const applyFirstPhoto = (clientId: string, placeId: string) => {
    const p = placeById(placeId);
    if (p?.urls?.[0]) {
      updateSlide(clientId, { imageUrl: p.urls[0] });
    }
  };

  const previewSlide = slides[Math.min(previewSlideIndex, Math.max(0, slides.length - 1))];

  useEffect(() => {
    setPreviewImageError(false);
  }, [previewSlide?.imageUrl]);

  const handleSave = async () => {
    setSaveError(null);
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      if (!s.headline.trim()) {
        setSaveError(`Slide ${i + 1}: enter a headline for this slide.`);
        return;
      }
      if (!s.placeId.trim()) {
        setSaveError(`Slide ${i + 1}: select a place.`);
        return;
      }
      if (!isValidHttpUrl(s.imageUrl)) {
        setSaveError(`Slide ${i + 1}: enter a valid https image URL.`);
        return;
      }
    }

    const slidesToSave = slides.map((s) => {
      const p = placeById(s.placeId.trim());
      return {
        placeId: s.placeId.trim(),
        placeName: p?.name ?? "Place",
        imageUrl: s.imageUrl.trim(),
        headline: s.headline.trim(),
        tagline: s.tagline.trim(),
      };
    });

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await setDoc(
        doc(db, "feature", "highlight"),
        {
          // Root fields mirror slide 1 for any legacy readers.
          title: slidesToSave[0]?.headline ?? "",
          subtitle: slidesToSave[0]?.tagline?.trim() || "Discover",
          slides: slidesToSave,
          images: slidesToSave.map((s) => s.imageUrl),
          placeId: deleteField(),
          placeName: deleteField(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const initialLoading = loadingPlaces || loadingFeature;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-600 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        Loading feature settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 text-gray-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <span className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md">
            <ImageIcon className="h-6 w-6" />
          </span>
          Home feature carousel
        </h1>
        <p className="text-gray-500 mt-2 max-w-3xl">
          Add <strong>one or more slides</strong>: each slide has its own <strong>headline</strong> and <strong>tagline</strong>, a{" "}
          <strong>place</strong>, and a <strong>hero image URL</strong>. The app rotates through slides; <strong>Discover</strong> opens
          the place for the <strong>slide currently shown</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="secondary" className="bg-orange-50 text-orange-900 border-orange-200">
          <code className="text-xs">feature/highlight</code> · {slides.length} slide{slides.length === 1 ? "" : "s"}
        </Badge>
        {saveSuccess && (
          <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved — app updates live
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Slides (place + image)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Shared search filters all place dropdowns below.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              placeholder="Filter places by name…"
              className="pl-9 h-10 border-orange-100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.clientId} className="border-orange-100 shadow-sm overflow-visible">
            <CardHeader className="py-3 px-4 border-b bg-white flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold text-gray-800">Slide {index + 1}</CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => moveSlide(index, -1)}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === slides.length - 1}
                  onClick={() => moveSlide(index, 1)}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={slides.length <= 1}
                  onClick={() => removeSlide(slide.clientId)}
                  title="Remove slide"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 overflow-visible">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`slide-h-${slide.clientId}`}>
                    Headline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`slide-h-${slide.clientId}`}
                    value={slide.headline}
                    onChange={(e) => updateSlide(slide.clientId, { headline: e.target.value })}
                    placeholder="Title for this slide only"
                    className="h-11 border-orange-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slide-t-${slide.clientId}`}>Tagline (optional)</Label>
                  <Input
                    id={`slide-t-${slide.clientId}`}
                    value={slide.tagline}
                    onChange={(e) => updateSlide(slide.clientId, { tagline: e.target.value })}
                    placeholder="Short line under the headline"
                    className="h-11 border-orange-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Place</Label>
                <Select
                  value={slide.placeId || undefined}
                  onValueChange={(v) => updateSlide(slide.clientId, { placeId: v })}
                >
                  <SelectTrigger className="h-11 border-orange-200 bg-white">
                    <SelectValue placeholder="Choose place for this slide…" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={8}
                    className="max-h-72 w-[var(--radix-select-trigger-width)] border-orange-100"
                  >
                    {filteredPlaces.length === 0 ? (
                      <div className="py-6 px-3 text-sm text-gray-500 text-center">No places match filter.</div>
                    ) : (
                      filteredPlaces.map((p) => (
                        <SelectItem key={`${slide.clientId}-${p.id}`} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {slide.placeId && (
                  <p className="text-xs text-gray-500">
                    ID: <code className="bg-gray-100 px-1 rounded">{slide.placeId}</code>
                    {placeById(slide.placeId)?.urls?.[0] ? (
                      <>
                        {" "}
                        ·{" "}
                        <button
                          type="button"
                          className="text-orange-700 font-medium underline-offset-2 hover:underline"
                          onClick={() => applyFirstPhoto(slide.clientId, slide.placeId)}
                        >
                          Use first place photo as URL
                        </button>
                      </>
                    ) : null}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Hero image URL</Label>
                <Textarea
                  value={slide.imageUrl}
                  onChange={(e) => updateSlide(slide.clientId, { imageUrl: e.target.value })}
                  placeholder="https://… (direct image link)"
                  className="min-h-[72px] font-mono text-sm border-orange-100"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto border-orange-300 border-dashed text-orange-900"
        onClick={addSlide}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add another slide
      </Button>

      <Card className="border-dashed border-orange-200 bg-orange-50/30">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base text-gray-800">Preview</CardTitle>
            <CardDescription>Pick which slide to preview (same order as in the app).</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            {slides.map((_, i) => (
              <Button
                key={i}
                type="button"
                size="sm"
                variant={previewSlideIndex === i ? "default" : "outline"}
                className={previewSlideIndex === i ? "bg-orange-600 hover:bg-orange-700" : ""}
                onClick={() => {
                  setPreviewSlideIndex(i);
                  setPreviewImageError(false);
                }}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-2xl overflow-hidden border border-orange-100 shadow-inner bg-gray-900 aspect-[16/10] max-h-72">
            {previewSlide?.imageUrl?.trim() && !previewImageError ? (
              <img
                src={previewSlide.imageUrl.trim()}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setPreviewImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
                {previewImageError ? "Image failed to load" : "Add image URL for this slide"}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">Featured</p>
              <p className="text-xl font-bold leading-tight mt-1">{previewSlide?.headline?.trim() || "Headline"}</p>
              <p className="text-sm opacity-90 mt-1">{previewSlide?.tagline?.trim() || "Discover"}</p>
              {previewSlide?.placeId && (
                <p className="text-xs opacity-80 mt-2">
                  Discover → {placeById(previewSlide.placeId)?.name ?? previewSlide.placeId}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {saveError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex gap-2"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 min-w-[180px] bg-orange-600 hover:bg-orange-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Publish to app
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FeatureSectionAdmin;
