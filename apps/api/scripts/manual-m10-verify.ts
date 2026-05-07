import "reflect-metadata";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { inspect } from "node:util";
import { NestFactory } from "@nestjs/core";
import { HostCategory, HostSubtype, OtpChannel, OtpPurpose, WithdrawalSchedule } from "@prisma/client";
import { AppModule } from "../src/app.module";
import { AdminKycService } from "../src/modules/admin/admin-kyc.service";
import { AuthService } from "../src/modules/auth/auth.service";
import { OtpService } from "../src/modules/auth/services/otp.service";
import { KycService } from "../src/modules/kyc/kyc.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";

const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907724de0000000c49444154789c6360000000020001e527d4a20000000049454e44ae426082",
  "hex",
);
const TINY_PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF", "utf8");

let currentStep = "starting";

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

async function expectBlocked(label: string, action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
  } catch {
    return;
  }
  throw new Error(`${label} was expected to fail`);
}

function authUser(userId: string, flags: { isHost?: boolean } = {}) {
  return {
    sub: userId,
    isGuest: true,
    isHost: Boolean(flags.isHost),
    isAdmin: false,
    isSuperAdmin: false,
    lastLoginAs: flags.isHost ? "host" : "guest",
  } as const;
}

async function run(): Promise<void> {
  currentStep = "create application context";
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  const auth = app.get(AuthService);
  const otp = app.get(OtpService);
  const kyc = app.get(KycService);
  const adminKyc = app.get(AdminKycService);
  const prisma = app.get(PrismaService);

  const runId = Date.now().toString();
  const ctx = { ipAddress: "127.0.0.1", userAgent: "m10-verify", requestId: `req-${runId}` };
  const email = `m10_${runId}@example.com`;
  const oldPassword = "Passw0rd1234";
  const newPassword = "NewPassw0rd5678";

  currentStep = "signup and verify email";
  const signup = await auth.signup(
    {
      fullName: "M10 Test User",
      email,
      password: oldPassword,
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );
  const emailToken = readOutboxToken({
    kind: "email_verification",
    userId: signup.userId,
    pattern: /([A-Za-z0-9_-]{32,})/,
  });
  await auth.verifyEmail(email, emailToken, ctx);

  currentStep = "login before reset";
  const firstLogin = await auth.login({ email, password: oldPassword, rememberMe: false }, ctx);
  if (!("accessToken" in firstLogin)) {
    throw new Error("Expected non-2FA login to issue tokens");
  }

  currentStep = "password reset request and confirm";
  const missingReset = await auth.requestPasswordReset(`missing_${runId}@example.com`, ctx);
  if (!missingReset.requested) {
    throw new Error("Missing-user password reset request should return generic success");
  }
  await auth.requestPasswordReset(email, ctx);
  const resetToken = readOutboxToken({
    kind: "password_reset",
    userId: signup.userId,
    pattern: /([A-Za-z0-9_-]{32,})/,
  });
  await expectBlocked("invalid password reset token", () =>
    auth.confirmPasswordReset(email, `${resetToken}x`, newPassword, ctx),
  );
  const reset = await auth.confirmPasswordReset(email, resetToken, newPassword, ctx);
  if (!reset.reset || reset.revokedSessions < 1) {
    throw new Error("Password reset should revoke existing sessions");
  }
  await expectBlocked("old refresh token after password reset", () =>
    auth.refresh(firstLogin.refreshToken, ctx),
  );
  await expectBlocked("old password login after password reset", () =>
    auth.login({ email, password: oldPassword, rememberMe: false }, ctx),
  );
  const secondLogin = await auth.login({ email, password: newPassword, rememberMe: false }, ctx);
  if (!("accessToken" in secondLogin)) {
    throw new Error("New password login should issue tokens");
  }

  currentStep = "login intent and phone verification";
  const hostIntentBefore = await auth.setLoginIntent(authUser(signup.userId), "host", ctx);
  if (!hostIntentBefore.becomeHostRequired) {
    throw new Error("Host intent should require become-host before profile exists");
  }
  await expectBlocked("become-host before phone verification", () =>
    auth.becomeHost(
      authUser(signup.userId),
      {
        hostCategory: HostCategory.real_estate,
        hostSubtype: HostSubtype.individual,
        displayName: "M10 Host",
        withdrawalSchedule: WithdrawalSchedule.monthly,
      },
      ctx,
    ),
  );

  const phone = `+1555${runId.slice(-7)}`;
  await otp.requestPhoneVerificationOtp(
    signup.userId,
    { purpose: OtpPurpose.phone_verification, channel: OtpChannel.phone, destination: phone },
    ctx,
  );
  const phoneCode = readOutboxToken({
    kind: "phone_verification_otp",
    userId: signup.userId,
    pattern: /\b(\d{6})\b/,
  });
  await expectBlocked("wrong phone OTP", () =>
    otp.verifyPhoneOtp(
      signup.userId,
      { purpose: OtpPurpose.phone_verification, destination: phone, code: "000000" },
      ctx,
    ),
  );
  await otp.verifyPhoneOtp(
    signup.userId,
    { purpose: OtpPurpose.phone_verification, destination: phone, code: phoneCode },
    ctx,
  );

  currentStep = "become-host and KYC";
  await auth.becomeHost(
    authUser(signup.userId),
    {
      hostCategory: HostCategory.real_estate,
      hostSubtype: HostSubtype.individual,
      displayName: "M10 Host",
      withdrawalSchedule: WithdrawalSchedule.monthly,
    },
    ctx,
  );

  const [idFront, idBack, selfie] = await Promise.all([
    kyc.uploadDocument({ userId: signup.userId, fileKind: "id_front", fileBuffer: TINY_PNG, declaredMimeType: "image/png", sizeBytes: TINY_PNG.byteLength }),
    kyc.uploadDocument({ userId: signup.userId, fileKind: "id_back", fileBuffer: TINY_PNG, declaredMimeType: "image/png", sizeBytes: TINY_PNG.byteLength }),
    kyc.uploadDocument({ userId: signup.userId, fileKind: "selfie", fileBuffer: TINY_PNG, declaredMimeType: "image/png", sizeBytes: TINY_PNG.byteLength }),
  ]);
  await expectBlocked("KYC missing ownership proof", () =>
    kyc.submitKyc({
      userId: signup.userId,
      payload: {
        idDocumentType: "national_id",
        idFrontKey: idFront.storageKey,
        idBackKey: idBack.storageKey,
        selfieKey: selfie.storageKey,
      },
      ctx,
    }),
  );

  const ownershipProof = await kyc.uploadDocument({
    userId: signup.userId,
    fileKind: "ownership_proof",
    fileBuffer: TINY_PDF,
    declaredMimeType: "application/pdf",
    sizeBytes: TINY_PDF.byteLength,
  });
  const submission = await kyc.submitKyc({
    userId: signup.userId,
    payload: {
      idDocumentType: "national_id",
      idFrontKey: idFront.storageKey,
      idBackKey: idBack.storageKey,
      selfieKey: selfie.storageKey,
      ownershipProofKey: ownershipProof.storageKey,
    },
    ctx,
  });
  const latest = await kyc.getLatestSubmission(signup.userId);
  const history = await kyc.getSubmissionHistory({ userId: signup.userId, limit: 5 });
  if (!latest || latest.id !== submission.id || history.items.length < 1) {
    throw new Error("KYC latest/history should include the submitted record");
  }
  if (JSON.stringify({ latest, history }).includes("kyc/")) {
    throw new Error("Safe KYC responses must not expose raw storage keys");
  }

  currentStep = "admin approve KYC and audit logs";
  const admin = await prisma.user.create({
    data: {
      email: `m10_admin_${runId}@example.com`,
      passwordHash: "not-used-in-m10-verify",
      fullName: "M10 Admin",
      isGuest: false,
      isAdmin: true,
    },
    select: { id: true },
  });
  await adminKyc.approveKyc({ adminUserId: admin.id, submissionId: submission.id, ctx });
  await expectBlocked("double-review approved KYC", () =>
    adminKyc.approveKyc({ adminUserId: admin.id, submissionId: submission.id, ctx }),
  );

  const dbHost = await prisma.hostProfile.findUniqueOrThrow({
    where: { userId: signup.userId },
    select: { isVerified: true, verifiedAt: true },
  });
  if (!dbHost.isVerified || !dbHost.verifiedAt) {
    throw new Error("Host profile should be verified after admin approval");
  }

  const auditActions = await prisma.auditLog.findMany({
    where: {
      OR: [{ actorUserId: signup.userId }, { actorUserId: admin.id }],
      action: {
        in: [
          "auth.signup",
          "auth.email_verified",
          "auth.password_reset_requested",
          "auth.password_reset_completed",
          "auth.phone_verified",
          "host.become_host",
          "kyc.submitted",
          "admin.kyc.approved",
        ],
      },
    },
    select: { action: true },
  });
  const seen = new Set(auditActions.map((row) => row.action));
  for (const action of [
    "auth.password_reset_requested",
    "auth.password_reset_completed",
    "auth.phone_verified",
    "host.become_host",
    "kyc.submitted",
    "admin.kyc.approved",
  ]) {
    if (!seen.has(action)) {
      throw new Error(`Missing audit action: ${action}`);
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: signup.userId,
        submissionId: submission.id,
        passwordResetRevokedSessions: reset.revokedSessions,
        hostVerified: dbHost.isVerified,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`M10 manual verification failed at step: ${currentStep}`);
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.stack ?? error.message : inspect(error));
  process.exit(1);
});
