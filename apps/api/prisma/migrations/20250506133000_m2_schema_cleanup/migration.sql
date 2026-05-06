-- Phase 2 Milestone 2 cleanup.
--
-- 1. Phone is optional at guest signup. Phone/WhatsApp verification is required
--    later before host onboarding or withdrawals, not for the fast guest path.
-- 2. Audit logs keep explicit before/after JSON snapshots, actor role, and
--    request ID to match SECURITY.md audit requirements before AuditService is built.

ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;

DROP INDEX IF EXISTS "idx_users_phone";
DROP INDEX IF EXISTS "users_phone_unique_active";

CREATE INDEX "idx_users_phone"
  ON "users" ("phone")
  WHERE ("deleted_at" IS NULL AND "phone" IS NOT NULL);

CREATE UNIQUE INDEX "users_phone_unique_active"
  ON "users" ("phone")
  WHERE ("deleted_at" IS NULL AND "phone" IS NOT NULL);

ALTER TABLE "audit_logs"
  ADD COLUMN "actor_role" VARCHAR(50),
  ADD COLUMN "request_id" VARCHAR(100),
  ADD COLUMN "before" JSONB,
  ADD COLUMN "after" JSONB;

ALTER TABLE "audit_logs"
  ALTER COLUMN "actor_ip" TYPE INET USING NULLIF("actor_ip", '')::inet;
