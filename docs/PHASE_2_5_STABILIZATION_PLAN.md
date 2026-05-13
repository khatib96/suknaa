# Phase 2.5 Stabilization Plan

> **Status: Completed** (documentation closure 2026-05-13)  
> Date: 2026-05-09 (plan) · Closed: 2026-05-13  
> Purpose: stabilize the Phase 2 foundation before starting Phase 3 real estate work.

**Phase 2.5 is complete.** **Phase 3 may start** when you are ready to implement real-estate scope (see `docs/BUILD_PLAN.md`). The final health gate passed: `npx pnpm@9.15.4 verify:phase2.5` (after Docker + `apps/api/.env` — see M5 below).

**Milestones M1–M6:** all delivered — reproducible web build (local fonts), Helmet + `CORS_ORIGINS`, Redis auth rate limiting, focused `node:test` auth suite, root verification gate, and this documentation closure.

## Why This Phase Exists

Phase 2 is functionally closed, but Phase 3 will add larger database models, host listing workflows, image handling, search, maps, and more frontend/backend integration. Before adding that surface area, the project needs a short stabilization pass focused on build reliability, auth hardening, and verification.

This phase is intentionally narrow. It should not add product features, rewrite the UI, or start the real estate schema.

## Current Verified State

- **Canonical gate (2026-05-13, M5)**: from repo root, with Docker (`suknaa_postgres`, `suknaa_redis`, `suknaa_minio`) and valid `apps/api/.env`, run `npx pnpm@9.15.4 verify:phase2.5` — runs `web` + `api` lint/build, `prisma validate`, and `api test`.
- Phase 2 auth/KYC implementation is documented in `docs/PHASE_2_TRACKER.md`.
- Historical note: before M1, `web build` could fail when `next/font/google` could not reach Google Fonts; M1 replaced that with local fonts.

## Corrections To The Diagnostic Report

The diagnostic report is useful as a broad review, but a few findings should not be treated as action items:

- `users.email` already has a partial unique index in the migration SQL: `users_email_unique_active` on `LOWER(email)` where `deleted_at IS NULL`.
- Local env files are ignored by Git. Root `.gitignore` covers `.env` and `.env.*`, and `apps/api/.gitignore` also ignores API env files.
- OTP already has Redis-based rate limiting. The missing gap is broader auth throttling around login/signup and related endpoints.
- CORS is not currently as urgent as rate limiting because the frontend uses BFF route handlers, but API CORS should still be configured before broader deployment.

## Goals

1. Make frontend builds reproducible without external font fetching.
2. Add basic API security headers and conservative CORS configuration.
3. Add practical rate limiting for sensitive auth endpoints.
4. Add focused automated tests around critical auth flows.
5. Add a repeatable verification gate before starting Phase 3.
6. Document what was done and what remains intentionally deferred.

## Non-Goals

- Do not start Phase 3 property schema or property UI.
- Do not perform a large `AuthService` refactor unless required by tests or security work.
- Do not split `HeroSearchBar` in this phase.
- Do not move `components/ui` into `packages/ui` in this phase.
- Do not add full i18n in this phase.
- Do not build the full profile/dashboard/admin UI in this phase.

## M1 - Reproducible Web Build

### Problem

`apps/web` uses `next/font/google` for Tajawal and Inter. Production build can fail when the build environment cannot reach Google Fonts.

### Scope

- Replace `next/font/google` with `next/font/local`.
- Add self-hosted font files under `apps/web` in a clear location such as `apps/web/assets/fonts` or `apps/web/public/fonts`.
- Preserve the current CSS variable names and typography behavior as much as possible.
- Keep Arabic RTL rendering stable.
- Avoid broad visual redesign.

### Acceptance Criteria

- `npx pnpm@9.15.4 --filter web lint` passes.
- `npx pnpm@9.15.4 --filter web build` passes.
- The app no longer fetches Google Fonts during build.
- `apps/web/app/layout.tsx` no longer imports from `next/font/google`.

### Notes

If font files are not already present locally, use a reliable self-hosting approach and keep license metadata or source notes in the font folder.

### Completed (2026-05-09)

- Local Tajawal + Inter under `apps/web/assets/fonts/`; `next/font/local` in `apps/web/app/layout.tsx`; acceptance criteria verified.

## M2 - API Security Headers And CORS

### Problem

The API currently configures the global prefix and trust proxy, but does not set HTTP security headers through Helmet and does not define explicit CORS policy.

### Scope

- Add `helmet` to `apps/api`.
- Configure Helmet in `apps/api/src/main.ts` (CSP disabled temporarily for Swagger UI compatibility at `/api/docs`; strict CSP deferred until production hardening or hosting Swagger separately — CSP itself remains important).
- Add env-driven CORS configuration via comma-separated **`CORS_ORIGINS`** (e.g. `http://localhost:3000,http://127.0.0.1:3000`, plus future values like `https://suknaa.com`).
- Update `apps/api/src/shared/config/env.schema.ts`.
- Update `apps/api/.env.example`.
- Keep Swagger working locally.

### Acceptance Criteria

- `api lint` passes.
- `api build` passes.
- Swagger remains reachable locally at `/api/docs`.
- API responses include security headers.
- CORS allows configured frontend origins only.

### Completed (2026-05-10)

- `helmet` + `CORS_ORIGINS` in API; Swagger preserved; acceptance criteria verified.

## M3 - Auth Rate Limiting

### Problem

Sensitive auth flows need throttling against brute force and abuse. OTP has some protection, but login/signup and some related flows need broader coverage.

### Scope

Use a conservative Redis-based limiter, preferably building on the existing `RedisService.incrementWithTtl`, unless a Nest-native approach fits more cleanly.

Initial limits:

| Flow | Suggested limit | Keying strategy |
|---|---:|---|
| `POST /v1/auth/login` | 5 per minute | IP + normalized email |
| `POST /v1/auth/signup` | 3 per hour | IP |
| `POST /v1/auth/password-reset/request` | 5 per hour | IP + normalized email |
| `POST /v1/auth/password-reset/confirm` | 5 per hour | IP + normalized email or token fingerprint |
| MFA / 2FA confirmation | 5 per 10 minutes | user/session + IP |

### Acceptance Criteria

- Excess attempts return the existing standardized rate-limited API error shape.
- Normal successful auth flows still work.
- Rate limit keys do not store raw secrets or raw tokens.
- Tests or verification scripts cover at least one rate-limited path.

### Completed (2026-05-13)

- **`AuthRateLimitService`**: [`apps/api/src/modules/auth/services/auth-rate-limit.service.ts`](apps/api/src/modules/auth/services/auth-rate-limit.service.ts) uses `RedisService.incrementWithTtl` with namespaced keys `auth:rl:<flow>:<sha256-truncated>`; key material never includes raw reset tokens (confirm path hashes the token in-memory, then hashes the combined material for the Redis suffix).
- **`AuthService` wiring**: consume at start of `login` and `signup`; `requestPasswordReset` after email normalize and **before** the “user not found” early return (Redis throttling without weakening enumeration-safe 200 responses); `confirmPasswordReset` at start; `completeMfaLogin` after a valid MFA challenge JWT is resolved and the user row is loaded, **before** `verifySecondFactor` (key = IP + `userId`). Existing DB-based password-reset email cap and OTP Redis limits unchanged.
- **HTTP 429**: `rateLimitedError()` with codes `AUTH_LOGIN_RATE_LIMITED`, `AUTH_SIGNUP_RATE_LIMITED`, `AUTH_PASSWORD_RESET_RATE_LIMITED`, `AUTH_MFA_RATE_LIMITED` (Arabic `message` + English `message_en`).
- **Config**: `AUTH_RL_*` variables in [`apps/api/src/shared/config/env.schema.ts`](apps/api/src/shared/config/env.schema.ts) with defaults matching the table above; documented in [`apps/api/.env.example`](apps/api/.env.example).
- **Verification gate**: `npx pnpm@9.15.4 --filter api verify:m3` compiles and runs [`apps/api/scripts/manual-m3-verify.ts`](apps/api/scripts/manual-m3-verify.ts) (Nest `AppModule` context): clears the probe Redis key, performs five failed logins expecting `401`/`INVALID_CREDENTIALS`, sixth expects `429`/`AUTH_LOGIN_RATE_LIMITED` with non-empty `message`/`message_en`. Requires local **PostgreSQL + Redis** (e.g. `docker compose -f infrastructure/docker-compose.yml up -d`) and a valid `apps/api/.env`.

## M4 - Focused Auth Tests

### Problem

Manual verification scripts exist, but there is no conventional test harness for critical auth behavior. Phase 3 should not be built on auth flows that can regress silently.

### Scope

Add a minimal test setup for the API. Start with critical service-level or integration-style tests, depending on what fits the existing Nest/Prisma setup with least friction.

Initial test targets:

- signup succeeds for a new user.
- duplicate email is rejected.
- email verification works.
- login rejects invalid password.
- refresh rotation revokes the old session.
- logout revokes session.
- password reset request avoids account enumeration.
- password reset confirm changes password and revokes sessions.
- OTP/rate limit path is enforced.
- become-host permission/role transition stays valid.
- KYC requirement validation rejects missing required documents.

### Acceptance Criteria

- A single command runs the focused tests.
- Tests can run from repo root.
- Tests are documented in this file or `PHASE_2_TRACKER.md`.
- Tests do not require manual browser interaction.

### Completed (2026-05-13)

- **Harness**: Node.js built-in test runner (`node --test`); TypeScript compiled via [`apps/api/tsconfig.tests.json`](apps/api/tsconfig.tests.json) to [`.tmp-tests/`](apps/api/.gitignore) (gitignored), then `node --test .tmp-tests/tests/auth-flows.test.js`.
- **Suite**: [`apps/api/tests/auth-flows.test.ts`](apps/api/tests/auth-flows.test.ts) — `NestFactory.createApplicationContext(AppModule, { logger: false, abortOnError: false })`, unique `runId` + per-scope synthetic client IPs (`SHA256(runId:scope)` → `10.x.x.x`) to avoid cross-test Redis signup rate-limit collisions when tests run concurrently; tokens read from `.dev-outbox` (same pattern as [`manual-m10-verify.ts`](apps/api/scripts/manual-m10-verify.ts)); `after` closes the Nest context.
- **Command**: `npx pnpm@9.15.4 --filter api test` (from repo root) builds `@suknaa/types`, compiles tests, runs the suite. Manual scripts `verify:m3` / `verify:m5` / … / `verify:m10` unchanged.
- **Coverage implemented**: (1) signup success, (2) duplicate email `409`/`EMAIL_ALREADY_EXISTS`, (3) email verification, (4) invalid password login `401`, (5) refresh rotates and revokes prior session, (6) logout revokes session and refresh returns `401`/`SESSION_REVOKED`, (7) password reset request for unknown email returns `{ requested: true }`, (8) reset confirm updates password and revokes sessions, (9) sixth failed login returns `429`/`AUTH_LOGIN_RATE_LIMITED`, (10) become-host blocked with `403`/`PHONE_VERIFICATION_REQUIRED` before phone OTP, (11) KYC submit without `ownershipProofKey` for real_estate individual → `400`/`KYC_INVALID_DOCS` with `ownershipProofKey` in `details.missingFields`.
- **Prerequisites**: Docker Compose Postgres + Redis + MinIO (see `infrastructure/docker-compose.yml`), valid `apps/api/.env`, and `MESSAGE_PROVIDER=mock` with writable `.dev-outbox/` for email/OTP payloads.

## M5 - Verification Gate

### Problem

Before Phase 3, the project needs one repeatable command sequence that proves the base is healthy.

### Scope

Add either a local script or documented command sequence for Phase 2.5 verification.

Minimum gate (equivalent steps run by the root script):

```powershell
npx pnpm@9.15.4 --filter web lint
npx pnpm@9.15.4 --filter web build
npx pnpm@9.15.4 --filter api lint
npx pnpm@9.15.4 --filter api build
npx pnpm@9.15.4 --filter api exec prisma validate
npx pnpm@9.15.4 --filter api test
```

If `api test` is named differently, document the actual command.

### Acceptance Criteria

- The verification gate is clear and repeatable.
- Any required Docker services are documented.
- The gate was used before marking Phase 2.5 complete (**satisfied 2026-05-13**; final closure in M6).

### Completed (2026-05-13)

- **Root script**: [`scripts/verify-phase-2-5.mjs`](../scripts/verify-phase-2-5.mjs) runs the six commands above in order via `npx` + `child_process.spawnSync` (`stdio: 'inherit'`, `shell: true` for cross-platform `npx`), stops on first failure, and prints which step failed.
- **npm/pnpm script**: from repo root, `npx pnpm@9.15.4 verify:phase2.5` (declared in root [`package.json`](../package.json) as `node scripts/verify-phase-2-5.mjs`).
- **Docker prerequisites for `api test`**: start local dependencies first:

  ```bash
  docker compose -f infrastructure/docker-compose.yml up -d
  ```

  Required containers (names from compose): **`suknaa_postgres`**, **`suknaa_redis`**, **`suknaa_minio`**.

- **App env**: valid `apps/api/.env` (see `apps/api/.env.example`); auth tests expect `MESSAGE_PROVIDER=mock` and a writable `.dev-outbox/` for OTP/email payloads (same as M4).

**Recommended run (repo root)**:

1. `docker compose -f infrastructure/docker-compose.yml up -d`
2. `npx pnpm@9.15.4 verify:phase2.5`

## M6 - Documentation Closure

### Scope

- Update this file with actual completed status.
- Update `docs/PHASE_2_TRACKER.md` only after implementation passes.
- Optionally add a short note to `docs/BUILD_PLAN.md` that Phase 2.5 sits between Phase 2 and Phase 3.

### Acceptance Criteria

- Phase 2.5 has a clear completion record.
- Deferred items remain explicit.
- Phase 3 can start with known prerequisites satisfied.

### Completed (2026-05-13)

- **`docs/PHASE_2_5_STABILIZATION_PLAN.md`**: status set to **Completed**; M1–M6 recorded done; final gate `npx pnpm@9.15.4 verify:phase2.5` documented as passed (same prerequisites as M5: Docker `suknaa_postgres` / `suknaa_redis` / `suknaa_minio`, valid `apps/api/.env`, mock outbox for tests).
- **`docs/PHASE_2_TRACKER.md`**: current status — Phase 2 closed, Phase 2.5 stabilization complete, Phase 3 next; Phase 2.5 section (M1–M6 summary) + `verify:phase2.5` first in Standard Verification Commands.
- **`docs/BUILD_PLAN.md`**: short note between Phase 2 and Phase 3 — Phase 2.5 completed; canonical pre–Phase 3 command `npx pnpm@9.15.4 verify:phase2.5`.
- **`ai_memory.md`**: project state Phase 2.5 complete, Phase 3 next; M6 checklist closed.
- **`.cursor/rules/suknaa.mdc`**: Phase Awareness — Phase 2.5 complete, Phase 3 active next; verification gate retained.

## Recommended Execution Order

1. M1 - Reproducible Web Build. ✓
2. M2 - API Security Headers And CORS. ✓
3. M3 - Auth Rate Limiting. ✓
4. M4 - Focused Auth Tests. ✓
5. M5 - Verification Gate. ✓
6. M6 - Documentation Closure. ✓

**All milestones completed 2026-05-13.**

## Phase 2.5 Exit Criteria

Phase 2.5 is complete when:

- The frontend production build passes reliably.
- API security headers and CORS are configured.
- Sensitive auth endpoints have practical rate limits.
- Focused auth tests exist and pass.
- The verification gate passes.
- Documentation reflects the completed hardening work.

**As of 2026-05-13:** all exit criteria above are **satisfied**. Re-run `npx pnpm@9.15.4 verify:phase2.5` before major work to confirm the workspace is healthy.

## Still deferred (unchanged intent)

Items listed under **Non-Goals** above remain out of scope for Phase 2.5 (no full i18n, no `HeroSearchBar` split, no `packages/ui` move, no full profile/dashboard/admin UI in this stabilization pass). Phase 2 tracker deferred items (e.g. mandatory 2FA enforcement for hosts/admins, full admin UI) stay on the roadmap for later phases — see `docs/PHASE_2_TRACKER.md` and `docs/BUILD_PLAN.md`.

