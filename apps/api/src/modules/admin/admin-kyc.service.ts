import { Injectable } from "@nestjs/common";
import type { HostProfile, KycStatus, KycSubmission, User } from "@prisma/client";
import { AuditService } from "../../shared/audit/audit.service";
import { conflictError, notFoundError } from "../../shared/errors/api-error.helpers";
import { PrismaService } from "../../shared/prisma/prisma.service";
import type { AdminKycQueueItem } from "./admin-kyc.types";

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

@Injectable()
export class AdminKycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listQueue(params: {
    status: KycStatus;
    limit: number;
    cursor?: string;
  }): Promise<{ items: AdminKycQueueItem[]; nextCursor: string | null }> {
    const rows = await this.prisma.kycSubmission.findMany({
      where: { status: params.status },
      orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            hostProfile: {
              select: {
                displayName: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    const hasMore = rows.length > params.limit;
    const sliced = hasMore ? rows.slice(0, params.limit) : rows;

    return {
      items: sliced.map((row) => this.toQueueItem(row)),
      nextCursor: hasMore ? (sliced[sliced.length - 1]?.id ?? null) : null,
    };
  }

  async approveKyc(params: {
    adminUserId: string;
    submissionId: string;
    ctx: RequestContext;
  }): Promise<{ id: string; status: "approved"; reviewedAt: Date }> {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const result = await this.prisma.$transaction(async (tx) => {
      const submission = await tx.kycSubmission.findUnique({
        where: { id: params.submissionId },
      });
      this.assertPendingSubmission(submission);

      const updated = await tx.kycSubmission.update({
        where: { id: params.submissionId },
        data: {
          status: "approved",
          reviewedByUserId: params.adminUserId,
          reviewedAt: now,
          expiresAt,
        },
        select: { id: true, status: true, reviewedAt: true },
      });
      await tx.hostProfile.update({
        where: { userId: submission.userId },
        data: { isVerified: true, verifiedAt: now },
      });
      return { updated, submission };
    });

    await this.audit.write({
      actorUserId: params.adminUserId,
      actorRole: "admin",
      actorIp: params.ctx.ipAddress ?? null,
      userAgent: params.ctx.userAgent ?? null,
      requestId: params.ctx.requestId ?? null,
      action: "admin.kyc.approved",
      entityType: "kyc_submissions",
      entityId: params.submissionId,
      before: { status: "pending" },
      after: { status: "approved", expiresAt },
      metadata: { hostUserId: result.submission.userId },
    });

    return { id: result.updated.id, status: "approved", reviewedAt: result.updated.reviewedAt! };
  }

  async rejectKyc(params: {
    adminUserId: string;
    submissionId: string;
    rejectionReason: string;
    ctx: RequestContext;
  }): Promise<{ id: string; status: "rejected"; reviewedAt: Date }> {
    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const submission = await tx.kycSubmission.findUnique({
        where: { id: params.submissionId },
      });
      this.assertPendingSubmission(submission);

      const updated = await tx.kycSubmission.update({
        where: { id: params.submissionId },
        data: {
          status: "rejected",
          rejectionReason: params.rejectionReason,
          reviewedByUserId: params.adminUserId,
          reviewedAt: now,
        },
        select: { id: true, status: true, reviewedAt: true },
      });
      return { updated, submission };
    });

    await this.audit.write({
      actorUserId: params.adminUserId,
      actorRole: "admin",
      actorIp: params.ctx.ipAddress ?? null,
      userAgent: params.ctx.userAgent ?? null,
      requestId: params.ctx.requestId ?? null,
      action: "admin.kyc.rejected",
      entityType: "kyc_submissions",
      entityId: params.submissionId,
      before: { status: "pending" },
      after: { status: "rejected", rejectionReason: params.rejectionReason },
      metadata: { hostUserId: result.submission.userId },
    });

    return { id: result.updated.id, status: "rejected", reviewedAt: result.updated.reviewedAt! };
  }

  private assertPendingSubmission(submission: KycSubmission | null): asserts submission is KycSubmission {
    if (!submission) {
      throw notFoundError({
        code: "KYC_SUBMISSION_NOT_FOUND",
        message: "KYC submission not found",
        message_en: "KYC submission not found",
      });
    }
    if (submission.status !== "pending") {
      throw conflictError({
        code: "KYC_ALREADY_REVIEWED",
        message: "This submission has already been reviewed",
        message_en: "This submission has already been reviewed",
      });
    }
  }

  private toQueueItem(
    row: KycSubmission & {
      user: Pick<User, "email" | "fullName"> & {
        hostProfile: Pick<HostProfile, "displayName" | "companyName"> | null;
      };
    },
  ): AdminKycQueueItem {
    return {
      id: row.id,
      status: row.status,
      userId: row.userId,
      submitterEmail: row.user.email,
      submitterFullName: row.user.fullName,
      intendedHostCategory: row.intendedHostCategory,
      intendedHostSubtype: row.intendedHostSubtype,
      hostDisplayName: row.user.hostProfile?.displayName ?? null,
      hostCompanyName: row.user.hostProfile?.companyName ?? null,
      idDocumentType: row.idDocumentType,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      expiresAt: row.expiresAt,
      rejectionReason: row.rejectionReason,
      documentPresence: {
        idFront: Boolean(row.idFrontUrl),
        idBack: Boolean(row.idBackUrl),
        selfie: Boolean(row.selfieUrl),
        ownershipProof: Boolean(row.ownershipProofUrl),
        companyRegistration: Boolean(row.companyRegistrationUrl),
        taxCertificate: Boolean(row.taxCertificateUrl),
        authorizationLetter: Boolean(row.authorizationLetterUrl),
        hotelLicense: Boolean(row.hotelLicenseUrl),
      },
    };
  }
}
