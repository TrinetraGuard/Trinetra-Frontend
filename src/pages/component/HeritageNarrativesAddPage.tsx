import { HeritageNarrativeEditorCard } from "@/components/heritage/HeritageNarrativeEditorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHeritageStoryForm } from "@/hooks/useHeritageStoryForm";
import { usePlaceStoriesRows } from "@/hooks/usePlaceStoriesRows";
import { usePlacesDirectory } from "@/hooks/usePlacesDirectory";
import { BookOpen, LayoutList, Loader2, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function HeritageNarrativesAddPage() {
  const { places, loading: loadingPlaces } = usePlacesDirectory();
  const { storyRows } = usePlaceStoriesRows();
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");
  const [placeListMode, setPlaceListMode] = useState<"all" | "no_narrative">("all");

  const storyIds = useMemo(() => new Set(storyRows.map((r) => r.id)), [storyRows]);

  const filteredPlaces = useMemo(() => {
    let list = places;
    if (placeListMode === "no_narrative") {
      list = list.filter((p) => !storyIds.has(p.id));
    }
    const q = placeSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [places, placeSearch, placeListMode, storyIds]);

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
  } = useHeritageStoryForm(selectedPlaceId, places, storyRows);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 text-white">
              <BookOpen className="h-6 w-6" />
            </span>
            Add heritage narrative
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            Choose a place, then write content or use <strong>Generate with AI</strong>. Save when ready; use{" "}
            <strong>Published</strong> when the story should appear in the app. To change existing stories, open{" "}
            <strong>Update heritage narratives</strong>.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 border-indigo-200 text-indigo-900 w-full sm:w-auto">
          <Link to="/dashboard/heritage-narratives/manage">
            <LayoutList className="h-4 w-4 mr-2" />
            View all saved narratives
          </Link>
        </Button>
      </div>

      <Card className="border-indigo-100 shadow-md overflow-visible">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50/80 to-orange-50/50">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <MapPin className="h-4 w-4" />
                </span>
                Select place
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                The narrative document uses the same ID as the place in{" "}
                <code className="text-xs bg-white/80 px-1 rounded">places</code>. Optionally show only places that do not
                have a saved story yet.
              </CardDescription>
            </div>
            {!loadingPlaces && places.length > 0 && (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 shrink-0">
                {places.length} place{places.length === 1 ? "" : "s"} total
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 overflow-visible">
          {loadingPlaces ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading places…
            </div>
          ) : places.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-sm text-amber-900">
              No places found in Firestore. Add places under <strong>Add Places</strong> first.
            </div>
          ) : (
            <div className="space-y-4 w-full max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={placeListMode === "all" ? "default" : "outline"}
                  className={placeListMode === "all" ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-100"}
                  onClick={() => setPlaceListMode("all")}
                >
                  All places
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={placeListMode === "no_narrative" ? "default" : "outline"}
                  className={
                    placeListMode === "no_narrative" ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-100"
                  }
                  onClick={() => setPlaceListMode("no_narrative")}
                >
                  Without a narrative
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="place-search" className="text-gray-700">
                  Search places
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <Input
                    id="place-search"
                    type="search"
                    value={placeSearch}
                    onChange={(e) => setPlaceSearch(e.target.value)}
                    placeholder="Type to filter by name…"
                    className="h-11 pl-9 bg-white border-indigo-100 focus-visible:ring-indigo-500"
                  />
                </div>
                {placeSearch.trim() && (
                  <p className="text-xs text-gray-500">
                    Showing {filteredPlaces.length} of {placeListMode === "no_narrative" ? places.filter((p) => !storyIds.has(p.id)).length : places.length}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="place-select-trigger" className="text-gray-700">
                  Place
                </Label>
                <Select
                  value={selectedPlaceId || undefined}
                  onValueChange={(v) => {
                    setSelectedPlaceId(v);
                  }}
                >
                  <SelectTrigger
                    id="place-select-trigger"
                    className="h-11 w-full bg-white border-2 border-indigo-100 shadow-sm hover:border-indigo-200 focus:ring-2 focus:ring-indigo-500/20 data-[placeholder]:text-gray-400"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                      <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                      <SelectValue placeholder="Choose a place to attach this narrative…" />
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={8}
                    align="start"
                    className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-[min(100vw-2rem,32rem)] border-indigo-100 shadow-xl"
                  >
                    {filteredPlaces.length === 0 ? (
                      <div className="py-8 px-4 text-center text-sm text-gray-500">
                        {placeListMode === "no_narrative"
                          ? "Every place already has a narrative, or none match your search."
                          : `No places match “${placeSearch.trim()}”. Clear search to see all.`}
                      </div>
                    ) : (
                      filteredPlaces.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="cursor-pointer py-2.5 pl-3 pr-8 focus:bg-indigo-50 focus:text-indigo-900"
                        >
                          <span className="line-clamp-2">{p.name}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlaceId && (
        <HeritageNarrativeEditorCard
          selectedPlaceId={selectedPlaceId}
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
      )}

      {!selectedPlaceId && !loadingPlaces && places.length > 0 && (
        <Card className="border-dashed border-indigo-200 bg-indigo-50/30">
          <CardContent className="py-8 text-center text-sm text-gray-600">
            Select a place above to show the editor and preview.
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="py-4 text-sm text-gray-600">
          <strong>Firestore:</strong> collection <code className="bg-white px-1 rounded">place_stories</code>,
          document ID = place ID. After saving, you can review and edit again from{" "}
          <Link to="/dashboard/heritage-narratives/manage" className="text-indigo-700 font-medium underline-offset-2 hover:underline">
            Update heritage narratives
          </Link>
          .
        </CardContent>
      </Card>
    </div>
  );
}
