/**
 * Syrian governorates used by the host onboarding wizard.
 * Order matches the conventional administrative listing.
 */

export type GovernorateOption = {
  id: string;
  labelAr: string;
};

export const SYRIAN_GOVERNORATES: ReadonlyArray<GovernorateOption> = [
  { id: "damascus", labelAr: "دمشق" },
  { id: "rif_dimashq", labelAr: "ريف دمشق" },
  { id: "aleppo", labelAr: "حلب" },
  { id: "homs", labelAr: "حمص" },
  { id: "hama", labelAr: "حماة" },
  { id: "latakia", labelAr: "اللاذقية" },
  { id: "tartus", labelAr: "طرطوس" },
  { id: "idlib", labelAr: "إدلب" },
  { id: "daraa", labelAr: "درعا" },
  { id: "suwayda", labelAr: "السويداء" },
  { id: "quneitra", labelAr: "القنيطرة" },
  { id: "raqqa", labelAr: "الرقة" },
  { id: "deir_ez_zor", labelAr: "دير الزور" },
  { id: "hasakah", labelAr: "الحسكة" },
] as const;

export function findGovernorate(id: string | undefined) {
  if (!id) return undefined;
  return SYRIAN_GOVERNORATES.find((g) => g.id === id);
}
