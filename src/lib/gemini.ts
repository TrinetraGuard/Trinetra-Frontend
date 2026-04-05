/** Shared Gemini generateContent endpoint (same model as Add Places with AI). */
export const GEMINI_GENERATE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export function getGeminiApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY ?? "";
}
