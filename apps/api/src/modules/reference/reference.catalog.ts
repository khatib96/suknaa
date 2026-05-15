import type { ReferenceLabelItem } from "./reference.types";

/** Static AR/EN labels for DB enums not stored as reference rows. */
export const VACATION_RENTAL_TYPE_LABELS: ReferenceLabelItem[] = [
  { key: "apartment", label_ar: "شقة", label_en: "Apartment" },
  { key: "house", label_ar: "بيت", label_en: "House" },
  { key: "villa", label_ar: "فيلا", label_en: "Villa" },
  { key: "farm", label_ar: "مزرعة", label_en: "Farm" },
  { key: "chalet", label_ar: "شاليه", label_en: "Chalet" },
  { key: "cabin", label_ar: "كوخ", label_en: "Cabin" },
  { key: "studio", label_ar: "استوديو", label_en: "Studio" },
];

export const SPACE_TYPE_LABELS: ReferenceLabelItem[] = [
  { key: "bedroom", label_ar: "غرفة نوم", label_en: "Bedroom" },
  { key: "bathroom", label_ar: "حمام", label_en: "Bathroom" },
  { key: "kitchen", label_ar: "مطبخ", label_en: "Kitchen" },
  { key: "living_room", label_ar: "غرفة معيشة", label_en: "Living room" },
  { key: "dining_room", label_ar: "غرفة طعام", label_en: "Dining room" },
  { key: "balcony", label_ar: "شرفة", label_en: "Balcony" },
  { key: "terrace", label_ar: "تراس", label_en: "Terrace" },
  { key: "garden", label_ar: "حديقة", label_en: "Garden" },
  { key: "pool_area", label_ar: "منطقة مسبح", label_en: "Pool area" },
  { key: "rooftop", label_ar: "سطح", label_en: "Rooftop" },
  { key: "parking", label_ar: "موقف", label_en: "Parking" },
  { key: "storage", label_ar: "مخزن", label_en: "Storage" },
  { key: "office", label_ar: "مكتب", label_en: "Office" },
  { key: "gym", label_ar: "صالة رياضية", label_en: "Gym" },
  { key: "other", label_ar: "أخرى", label_en: "Other" },
];

export const BOOKING_MODE_LABELS: ReferenceLabelItem[] = [
  { key: "instant", label_ar: "حجز فوري", label_en: "Instant booking" },
  { key: "request", label_ar: "طلب حجز", label_en: "Request to book" },
  { key: "contact_only", label_ar: "تواصل فقط", label_en: "Contact only" },
];

export const CANCELLATION_POLICY_LABELS: ReferenceLabelItem[] = [
  { key: "flexible", label_ar: "مرن", label_en: "Flexible" },
  { key: "medium", label_ar: "متوسط", label_en: "Medium" },
  { key: "strict", label_ar: "صارم", label_en: "Strict" },
];
