/**
 * Computes how "complete" a place's information is (0–100%).
 * Used to show "Information 100%" badge and filter places that need updates.
 */
export type PlaceForCompleteness = {
  name?: string;
  categories?: string[];
  latitude?: number;
  longitude?: number;
  urls?: string[];
  description?: string;
  visitTime?: string;
  crowd?: string;
  bestSeason?: string;
  entryType?: string[];
  entryFee?: string;
  openingHours?: string;
  transportModes?: Array<{ mode?: string; minPrice?: string; maxPrice?: string }>;
  facilities?: Array<{ name?: string; minPrice?: string; maxPrice?: string; estimatedPrice?: string }>;
};

const WEIGHTS = {
  name: 8,
  categories: 8,
  latLng: 10,
  urls: 8,
  description: 12,
  visitTime: 6,
  crowd: 5,
  bestSeason: 6,
  entryType: 6,
  entryFee: 5,
  openingHours: 8,
  transportModes: 9,
  facilities: 9,
} as const;

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

export function getPlaceCompleteness(place: PlaceForCompleteness): { percent: number; isComplete: boolean } {
  if (!place) {
    return { percent: 0, isComplete: false };
  }

  let score = 0;

  if (place.name && place.name.trim().length > 0) score += WEIGHTS.name;
  if (place.categories && place.categories.length > 0) score += WEIGHTS.categories;
  const lat = Number(place.latitude);
  const lng = Number(place.longitude);
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) score += WEIGHTS.latLng;
  if (place.urls && place.urls.length > 0) score += WEIGHTS.urls;
  if (place.description && place.description.trim().length >= 30) score += WEIGHTS.description;
  if (place.visitTime && place.visitTime.trim().length > 0) score += WEIGHTS.visitTime;
  if (place.crowd && place.crowd.trim().length > 0) score += WEIGHTS.crowd;
  if (place.bestSeason && place.bestSeason.trim().length > 0) score += WEIGHTS.bestSeason;
  if (place.entryType && place.entryType.length > 0) score += WEIGHTS.entryType;
  const needsEntryFee = place.entryType?.includes("Paid");
  if (!needsEntryFee || (place.entryFee !== undefined && place.entryFee !== null && String(place.entryFee).trim() !== "")) {
    score += WEIGHTS.entryFee;
  }
  if (place.openingHours && place.openingHours.trim().length > 0) score += WEIGHTS.openingHours;
  const hasTransport = place.transportModes && place.transportModes.length > 0;
  const transportWithPrice = place.transportModes?.some((t) => (t.minPrice ?? "").trim() !== "" || (t.maxPrice ?? "").trim() !== "");
  if (hasTransport && transportWithPrice) score += WEIGHTS.transportModes;
  const hasFacilities = place.facilities && place.facilities.length > 0;
  const facilitiesWithInfo = place.facilities?.some(
    (f) => (f.minPrice ?? "").trim() !== "" || (f.maxPrice ?? "").trim() !== "" || (f.estimatedPrice ?? "").trim() !== ""
  );
  if (hasFacilities && facilitiesWithInfo) score += WEIGHTS.facilities;

  const percent = Math.round((score / TOTAL_WEIGHT) * 100);
  const isComplete = percent >= 100;

  return { percent: Math.min(100, percent), isComplete };
}
