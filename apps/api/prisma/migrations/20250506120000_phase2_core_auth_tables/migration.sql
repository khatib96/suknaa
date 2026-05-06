-- Phase 2 Milestone 2 — core auth schema (users, host_profiles, kyc_submissions,
-- auth_sessions, otp_codes, two_factor_secrets, audit_logs).
--
-- Extensions: pgcrypto is required by project policy; gen_random_uuid() is also
-- available in PostgreSQL without pgcrypto on supported versions, but we still
-- enable pgcrypto for crypto helpers used elsewhere later.
-- postgis is required for future geography columns (Phase 3+).
--
-- Case-insensitive unique email / unique active phone:
-- Implemented with partial UNIQUE indexes on LOWER(email) and phone WHERE deleted_at IS NULL
-- (Prisma cannot express these in schema — see schema.prisma header comment).
--
-- audit_logs append-only: BEFORE UPDATE/DELETE trigger blocks mutations for all roles.
-- REVOKE UPDATE/DELETE is best-effort: when the application connects as the table OWNER
-- (common in local dev), PostgreSQL still allows DML regardless of REVOKE; production
-- should use a non-owner APPLICATION role with GRANT INSERT, SELECT only.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS "m1_placeholder" CASCADE;

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'suspended', 'pending_verification', 'banned');

-- CreateEnum
CREATE TYPE "user_experience" AS ENUM ('guest', 'host', 'admin');

-- CreateEnum
CREATE TYPE "host_category" AS ENUM ('real_estate', 'hospitality');

-- CreateEnum
CREATE TYPE "host_subtype" AS ENUM ('individual', 'real_estate_office', 'hotel_company');

-- CreateEnum
CREATE TYPE "withdrawal_schedule" AS ENUM ('weekly', 'monthly', 'manual');

-- CreateEnum
CREATE TYPE "kyc_doc_type" AS ENUM ('national_id', 'passport', 'driver_license');

-- CreateEnum
CREATE TYPE "kyc_status" AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "otp_purpose" AS ENUM ('login', 'password_reset', 'email_verification', 'phone_verification', 'two_factor', 'change_email', 'change_phone');

-- CreateEnum
CREATE TYPE "otp_channel" AS ENUM ('phone', 'email');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(20) NOT NULL,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "avatar_url" VARCHAR(500),
    "preferred_language" VARCHAR(5) NOT NULL DEFAULT 'ar',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Damascus',
    "is_guest" BOOLEAN NOT NULL DEFAULT true,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "last_login_as" "user_experience" NOT NULL DEFAULT 'guest',
    "status" "user_status" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(3),
    "last_login_ip" INET,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "average_rating_as_guest" DECIMAL(3,2),
    "total_reviews_as_guest" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_profiles" (
    "user_id" UUID NOT NULL,
    "host_category" "host_category" NOT NULL,
    "host_subtype" "host_subtype" NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "company_name" VARCHAR(200),
    "company_registration" VARCHAR(100),
    "tax_id" VARCHAR(100),
    "bio_ar" TEXT,
    "bio_en" TEXT,
    "response_rate" SMALLINT,
    "response_time_minutes" INTEGER DEFAULT 0,
    "acceptance_rate" SMALLINT,
    "re_total_listings" INTEGER NOT NULL DEFAULT 0,
    "hotel_total" INTEGER NOT NULL DEFAULT 0,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMPTZ(3),
    "withdrawal_schedule" "withdrawal_schedule" NOT NULL DEFAULT 'monthly',
    "bank_details_encrypted" TEXT,
    "suspicious_activity_score" SMALLINT NOT NULL DEFAULT 0,
    "last_flagged_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "host_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "kyc_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "intended_host_category" "host_category",
    "intended_host_subtype" "host_subtype",
    "id_document_type" "kyc_doc_type" NOT NULL,
    "id_front_url" VARCHAR(500) NOT NULL,
    "id_back_url" VARCHAR(500),
    "selfie_url" VARCHAR(500) NOT NULL,
    "ownership_proof_url" VARCHAR(500),
    "company_registration_url" VARCHAR(500),
    "tax_certificate_url" VARCHAR(500),
    "authorization_letter_url" VARCHAR(500),
    "hotel_license_url" VARCHAR(500),
    "status" "kyc_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3),

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(128) NOT NULL,
    "login_intent" "user_experience" NOT NULL,
    "remember_me" BOOLEAN NOT NULL DEFAULT false,
    "user_agent" TEXT,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(3),
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "purpose" "otp_purpose" NOT NULL,
    "channel" "otp_channel" NOT NULL,
    "delivery_target" VARCHAR(255) NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "attempts_count" SMALLINT NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_secrets" (
    "user_id" UUID NOT NULL,
    "totp_secret_encrypted" TEXT,
    "backup_codes_hashes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "enabled_at" TIMESTAMPTZ(3),
    "verified_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "two_factor_secrets_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID,
    "actor_ip" VARCHAR(45),
    "user_agent" TEXT,
    "action" VARCHAR(120) NOT NULL,
    "entity_type" VARCHAR(120) NOT NULL,
    "entity_id" UUID,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_kyc_submissions_admin_queue" ON "kyc_submissions"("status", "submitted_at" DESC);

-- CreateIndex
CREATE INDEX "idx_kyc_submissions_pending_queue" ON "kyc_submissions" ("submitted_at" DESC) WHERE ("status" = 'pending'::"kyc_status");

-- CreateIndex
CREATE INDEX "idx_auth_sessions_user_id" ON "auth_sessions"("user_id");

CREATE INDEX "idx_auth_sessions_active_by_user" ON "auth_sessions" ("user_id", "expires_at" DESC) WHERE ("revoked_at" IS NULL);

-- CreateIndex
CREATE INDEX "idx_otp_codes_user_created" ON "otp_codes"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_otp_codes_rate_limit" ON "otp_codes"("delivery_target", "channel", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_otp_codes_expires_at" ON "otp_codes"("expires_at");

CREATE INDEX "idx_otp_codes_active_lookup" ON "otp_codes" ("delivery_target", "channel", "purpose", "expires_at" DESC) WHERE ("consumed_at" IS NULL);

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor_created" ON "audit_logs"("actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at" DESC);

-- Partial btree indexes (DATABASE_SCHEMA §A1 users)
CREATE INDEX "idx_users_email" ON "users" ("email") WHERE ("deleted_at" IS NULL);
CREATE INDEX "idx_users_phone" ON "users" ("phone") WHERE ("deleted_at" IS NULL);
CREATE INDEX "idx_users_is_host" ON "users" ("is_host") WHERE ("deleted_at" IS NULL AND "is_host" = true);

-- Case-insensitive unique email + unique phone for non-deleted users only
CREATE UNIQUE INDEX "users_email_unique_active" ON "users" (LOWER("email")) WHERE ("deleted_at" IS NULL);
CREATE UNIQUE INDEX "users_phone_unique_active" ON "users" ("phone") WHERE ("deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "host_profiles" ADD CONSTRAINT "host_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_secrets" ADD CONSTRAINT "two_factor_secrets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Append-only enforcement for audit_logs (stronger than REVOKE for table owner sessions)
CREATE OR REPLACE FUNCTION prevent_audit_log_update_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

CREATE TRIGGER audit_logs_append_only
  BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW
  EXECUTE PROCEDURE prevent_audit_log_update_delete();

-- Best-effort privilege tightening (non-owner roles only; see header comment)
REVOKE UPDATE, DELETE ON TABLE "audit_logs" FROM PUBLIC;
