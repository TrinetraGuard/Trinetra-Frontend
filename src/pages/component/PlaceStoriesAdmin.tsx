import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { BookOpen, Loader2, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getGeminiApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY ?? "";
}

type PlaceOpt = { id: string; name: string; description: string; urls: string[] };

type StoryForm = {
  subtitle: string;
  storyBody: string;
  factsText: string;
  heroImageUrl: string;
  sortOrder: string;
  published: boolean;
};

const emptyForm = (): StoryForm => ({
  subtitle: "",
  storyBody: "",
  factsText: "",
  heroImageUrl: "",
  sortOrder: "0",
  published: false,
});

export default function PlaceStoriesAdmin() {
  const [places, setPlaces] = useState<PlaceOpt[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
  const [form, setForm] = useState<StoryForm>(emptyForm());
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);

  const loadPlaces = useCallback(async () => {
    setLoadingPlaces(true);
    try {
      const q = query(collection(db, "places"), orderBy("name"));
      const snap = await getDocs(q);
      const list: PlaceOpt[] = snap.docs.map((d) => {
        const data = d.data();
        const urls = Array.isArray(data.urls) ? (data.urls as string[]) : [];
        return {
          id: d.id,
          name: (data.name ?? "Unnamed").toString(),
          description: (data.description ?? "").toString(),
          urls,
        };
      });
      setPlaces(list);
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    if (!selectedPlaceId) {
      setForm(emptyForm());
      return;
    }
    const ref = doc(db, "place_stories", selectedPlaceId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        const p = places.find((x) => x.id === selectedPlaceId);
        setForm({
          subtitle: "",
          storyBody: "",
          factsText: "",
          heroImageUrl: p?.urls?.[0] ?? "",
          sortOrder: "0",
          published: false,
        });
        return;
      }
      const d = snap.data();
      const facts = Array.isArray(d.facts) ? (d.facts as string[]).join("\n") : "";
      setForm({
        subtitle: (d.subtitle ?? "").toString(),
        storyBody: (d.storyBody ?? "").toString(),
        factsText: facts,
        heroImageUrl: (d.heroImageUrl ?? "").toString() || (selectedPlace?.urls?.[0] ?? ""),
        sortOrder: String(d.sortOrder ?? 0),
        published: d.published === true,
      });
    });
    return () => unsub();
  }, [selectedPlaceId, places, selectedPlace]);

  const parseFacts = (text: string): string[] =>
    text
      .split(/\r?\n/)
      .map((l) => l.replace(/^[\s•\-\*]+/, "").trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!selectedPlaceId || !selectedPlace) {
      setSaveMsg("Select a place first.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const sortNum = parseInt(form.sortOrder, 10);
      await setDoc(
        doc(db, "place_stories", selectedPlaceId),
        {
          placeId: selectedPlaceId,
          placeName: selectedPlace.name,
          subtitle: form.subtitle.trim(),
          storyBody: form.storyBody.trim(),
          facts: parseFacts(form.factsText),
          heroImageUrl: form.heroImageUrl.trim(),
          sortOrder: Number.isFinite(sortNum) ? sortNum : 0,
          published: form.published,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaveMsg("Saved successfully.");
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const generateWithAI = async () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setAiError("Add VITE_GEMINI_API_KEY to your .env file.");
      return;
    }
    if (!selectedPlace) {
      setAiError("Select a place first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    const cats = ""; // optional: could pass categories if loaded on place
    const prompt = `You are an expert on Nashik, Maharashtra pilgrimage and heritage sites.

Write content for the mobile app "Trinetra" about this place:
Name: ${selectedPlace.name}
Description from database: ${selectedPlace.description || "(none)"}
${cats}

TASK: Return ONLY valid JSON (no markdown fence) with this shape:
{
  "subtitle": "One short engaging line (max 120 chars)",
  "story": "Multiple well-written paragraphs for pilgrims and tourists. Separate paragraphs with double newline \\\\n\\\\n. Respectful tone; include mythology, history, or local significance where appropriate. No markdown headings.",
  "facts": ["short fact 1", "short fact 2", "3", "4", "5"]
}

Use 4–7 facts. Story should be at least 3 paragraphs when possible.`;

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
            temperature: 0.75,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
      }
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      text = text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      const parsed = JSON.parse(text) as {
        subtitle?: string;
        story?: string;
        facts?: string[];
      };
      setForm((f) => ({
        ...f,
        subtitle: (parsed.subtitle ?? f.subtitle).toString().slice(0, 200),
        storyBody: (parsed.story ?? f.storyBody).toString(),
        factsText: Array.isArray(parsed.facts)
          ? parsed.facts.join("\n")
          : f.factsText,
      }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 text-white">
              <BookOpen className="h-6 w-6" />
            </span>
            Heritage Narratives
          </h1>
          <p className="text-gray-500 mt-1 max-w-2xl">
            Curate sacred stories and facts for each place. Content appears in the app under{" "}
            <strong>Heritage Narratives</strong> when <strong>Published</strong> is on.
          </p>
        </div>
      </div>

      <Card className="border-indigo-100 shadow-md">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50/80 to-orange-50/50">
          <CardTitle className="text-lg">Select place</CardTitle>
          <CardDescription>
            Choose a place, then write or generate a story. One document per place (ID matches place).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {loadingPlaces ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading places…
            </div>
          ) : (
            <div className="space-y-2 max-w-xl">
              <Label>Place</Label>
              <Select
                value={selectedPlaceId || undefined}
                onValueChange={(v) => setSelectedPlaceId(v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Choose a place…" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {places.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlaceId && (
        <Card className="shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{selectedPlace?.name}</CardTitle>
              <CardDescription>
                Story body: use blank lines between paragraphs (shown as separate paragraphs in the app).
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 bg-violet-600 text-white hover:bg-violet-700"
              disabled={aiLoading || !selectedPlace}
              onClick={generateWithAI}
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate with AI
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {aiError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {aiError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle / tagline</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="e.g. Where Hanuman rested — local lore"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Display order (lower = first)</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero">Hero image URL</Label>
              <Input
                id="hero"
                value={form.heroImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, heroImageUrl: e.target.value }))}
                placeholder="Defaults to first place image if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">Story (paragraphs)</Label>
              <Textarea
                id="story"
                className="min-h-[220px] font-sans text-sm leading-relaxed"
                value={form.storyBody}
                onChange={(e) => setForm((f) => ({ ...f, storyBody: e.target.value }))}
                placeholder="Write or paste your narrative. Separate paragraphs with a blank line."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facts">Facts (one per line)</Label>
              <Textarea
                id="facts"
                className="min-h-[120px]"
                value={form.factsText}
                onChange={(e) => setForm((f) => ({ ...f, factsText: e.target.value }))}
                placeholder="Each line becomes a bullet in the app."
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 h-4 w-4 text-indigo-600"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, published: e.target.checked }))
                  }
                />
                <span className="text-sm font-medium text-gray-800">Published (visible in app)</span>
              </label>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="sm:ml-auto bg-orange-600 hover:bg-orange-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save story
              </Button>
            </div>
            {saveMsg && (
              <p
                className={`text-sm ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}
              >
                {saveMsg}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="py-4 text-sm text-gray-600">
          <strong>Firestore:</strong> collection <code className="bg-white px-1 rounded">place_stories</code>,
          document ID = place ID. Ensure security rules allow authenticated admins to write and app users to read
          published documents.
        </CardContent>
      </Card>
    </div>
  );
}
