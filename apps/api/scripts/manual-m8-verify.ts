import "reflect-metadata";
import { inspect } from "node:util";
import { NestFactory } from "@nestjs/core";
import { HostCategory, HostSubtype, WithdrawalSchedule } from "@prisma/client";
import { AppModule } from "../src/app.module";
import { AdminKycService } from "../src/modules/admin/admin-kyc.service";
import { AuthService } from "../src/modules/auth/auth.service";
import { KycService } from "../src/modules/kyc/kyc.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";

const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907724de0000000c49444154789c6360000000020001e527d4a20000000049454e44ae426082",
  "hex",
);
const TINY_PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF", "utf8");

async function createVerifiedHost(
  auth: AuthService,
  kyc: KycService,
  prisma: PrismaService,
  email: string,
  phone: string,
  ctx: { ipAddress: string; userAgent: string; requestId: string },
): Promise<{ userId: string; submissionId: string }> {
  const { userId } = await auth.signup(
    { email, password: "Passw0rd1234", preferredLanguage: "ar", marketingOptIn: false },
    ctx,
  );

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, phone, phoneVerified: true },
  });

  await auth.becomeHost(
    { sub: userId, isGuest: true, isHost: false, isAdmin: false, isSuperAdmin: false, lastLoginAs: "guest" },
    {
      hostCategory: HostCategory.real_estate,
      hostSubtype: HostSubtype.individual,
      displayName: `Host ${email}`,
      withdrawalSchedule: WithdrawalSchedule.monthly,
    },
    ctx,
  );

  const [idFront, idBack, selfie, ownershipProof] = await Promise.all([
    kyc.uploadDocument({ userId, fileKind: "id_front", fileBuffer: TINY_PNG, declaredMimeType: "image/png", sizeBytes: TINY_PNG.byteLength }),
    kyc.uploadDocument({ userId, fileKind: "id_back", fileBuffer: TINY_PNG, declaredMimeType: "image/png", sizeBytes: TINY_PNG.byteLength }),
    kyc.uploadDocument({ userId, fileKind: "selfie", fileBuffer: TINY_PNG, declaredMimeType: "image/png", sizeBytes: TINY_PNG.byteLength }),
    kyc.uploadDocument({ userId, fileKind: "ownership_proof", fileBuffer: TINY_PDF, declaredMimeType: "application/pdf", sizeBytes: TINY_PDF.byteLength }),
  ]);

  const submission = await kyc.submitKyc({
    userId,
    payload: {
      idDocumentType: "national_id",
      idFrontKey: idFront.storageKey,
      idBackKey: idBack.storageKey,
      selfieKey: selfie.storageKey,
      ownershipProofKey: ownershipProof.storageKey,
    },
    ctx,
  });

  return { userId, submissionId: submission.id };
}

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  const auth = app.get(AuthService);
  const kyc = app.get(KycService);
  const adminKyc = app.get(AdminKycService);
  const prisma = app.get(PrismaService);

  const runId = Date.now().toString();
  const ctx = { ipAddress: "127.0.0.1", userAgent: "m8-verify", requestId: `req-${runId}` };

  // Admin user — created directly to avoid needing email verification flow
  const admin = await prisma.user.create({
    data: {
      email: `m8_admin_${runId}@example.com`,
      passwordHash: "not-used-in-m8-verify",
      fullName: "M8 Admin",
      isGuest: false,
      isAdmin: true,
    },
    select: { id: true },
  });

  // Two host users with pending KYC
  const host1 = await createVerifiedHost(
    auth, kyc, prisma,
    `m8_host1_${runId}@example.com`,
    `+155501${runId.slice(-6)}`,
    ctx,
  );
  const host2 = await createVerifiedHost(
    auth, kyc, prisma,
    `m8_host2_${runId}@example.com`,
    `+155502${runId.slice(-6)}`,
    ctx,
  );

  // Queue must contain both submissions
  const queue = await adminKyc.listQueue({ status: "pending", limit: 50 });
  const inQueue = (id: string) => queue.items.some((i) => i.id === id);
  if (!inQueue(host1.submissionId) || !inQueue(host2.submissionId)) {
    throw new Error("Both pending submissions must appear in admin queue");
  }
  // Queue items must not expose raw storage keys
  for (const item of queue.items) {
    const raw = JSON.stringify(item);
    if (raw.includes("kyc/")) {
      throw new Error("Admin queue response must not contain raw storage keys");
    }
  }

  // Approve submission 1
  const approveResult = await adminKyc.approveKyc({
    adminUserId: admin.id,
    submissionId: host1.submissionId,
    ctx,
  });
  if (approveResult.status !== "approved") {
    throw new Error("Expected approved status");
  }

  // Reject submission 2
  const rejectResult = await adminKyc.rejectKyc({
    adminUserId: admin.id,
    submissionId: host2.submissionId,
    rejectionReason: "Documents are not legible",
    ctx,
  });
  if (rejectResult.status !== "rejected") {
    throw new Error("Expected rejected status");
  }

  // DB: approved submission
  const dbSub1 = await prisma.kycSubmission.findUniqueOrThrow({ where: { id: host1.submissionId } });
  if (
    dbSub1.status !== "approved" ||
    !dbSub1.reviewedAt ||
    !dbSub1.expiresAt ||
    dbSub1.reviewedByUserId !== admin.id
  ) {
    throw new Error("Approved submission DB state is incorrect");
  }

  // DB: approved host profile must be verified
  const dbHostProfile1 = await prisma.hostProfile.findUniqueOrThrow({ where: { userId: host1.userId } });
  if (!dbHostProfile1.isVerified || !dbHostProfile1.verifiedAt) {
    throw new Error("Host 1 must be verified after KYC approval");
  }

  // DB: rejected submission
  const dbSub2 = await prisma.kycSubmission.findUniqueOrThrow({ where: { id: host2.submissionId } });
  if (
    dbSub2.status !== "rejected" ||
    !dbSub2.reviewedAt ||
    !dbSub2.rejectionReason ||
    dbSub2.reviewedByUserId !== admin.id
  ) {
    throw new Error("Rejected submission DB state is incorrect");
  }

  // DB: rejected host profile must remain unverified
  const dbHostProfile2 = await prisma.hostProfile.findUniqueOrThrow({ where: { userId: host2.userId } });
  if (dbHostProfile2.isVerified) {
    throw new Error("Host 2 must NOT be verified after KYC rejection");
  }

  // Audit logs
  const approveAudit = await prisma.auditLog.findFirst({
    where: { actorUserId: admin.id, action: "admin.kyc.approved", entityId: host1.submissionId },
    select: { id: true },
  });
  if (!approveAudit) throw new Error("Expected admin.kyc.approved audit log");

  const rejectAudit = await prisma.auditLog.findFirst({
    where: { actorUserId: admin.id, action: "admin.kyc.rejected", entityId: host2.submissionId },
    select: { id: true },
  });
  if (!rejectAudit) throw new Error("Expected admin.kyc.rejected audit log");

  // Double-review guard — approving an already-approved submission must be rejected
  let doubleReviewBlocked = false;
  try {
    await adminKyc.approveKyc({ adminUserId: admin.id, submissionId: host1.submissionId, ctx });
  } catch {
    doubleReviewBlocked = true;
  }
  if (!doubleReviewBlocked) {
    throw new Error("Double-review (KYC_ALREADY_REVIEWED) was not blocked");
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        approvedSubmissionId: host1.submissionId,
        rejectedSubmissionId: host2.submissionId,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("M8 manual verification failed");
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? (error.stack ?? error.message) : inspect(error));
  process.exit(1);
});
