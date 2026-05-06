import "reflect-metadata";
import { readFileSync, readdirSync } from "node:fs";
import { inspect } from "node:util";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { generate } from "otplib";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { OtpService } from "../src/modules/auth/services/otp.service";
import { TwoFactorService } from "../src/modules/auth/services/two-factor.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";

async function readLatestOutboxOtpCode(): Promise<string> {
  const outboxDir = path.resolve(process.cwd(), ".dev-outbox");
  const files = readdirSync(outboxDir).sort();
  const newest = files.at(-1);
  if (!newest) {
    throw new Error("No mock outbox files");
  }
  const raw = readFileSync(path.join(outboxDir, newest), "utf8");
  const json = JSON.parse(raw) as { body: string };
  const match = json.body.match(/\b(\d{6})\b/);
  if (!match) {
    throw new Error("6-digit OTP not found in outbox body");
  }
  return match[1];
}

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });
  const auth = app.get(AuthService);
  const otp = app.get(OtpService);
  const twoFa = app.get(TwoFactorService);
  const prisma = app.get(PrismaService);

  const ctx = {
    ipAddress: "127.0.0.1",
    userAgent: "m5-manual-script",
    requestId: `req-${Date.now()}`,
  };

  const phone = "+441632960961";

  // --- User A: full M5 path (OTP + 2FA) ---
  const emailA = `m5_${Date.now()}@example.com`;
  const signupA = await auth.signup(
    {
      fullName: "M5 Full User",
      email: emailA,
      password: "Passw0rd1234",
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );

  const outboxDir = path.resolve(process.cwd(), ".dev-outbox");
  const verifyFile = readdirSync(outboxDir).sort().at(-1);
  if (!verifyFile) throw new Error("No outbox for email verification");
  const verifyRaw = readFileSync(path.join(outboxDir, verifyFile), "utf8");
  const verifyJson = JSON.parse(verifyRaw) as { body: string };
  const emailTokenMatch = verifyJson.body.match(/([A-Za-z0-9_-]{32,})/);
  if (!emailTokenMatch) throw new Error("Email token missing");
  await auth.verifyEmail(emailA, emailTokenMatch[1], ctx);

  const loginA1 = await auth.login(
    { email: emailA, password: "Passw0rd1234", rememberMe: false },
    ctx,
  );
  if (
    !("accessToken" in loginA1) ||
    typeof loginA1.accessToken !== "string" ||
    "requires_2fa" in loginA1
  ) {
    throw new Error("Expected normal login tokens before 2FA is enabled");
  }

  await otp.requestPhoneVerificationOtp(
    signupA.userId,
    {
      purpose: "phone_verification",
      channel: "phone",
      destination: phone,
    },
    ctx,
  );
  const smsCode = await readLatestOutboxOtpCode();
  await otp.verifyPhoneOtp(
    signupA.userId,
    {
      purpose: "phone_verification",
      destination: phone,
      code: smsCode,
    },
    ctx,
  );

  const userAfterPhone = await prisma.user.findUniqueOrThrow({
    where: { id: signupA.userId },
    select: { phone: true, phoneVerified: true },
  });
  if (userAfterPhone.phone !== phone || !userAfterPhone.phoneVerified) {
    throw new Error("Phone verification fields not updated");
  }

  const setup = await twoFa.setupTotp(signupA.userId, ctx);
  const confirmTok = await generate({ secret: setup.manualEntryKey });
  const confirm = await twoFa.confirmTotp(signupA.userId, confirmTok, ctx);
  if (confirm.backupCodes.length !== 10) {
    throw new Error("Expected 10 backup codes");
  }

  const loginChallenge = await auth.login(
    { email: emailA, password: "Passw0rd1234", rememberMe: false },
    ctx,
  );
  if (
    !("requires_2fa" in loginChallenge) ||
    !loginChallenge.requires_2fa ||
    typeof loginChallenge.mfa_token !== "string"
  ) {
    throw new Error("Expected requires_2fa + mfa_token after enabling 2FA");
  }

  const mfaTok = await generate({ secret: setup.manualEntryKey });
  const loginDone = await auth.completeMfaLogin(loginChallenge.mfa_token, mfaTok, ctx);
  if (!("accessToken" in loginDone) || typeof loginDone.accessToken !== "string") {
    throw new Error("Expected tokens after MFA completion");
  }

  const backupPlain = confirm.backupCodes[0];
  const loginChallenge2 = await auth.login(
    { email: emailA, password: "Passw0rd1234", rememberMe: false },
    ctx,
  );
  if (!("mfa_token" in loginChallenge2) || typeof loginChallenge2.mfa_token !== "string") {
    throw new Error("Expected second MFA challenge");
  }
  await auth.completeMfaLogin(loginChallenge2.mfa_token, backupPlain, ctx);

  // --- User B: no 2FA — login must stay M4-style ---
  const emailB = `m5_plain_${Date.now()}@example.com`;
  await auth.signup(
    {
      fullName: "M5 Plain User",
      email: emailB,
      password: "Passw0rd1234",
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );
  const newestForB = readdirSync(outboxDir).sort().at(-1);
  if (!newestForB) {
    throw new Error("No outbox file for user B verification");
  }
  const rawB = readFileSync(path.join(outboxDir, newestForB), "utf8");
  const tokB = JSON.parse(rawB) as { body: string };
  const mB = tokB.body.match(/([A-Za-z0-9_-]{32,})/);
  if (!mB) throw new Error("Email token B missing");
  await auth.verifyEmail(emailB, mB[1], ctx);
  const loginB = await auth.login(
    { email: emailB, password: "Passw0rd1234", rememberMe: false },
    ctx,
  );
  if ("requires_2fa" in loginB && loginB.requires_2fa) {
    throw new Error("Plain user login must not require 2FA");
  }
  if (!("accessToken" in loginB)) {
    throw new Error("Plain user expected access token");
  }

  const auditActions = [
    "auth.otp_requested",
    "auth.phone_verified",
    "auth.2fa_setup_started",
    "auth.2fa_enabled",
    "auth.2fa_challenge",
    "auth.2fa_success",
    "auth.login",
  ];
  const auditWhere = await prisma.auditLog.findMany({
    where: {
      actorUserId: signupA.userId,
      action: { in: auditActions },
    },
    select: { action: true },
  });
  const seen = new Set(auditWhere.map((a) => a.action));
  const missing = auditActions.filter((a) => !seen.has(a));
  if (missing.length > 0) {
    throw new Error(`Missing audit actions: ${missing.join(", ")}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        userA: signupA.userId,
        phoneVerified: userAfterPhone.phoneVerified,
        backupCodesReturned: confirm.backupCodes.length,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("M5 manual verification failed");
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.stack ?? error.message : inspect(error));
  process.exit(1);
});
