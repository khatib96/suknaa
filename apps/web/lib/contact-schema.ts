/**
 * Zod schema for the public contact form (`/contact`).
 *
 * In Phase 6 this is shared with the backend (NestJS) via
 * `packages/types`. For now it lives next to the auth schemas in
 * `apps/web/lib/`.
 */

import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم مطلوب")
    .max(100, "الاسم طويل جداً"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  subject: z
    .string()
    .min(3, "الموضوع قصير جداً")
    .max(200, "الموضوع طويل جداً"),
  message: z
    .string()
    .min(10, "الرسالة قصيرة جداً (10 أحرف على الأقل)")
    .max(2000, "الرسالة طويلة جداً (الحد الأقصى 2000 حرف)"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
