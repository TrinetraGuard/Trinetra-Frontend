/** Shared grayscale admin dashboard styling — consistent black/white professional theme */

export const admin = {
  page: "space-y-6",
  title: "text-2xl md:text-3xl font-bold text-gray-900",
  subtitle: "text-gray-500 mt-1",
  iconWrap: "p-2 rounded-lg bg-gray-100 text-gray-700",
  iconWrapSolid: "p-2 rounded-xl bg-gray-900 text-white",
  card: "border border-gray-200 shadow-sm",
  cardHeader: "border-b bg-gray-50",
  tableHead: "sticky top-0 z-10 bg-gray-50 border-b border-gray-200",
  input: "border-gray-200",
  warning: "rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800",
  empty: "rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600",
  statCard: "border border-gray-200 bg-white",
  statIcon: "p-3 bg-gray-900 rounded-lg text-white",
  badge: "bg-gray-100 text-gray-800 border-gray-200",
  /** Primary call-to-action — dark fill */
  cta: "bg-gray-900 text-white hover:bg-gray-800",
  /** Success / confirmation banner */
  success: "rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800",
  /** List row hover */
  listItem:
    "rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm",
  /** Section heading inside a page */
  sectionTitle: "text-lg font-bold text-gray-900 border-b border-gray-200 pb-2",
} as const;

export type DensityLevel = "low" | "medium" | "high" | "critical";

export function densityStyles(level: DensityLevel) {
  const map: Record<
    DensityLevel,
    { bg: string; text: string; border: string; light: string }
  > = {
    low: {
      bg: "bg-gray-400",
      text: "text-gray-600",
      border: "border-gray-300",
      light: "bg-gray-50",
    },
    medium: {
      bg: "bg-gray-600",
      text: "text-gray-700",
      border: "border-gray-400",
      light: "bg-gray-100",
    },
    high: {
      bg: "bg-gray-800",
      text: "text-gray-800",
      border: "border-gray-500",
      light: "bg-gray-200",
    },
    critical: {
      bg: "bg-black",
      text: "text-gray-900",
      border: "border-gray-700",
      light: "bg-gray-300",
    },
  };
  return map[level] ?? map.medium;
}

export function densityBadgeClass(level: DensityLevel): string {
  const s = densityStyles(level);
  return `${s.light} ${s.text} ${s.border}`;
}
