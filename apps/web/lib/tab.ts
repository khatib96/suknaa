/**
 * Persistent tab state shared between the Navbar and any page that needs it
 * (Homepage, Search, Map, Featured Listings).
 *
 * The URL is the source of truth: `?tab=all|real_estate|hospitality`.
 * Default tab is "all".
 */

export const TAB_VALUES = ["all", "real_estate", "hospitality"] as const;

export type TabValue = (typeof TAB_VALUES)[number];

export const DEFAULT_TAB: TabValue = "all";

export const TAB_LABELS: Record<TabValue, string> = {
  all: "الكل",
  real_estate: "بيوت عطلات",
  hospitality: "فنادق",
};

export function isTabValue(value: unknown): value is TabValue {
  return typeof value === "string" && (TAB_VALUES as readonly string[]).includes(value);
}

export function parseTab(value: unknown): TabValue {
  return isTabValue(value) ? value : DEFAULT_TAB;
}
