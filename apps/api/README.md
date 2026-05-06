# Suknaa API

NestJS backend for Suknaa. In production it will live behind `api.suknaa.com`; locally it runs on port `3001` and is reached by the public web app through the Next.js BFF (`apps/web/app/api/*`).

## Phase 2 Status - Milestone 2 of 10

Milestone 1 scaffolded the NestJS API, Zod env validation, Pino logger, Swagger, Prisma/Redis/MinIO shared services, and `GET /v1/health`.

Milestone 2 added the first Prisma schema and migrations for the Phase 2 core tables:

- `users`
- `host_profiles`
- `kyc_submissions`
- `auth_sessions`
- `otp_codes`
- `two_factor_secrets`
- `audit_logs`

No Auth/KYC services, controllers, BFF routes, or admin UI are implemented yet.

See [docs/BUILD_PLAN.md](../../docs/BUILD_PLAN.md) Phase 2 for the milestone breakdown.

## Local Setup

1. Make sure the local infra is running:

   ```powershell
   docker compose -f infrastructure/docker-compose.yml up -d
   ```

2. Copy env:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```

3. Install from the repo root:

   ```powershell
   npx pnpm@9.15.4 install
   ```

4. Apply database migrations:

   ```powershell
   npx pnpm@9.15.4 db:migrate
   ```

5. Generate the Prisma client:

   ```powershell
   npx pnpm@9.15.4 --filter api prisma:generate
   ```

6. Run dev:

   ```powershell
   npx pnpm@9.15.4 --filter api dev
   ```

Then:

- Health: <http://localhost:3001/v1/health>
- Swagger: <http://localhost:3001/api/docs>

## Layout

```text
apps/api/
├── prisma/
│   ├── schema.prisma         # Phase 2 core auth/users/KYC/audit tables
│   └── migrations/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   └── health/           # GET /v1/health
│   └── shared/
│       ├── config/           # Zod-validated env
│       ├── prisma/           # PrismaService
│       ├── redis/            # RedisService (ioredis)
│       ├── storage/          # MinIO client wrapper
│       └── errors/           # Global exception filter (API_SPEC section 0 shape)
└── .env.example
```

## Conventions

- Strict TypeScript (`tsconfig.json`).
- Logging: Pino via `nestjs-pino`, with request IDs and PII redaction (`password`, `token`, `secret`, `password_hash`, `refresh_token`, `code`, `totp_secret`, `authorization` header, `cookie` header).
- Errors: every response shape matches `docs/API_SPEC.md` section 0 (`{ error: { code, message, message_en? }, meta: { request_id } }`).
- Money: `BIGINT` cents in DB, `bigint` in TS. Never use `number` for money. This is not yet relevant in Phase 2 M2.
