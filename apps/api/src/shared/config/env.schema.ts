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
  JWT_PRIVATE_KEY_PATH: z.string().optional(),
  JWT_PUBLIC_KEY_PATH: z.string().optional(),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),

  // ---- TOTP encryption (Milestone 5) ----
  TOTP_ENC_KEY: z.string().optional(),

  // ---- BFF integration (Milestone 9) ----
  INTERNAL_API_KEY: z.string().optional(),

  // ---- Super-admin bootstrap (Milestone 4 seed) ----
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(10).optional(),
});

export type Env = z.infer<typeof envSchema>;
