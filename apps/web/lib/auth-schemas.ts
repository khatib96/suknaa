/**
 * Zod schemas for auth forms.
 *
 * In Phase 2 these schemas will move to `packages/types` so the backend
 * (NestJS DTOs) and the frontend (React Hook Form) share a single source
 * of truth — see `.cursor/rules/suknaa.mdc` §5 (Forms).
 */

import { z } from "zod";

export const LOGIN_INTENTS = ["guest", "host"] as const;
export type LoginIntent = (typeof LOGIN_INTENTS)[number];

export function isLoginIntent(value: unknown): value is LoginIntent {
  return typeof value === "string" && (LOGIN_INTENTS as readonly string[]).includes(value);
}

/** Login: email + password. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string()
    .min(10, "كلمة المرور يجب أن تكون 10 أحرف على الأقل"),
  intent: z.enum(LOGIN_INTENTS),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------

export const HOST_CATEGORIES = ["real_estate", "hospitality"] as const;
export type HostCategory = (typeof HOST_CATEGORIES)[number];

export const HOST_SUBTYPES = [
  "individual",
  "re_office",
  "hotel_company",
] as const;
export type HostSubtype = (typeof HOST_SUBTYPES)[number];

/**
 * Single signup schema with branching based on `intent`.
 * The form is a small wizard; we still validate everything at submit.
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "الاسم مطلوب")
      .max(80, "الاسم طويل جداً"),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("صيغة البريد الإلكتروني غير صحيحة"),
    phone: z
      .string()
      .min(8, "رقم الهاتف مطلوب")
      .regex(/^[+\d\s-]+$/, "أرقام فقط (مع علامة + اختيارية)"),
    password: z
      .string()
      .min(10, "كلمة المرور يجب أن تكون 10 أحرف على الأقل")
      .regex(/[A-Za-z]/, "يجب أن تحوي حرفاً واحداً على الأقل")
      .regex(/[0-9]/, "يجب أن تحوي رقماً واحداً على الأقل"),
    intent: z.enum(LOGIN_INTENTS),
    hostCategory: z.enum(HOST_CATEGORIES).optional(),
    hostSubtype: z.enum(HOST_SUBTYPES).optional(),
    acceptTerms: z.literal<boolean>(true, {
      message: "يجب الموافقة على شروط الاستخدام",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.intent !== "host") return;

    if (!data.hostCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostCategory"],
        message: "اختر فئة الاستضافة",
      });
    }

    if (!data.hostSubtype) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostSubtype"],
        message: "اختر نوع الحساب",
      });
      return;
    }

    if (data.hostCategory === "real_estate" && data.hostSubtype === "hotel_company") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostSubtype"],
        message: "نوع الحساب لا يطابق فئة الاستضافة",
      });
    }
    if (
      data.hostCategory === "hospitality" &&
      (data.hostSubtype === "individual" || data.hostSubtype === "re_office")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hostSubtype"],
        message: "نوع الحساب لا يطابق فئة الاستضافة",
      });
    }
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
