# Phase 2 Tracker — Backend Foundation + Auth + KYC

> Purpose: a simple progress tracker for Mohammad. This file shows where Phase 2 stands, what each milestone means, and when it is safe to move forward.

## Current Status

**Current milestone:** M5 — OTP + Phone Verification + 2FA  
**Completed:** M1, M2, M2 cleanup, M3  
**Not started:** M5+

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
| M5 | OTP + Phone Verification + 2FA | Not started | Provider-agnostic OTP flow, mock message provider, TOTP setup/confirm, backup codes. |
| M6 | Login Intent + Roles + Become Host | Not started | Guest/host intent, roles guard, become-host endpoint, host profile creation. |
| M7 | KYC Submission + MinIO | Not started | KYC document validation, upload flow, private MinIO storage, per-subtype requirements. |
| M8 | Admin KYC Review + Audit Logs | Not started | Admin queue, approve/reject, KYC expiry, audit logs for decisions. |
| M9 | Frontend BFF Integration | Not started | Next.js route handlers, connect existing auth/host forms to real API. |
| M10 | Tests + Docs Closure | Not started | Focused auth/KYC tests, Swagger review, docs and memory final update. |

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

## Standard Verification Commands

Run from repo root:

```powershell
npx pnpm@9.15.4 --filter api prisma:generate
npx pnpm@9.15.4 db:status
npx pnpm@9.15.4 --filter api build
npx pnpm@9.15.4 --filter api lint
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
