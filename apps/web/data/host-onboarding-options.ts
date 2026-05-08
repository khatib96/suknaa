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
  { id: "1", labelAr: "بيت عطلات واحد فقط", hint: "بداية مثالية" },
  { id: "2-3", labelAr: "بيتا عطلات أو ثلاثة" },
  { id: "4-10", labelAr: "بين 4 و 10 بيوت عطلات" },
  { id: "10+", labelAr: "أكثر من 10 بيوت عطلات", hint: "نتواصل معك مباشرة" },
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
  { id: "pricing", labelAr: "تسعير بيت العطلات بشكل عادل" },
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
  { title: string; subtitle: string }
> = {
  real_estate: {
    title: "بيوت عطلات",
    subtitle: "بيت، شقة، فيلا، مزرعة، شاليه، استوديو...",
  },
  hospitality: {
    title: "فنادق ومنتجعات",
    subtitle: "فندق، منتجع، شقق فندقية، هوستل.",
  },
};

export const HOST_SUBTYPE_LABELS: Record<
  HostSubtype,
  { title: string; subtitle: string }
> = {
  individual: {
    title: "حساب شخصي",
    subtitle: "أعرض بيتي أو شقتي للحجز كمالك.",
  },
  re_office: {
    title: "تجاري",
    subtitle: "للمكاتب العقارية أو من يدير عدة بيوت عطلات نيابة عن أصحابها.",
  },
  hotel_company: {
    title: "تجاري",
    subtitle: "للشركات الفندقية أو من يدير منشأة فندقية أو منتجع.",
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
