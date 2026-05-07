/**
 * Zod schemas for the four auth experiences:
 *
 *   /login                       → guestLoginSchema
 *   /host/login                  → hostLoginSchema
 *   /signup                      → guestSignupSchema
 *   /become-a-host/apply (1..5)  → hostApplySchema (validated step-by-step)
 *
 * In Phase 2 these schemas move to `packages/types` so the backend
 * (NestJS DTOs) and the frontend (React Hook Form) share a single
 * source of truth — see `.cursor/rules/suknaa.mdc` §5 (Forms).
 *
 * Critical invariant (matches the backend `WRONG_HOST_CATEGORY` rule):
 *   real_estate  → hostSubtype ∈ { individual, re_office }
 *   hospitality  → hostSubtype = hotel_company
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared field schemas
// ---------------------------------------------------------------------------

const emailField = z
  .string()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("صيغة البريد الإلكتروني غير صحيحة");

/** Login passwords don't need the strength regex — the user already has an account. */
const passwordLoginField = z
  .string()
  .min(1, "كلمة المرور مطلوبة")
  .min(10, "كلمة المرور يجب أن تكون 10 أحرف على الأقل");

/** Signup passwords enforce the 10-char + letter + digit policy from SECURITY.md §2.1. */
const passwordSignupField = z
  .string()
  .min(10, "كلمة المرور يجب أن تكون 10 أحرف على الأقل")
  .regex(/[A-Za-z]/, "يجب أن تحوي حرفاً واحداً على الأقل")
  .regex(/[0-9]/, "يجب أن تحوي رقماً واحداً على الأقل");

const phoneField = z
  .string()
  .min(8, "رقم الهاتف مطلوب")
  .regex(/^\+[1-9]\d{6,14}$/, "اكتب الرقم بصيغة دولية مثل +963991234567");

// ---------------------------------------------------------------------------
// Guest login
// ---------------------------------------------------------------------------

export const guestLoginSchema = z.object({
  email: emailField,
  password: passwordLoginField,
});

export type GuestLoginValues = z.infer<typeof guestLoginSchema>;

// ---------------------------------------------------------------------------
// Host login
// ---------------------------------------------------------------------------

export const hostLoginSchema = z.object({
  email: emailField,
  password: passwordLoginField,
});

export type HostLoginValues = z.infer<typeof hostLoginSchema>;

// ---------------------------------------------------------------------------
// Guest signup (fast path — 30 seconds and done)
// ---------------------------------------------------------------------------

export const guestSignupSchema = z.object({
  fullName: z
    .string()
    .max(80, "الاسم طويل جداً")
    .optional()
    .or(z.literal("")),
  email: emailField,
  password: passwordSignupField,
  acceptTerms: z.literal<boolean>(true, {
    message: "يجب الموافقة على شروط الاستخدام",
  }),
});

export type GuestSignupValues = z.infer<typeof guestSignupSchema>;

// ---------------------------------------------------------------------------
// Host onboarding wizard
// ---------------------------------------------------------------------------

export const HOST_CATEGORIES = ["real_estate", "hospitality"] as const;
export type HostCategory = (typeof HOST_CATEGORIES)[number];

export const HOST_SUBTYPES = [
  "individual",
  "re_office",
  "hotel_company",
] as const;
export type HostSubtype = (typeof HOST_SUBTYPES)[number];

export const PORTFOLIO_SIZES = ["1", "2-3", "4-10", "10+"] as const;
export type PortfolioSize = (typeof PORTFOLIO_SIZES)[number];

export const START_TIMELINES = [
  "now",
  "this_month",
  "this_quarter",
  "exploring",
] as const;
export type StartTimeline = (typeof START_TIMELINES)[number];

export const BIGGEST_CHALLENGES = [
  "pricing",
  "attracting_guests",
  "managing_bookings",
  "verification",
  "other",
] as const;
export type BiggestChallenge = (typeof BIGGEST_CHALLENGES)[number];

/**
 * Helper used by the wizard to enforce the dual-system rule
 * before submission. Returns null if (category, subtype) is consistent.
 */
export function categorySubtypeMismatch(
  category: HostCategory | undefined,
  subtype: HostSubtype | undefined,
): string | null {
  if (!category || !subtype) return null;
  if (
    category === "real_estate" &&
    (subtype === "individual" || subtype === "re_office")
  ) {
    return null;
  }
  if (category === "hospitality" && subtype === "hotel_company") return null;
  return "نوع الحساب لا يطابق فئة الاستضافة";
}

/**
 * The full wizard schema. We keep all fields at one level so the wizard
 * can hold a single `useForm` instance and validate a slice per step
 * via `form.trigger([...stepFields])`.
 */
export const hostApplySchema = z
  .object({
    // Step 1
    hostCategory: z.enum(HOST_CATEGORIES, {
      message: "اختر فئة الاستضافة",
    }),
    // Step 2
    hostSubtype: z.enum(HOST_SUBTYPES, {
      message: "اختر نوع الحساب",
    }),
    // Step 3
    fullName: z
      .string()
      .min(2, "الاسم مطلوب")
      .max(80, "الاسم طويل جداً"),
    phone: phoneField,
    email: emailField,
    password: passwordSignupField,
    cityId: z.string().min(1, "اختر المدينة"),
    acceptTerms: z.literal<boolean>(true, {
      message: "يجب الموافقة على شروط الاستخدام",
    }),
    // Step 4 — qualitative, all optional (the user can skip)
    portfolioSize: z.enum(PORTFOLIO_SIZES).optional(),
    startTimeline: z.enum(START_TIMELINES).optional(),
    biggestChallenge: z.enum(BIGGEST_CHALLENGES).optional(),
  })
  .superRefine((data, ctx) => {
    const mismatch = categorySubtypeMismatch(data.hostCategory, data.hostSubtype);
    if (mismatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostSubtype"],
        message: mismatch,
      });
    }
  });

export type HostApplyValues = z.infer<typeof hostApplySchema>;

/** Field groups the wizard validates step-by-step. Order matches URL `?step=N`. */
export const HOST_APPLY_STEP_FIELDS = {
  1: ["hostCategory"],
  2: ["hostSubtype"],
  3: [
    "fullName",
    "phone",
    "email",
    "password",
    "cityId",
    "acceptTerms",
  ],
  4: ["portfolioSize", "startTimeline", "biggestChallenge"],
  5: [],
} as const satisfies Record<number, ReadonlyArray<keyof HostApplyValues>>;

export type HostApplyStep = keyof typeof HOST_APPLY_STEP_FIELDS;
export const HOST_APPLY_TOTAL_STEPS = 5 as const;

export function isHostApplyStep(value: unknown): value is HostApplyStep {
  return (
    typeof value === "number" && value >= 1 && value <= HOST_APPLY_TOTAL_STEPS
  );
}

export function parseHostApplyStep(raw: unknown): HostApplyStep {
  const n =
    typeof raw === "string"
      ? Number.parseInt(raw, 10)
      : typeof raw === "number"
        ? raw
        : Number.NaN;
  return isHostApplyStep(n) ? n : 1;
}
