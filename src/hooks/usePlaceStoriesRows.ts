import { db } from "@/firebase/firebase";
import {
  docToStoryListRow,
  sortStoryRows,
  type StoryListRow,
} from "@/lib/heritageNarrativesUtils";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function usePlaceStoriesRows() {
  const [storyRows, setStoryRows] = useState<StoryListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "place_stories"),
      (snap) => {
        setError(null);
        const rows = sortStoryRows(snap.docs.map((d) => docToStoryListRow(d)));
        setStoryRows(rows);
        setLoading(false);
      },
      (err) => {
        console.error("place_stories listener:", err);
        setError(err.message || "Could not load narratives.");
        setStoryRows([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { storyRows, loading, error };
}
