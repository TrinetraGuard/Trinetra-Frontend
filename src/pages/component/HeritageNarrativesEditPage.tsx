import { HeritageNarrativeEditorCard } from "@/components/heritage/HeritageNarrativeEditorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHeritageStoryForm } from "@/hooks/useHeritageStoryForm";
import { usePlaceStoriesRows } from "@/hooks/usePlaceStoriesRows";
import { usePlacesDirectory } from "@/hooks/usePlacesDirectory";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function HeritageNarrativesEditPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const resolvedId = placeId?.trim() ?? "";

  const { places, loading: loadingPlaces } = usePlacesDirectory();
  const { storyRows, loading: loadingStories, error: storiesError } = usePlaceStoriesRows();

  const {
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
  } = useHeritageStoryForm(resolvedId, places, storyRows);

  useEffect(() => {
    if (!resolvedId) return;
    requestAnimationFrame(() => {
      document.getElementById("heritage-narrative-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [resolvedId]);

  if (!resolvedId) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-gray-900">
        <p className="text-red-600">Missing place ID in URL.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/heritage-narratives/manage">Back to list</Link>
        </Button>
      </div>
    );
  }

  const stillLoading = loadingPlaces || loadingStories;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="ghost"
            className="w-fit -ml-2 text-indigo-800 hover:text-indigo-950 hover:bg-indigo-50"
            onClick={() => navigate("/dashboard/heritage-narratives/manage")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all narratives
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit heritage narrative</h1>
            <p className="text-gray-500 mt-1">
              {editorPlaceName}
              <span className="text-gray-400 font-mono text-sm ml-2">· {resolvedId}</span>
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="border-indigo-200 shrink-0 w-full sm:w-auto">
          <Link to="/dashboard/heritage-narratives/add">Add another narrative</Link>
        </Button>
      </div>

      {storiesError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {storiesError}
        </div>
      )}

      {stillLoading ? (
        <div className="flex items-center gap-2 text-gray-500 py-16 justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          Loading editor…
        </div>
      ) : (
        <>
          {!activeStoryRow && !selectedPlace && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="py-6 text-sm text-amber-950">
                <p className="font-medium">No matching place in your directory and no saved row yet.</p>
                <p className="mt-2 text-amber-900/90">
                  You can still compose and save — a new{" "}
                  <code className="text-xs bg-white/80 px-1 rounded">place_stories</code> document will be created for
                  this ID when you save.
                </p>
              </CardContent>
            </Card>
          )}
          <HeritageNarrativeEditorCard
            selectedPlaceId={resolvedId}
            editorPlaceName={editorPlaceName}
            selectedPlace={selectedPlace}
            activeStoryRow={activeStoryRow}
            form={form}
            setForm={setForm}
            saving={saving}
            saveMsg={saveMsg}
            aiLoading={aiLoading}
            aiError={aiError}
            onSave={handleSave}
            onGenerateAI={generateWithAI}
            previewParagraphs={previewParagraphs}
            previewFacts={previewFacts}
          />
        </>
      )}

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="py-4 text-sm text-gray-600">
          Changes sync live from Firestore while this page is open. Use <strong>Save story</strong> to persist your edits.
        </CardContent>
      </Card>
    </div>
  );
}
