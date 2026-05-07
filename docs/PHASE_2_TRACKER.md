# Phase 2 Tracker — Backend Foundation + Auth + KYC

> Purpose: a simple progress tracker for Mohammad. This file shows where Phase 2 stands, what each milestone means, and when it is safe to move forward.

## Current Status

**Current milestone:** Phase 2 closed; Phase 3 is next  
**Completed:** M1, M2, M2 cleanup, M3, M4, M5, M6, M7, M8, M9, M10  
**In progress:** None  
**Not started:** Phase 3

## Phase 2 Rule

Do not start Phase 3 until all Phase 2 exit criteria are done:

- Guest can sign up, verify email, log in, refresh session, and log out.
- User can choose login intent: guest or host.
- User can start become-host flow for real estate or hospitality.
- KYC submission can be created with the correct document requirements.
- Admin can approve or reject KYC.
- Audit logs are written for sensitive actions.
- API build, lint, Prisma generate, migrations, and focused checks are clean.

## Milestones

| Milestone | Name | Status | Summary |
|---|---|---:|---|
| M1 | API Scaffold | Done | NestJS API app, env validation, Pino, Swagger, Prisma/Redis/MinIO services, health endpoint. |
| M2 | Core DB Schema | Done | Prisma schema + migrations for users, host profiles, KYC, sessions, OTP, 2FA, audit logs. |
| M2 Cleanup | Schema Review Fixes | Done | `users.phone` optional, phone partial unique index, stronger `audit_logs`, README update. |
| M3 | Shared Backend Infrastructure | Done | Messaging abstraction, mock outbox, disabled WhatsApp stub, AuditService, error helpers, storage/redis helpers. |
| M4 | Auth Core | Done | Shared auth schemas, password/hash services, strict RS256 auth endpoints, email verification via mock outbox, refresh rotation, sessions, `/v1/me`, auth audit events. |
| M5 | OTP + Phone Verification + 2FA | Done | Phone OTP (mock provider), optional phone verification, TOTP + backup codes, MFA login challenge (`mfa_token`), WhatsApp Cloud prep behind env gate. |
| M6 | Login Intent + Roles + Become Host | Done | Guest/host intent, roles guard, become-host endpoint, host profile creation. |
| M7 | KYC Submission + MinIO | Done | KYC document validation, upload flow, private MinIO storage, per-subtype requirements. |
| M8 | Admin KYC Review + Audit Logs | Done | Admin queue (cursor-paginated), approve (sets host isVerified + expiresAt), reject (reason required), admin.kyc.approved/rejected audit logs. |
| M9 | Frontend BFF Integration | Done | Next.js BFF route handlers + auth/host forms wired to real API + CSRF double-submit + minimal KYC page + browser smoke test. |
| M10 | Tests + Docs Closure | Done | Password reset completed, `verify:m10` added, Phase 2 docs reconciled, deferred items documented. |

## Completed Verification

### M1

- API build: passed
- API lint: passed
- `GET /v1/health`: passed when Docker services were running
- Swagger: available at `/api/docs`

### M2 + Cleanup

- `prisma validate`: passed
- `db:migrate`: passed
- `db:status`: clean
- `prisma:generate`: passed after freeing Windows Prisma DLL lock
- API build: passed
- API lint: passed
- `prisma.user.count()`: passed

### M3

- `prisma:generate`: passed
- `db:status`: clean
- API build: passed
- API lint: passed
- Mock message outbox: passed, files created under `apps/api/.dev-outbox/`
- `AuditService.write()`: passed, rows inserted into `audit_logs`
- `apps/web`: untouched

### M4

- `prisma:generate`: passed
- `db:status`: clean
- API build: passed
- API lint: passed
- Manual auth lifecycle script: passed (`scripts/manual-m4-verify.ts`)
- `.dev-outbox` verification message: passed
- `auth_sessions.refresh_token_hash` differs from raw refresh token: passed
- Old session revoked on refresh rotation: passed
- `audit_logs` auth actions recorded: passed
- `apps/web`: untouched

### M5

- `prisma:generate`: passed
- `db:status`: clean after starting Docker services
- API build: passed
- API lint: passed
- `verify:m5`: passed (`ok: true`, `phoneVerified: true`, `backupCodesReturned: 10`)
- WhatsApp Cloud sender stays disabled unless `WHATSAPP_CLOUD_ENABLED=true` (validated env)


### M6

- `prisma:generate`: passed
- API build: passed
- API lint: passed
- `verify:m6`: passed (`ok: true`, `isHost: true`, `hostCategory: real_estate`, `hostSubtype: individual`)

### M8

- `prisma:generate`: passed
- `db:status`: clean
- API build: passed
- API lint: passed
- `verify:m8`: passed (`ok: true`, `approvedSubmissionId`, `rejectedSubmissionId`)
- Approved submission: `status=approved`, `reviewedAt` set, `expiresAt` set +2 years, `host_profiles.is_verified=true`.
- Rejected submission: `status=rejected`, `reviewedAt` set, `rejectionReason` set, host profile unchanged.
- `admin.kyc.approved` and `admin.kyc.rejected` audit logs present.
- Double-review correctly blocked with `KYC_ALREADY_REVIEWED`.
- Admin queue response contains no raw MinIO storage keys.

### M7

- `prisma:generate`: passed
- `db:status`: clean
- API build: passed
- API lint: passed
- `verify:m7`: passed (`ok: true`, `status: pending`, `hostVerified: false`)
- KYC uploads stay private in MinIO and safe read endpoints do not return raw storage keys.

### M9

- `web lint`: passed
- `web build`: passed
- `api lint`: passed
- `api build`: passed
- `api verify:m8`: passed (`ok: true`) while Docker services were running and healthy.
- Manual browser smoke test: passed on 2026-05-07.
  - Signup through BFF: passed.
  - Email verification through BFF + CSRF: passed.
  - Login + login intent: passed.
  - Host apply + phone OTP + become-host: passed.
  - KYC page upload/submit via BFF: passed.
- Implemented scope in web:
  - BFF routes under `apps/web/app/api/*` for auth/me/otp/2fa/kyc.
  - httpOnly auth cookies (access + refresh), refresh retry-on-401 for protected BFF routes, and cookie clear on session expiry.
  - CSRF double-submit (`GET /api/csrf` + `X-CSRF-Token` checks for state-changing routes).
  - Auth/host forms moved from mock submit to real BFF calls with Arabic error states + 2FA challenge handling.
  - Minimal KYC UI page at `/become-a-host/kyc` with upload/submit/history via BFF only.
- M9 is closed. Future UX/product naming notes are tracked in `docs/UX_BACKLOG.md` and are not blockers for Phase 2 M9.

### M10

- Implemented password reset:
  - `POST /v1/auth/password-reset/request`
  - `POST /v1/auth/password-reset/confirm`
  - BFF mirrors:
    - `POST /api/auth/password-reset/request`
    - `POST /api/auth/password-reset/confirm`
- Password reset request returns generic success for unknown emails to avoid account enumeration.
- Reset tokens are long opaque tokens stored hashed in `otp_codes` with `purpose=password_reset`.
- Successful reset revokes existing auth sessions for that user.
- Added focused verification script:
  - `npx pnpm@9.15.4 --filter api verify:m10`
- `verify:m10`: passed (`ok: true`) with Docker services running.
- Final gates passed:
  - `web lint`
  - `web build`
  - `api lint`
  - `api build`
  - `api verify:m8`
  - `api verify:m10`
- M10 decisions:
  - SMS is not a Phase 2 requirement anymore; WhatsApp provider abstraction/prep is the selected channel path, with mock provider as local default and real WhatsApp behind env flags.
  - Language/i18n preference UI is deferred until the full site structure is stable.
  - Dashboard/profile UI is outside Phase 2. Current `/dashboard` 404 is tracked as a future UX/product item.
  - KYC approval is currently API/admin-service based through `/v1/admin/kyc/*`; admin UI is a later phase.
  - Mandatory 2FA enforcement for hosts/admins remains a pre-production security hardening item, not a blocker for closing Phase 2 foundation.

## Standard Verification Commands

Run from repo root:

```powershell
npx pnpm@9.15.4 --filter api prisma:generate
npx pnpm@9.15.4 db:status
npx pnpm@9.15.4 --filter api build
npx pnpm@9.15.4 --filter api lint
npx pnpm@9.15.4 --filter api verify:m8
npx pnpm@9.15.4 --filter api verify:m10
```

If Docker services are needed:

```powershell
docker compose -f infrastructure/docker-compose.yml up -d
docker compose -f infrastructure/docker-compose.yml ps
```

Expected services:

- `suknaa_postgres`
- `suknaa_redis`
- `suknaa_minio`

## M4 — Auth Core Scope

M4 should implement only core authentication:

- Move/shared auth schemas into `packages/types`.
- `PasswordService` using argon2id settings from `docs/SECURITY.md`.
- `PasswordBreachChecker` interface with mock provider for now.
- `TokensService` for access/refresh token handling.
- Signup.
- Email verification.
- Login.
- Refresh token rotation.
- Logout and logout-all.
- Basic session listing/revocation.
- Basic decorators/guards needed for `/me`.

M4 should not implement:

- Real WhatsApp provider.
- OTP endpoints, unless only a tiny email-verification token helper is needed.
- TOTP/2FA.
- KYC upload.
- Admin KYC review.
- Bookings/payments/chat/maps.
- Frontend BFF integration.

## M4 Exit Criteria

- `POST /v1/auth/signup` works.
- Email verification flow works through mock/dev outbox.
- `POST /v1/auth/login` works for verified users.
- Refresh token is stored hashed in `auth_sessions`.
- Refresh rotates tokens and revokes the old session.
- Logout revokes the current session.
- `/v1/me` or equivalent current-user endpoint works behind auth guard.
- Passwords and tokens are not logged.
- Standard verification commands pass.
- `ai_memory.md` is updated.

## Notes

- WhatsApp is the likely future provider for phone verification, but it remains deferred. Keep using provider-agnostic messaging.
- HIBP real integration can be deferred, but `PasswordBreachChecker` should exist so it can be enabled later without redesigning auth.
- Keep guest and host intent separate from real authorization. Security must use roles and service-layer checks.
- Do not weaken security for speed.
