import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import type { Firestore } from "firebase/firestore";

/** Stable keys for probe / draft / good-broken state (Firestore doc ids should not contain `::`). */
export const mediaSlotKey = {
  place: (placeId: string, index: number) => `place::${placeId}::${index}`,
  heritage: (storyDocId: string) => `heritage::${storyDocId}::hero`,
  event: (eventId: string) => `event::${eventId}::image`,
  feature: (index: number) => `feature::highlight::${index}`,
  category: (categoryId: string) => `category::${categoryId}::icon`,
} as const;

export type SlotStatus = "empty" | "probing" | "ok" | "broken";

export function getSlotStatus(
  urlTrimmed: string,
  key: string,
  goodKeys: Set<string>,
  brokenKeys: Set<string>
): SlotStatus {
  if (!urlTrimmed) return "empty";
  if (goodKeys.has(key)) return "ok";
  if (brokenKeys.has(key)) return "broken";
  return "probing";
}

export function slotNeedsListing(
  urlTrimmed: string,
  key: string,
  goodKeys: Set<string>,
  brokenKeys: Set<string>
): boolean {
  if (!urlTrimmed) return true;
  if (brokenKeys.has(key)) return true;
  if (!goodKeys.has(key) && !brokenKeys.has(key)) return true;
  return false;
}

export async function savePlaceUrl(
  db: Firestore,
  placeId: string,
  index: number,
  currentUrls: string[],
  newUrl: string
): Promise<void> {
  const next = [...currentUrls];
  if (next.length === 0) {
    next.push(newUrl);
  } else if (index >= next.length) {
    while (next.length < index) next.push("");
    next.push(newUrl);
  } else {
    next[index] = newUrl;
  }
  await updateDoc(doc(db, "places", placeId), {
    urls: next,
    updatedAt: new Date(),
  });
}

export async function saveHeritageHero(db: Firestore, storyDocId: string, newUrl: string): Promise<void> {
  await updateDoc(doc(db, "place_stories", storyDocId), {
    heroImageUrl: newUrl,
    updatedAt: new Date(),
  });
}

export async function saveEventImage(db: Firestore, eventId: string, newUrl: string): Promise<void> {
  await updateDoc(doc(db, "events", eventId), {
    imageUrl: newUrl,
  });
}

export async function saveFeatureImageAtIndex(
  db: Firestore,
  index: number,
  newUrl: string
): Promise<void> {
  const ref = doc(db, "feature", "highlight");
  const snap = await getDoc(ref);
  const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
  const raw = data.images;
  const imgs: string[] = Array.isArray(raw) ? raw.map((u) => String(u)) : [];
  while (imgs.length <= index) imgs.push("");
  imgs[index] = newUrl;
  await setDoc(ref, { ...data, images: imgs }, { merge: true });
}

export async function saveCategoryIcon(db: Firestore, categoryId: string, newUrl: string): Promise<void> {
  await updateDoc(doc(db, "categories", categoryId), {
    icon: newUrl,
  });
}
