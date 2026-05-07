import "reflect-metadata";
import { readFileSync, readdirSync } from "node:fs";
import { inspect } from "node:util";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { HostCategory, HostSubtype, WithdrawalSchedule } from "@prisma/client";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { KycService } from "../src/modules/kyc/kyc.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";

function readLatestEmailVerificationToken(): string {
  const outboxDir = path.resolve(process.cwd(), ".dev-outbox");
  const newest = readdirSync(outboxDir).sort().at(-1);
  if (!newest) {
    throw new Error("No outbox file found for email verification");
  }
  const raw = readFileSync(path.join(outboxDir, newest), "utf8");
  const body = (JSON.parse(raw) as { body: string }).body;
  const match = body.match(/([A-Za-z0-9_-]{32,})/);
  if (!match) {
    throw new Error("Verification token was not found in outbox");
  }
  return match[1];
}

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  const auth = app.get(AuthService);
  const kyc = app.get(KycService);
  const prisma = app.get(PrismaService);

  const ctx = {
    ipAddress: "127.0.0.1",
    userAgent: "m7-manual-script",
    requestId: `req-${Date.now()}`,
  };

  const runId = Date.now().toString();
  const email = `m7_${runId}@example.com`;
  const signup = await auth.signup(
    {
      fullName: "M7 Host Candidate",
      email,
      password: "Passw0rd1234",
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );

  await auth.verifyEmail(email, readLatestEmailVerificationToken(), ctx);
  await prisma.user.update({
    where: { id: signup.userId },
    data: { phone: `+1555${runId.slice(-10)}`, phoneVerified: true },
  });

  await auth.becomeHost(
    {
      sub: signup.userId,
      isGuest: true,
      isHost: false,
      isAdmin: false,
      isSuperAdmin: false,
      lastLoginAs: "guest",
    },
    {
      hostCategory: HostCategory.real_estate,
      hostSubtype: HostSubtype.individual,
      displayName: "M7 Individual Host",
      withdrawalSchedule: WithdrawalSchedule.monthly,
    },
    ctx,
  );

  // Minimal valid signatures for M7 checks (magic bytes + MIME + size).
  const tinyPng = Buffer.from(
    "89504e470d0a1a0a0000000d4948445200000001000000010802000000907724de0000000c49444154789c6360000000020001e527d4a20000000049454e44ae426082",
    "hex",
  );
  const tinyPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF", "utf8");

  const idFrontUpload = await kyc.uploadDocument({
    userId: signup.userId,
    fileKind: "id_front",
    fileBuffer: tinyPng,
    declaredMimeType: "image/png",
    sizeBytes: tinyPng.byteLength,
  });
  const idBackUpload = await kyc.uploadDocument({
    userId: signup.userId,
    fileKind: "id_back",
    fileBuffer: tinyPng,
    declaredMimeType: "image/png",
    sizeBytes: tinyPng.byteLength,
  });
  const selfieUpload = await kyc.uploadDocument({
    userId: signup.userId,
    fileKind: "selfie",
    fileBuffer: tinyPng,
    declaredMimeType: "image/png",
    sizeBytes: tinyPng.byteLength,
  });
  const ownershipProofUpload = await kyc.uploadDocument({
    userId: signup.userId,
    fileKind: "ownership_proof",
    fileBuffer: tinyPdf,
    declaredMimeType: "application/pdf",
    sizeBytes: tinyPdf.byteLength,
  });

  const submission = await kyc.submitKyc({
    userId: signup.userId,
    payload: {
      idDocumentType: "national_id",
      idFrontKey: idFrontUpload.storageKey,
      idBackKey: idBackUpload.storageKey,
      selfieKey: selfieUpload.storageKey,
      ownershipProofKey: ownershipProofUpload.storageKey,
    },
    ctx,
  });

  const dbSubmission = await prisma.kycSubmission.findUniqueOrThrow({
    where: { id: submission.id },
    select: { status: true },
  });
  if (dbSubmission.status !== "pending") {
    throw new Error("Expected KYC submission to be pending");
  }

  const hostProfile = await prisma.hostProfile.findUniqueOrThrow({
    where: { userId: signup.userId },
    select: { isVerified: true },
  });
  if (hostProfile.isVerified) {
    throw new Error("Host profile must remain unverified in M7");
  }

  const auditLog = await prisma.auditLog.findFirst({
    where: {
      actorUserId: signup.userId,
      action: "kyc.submitted",
      entityId: submission.id,
    },
    select: { id: true },
  });
  if (!auditLog) {
    throw new Error("Expected kyc.submitted audit log");
  }

  const latest = await kyc.getLatestSubmission(signup.userId);
  if (!latest || latest.id !== submission.id || !latest.documentPresence.idFront) {
    throw new Error("Latest KYC response did not return expected safe payload");
  }

  const history = await kyc.getSubmissionHistory({ userId: signup.userId, limit: 10 });
  if (history.items.length === 0 || history.items[0]?.id !== submission.id) {
    throw new Error("KYC history did not include submitted item");
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: signup.userId,
        submissionId: submission.id,
        status: dbSubmission.status,
        hostVerified: hostProfile.isVerified,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("M7 manual verification failed");
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.stack ?? error.message : inspect(error));
  process.exit(1);
});
