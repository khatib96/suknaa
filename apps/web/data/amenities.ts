/**
 * Amenities catalogue. Each amenity has an id, an Arabic label, and a Lucide
 * icon name (string) — components map the name to an actual icon component.
 *
 * `appliesTo` mirrors the `applies_to_*` flags from docs/DATABASE_SCHEMA.md so
 * that filters can be tab-aware in /search.
 */

export type AmenityKind = "real_estate" | "hospitality" | "both";

export type Amenity = {
  id: string;
  label: string;
  /** Lucide icon name. Must match an export from `lucide-react`. */
  icon: string;
  appliesTo: AmenityKind;
};

export const AMENITIES: Amenity[] = [
  { id: "wifi", label: "واي فاي", icon: "Wifi", appliesTo: "both" },
  { id: "parking", label: "موقف سيارة", icon: "ParkingSquare", appliesTo: "both" },
  { id: "ac", label: "تكييف", icon: "Snowflake", appliesTo: "both" },
  { id: "pool", label: "مسبح", icon: "Waves", appliesTo: "both" },
  { id: "pets", label: "تقبل حيوانات أليفة", icon: "PawPrint", appliesTo: "both" },
  { id: "kitchen", label: "مطبخ مجهز", icon: "Utensils", appliesTo: "real_estate" },
  { id: "washing-machine", label: "غسالة", icon: "WashingMachine", appliesTo: "real_estate" },
  { id: "garden", label: "حديقة", icon: "Trees", appliesTo: "real_estate" },
  { id: "barbecue", label: "شواية", icon: "Flame", appliesTo: "real_estate" },
  { id: "breakfast", label: "إفطار مشمول", icon: "Coffee", appliesTo: "hospitality" },
  { id: "reception24", label: "استقبال 24 ساعة", icon: "BellRing", appliesTo: "hospitality" },
  { id: "gym", label: "صالة رياضية", icon: "Dumbbell", appliesTo: "hospitality" },
  { id: "spa", label: "سبا", icon: "Sparkles", appliesTo: "hospitality" },
  { id: "restaurant", label: "مطعم", icon: "UtensilsCrossed", appliesTo: "hospitality" },
];

export function findAmenity(id: string): Amenity | undefined {
  return AMENITIES.find((a) => a.id === id);
}
