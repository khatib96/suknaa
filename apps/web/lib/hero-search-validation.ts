/**
 * Pure validation for the home hero search bar (Phase 1 mock).
 */

export type HeroSearchInput = {
  locationId: string | null;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type HeroSearchValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function parseISODateLocal(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function validateHeroSearch(input: HeroSearchInput): HeroSearchValidationResult {
  if (!input.locationId || !input.locationId.trim()) {
    return { ok: false, message: "يرجى اختيار الموقع." };
  }
  if (!input.checkIn.trim()) {
    return { ok: false, message: "يرجى اختيار تاريخ الوصول." };
  }
  if (!input.checkOut.trim()) {
    return { ok: false, message: "يرجى اختيار تاريخ المغادرة." };
  }
  const inD = parseISODateLocal(input.checkIn);
  const outD = parseISODateLocal(input.checkOut);
  if (!inD) {
    return { ok: false, message: "تاريخ الوصول غير صالح." };
  }
  if (!outD) {
    return { ok: false, message: "تاريخ المغادرة غير صالح." };
  }
  if (outD.getTime() <= inD.getTime()) {
    return { ok: false, message: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول." };
  }
  if (!Number.isFinite(input.guests) || input.guests < 1) {
    return { ok: false, message: "عدد الضيوف يجب أن يكون 1 على الأقل." };
  }
  return { ok: true };
}
