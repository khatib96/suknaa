import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email format")
  .transform((value) => value.toLowerCase());

const passwordLoginField = z
  .string()
  .min(1, "Password is required")
  .min(10, "Password must be at least 10 characters");

const passwordSignupField = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one digit");

const uuidField = z.string().uuid("Invalid UUID");

export const authSignupSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  email: emailField,
  password: passwordSignupField,
  preferredLanguage: z.enum(["ar", "en"]).default("ar"),
  marketingOptIn: z.boolean().default(false),
});

export const authLoginSchema = z.object({
  email: emailField,
  password: passwordLoginField,
  rememberMe: z.boolean().optional().default(false),
});

export const authVerifyEmailSchema = z.object({
  email: emailField,
  token: z.string().min(32, "Invalid verification token"),
});

export const authRefreshSchema = z.object({
  refreshToken: z.string().min(32, "Invalid refresh token"),
});

export const authLogoutSchema = z.object({
  refreshToken: z.string().min(32, "Invalid refresh token"),
});

export const authRevokeSessionSchema = z.object({
  sessionId: uuidField,
});

export const authSessionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/** E.164-style phone (+countrycode, 7–15 digits total after +). */
export const phoneE164Schema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, "Invalid phone format (use E.164, e.g. +447911123456)");

export const otpPurposePhoneVerificationSchema = z.literal("phone_verification");

export const requestOtpSchema = z.object({
  purpose: otpPurposePhoneVerificationSchema,
  channel: z.literal("phone"),
  destination: phoneE164Schema,
});

export const verifyOtpSchema = z.object({
  purpose: otpPurposePhoneVerificationSchema,
  destination: phoneE164Schema,
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const totpConfirmSchema = z.object({
  code: z.string().trim().min(6).max(12),
});

export const totpDisableSchema = z
  .object({
    password: passwordLoginField.optional(),
    totpCode: z.string().trim().min(6).max(12).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.password && !data.totpCode) {
      ctx.addIssue({
        code: "custom",
        message: "Either password or totpCode is required",
        path: ["password"],
      });
    }
  });

export const authLogin2faSchema = z.object({
  mfa_token: z.string().min(10),
  code: z.string().trim().min(6).max(32),
});

export type AuthSignupInput = z.infer<typeof authSignupSchema>;
export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type AuthVerifyEmailInput = z.infer<typeof authVerifyEmailSchema>;
export type AuthRefreshInput = z.infer<typeof authRefreshSchema>;
export type AuthLogoutInput = z.infer<typeof authLogoutSchema>;
export type AuthRevokeSessionInput = z.infer<typeof authRevokeSessionSchema>;
export type AuthSessionsQueryInput = z.infer<typeof authSessionsQuerySchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type TotpConfirmInput = z.infer<typeof totpConfirmSchema>;
export type TotpDisableInput = z.infer<typeof totpDisableSchema>;
export type AuthLogin2faInput = z.infer<typeof authLogin2faSchema>;
