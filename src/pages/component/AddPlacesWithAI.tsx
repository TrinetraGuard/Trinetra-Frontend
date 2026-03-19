import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  Bot,
  Check,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "../../firebase/firebase";

const ALL_CATEGORIES = [
  "Spiritual",
  "Aarti",
  "Discover Nashik",
  "Pilgrimage",
  "Ghats",
  "Cultural",
  "Nature",
  "Other",
];

const PLACE_TYPES = [
  { value: "hidden", label: "Hidden Gems" },
  { value: "local", label: "Local Favorites (known mainly to locals)" },
  { value: "ritual", label: "Ritual & Religious" },
  { value: "historical", label: "Historical" },
  { value: "nature", label: "Nature & Scenic" },
  { value: "cultural", label: "Cultural" },
  { value: "popular", label: "Popular" },
  { value: "other", label: "Other" },
];

const TRANSPORT_MODES = ["Bus", "Cabs", "Rental Cars"];
const FACILITIES_OPTIONS = [
  "Accommodation - Budget & mid-range hotels nearby",
  "Food & Dining - Food courts & local eateries",
  "Parking - Available at base area",
];

type TransportMode = {
  mode: string;
  minPrice: string;
  maxPrice: string;
};

type Facility = {
  name: string;
  minPrice: string;
  maxPrice: string;
  estimatedPrice: string;
};

export type GeneratedPlace = {
  name: string;
  categories: string[];
  placeType: string;
  latitude: number;
  longitude: number;
  urls: string[];
  description: string;
  visitTime: string;
  crowd: string;
  bestSeason: string;
  entryType: string[];
  entryFee: string;
  openingHours: string;
  transportModes: TransportMode[];
  facilities: Facility[];
};

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Nashik city/district bounds - only allow places within this region
const NASHIK_LAT_MIN = 19.85;
const NASHIK_LAT_MAX = 20.15;
const NASHIK_LNG_MIN = 73.65;
const NASHIK_LNG_MAX = 74.05;

function isPlaceInNashik(p: { latitude?: number; longitude?: number }): boolean {
  const lat = Number(p.latitude);
  const lng = Number(p.longitude);
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= NASHIK_LAT_MIN &&
    lat <= NASHIK_LAT_MAX &&
    lng >= NASHIK_LNG_MIN &&
    lng <= NASHIK_LNG_MAX
  );
}

function getGeminiApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY ?? "";
}

export default function AddPlacesWithAI() {
  const [existingPlaces, setExistingPlaces] = useState<{ name: string; categories: string[] }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlaceType, setSelectedPlaceType] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedPlaces, setGeneratedPlaces] = useState<GeneratedPlace[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [addResult, setAddResult] = useState<{ added: number; failed: string[] } | null>(null);

  const loadExistingPlaces = useCallback(async () => {
    const snap = await getDocs(collection(db, "places"));
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        name: (data.name ?? "").toString().trim().toLowerCase(),
        categories: Array.isArray(data.categories) ? (data.categories as string[]) : [],
      };
    });
    setExistingPlaces(list);
  }, []);

  useEffect(() => {
    loadExistingPlaces();
  }, [loadExistingPlaces]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const generateWithAI = async () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setGenerateError("Gemini API key not set. Add VITE_GEMINI_API_KEY to your .env file.");
      return;
    }
    if (selectedCategories.length === 0) {
      setGenerateError("Please select at least one category.");
      return;
    }
    if (!selectedPlaceType) {
      setGenerateError("Please select a place type.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedPlaces([]);
    setSelectedIds(new Set());

    const existingNames = existingPlaces.map((p) => p.name).filter(Boolean);
    const typeLabel = PLACE_TYPES.find((t) => t.value === selectedPlaceType)?.label ?? selectedPlaceType;

    const prompt = `You are a professional travel and pilgrimage content writer for Nashik, Maharashtra, India.

IMPORTANT: Generate places ONLY within Nashik city and Nashik district. Do NOT suggest places in other cities (e.g. no Mumbai, Pune, Shirdi, Trimbak unless it is a well-known Nashik-area site within Nashik district). All places must be in Nashik.

TASK: Generate exactly ${count} NEW places (tourist/pilgrimage spots) in Nashik that are NOT already in our database.
The user wants places in these categories: ${selectedCategories.join(", ")}.
Place type theme: ${typeLabel}.

EXISTING PLACES (do NOT suggest any of these again; names are lowercased for match):
${existingNames.length ? existingNames.join("\n") : "(none yet)"}

SCOPE OF PLACES:
- Include both well-known tourist spots AND spiritual/popular places that are known mainly to locals (small temples, local pilgrimage spots, neighborhood landmarks, lesser-known ghats, local viewpoints, kunds, and cultural sites). The app should cover every spiritual and popular place so that even places only locals know are represented with proper information.
${selectedPlaceType === "local" ? "- For this run, FOCUS on places known mainly to locals: lesser-known temples, local pilgrimage spots, neighborhood spiritual sites, and popular local spots that may not appear in standard tourist guides. Still use accurate names and real coordinates within Nashik." : ""}
- Prioritize "top" and important places for the chosen categories so the place section is comprehensive and useful.

INFORMATION MUST BE 100% COMPLETE:
- Every field below MUST be filled with accurate, non-empty, real values. No placeholders like "N/A", "TBD", or empty strings. Each place's information should be complete and proper so it can be shown as "Information 100%" in the app.
- description: 2-4 sentences, professional, specific to the place in Nashik (at least 30 characters).
- visitTime, crowd, bestSeason, openingHours: real plausible values.
- entryType and entryFee: accurate (e.g. "0" for free, or actual fee in INR).
- transportModes: include at least one mode with minPrice and maxPrice in INR (e.g. 20-50 for bus).
- facilities: include at least one facility with minPrice, maxPrice, and estimatedPrice where applicable.
- urls: 1-3 real Unsplash image URLs (e.g. https://images.unsplash.com/photo-...) that suit the place type.

RULES:
1. Suggest only real places in NASHIK (temples, ghats, forts, parks, viewpoints, lakes, kunds, local shrines, etc.). Use accurate names. Every place must be located in Nashik city or Nashik district only.
2. Do not duplicate or closely rename any place from the existing list above.
3. Coordinates MUST be within Nashik: latitude between 19.85 and 20.15, longitude between 73.65 and 74.05. Use real approximate coordinates for each place within this range.
4. Each place must have: name, categories (array from: ${ALL_CATEGORIES.join(", ")}), placeType ("${selectedPlaceType}"), latitude, longitude, urls (array of 1-3 image URLs), description, visitTime, crowd ("Low"/"Medium"/"High"), bestSeason, entryType (["Free"] or ["Paid"] or ["Free","Paid"]), entryFee (string), openingHours, transportModes (array of objects with mode, minPrice, maxPrice - use modes from: ${TRANSPORT_MODES.join(", ")}; provide numeric min/max in INR), facilities (array of objects with name, minPrice, maxPrice, estimatedPrice - use names from: ${JSON.stringify(FACILITIES_OPTIONS)}; provide numeric values where applicable).
5. Output ONLY a valid JSON array of objects, no markdown, no code fence. Each object must have exactly these keys: name, categories, placeType, latitude, longitude, urls, description, visitTime, crowd, bestSeason, entryType, entryFee, openingHours, transportModes, facilities.`;

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      let jsonStr = text.trim();
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr) as GeneratedPlace[];

      // Filter: must have name, be within Nashik bounds, and not duplicate existing
      const existingSet = new Set(existingPlaces.map((p) => p.name));
      const unique = parsed.filter(
        (p) =>
          p.name &&
          !existingSet.has(p.name.trim().toLowerCase()) &&
          isPlaceInNashik(p)
      );
      // Sort by name
      unique.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

      setGeneratedPlaces(unique);
      setSelectedIds(new Set(unique.map((_, i) => i)));
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Failed to generate places.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelected = (index: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addSelectedToFirestore = async () => {
    const toAdd = generatedPlaces.filter((_, i) => selectedIds.has(i));
    if (toAdd.length === 0) {
      setAddResult({ added: 0, failed: ["No places selected."] });
      return;
    }

    setIsAdding(true);
    setAddResult(null);
    const failed: string[] = [];
    let added = 0;

    for (const place of toAdd) {
      if (!isPlaceInNashik(place)) {
        failed.push(`${place.name} (outside Nashik bounds)`);
        continue;
      }
      try {
        await addDoc(collection(db, "places"), {
          name: place.name,
          categories: place.categories ?? [],
          placeType: place.placeType ?? selectedPlaceType,
          latitude: Number(place.latitude),
          longitude: Number(place.longitude),
          urls: Array.isArray(place.urls) ? place.urls : [],
          description: place.description ?? "",
          visitTime: place.visitTime ?? "",
          crowd: place.crowd ?? "Low",
          bestSeason: place.bestSeason ?? "",
          entryType: Array.isArray(place.entryType) ? place.entryType : ["Free"],
          entryFee: place.entryFee ?? "",
          openingHours: place.openingHours ?? "",
          transportModes: Array.isArray(place.transportModes) ? place.transportModes : [],
          facilities: Array.isArray(place.facilities) ? place.facilities : [],
          createdAt: new Date(),
        });
        added++;
      } catch {
        failed.push(place.name);
      }
    }

    setAddResult({ added, failed });
    if (added > 0) {
      await loadExistingPlaces();
      setGeneratedPlaces((prev) => prev.filter((_, i) => !selectedIds.has(i)));
      setSelectedIds(new Set());
    }
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2 border-orange-100">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50/50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Add Places Using AI</CardTitle>
              <CardDescription>
                Generate places in Nashik only—including local favorites and spiritual spots known mainly to locals. Select categories and place type; AI will suggest new places with 100% complete information (no duplicates). Review and add to the database.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories to add places for</Label>
            <p className="text-xs text-muted-foreground">Select one or more categories.</p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={selectedCategories.includes(cat) ? "default" : "outline"}
                  className={selectedCategories.includes(cat) ? "bg-orange-600 hover:bg-orange-700" : ""}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Place type */}
          <div className="space-y-2">
            <Label>Type of places</Label>
            <p className="text-xs text-muted-foreground">Hidden, ritual, historical, etc.</p>
            <Select value={selectedPlaceType} onValueChange={setSelectedPlaceType}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PLACE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Count */}
          <div className="space-y-2">
            <Label>Number of places to generate</Label>
            <Select
              value={count.toString()}
              onValueChange={(v) => setCount(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 5, 8, 10, 15].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {generateError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
              {generateError}
            </div>
          )}

          <Button
            onClick={generateWithAI}
            disabled={isGenerating || selectedCategories.length === 0 || !selectedPlaceType}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Generate places with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated list */}
      {generatedPlaces.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Generated places ({generatedPlaces.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds(new Set(generatedPlaces.map((_, i) => i)))}
                >
                  Select all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear selection
                </Button>
                <Button
                  onClick={addSelectedToFirestore}
                  disabled={isAdding || selectedIds.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Add selected ({selectedIds.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardDescription>
              Sorted by name. Uncheck any place you do not want to add. Then click &quot;Add selected&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 w-12">Add</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Categories</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedPlaces.map((place, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-muted/30"
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.has(index)}
                          onCheckedChange={() => toggleSelected(index)}
                        />
                      </td>
                      <td className="p-3 font-medium">{place.name}</td>
                      <td className="p-3">
                        {(place.categories ?? []).join(", ") || "—"}
                      </td>
                      <td className="p-3 capitalize">{place.placeType ?? "—"}</td>
                      <td className="p-3 max-w-xs truncate" title={place.description}>
                        {place.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {addResult && (
        <Card className="shadow border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <p className="font-medium text-green-800">
              Added {addResult.added} place(s) successfully.
            </p>
            {addResult.failed.length > 0 && (
              <p className="text-sm text-amber-800 mt-1">
                Failed: {addResult.failed.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
