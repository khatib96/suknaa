import "reflect-metadata";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { HttpException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { HostCategory, HostSubtype, OtpChannel, OtpPurpose, WithdrawalSchedule } from "@prisma/client";
import type { INestApplicationContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { OtpService } from "../src/modules/auth/services/otp.service";
import { KycService } from "../src/modules/kyc/kyc.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";
import { RedisService } from "../src/shared/redis/redis.service";

const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907724de0000000c49444154789c6360000000020001e527d4a20000000049454e44ae426082",
  "hex",
);

interface OutboxMessage {
  body: string;
  metadata?: {
    kind?: string;
    userId?: string;
  };
}

function readOutboxToken(params: {
  kind: string;
  userId: string;
  pattern: RegExp;
}): string {
  const outboxDir = path.resolve(process.cwd(), ".dev-outbox");
  const files = readdirSync(outboxDir).sort().reverse();
  for (const file of files) {
    const raw = readFileSync(path.join(outboxDir, file), "utf8");
    const parsed = JSON.parse(raw) as OutboxMessage;
    if (parsed.metadata?.kind !== params.kind || parsed.metadata.userId !== params.userId) {
      continue;
    }
    const match = parsed.body.match(params.pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  throw new Error(`Outbox token not found for ${params.kind}`);
}

function testClientIp(runId: string, scope: string): string {
  const digest = createHash("sha256").update(`${runId}:${scope}`).digest();
  const a = 10;
  const b = digest.readUInt8(0) % 255 || 1;
  const c = digest.readUInt8(1) % 255 || 1;
  const d = digest.readUInt8(2) % 255 || 1;
  return `${a}.${b}.${c}.${d}`;
}

function ctxForScoped(runId: string, scope: string) {
  return {
    ipAddress: testClientIp(runId, scope),
    userAgent: `auth-flows-test/${scope}`,
    requestId: `req-${runId}-${scope}`,
  };
}

function authUser(userId: string) {
  return {
    sub: userId,
    isGuest: true,
    isHost: false,
    isAdmin: false,
    isSuperAdmin: false,
    lastLoginAs: "guest" as const,
  };
}

function assertHttpException(err: unknown, status: number, code: string): void {
  assert.ok(err instanceof HttpException, `expected HttpException, got ${String(err)}`);
  assert.equal(err.getStatus(), status);
  const body = err.getResponse();
  assert.ok(body && typeof body === "object" && "code" in body);
  assert.equal((body as { code: string }).code, code);
}

async function assertRejects(
  promise: Promise<unknown>,
  check: (err: unknown) => void,
): Promise<void> {
  try {
    await promise;
    assert.fail("expected rejection");
  } catch (err) {
    check(err);
  }
}

describe("Focused auth flows (Phase 2.5 M4)", () => {
  const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  let app: INestApplicationContext;
  let auth: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let redis: RedisService;
  let otp: OtpService;
  let kyc: KycService;

  before(async () => {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
      abortOnError: false,
    });
    auth = app.get(AuthService);
    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    redis = app.get(RedisService);
    otp = app.get(OtpService);
    kyc = app.get(KycService);
    await redis.ping();
  });

  after(async () => {
    await app.close();
  });

  it("signup succeeds for a new user", async () => {
    const email = `af_${runId}_new@example.com`;
    const ctx = ctxForScoped(runId, "signup");
    const out = await auth.signup(
      {
        fullName: "Auth Flow User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    assert.match(out.userId, /^[0-9a-f-]{36}$/i);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: out.userId } });
    assert.equal(row.email, email.toLowerCase());
  });

  it("duplicate email is rejected", async () => {
    const email = `af_${runId}_dup@example.com`;
    const ctxFirst = ctxForScoped(runId, "dup-first");
    const ctxSecond = ctxForScoped(runId, "dup-second");
    await auth.signup(
      {
        fullName: "Dup A",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctxFirst,
    );
    await assertRejects(
      auth.signup(
        {
          fullName: "Dup B",
          email,
          password: "Passw0rd9999",
          preferredLanguage: "en",
          marketingOptIn: false,
        },
        ctxSecond,
      ),
      (e) => assertHttpException(e, 409, "EMAIL_ALREADY_EXISTS"),
    );
  });

  it("email verification works", async () => {
    const email = `af_${runId}_verify@example.com`;
    const ctx = ctxForScoped(runId, "verify");
    const { userId } = await auth.signup(
      {
        fullName: "Verify User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const token = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    const verified = await auth.verifyEmail(email, token, ctx);
    assert.equal(verified.verified, true);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    assert.equal(user.emailVerified, true);
  });

  it("login rejects invalid password", async () => {
    const email = `af_${runId}_badpw@example.com`;
    const ctx = ctxForScoped(runId, "badpw");
    const { userId } = await auth.signup(
      {
        fullName: "Bad Pw User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const token = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    await auth.verifyEmail(email, token, ctx);
    await assertRejects(
      auth.login({ email, password: "WrongPassw0rd999", rememberMe: false }, ctx),
      (e) => assertHttpException(e, 401, "INVALID_CREDENTIALS"),
    );
  });

  it("refresh rotation revokes the old session", async () => {
    const email = `af_${runId}_refresh@example.com`;
    const ctx = ctxForScoped(runId, "refresh");
    const { userId } = await auth.signup(
      {
        fullName: "Refresh User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const ev = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    await auth.verifyEmail(email, ev, ctx);
    const login = await auth.login({ email, password: "Passw0rd1234", rememberMe: false }, ctx);
    if (!("refreshToken" in login)) {
      assert.fail("expected token login");
    }
    const sessionId1 = login.refreshToken.split(".")[0] ?? "";
    assert.ok(sessionId1.length > 0);
    const refreshed = await auth.refresh(login.refreshToken, ctx);
    if (!("refreshToken" in refreshed)) {
      assert.fail("expected refresh tokens");
    }
    const oldRow = await prisma.authSession.findUniqueOrThrow({ where: { id: sessionId1 } });
    assert.ok(oldRow.revokedAt !== null);
    assert.notEqual(refreshed.refreshToken, login.refreshToken);
  });

  it("logout revokes session", async () => {
    const email = `af_${runId}_logout@example.com`;
    const ctx = ctxForScoped(runId, "logout");
    const { userId } = await auth.signup(
      {
        fullName: "Logout User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const ev = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    await auth.verifyEmail(email, ev, ctx);
    const login = await auth.login({ email, password: "Passw0rd1234", rememberMe: false }, ctx);
    if (!("refreshToken" in login)) {
      assert.fail("expected token login");
    }
    const sessionId = login.refreshToken.split(".")[0] ?? "";
    await auth.logout(login.refreshToken, ctx);
    const row = await prisma.authSession.findUniqueOrThrow({ where: { id: sessionId } });
    assert.ok(row.revokedAt !== null);
    await assertRejects(
      auth.refresh(login.refreshToken, ctx),
      (e) => assertHttpException(e, 401, "SESSION_REVOKED"),
    );
  });

  it("password reset request returns generic success for unknown email", async () => {
    const ctx = ctxForScoped(runId, "pw-unknown");
    const r = await auth.requestPasswordReset(`missing_${runId}@example.com`, ctx);
    assert.equal(r.requested, true);
  });

  it("password reset confirm changes password and revokes existing sessions", async () => {
    const email = `af_${runId}_pwreset@example.com`;
    const ctx = ctxForScoped(runId, "pwreset");
    const oldPassword = "Passw0rd1234";
    const newPassword = "NewPassw0rd5678";
    const { userId } = await auth.signup(
      {
        fullName: "Pw Reset User",
        email,
        password: oldPassword,
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const ev = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    await auth.verifyEmail(email, ev, ctx);
    const firstLogin = await auth.login({ email, password: oldPassword, rememberMe: false }, ctx);
    if (!("refreshToken" in firstLogin)) {
      assert.fail("expected token login");
    }
    await auth.requestPasswordReset(email, ctx);
    const resetToken = readOutboxToken({
      kind: "password_reset",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    const reset = await auth.confirmPasswordReset(email, resetToken, newPassword, ctx);
    assert.equal(reset.reset, true);
    assert.ok(reset.revokedSessions >= 1);
    await assertRejects(
      auth.refresh(firstLogin.refreshToken, ctx),
      (e) => assertHttpException(e, 401, "SESSION_REVOKED"),
    );
    await assertRejects(
      auth.login({ email, password: oldPassword, rememberMe: false }, ctx),
      (e) => assertHttpException(e, 401, "INVALID_CREDENTIALS"),
    );
    const secondLogin = await auth.login({ email, password: newPassword, rememberMe: false }, ctx);
    assert.ok("accessToken" in secondLogin);
    const claims = await jwt.verifyAsync(secondLogin.accessToken);
    assert.equal(typeof claims.sub, "string");
  });

  it("auth login rate limit returns 429 AUTH_LOGIN_RATE_LIMITED on 6th bad attempt", async () => {
    const email = `af_${runId}_rl@example.com`;
    const ctx = ctxForScoped(runId, "rl");
    const rlKeyMaterial = `login|v1|${ctx.ipAddress}|${email.toLowerCase()}`;
    const suffix = createHash("sha256").update(rlKeyMaterial, "utf8").digest("hex").slice(0, 32);
    await redis.client.del(redis.buildKey(`auth:rl:login:${suffix}`));
    for (let i = 1; i <= 5; i += 1) {
      await assertRejects(
        auth.login({ email, password: "WrongPassword999!", rememberMe: false }, ctx),
        (e) => assertHttpException(e, 401, "INVALID_CREDENTIALS"),
      );
    }
    try {
      await auth.login({ email, password: "WrongPassword999!", rememberMe: false }, ctx);
      assert.fail("expected 429 on 6th attempt");
    } catch (e) {
      assert.ok(e instanceof HttpException);
      assert.equal(e.getStatus(), 429);
      const body = e.getResponse() as unknown;
      assert.ok(body && typeof body === "object" && "code" in body);
      assert.equal((body as { code: string }).code, "AUTH_LOGIN_RATE_LIMITED");
      const b = body as { message?: unknown; message_en?: unknown };
      assert.equal(typeof b.message, "string");
      assert.ok((b.message as string).length > 0);
      assert.equal(typeof b.message_en, "string");
      assert.ok((b.message_en as string).length > 0);
    }
  });

  it("become-host is blocked before phone verification", async () => {
    const email = `af_${runId}_nophone@example.com`;
    const ctx = ctxForScoped(runId, "nophone");
    const { userId } = await auth.signup(
      {
        fullName: "No Phone User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const ev = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    await auth.verifyEmail(email, ev, ctx);
    await assertRejects(
      auth.becomeHost(
        authUser(userId),
        {
          hostCategory: HostCategory.real_estate,
          hostSubtype: HostSubtype.individual,
          displayName: "Should Fail",
          withdrawalSchedule: WithdrawalSchedule.monthly,
        },
        ctx,
      ),
      (e) => assertHttpException(e, 403, "PHONE_VERIFICATION_REQUIRED"),
    );
  });

  it("KYC submission rejects missing ownership proof for real_estate individual", async () => {
    const email = `af_${runId}_kyc@example.com`;
    const ctx = ctxForScoped(runId, "kyc");
    const { userId } = await auth.signup(
      {
        fullName: "KYC User",
        email,
        password: "Passw0rd1234",
        preferredLanguage: "ar",
        marketingOptIn: false,
      },
      ctx,
    );
    const ev = readOutboxToken({
      kind: "email_verification",
      userId,
      pattern: /([A-Za-z0-9_-]{32,})/,
    });
    await auth.verifyEmail(email, ev, ctx);
    const phone = `+1555${runId.slice(-7)}`;
    await otp.requestPhoneVerificationOtp(
      userId,
      { purpose: OtpPurpose.phone_verification, channel: OtpChannel.phone, destination: phone },
      ctx,
    );
    const phoneCode = readOutboxToken({
      kind: "phone_verification_otp",
      userId,
      pattern: /\b(\d{6})\b/,
    });
    await otp.verifyPhoneOtp(
      userId,
      { purpose: OtpPurpose.phone_verification, destination: phone, code: phoneCode },
      ctx,
    );
    await auth.becomeHost(
      authUser(userId),
      {
        hostCategory: HostCategory.real_estate,
        hostSubtype: HostSubtype.individual,
        displayName: "KYC Host",
        withdrawalSchedule: WithdrawalSchedule.monthly,
      },
      ctx,
    );
    const [idFront, idBack, selfie] = await Promise.all([
      kyc.uploadDocument({
        userId,
        fileKind: "id_front",
        fileBuffer: TINY_PNG,
        declaredMimeType: "image/png",
        sizeBytes: TINY_PNG.byteLength,
      }),
      kyc.uploadDocument({
        userId,
        fileKind: "id_back",
        fileBuffer: TINY_PNG,
        declaredMimeType: "image/png",
        sizeBytes: TINY_PNG.byteLength,
      }),
      kyc.uploadDocument({
        userId,
        fileKind: "selfie",
        fileBuffer: TINY_PNG,
        declaredMimeType: "image/png",
        sizeBytes: TINY_PNG.byteLength,
      }),
    ]);
    await assertRejects(
      kyc.submitKyc({
        userId,
        payload: {
          idDocumentType: "national_id",
          idFrontKey: idFront.storageKey,
          idBackKey: idBack.storageKey,
          selfieKey: selfie.storageKey,
        },
        ctx,
      }),
      (e) => {
        assertHttpException(e, 400, "KYC_INVALID_DOCS");
        const body = (e as HttpException).getResponse() as {
          details?: { missingFields?: string[] };
        };
        assert.ok(body.details?.missingFields?.includes("ownershipProofKey"));
      },
    );
  });
});
