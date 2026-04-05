import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePlaceStoriesRows } from "@/hooks/usePlaceStoriesRows";
import { BookOpen, Edit3, LayoutList, Loader2, PlusCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HeritageNarrativesManagePage() {
  const navigate = useNavigate();
  const { storyRows, loading: storiesLoading, error: storiesError } = usePlaceStoriesRows();
  const [narrativeFilter, setNarrativeFilter] = useState<"all" | "published" | "drafts">("all");
  const [narrativeSearch, setNarrativeSearch] = useState("");

  const filteredNarrativeRows = useMemo(() => {
    let list = storyRows;
    if (narrativeFilter === "published") list = list.filter((r) => r.published);
    if (narrativeFilter === "drafts") list = list.filter((r) => !r.published);
    const q = narrativeSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.placeName.toLowerCase().includes(q) ||
          r.storyPreview.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [storyRows, narrativeFilter, narrativeSearch]);

  const narrativeStats = useMemo(() => {
    const published = storyRows.filter((r) => r.published && r.hasBody).length;
    const drafts = storyRows.filter((r) => !r.published).length;
    const empty = storyRows.filter((r) => !r.hasBody).length;
    return { total: storyRows.length, published, drafts, empty };
  }, [storyRows]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 text-white">
              <LayoutList className="h-6 w-6" />
            </span>
            Update heritage narratives
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            All saved stories are listed below (sorted by display order, then name). Use <strong>Edit</strong> to open
            the full editor. To create a narrative for a place that is not listed yet, use{" "}
            <strong>Add heritage narrative</strong>.
          </p>
        </div>
        <Button asChild className="shrink-0 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
          <Link to="/dashboard/heritage-narratives/add">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add new narrative
          </Link>
        </Button>
      </div>

      <Card className="border-indigo-200 shadow-md overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-indigo-50/60">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl text-gray-900">Saved narratives</CardTitle>
                <CardDescription className="mt-1 max-w-2xl">
                  Collection <code className="text-xs bg-white/80 px-1 rounded">place_stories</code>. Rows are sorted by{" "}
                  <strong>display order</strong> (then place name).
                </CardDescription>
              </div>
            </div>
            {!storiesLoading && !storiesError && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white border-indigo-100 text-indigo-900">
                  {narrativeStats.total} saved
                </Badge>
                <Badge className="bg-emerald-600 hover:bg-emerald-600">{narrativeStats.published} live in app</Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">
                  {narrativeStats.drafts} draft{narrativeStats.drafts === 1 ? "" : "s"}
                </Badge>
                {narrativeStats.empty > 0 && (
                  <Badge variant="destructive" className="font-normal">
                    {narrativeStats.empty} without story text
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          {storiesError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              <strong>Could not load narratives.</strong> {storiesError}
            </div>
          )}
          {storiesLoading ? (
            <div className="flex items-center gap-2 text-gray-500 py-10 justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              Loading saved stories…
            </div>
          ) : storyRows.length === 0 && !storiesError ? (
            <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-indigo-300 mb-3" />
              <p className="font-medium text-gray-800">No narratives saved yet</p>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Add your first narrative from the <strong>Add heritage narrative</strong> screen.
              </p>
              <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Link to="/dashboard/heritage-narratives/add">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add heritage narrative
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: "all" as const, label: "All" },
                      { key: "published" as const, label: "Published" },
                      { key: "drafts" as const, label: "Drafts" },
                    ] as const
                  ).map(({ key, label }) => (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={narrativeFilter === key ? "default" : "outline"}
                      className={
                        narrativeFilter === key
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "border-indigo-100 text-indigo-900"
                      }
                      onClick={() => setNarrativeFilter(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <Input
                    type="search"
                    value={narrativeSearch}
                    onChange={(e) => setNarrativeSearch(e.target.value)}
                    placeholder="Search by place name or text…"
                    className="h-10 pl-9 border-indigo-100"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Showing {filteredNarrativeRows.length} of {storyRows.length} row{storyRows.length === 1 ? "" : "s"}
                {narrativeSearch.trim() ? ` matching “${narrativeSearch.trim()}”` : ""}
              </p>
              <div className="rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-gray-200 text-left">
                      <th className="px-3 py-3 font-semibold text-gray-700 w-14 whitespace-nowrap">#</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 min-w-[160px]">Place</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">Status</th>
                      <th className="px-3 py-3 font-semibold text-gray-700">Preview</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap text-center">
                        Paragraphs / Facts
                      </th>
                      <th className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">Updated</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 text-right w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredNarrativeRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                          No narratives match this filter or search.
                        </td>
                      </tr>
                    ) : (
                      filteredNarrativeRows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/80">
                          <td className="px-3 py-3 text-gray-500 font-mono text-xs align-top">{row.sortOrder}</td>
                          <td className="px-3 py-3 align-top">
                            <p className="font-semibold text-gray-900 leading-snug">{row.placeName}</p>
                            <p
                              className="text-[11px] text-gray-400 font-mono mt-0.5 truncate max-w-[200px]"
                              title={row.id}
                            >
                              {row.id}
                            </p>
                          </td>
                          <td className="px-3 py-3 align-top whitespace-nowrap">
                            {row.published && row.hasBody ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600">Published</Badge>
                            ) : row.published && !row.hasBody ? (
                              <Badge variant="destructive">No body</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                Draft
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-3 align-top text-gray-600 max-w-md">
                            <p className="line-clamp-2 leading-relaxed">{row.storyPreview}</p>
                          </td>
                          <td className="px-3 py-3 align-top text-center text-gray-600 whitespace-nowrap">
                            {row.paragraphCount} / {row.factsCount}
                          </td>
                          <td className="px-3 py-3 align-top text-gray-500 text-xs whitespace-nowrap">
                            {row.updatedAtLabel}
                          </td>
                          <td className="px-3 py-3 align-top text-right">
                            <Button
                              type="button"
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => navigate(`/dashboard/heritage-narratives/edit/${row.id}`)}
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="py-4 text-sm text-gray-600">
          <strong>Tip:</strong> Document ID in <code className="bg-white px-1 rounded">place_stories</code> matches the
          place ID in <code className="bg-white px-1 rounded">places</code>. Only narratives marked published appear in
          the app.
        </CardContent>
      </Card>
    </div>
  );
}
