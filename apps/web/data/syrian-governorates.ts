/**
 * Canonical Syrian governorates for Phase 1 mock data.
 *
 * Keep governorates as the stable search key. Districts and tourist areas
 * such as الزبداني or تدمر should live as neighbourhood/area metadata under
 * their governorate, not as separate top-level city ids.
 */

export const SYRIAN_GOVERNORATES = [
  {
    id: "damascus",
    labelAr: "دمشق",
    image: "/images/destinations/damascus.jpg",
  },
  {
    id: "rif_dimashq",
    labelAr: "ريف دمشق",
  },
  {
    id: "aleppo",
    labelAr: "حلب",
    image: "/images/destinations/aleppo.jpg",
  },
  {
    id: "homs",
    labelAr: "حمص",
  },
  {
    id: "hama",
    labelAr: "حماة",
    image: "/images/destinations/hamah.jpg",
  },
  {
    id: "latakia",
    labelAr: "اللاذقية",
    image: "/images/destinations/latakia.jpg",
  },
  {
    id: "tartus",
    labelAr: "طرطوس",
    image: "/images/destinations/tartus.jpg",
  },
  {
    id: "idlib",
    labelAr: "إدلب",
  },
  {
    id: "daraa",
    labelAr: "درعا",
    image: "/images/destinations/daraa.jpg",
  },
  {
    id: "suwayda",
    labelAr: "السويداء",
  },
  {
    id: "quneitra",
    labelAr: "القنيطرة",
  },
  {
    id: "deir_ez_zor",
    labelAr: "دير الزور",
  },
  {
    id: "raqqa",
    labelAr: "الرقة",
  },
  {
    id: "hasakah",
    labelAr: "الحسكة",
  },
] as const;

export type Governorate = (typeof SYRIAN_GOVERNORATES)[number];
export type GovernorateId = Governorate["id"];

export const GOVERNORATE_LABELS: Record<GovernorateId, string> =
  Object.fromEntries(SYRIAN_GOVERNORATES.map((g) => [g.id, g.labelAr])) as Record<
    GovernorateId,
    string
  >;

export function findGovernorate(id: string | undefined) {
  if (!id) return undefined;
  return SYRIAN_GOVERNORATES.find((g) => g.id === id);
}

export function isGovernorateId(id: string): id is GovernorateId {
  return id in GOVERNORATE_LABELS;
}
