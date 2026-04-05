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
  normalizeMultiline,
  type PlaceOpt,
  type StoryForm,
  type StoryListRow,
} from "@/lib/heritageNarrativesUtils";
import { Loader2, Save, Sparkles } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type HeritageNarrativeEditorCardProps = {
  selectedPlaceId: string;
  editorPlaceName: string;
  selectedPlace: PlaceOpt | undefined;
  activeStoryRow: StoryListRow | undefined;
  form: StoryForm;
  setForm: Dispatch<SetStateAction<StoryForm>>;
  saving: boolean;
  saveMsg: string | null;
  aiLoading: boolean;
  aiError: string | null;
  onSave: () => void;
  onGenerateAI: () => void;
  previewParagraphs: string[];
  previewFacts: string[];
};

export function HeritageNarrativeEditorCard({
  selectedPlaceId,
  editorPlaceName,
  selectedPlace,
  activeStoryRow,
  form,
  setForm,
  saving,
  saveMsg,
  aiLoading,
  aiError,
  onSave,
  onGenerateAI,
  previewParagraphs,
  previewFacts,
}: HeritageNarrativeEditorCardProps) {
  return (
    <Card id="heritage-narrative-editor" className="shadow-md scroll-mt-4 border-indigo-100">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <CardTitle className="text-lg">{editorPlaceName}</CardTitle>
          {!selectedPlace && activeStoryRow && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mt-2">
              This story&apos;s place is not in your <strong>places</strong> list anymore. You can still edit and
              save; the app links by place ID <code className="text-xs">{selectedPlaceId}</code>.
            </p>
          )}
          <CardDescription className="space-y-1">
            <p>
              <strong>Paragraphs:</strong> leave one <em>blank line</em> between paragraphs in the main story (or use
              single line breaks — each line becomes its own block if you don’t use blank lines).
            </p>
            <p>
              Saved text is normalized (line endings, extra blank lines) so the mobile app shows the same structure as
              the preview.
            </p>
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 bg-violet-600 text-white hover:bg-violet-700"
          disabled={aiLoading || !(selectedPlace?.name?.trim() || activeStoryRow?.placeName?.trim())}
          onClick={onGenerateAI}
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
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{aiError}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle / tagline</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="Short line under the place name in the app (e.g. Where Hanuman rested — local lore)"
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
          <Label htmlFor="intro">Overview (optional)</Label>
          <Textarea
            id="intro"
            className="min-h-[88px] font-sans text-sm leading-relaxed"
            value={form.introText}
            onChange={(e) => setForm((f) => ({ ...f, introText: e.target.value }))}
            placeholder="Opening context shown under “OVERVIEW” in the app (italic), before the main story."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="story">Main story — paragraphs</Label>
          <Textarea
            id="story"
            className="min-h-[240px] font-sans text-sm leading-relaxed"
            value={form.storyBody}
            onChange={(e) => setForm((f) => ({ ...f, storyBody: e.target.value }))}
            placeholder={
              "Paragraph 1…\n\nParagraph 2…\n\nParagraph 3…\n\n(Blank line between paragraphs = separate blocks in the app.)"
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facts">Facts — one per line</Label>
          <Textarea
            id="facts"
            className="min-h-[120px]"
            value={form.factsText}
            onChange={(e) => setForm((f) => ({ ...f, factsText: e.target.value }))}
            placeholder="Each non-empty line = one bullet under “Did you know?” in the app."
          />
        </div>

        <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
          <CardHeader className="py-3 pb-0">
            <CardTitle className="text-base text-amber-900">App preview (matches mobile layout)</CardTitle>
            <CardDescription>
              Paragraph count: {previewParagraphs.length} · Facts: {previewFacts.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 pb-4 text-gray-800">
            <div>
              <p className="text-xs font-semibold tracking-wider text-orange-600 mb-1">PLACE NAME</p>
              <p className="font-semibold text-gray-900">{editorPlaceName}</p>
              {form.subtitle.trim() && <p className="text-sm text-gray-600 mt-1">{form.subtitle.trim()}</p>}
            </div>
            {form.introText.trim() && (
              <div>
                <p className="text-xs font-semibold tracking-wider text-orange-600 mb-1">OVERVIEW</p>
                <p className="text-sm italic text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {normalizeMultiline(form.introText)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold tracking-wider text-orange-600 mb-2">THE STORY</p>
              <div className="space-y-4 text-sm leading-relaxed">
                {previewParagraphs.length === 0 ? (
                  <p className="text-gray-400 italic">Add main story text to see paragraphs here.</p>
                ) : (
                  previewParagraphs.map((p, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {p}
                    </p>
                  ))
                )}
              </div>
            </div>
            {previewFacts.length > 0 && (
              <div className="rounded-lg border border-orange-100 bg-white p-3">
                <p className="text-xs font-semibold text-orange-800 mb-2">Did you know?</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {previewFacts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 h-4 w-4 text-indigo-600"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <span className="text-sm font-medium text-gray-800">Published (visible in app)</span>
          </label>
          <Button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="sm:ml-auto bg-orange-600 hover:bg-orange-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save story
          </Button>
        </div>
        {saveMsg && (
          <p className={`text-sm ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>{saveMsg}</p>
        )}
      </CardContent>
    </Card>
  );
}
