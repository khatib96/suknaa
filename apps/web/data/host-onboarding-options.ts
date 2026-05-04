/**
 * Qualitative options shown during step 4 of the host onboarding wizard.
 *
 * These answers do NOT gate the account — they are stored to help us
 * tailor early support and to power product analytics. The user can
 * skip the entire step.
 */

import type {
  BiggestChallenge,
  HostCategory,
  HostSubtype,
  PortfolioSize,
  StartTimeline,
} from "@/lib/auth-schemas";

export const PORTFOLIO_SIZE_OPTIONS: ReadonlyArray<{
  id: PortfolioSize;
  labelAr: string;
  hint?: string;
}> = [
  { id: "1", labelAr: "عقار واحد فقط", hint: "بداية مثالية" },
  { id: "2-3", labelAr: "عقاران أو ثلاثة" },
  { id: "4-10", labelAr: "بين 4 و 10 عقارات" },
  { id: "10+", labelAr: "أكثر من 10 عقارات", hint: "نتواصل معك مباشرة" },
];

export const START_TIMELINE_OPTIONS: ReadonlyArray<{
  id: StartTimeline;
  labelAr: string;
  hint?: string;
}> = [
  { id: "now", labelAr: "جاهز الآن", hint: "أبدأ خلال أيام" },
  { id: "this_month", labelAr: "خلال الشهر القادم" },
  { id: "this_quarter", labelAr: "خلال 3 أشهر" },
  { id: "exploring", labelAr: "أستكشف فقط الآن" },
];

export const BIGGEST_CHALLENGE_OPTIONS: ReadonlyArray<{
  id: BiggestChallenge;
  labelAr: string;
}> = [
  { id: "pricing", labelAr: "تسعير عقاري بشكل عادل" },
  { id: "attracting_guests", labelAr: "اجتذاب ضيوف" },
  { id: "managing_bookings", labelAr: "تنظيم الحجوزات" },
  { id: "verification", labelAr: "التحقق من الضيوف وثقتهم" },
  { id: "other", labelAr: "تحدي آخر" },
];

// ---------------------------------------------------------------------------
// Display helpers used by the wizard summary (step 5) and progress bar
// ---------------------------------------------------------------------------

export const HOST_CATEGORY_LABELS: Record<
  HostCategory,
  { title: string; subtitle: string; emoji: string }
> = {
  real_estate: {
    title: "عقارات",
    subtitle: "بيت، شقة، فيلا، مزرعة، شاليه، استوديو...",
    emoji: "🏡",
  },
  hospitality: {
    title: "فنادق ومنتجعات",
    subtitle: "فندق، منتجع، شقق فندقية، هوستل.",
    emoji: "🏨",
  },
};

export const HOST_SUBTYPE_LABELS: Record<
  HostSubtype,
  { title: string; subtitle: string }
> = {
  individual: {
    title: "فرد / مالك",
    subtitle: "أعرض عقاري الشخصي للحجز.",
  },
  re_office: {
    title: "مكتب عقاري",
    subtitle: "أدير عدة عقارات لأصحابها.",
  },
  hotel_company: {
    title: "شركة فندقية",
    subtitle: "أملك أو أدير منشأة فندقية.",
  },
};

/** Subtypes available for a given category — enforces the dual-system rule. */
export function subtypesForCategory(
  category: HostCategory | undefined,
): HostSubtype[] {
  if (category === "real_estate") return ["individual", "re_office"];
  if (category === "hospitality") return ["hotel_company"];
  return [];
}

export const HOST_APPLY_STEP_LABELS: Record<number, string> = {
  1: "نوع الاستضافة",
  2: "نوع الحساب",
  3: "معلوماتك الأساسية",
  4: "لمحة سريعة",
  5: "المراجعة والتأكيد",
};
