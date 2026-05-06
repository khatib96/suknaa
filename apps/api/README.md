# Suknaa API

NestJS backend for Suknaa. In production it will live behind `api.suknaa.com`; locally it runs on port `3001` and is reached by the public web app through the Next.js BFF (`apps/web/app/api/*`).

## Phase 2 Status - Milestone 3 of 10

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

Milestone 3 adds shared backend infrastructure used by future Auth/KYC flows:

- Provider-agnostic messaging abstraction in `src/shared/messaging`
- Mock message provider writing local files to `.dev-outbox/`
- Disabled WhatsApp provider stub (throws `NotImplementedException`)
- `AuditModule` + `AuditService.write()` backed by `audit_logs`
- Typed API error helpers compatible with the global exception filter
- Small low-risk helpers in `RedisService` and `StorageService`

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
│       ├── messaging/        # Provider-agnostic messaging + mock outbox
│       ├── audit/            # AuditService -> audit_logs
│       └── errors/           # Global exception filter (API_SPEC section 0 shape)
└── .env.example
```

## Conventions

- Strict TypeScript (`tsconfig.json`).
- Logging: Pino via `nestjs-pino`, with request IDs and PII redaction (`password`, `token`, `secret`, `password_hash`, `refresh_token`, `code`, `totp_secret`, `authorization` header, `cookie` header).
- Errors: every response shape matches `docs/API_SPEC.md` section 0 (`{ error: { code, message, message_en? }, meta: { request_id } }`).
- Money: `BIGINT` cents in DB, `bigint` in TS. Never use `number` for money. This is not yet relevant in Phase 2 M2.

## Milestone 3 Manual Verification

The repo currently has no real test harness for backend modules. Use the focused commands below.

1. Verify mock messaging writes a file to `.dev-outbox`:

   ```powershell
   npx pnpm@9.15.4 --filter api exec ts-node -e "import 'reflect-metadata'; import { NestFactory } from '@nestjs/core'; import { AppModule } from './src/app.module'; import { MessagingService } from './src/shared/messaging/messaging.service'; (async () => { const app = await NestFactory.createApplicationContext(AppModule, { logger: false }); const messaging = app.get(MessagingService); await messaging.send({ recipient: { channel: 'email', value: 'dev@example.com' }, subject: 'M3 Mock Message', body: 'Local development message body.' }); await app.close(); })().catch((err) => { console.error(err); process.exit(1); });"
   ```

2. Verify `AuditService.write()` inserts into `audit_logs`:

   ```powershell
   npx pnpm@9.15.4 --filter api exec ts-node -e "import 'reflect-metadata'; import { NestFactory } from '@nestjs/core'; import { AppModule } from './src/app.module'; import { AuditService } from './src/shared/audit/audit.service'; (async () => { const app = await NestFactory.createApplicationContext(AppModule, { logger: false }); const audit = app.get(AuditService); const row = await audit.write({ actorRole: 'system', action: 'm3.manual_verify', entityType: 'audit_logs', metadata: { source: 'manual-check' } }); console.log('audit_log_id', row.id); await app.close(); })().catch((err) => { console.error(err); process.exit(1); });"
   ```
