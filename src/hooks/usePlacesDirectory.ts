import { db } from "@/firebase/firebase";
import type { PlaceOpt } from "@/lib/heritageNarrativesUtils";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export function usePlacesDirectory() {
  const [places, setPlaces] = useState<PlaceOpt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  return { places, loading, reloadPlaces: loadPlaces };
}
