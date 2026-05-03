/**
 * Mock nearby-attractions for property/hotel detail pages.
 *
 * In production, this comes from the `nearby_attractions` table populated
 * via OpenStreetMap import (see docs/BUILD_PLAN.md Phase 8).
 */

export type AttractionCategory =
  | "landmark"
  | "restaurant"
  | "transport"
  | "beach"
  | "shopping"
  | "park";

export type NearbyAttraction = {
  id: string;
  name: string;
  category: AttractionCategory;
  /** Distance in kilometres (Latin numeral, displayed as e.g. "0.4 كم") */
  distanceKm: number;
};

export const CATEGORY_LABELS: Record<AttractionCategory, string> = {
  landmark: "معلم سياحي",
  restaurant: "مطاعم",
  transport: "وسائل نقل",
  beach: "شاطئ",
  shopping: "تسوق",
  park: "حديقة",
};

export const SAMPLE_NEARBY_DAMASCUS: NearbyAttraction[] = [
  { id: "umayyad", name: "الجامع الأموي", category: "landmark", distanceKm: 0.6 },
  { id: "souq", name: "سوق الحميدية", category: "shopping", distanceKm: 0.8 },
  { id: "azm", name: "قصر العظم", category: "landmark", distanceKm: 1.1 },
  { id: "barada", name: "نهر بردى", category: "park", distanceKm: 0.4 },
  { id: "saruja", name: "ساحة الساروجة", category: "landmark", distanceKm: 1.5 },
  { id: "naranj", name: "مطعم نارنج", category: "restaurant", distanceKm: 0.3 },
];

export const SAMPLE_NEARBY_LATAKIA: NearbyAttraction[] = [
  { id: "corniche", name: "الكورنيش الجنوبي", category: "beach", distanceKm: 0.2 },
  { id: "shati-azraq", name: "شاطئ الشاطئ الأزرق", category: "beach", distanceKm: 1.4 },
  { id: "sport-city", name: "مدينة الرياضية", category: "park", distanceKm: 2.1 },
  { id: "mashrou3", name: "المشروع السابع", category: "shopping", distanceKm: 0.9 },
  { id: "port", name: "ميناء اللاذقية", category: "transport", distanceKm: 1.7 },
];
