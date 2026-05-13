import { z } from "zod";

/**
 * Single source of truth for environment variables.
 *
 * Milestone 1: only DATABASE_URL / REDIS_URL / MINIO_* are strictly required
 * (the health check needs them). Everything else is optional / placeholder
 * and gets tightened up as later milestones depend on it.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  /**
   * Comma-separated browser origins allowed for CORS (e.g. Next.js dev server).
   * Not a substitute for auth — server-to-server and curl ignore CORS.
   */
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://127.0.0.1:3000"),

  // ---- Postgres ----
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // ---- Redis ----
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  REDIS_KEY_PREFIX: z.string().min(1).default("suknaa"),

  // ---- MinIO ----
  MINIO_ENDPOINT: z.string().url(),
  MINIO_USE_SSL: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .default(false),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_KYC_BUCKET: z.string().min(1).default("suknaa-kyc"),

  // ---- Messaging (Milestone 3 shared infra) ----
  MESSAGE_PROVIDER: z.enum(["mock", "whatsapp"]).default("mock"),
  DEV_OUTBOX_DIR: z.string().min(1).default(".dev-outbox"),

  // ---- JWT (Milestone 4) ----
  JWT_PRIVATE_KEY_PATH: z.string().min(1, "JWT_PRIVATE_KEY_PATH is required"),
  JWT_PUBLIC_KEY_PATH: z.string().min(1, "JWT_PUBLIC_KEY_PATH is required"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  /** Short-lived RS256 JWT returned when password login requires a second factor. */
  JWT_MFA_TTL: z.string().default("5m"),

  // ---- OTP + 2FA (Milestone 5) ----
  OTP_CODE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_PHONE_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(3),

  // ---- Auth rate limits (Phase 2.5 M3, Redis sliding/fixed window via INCR+EXPIRE) ----
  AUTH_RL_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RL_LOGIN_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  AUTH_RL_SIGNUP_MAX: z.coerce.number().int().positive().default(3),
  AUTH_RL_SIGNUP_WINDOW_SEC: z.coerce.number().int().positive().default(3600),
  AUTH_RL_PASSWORD_RESET_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RL_PASSWORD_RESET_WINDOW_SEC: z.coerce.number().int().positive().default(3600),
  AUTH_RL_MFA_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RL_MFA_WINDOW_SEC: z.coerce.number().int().positive().default(600),

  TWO_FACTOR_ISSUER: z.string().min(1).default("Suknaa"),
  TWO_FACTOR_TEMP_SECRET_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  /** 64-char hex (32 bytes) or a long passphrase (scrypt-derived). Required before encrypting TOTP secrets at rest. */
  TOTP_ENC_KEY: z.string().min(32).optional(),

  // ---- WhatsApp Cloud API (optional; deferred activation — see WhatsAppCloudProvider) ----
  WHATSAPP_CLOUD_ENABLED: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .default(false),
  WHATSAPP_CLOUD_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_CLOUD_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_CLOUD_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_CLOUD_API_VERSION: z.string().default("v21.0"),

  // ---- BFF integration (Milestone 9) ----
  INTERNAL_API_KEY: z.string().optional(),

  // ---- Super-admin bootstrap (Milestone 4 seed) ----
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(10).optional(),
})
  .superRefine((data, ctx) => {
    if (!data.WHATSAPP_CLOUD_ENABLED) {
      return;
    }
    const req = (
      key: keyof typeof data,
      label: string,
    ): void => {
      const v = data[key];
      if (typeof v !== "string" || v.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required when WHATSAPP_CLOUD_ENABLED=true`,
          path: [key as string],
        });
      }
    };
    req("WHATSAPP_CLOUD_ACCESS_TOKEN", "WHATSAPP_CLOUD_ACCESS_TOKEN");
    req("WHATSAPP_CLOUD_PHONE_NUMBER_ID", "WHATSAPP_CLOUD_PHONE_NUMBER_ID");
    req("WHATSAPP_CLOUD_BUSINESS_ACCOUNT_ID", "WHATSAPP_CLOUD_BUSINESS_ACCOUNT_ID");
    req("WHATSAPP_CLOUD_VERIFY_TOKEN", "WHATSAPP_CLOUD_VERIFY_TOKEN");
  });

export type Env = z.infer<typeof envSchema>;
