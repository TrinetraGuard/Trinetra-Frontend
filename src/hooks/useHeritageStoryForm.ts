import { db } from "@/firebase/firebase";
import {
  emptyForm,
  GEMINI_URL,
  getGeminiApiKey,
  normalizeMultiline,
  parseFactsText,
  splitStoryParagraphs,
  type PlaceOpt,
  type StoryForm,
  type StoryListRow,
} from "@/lib/heritageNarrativesUtils";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useHeritageStoryForm(
  selectedPlaceId: string,
  places: PlaceOpt[],
  storyRows: StoryListRow[]
) {
  const [form, setForm] = useState<StoryForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);
  const activeStoryRow = storyRows.find((r) => r.id === selectedPlaceId);
  const editorPlaceName = selectedPlace?.name ?? activeStoryRow?.placeName ?? "Place";

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
          introText: "",
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
      const sp = places.find((x) => x.id === selectedPlaceId);
      setForm({
        subtitle: (d.subtitle ?? "").toString(),
        introText: (d.introText ?? "").toString(),
        storyBody: (d.storyBody ?? "").toString(),
        factsText: facts,
        heroImageUrl: (d.heroImageUrl ?? "").toString() || (sp?.urls?.[0] ?? ""),
        sortOrder: String(d.sortOrder ?? 0),
        published: d.published === true,
      });
    });
    return () => unsub();
  }, [selectedPlaceId, places, selectedPlace]);

  const parseFacts = useCallback((text: string): string[] => parseFactsText(text), []);

  const handleSave = useCallback(async () => {
    if (!selectedPlaceId) {
      setSaveMsg("Select a place first.");
      return;
    }
    const placeNameForDoc =
      selectedPlace?.name ??
      storyRows.find((r) => r.id === selectedPlaceId)?.placeName ??
      "Untitled place";
    setSaving(true);
    setSaveMsg(null);
    try {
      const sortNum = parseInt(form.sortOrder, 10);
      await setDoc(
        doc(db, "place_stories", selectedPlaceId),
        {
          placeId: selectedPlaceId,
          placeName: placeNameForDoc,
          subtitle: form.subtitle.trim(),
          introText: normalizeMultiline(form.introText),
          storyBody: normalizeMultiline(form.storyBody),
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
  }, [selectedPlaceId, selectedPlace, storyRows, form, parseFacts]);

  const previewParagraphs = useMemo(
    () => splitStoryParagraphs(form.storyBody),
    [form.storyBody]
  );
  const previewFacts = useMemo(() => parseFacts(form.factsText), [form.factsText, parseFacts]);

  const generateWithAI = useCallback(async () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setAiError("Add VITE_GEMINI_API_KEY to your .env file.");
      return;
    }
    const aiPlace =
      selectedPlace ??
      (activeStoryRow
        ? {
            id: selectedPlaceId,
            name: activeStoryRow.placeName,
            description: "",
            urls: [] as string[],
          }
        : null);
    if (!aiPlace?.name) {
      setAiError("Select a place or open a saved narrative first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    const cats = "";
    const prompt = `You are an expert on Nashik, Maharashtra pilgrimage and heritage sites.

Write content for the mobile app "Trinetra" about this place:
Name: ${aiPlace.name}
Description from database: ${selectedPlace?.description || "(none)"}
${cats}

TASK: Return ONLY valid JSON (no markdown fence) with this shape:
{
  "subtitle": "One short engaging line (max 120 chars)",
  "intro": "2–4 sentences: overall context for pilgrims (optional but recommended). Single paragraph, no line breaks inside.",
  "story": "Main narrative: multiple paragraphs for pilgrims and tourists. Separate paragraphs with double newline \\n\\n. Respectful tone; mythology, history, local significance. No markdown headings.",
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
        intro?: string;
        story?: string;
        facts?: string[];
      };
      setForm((f) => ({
        ...f,
        subtitle: (parsed.subtitle ?? f.subtitle).toString().slice(0, 200),
        introText: (parsed.intro ?? f.introText).toString(),
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
  }, [selectedPlace, activeStoryRow, selectedPlaceId]);

  return {
    form,
    setForm,
    saving,
    saveMsg,
    aiLoading,
    aiError,
    handleSave,
    generateWithAI,
    previewParagraphs,
    previewFacts,
    editorPlaceName,
    selectedPlace,
    activeStoryRow,
  };
}
