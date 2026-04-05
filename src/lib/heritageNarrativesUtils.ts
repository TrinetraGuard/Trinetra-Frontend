import type { QueryDocumentSnapshot } from "firebase/firestore";

export const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export function getGeminiApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY ?? "";
}

export type PlaceOpt = { id: string; name: string; description: string; urls: string[] };

export type StoryForm = {
  subtitle: string;
  introText: string;
  storyBody: string;
  factsText: string;
  heroImageUrl: string;
  sortOrder: string;
  published: boolean;
};

export type StoryListRow = {
  id: string;
  placeId: string;
  placeName: string;
  published: boolean;
  sortOrder: number;
  storyPreview: string;
  paragraphCount: number;
  factsCount: number;
  hasBody: boolean;
  updatedAtLabel: string;
};

export const emptyForm = (): StoryForm => ({
  subtitle: "",
  introText: "",
  storyBody: "",
  factsText: "",
  heroImageUrl: "",
  sortOrder: "0",
  published: false,
});

export function normalizeMultiline(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitStoryParagraphs(text: string): string[] {
  const t = normalizeMultiline(text);
  if (!t) return [];
  let parts = t.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1 && t.includes("\n")) {
    parts = t.split("\n").map((p) => p.trim()).filter(Boolean);
  }
  return parts;
}

export function parseFactsText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);
}

export function docToStoryListRow(d: QueryDocumentSnapshot): StoryListRow {
  const x = d.data();
  const body = String(x.storyBody ?? "").trim();
  const factsArr = Array.isArray(x.facts) ? (x.facts as unknown[]) : [];
  const rawSort = x.sortOrder;
  const sortOrder =
    typeof rawSort === "number" && Number.isFinite(rawSort)
      ? rawSort
      : parseInt(String(rawSort ?? "0"), 10) || 0;
  let updatedAtLabel = "—";
  const u = x.updatedAt;
  if (
    u != null &&
    typeof u === "object" &&
    "toDate" in u &&
    typeof (u as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      updatedAtLabel = (u as { toDate: () => Date }).toDate().toLocaleString();
    } catch {
      updatedAtLabel = "—";
    }
  }
  const preview = body.length > 0 ? (body.length > 120 ? `${body.slice(0, 117)}…` : body) : "—";
  return {
    id: d.id,
    placeId: String(x.placeId ?? d.id),
    placeName: String(x.placeName ?? "Untitled place"),
    published: x.published === true,
    sortOrder,
    storyPreview: preview,
    paragraphCount: splitStoryParagraphs(String(x.storyBody ?? "")).length,
    factsCount: factsArr.length,
    hasBody: body.length > 0,
    updatedAtLabel,
  };
}

export function sortStoryRows(rows: StoryListRow[]): StoryListRow[] {
  return [...rows].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.placeName.localeCompare(b.placeName, undefined, { sensitivity: "base" });
  });
}
