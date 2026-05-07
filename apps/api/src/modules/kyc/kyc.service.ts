import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { HostProfile, KycSubmission } from "@prisma/client";
import {
  KYC_MAX_FILE_SIZE_BYTES,
  kycAllowedMimeSchema,
  type KycFileKind,
  type KycSubmitInput,
} from "@suknaa/types";
import { AuditService } from "../../shared/audit/audit.service";
import {
  badRequestError,
  conflictError,
  forbiddenError,
  unprocessableError,
} from "../../shared/errors/api-error.helpers";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import {
  REQUIRED_DOCS_BY_SUBTYPE,
  type KycSubmissionResponse,
} from "./kyc.types";

const EXPECTED_KIND_BY_PAYLOAD_FIELD = {
  idFrontKey: "id_front",
  idBackKey: "id_back",
  selfieKey: "selfie",
  ownershipProofKey: "ownership_proof",
  companyRegistrationKey: "company_registration",
  taxCertificateKey: "tax_certificate",
  authorizationLetterKey: "authorization_letter",
  hotelLicenseKey: "hotel_license",
} as const satisfies Partial<Record<keyof KycSubmitInput, KycFileKind>>;

interface KycRequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  async uploadDocument(params: {
    userId: string;
    fileKind: KycFileKind;
    fileBuffer: Buffer;
    declaredMimeType: string;
    sizeBytes: number;
  }): Promise<{
    storageKey: string;
    fileKind: KycFileKind;
    mimeType: string;
    sizeBytes: number;
  }> {
    await this.requireHostProfile(params.userId);
    this.assertFileSize(params.sizeBytes);

    const detected = this.detectAllowedFileType(params.fileBuffer);
    const detectedMime = detected?.mime ?? null;
    const detectedExt = detected?.ext ?? null;

    if (!detectedMime || !detectedExt) {
      throw unprocessableError({
        code: "KYC_INVALID_FILE_TYPE",
        message: "Unsupported KYC file type",
        message_en: "Unsupported KYC file type",
      });
    }

    const mimeAllowed = kycAllowedMimeSchema.safeParse(detectedMime).success;
    if (!mimeAllowed || detectedMime !== params.declaredMimeType) {
      throw unprocessableError({
        code: "KYC_INVALID_FILE_TYPE",
        message: "File MIME type is invalid",
        message_en: "File MIME type is invalid",
        details: {
          detectedMimeType: detectedMime,
        },
      });
    }

    const objectKey = this.storage.buildKycObjectKey({
      userId: params.userId,
      fileKind: params.fileKind,
      fileExtension: detectedExt,
    });

    try {
      await this.storage.ensureKycBucketExists();
      await this.storage.putObject(
        this.storage.kycBucket,
        objectKey,
        params.fileBuffer,
        {
          "Content-Type": detectedMime,
          "x-amz-meta-file-kind": params.fileKind,
          "x-amz-meta-upload-id": randomUUID(),
        },
      );
    } catch {
      throw unprocessableError({
        code: "KYC_UPLOAD_FAILED",
        message: "KYC upload failed",
        message_en: "KYC upload failed",
      });
    }

    return {
      storageKey: objectKey,
      fileKind: params.fileKind,
      mimeType: detectedMime,
      sizeBytes: params.sizeBytes,
    };
  }

  private detectAllowedFileType(
    buffer: Buffer,
  ): { mime: "image/jpeg" | "image/png" | "image/webp" | "application/pdf"; ext: string } | null {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { mime: "image/jpeg", ext: "jpg" };
    }

    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { mime: "image/png", ext: "png" };
    }

    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
      return { mime: "image/webp", ext: "webp" };
    }

    if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
      return { mime: "application/pdf", ext: "pdf" };
    }

    return null;
  }

  async submitKyc(params: {
    userId: string;
    payload: KycSubmitInput;
    ctx: KycRequestContext;
  }): Promise<{
    id: string;
    status: string;
    submittedAt: Date;
  }> {
    const hostProfile = await this.requireHostProfile(params.userId);
    this.assertRequiredDocsForSubtype(hostProfile.hostSubtype, params.payload);

    const allReferencedKeys = this.collectSubmittedKeys(params.payload);
    this.assertKeysBelongToUser(params.userId, allReferencedKeys);
    this.assertKeysMatchExpectedKinds(params.userId, params.payload);
    await this.assertObjectsExist(allReferencedKeys);

    const pending = await this.prisma.kycSubmission.findFirst({
      where: { userId: params.userId, status: "pending" },
      select: { id: true },
    });
    if (pending) {
      throw conflictError({
        code: "KYC_SUBMISSION_ALREADY_PENDING",
        message: "A pending KYC submission already exists",
        message_en: "A pending KYC submission already exists",
      });
    }

    const submission = await this.prisma.kycSubmission.create({
      data: {
        userId: params.userId,
        intendedHostCategory: hostProfile.hostCategory,
        intendedHostSubtype: hostProfile.hostSubtype,
        idDocumentType: params.payload.idDocumentType,
        idFrontUrl: params.payload.idFrontKey,
        idBackUrl: params.payload.idBackKey ?? null,
        selfieUrl: params.payload.selfieKey,
        ownershipProofUrl: params.payload.ownershipProofKey ?? null,
        companyRegistrationUrl: params.payload.companyRegistrationKey ?? null,
        taxCertificateUrl: params.payload.taxCertificateKey ?? null,
        authorizationLetterUrl: params.payload.authorizationLetterKey ?? null,
        hotelLicenseUrl: params.payload.hotelLicenseKey ?? null,
        status: "pending",
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
      },
    });

    await this.audit.write({
      actorUserId: params.userId,
      actorRole: "host",
      actorIp: params.ctx.ipAddress ?? null,
      userAgent: params.ctx.userAgent ?? null,
      requestId: params.ctx.requestId ?? null,
      action: "kyc.submitted",
      entityType: "kyc_submissions",
      entityId: submission.id,
      metadata: {
        hostCategory: hostProfile.hostCategory,
        hostSubtype: hostProfile.hostSubtype,
      },
    });

    return {
      id: submission.id,
      status: submission.status,
      submittedAt: submission.submittedAt,
    };
  }

  async getLatestSubmission(userId: string): Promise<KycSubmissionResponse | null> {
    await this.requireHostProfile(userId);
    const latest = await this.prisma.kycSubmission.findFirst({
      where: { userId },
      orderBy: { submittedAt: "desc" },
    });
    return latest ? this.toSafeSubmission(latest) : null;
  }

  async getSubmissionHistory(params: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<{
    items: KycSubmissionResponse[];
    nextCursor: string | null;
  }> {
    await this.requireHostProfile(params.userId);
    const rows = await this.prisma.kycSubmission.findMany({
      where: { userId: params.userId },
      orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
      take: params.limit + 1,
      ...(params.cursor
        ? {
            cursor: { id: params.cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = rows.length > params.limit;
    const sliced = hasMore ? rows.slice(0, params.limit) : rows;
    return {
      items: sliced.map((row) => this.toSafeSubmission(row)),
      nextCursor: hasMore ? sliced[sliced.length - 1]?.id ?? null : null,
    };
  }

  private assertFileSize(sizeBytes: number): void {
    if (sizeBytes > KYC_MAX_FILE_SIZE_BYTES) {
      throw unprocessableError({
        code: "KYC_FILE_TOO_LARGE",
        message: "KYC file is too large",
        message_en: "KYC file is too large",
        details: {
          maxSizeBytes: KYC_MAX_FILE_SIZE_BYTES,
        },
      });
    }
  }

  private async requireHostProfile(userId: string): Promise<HostProfile> {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });
    if (!hostProfile) {
      throw forbiddenError({
        code: "HOST_PROFILE_REQUIRED",
        message: "Host profile is required",
        message_en: "Host profile is required",
      });
    }
    return hostProfile;
  }

  private assertRequiredDocsForSubtype(
    hostSubtype: HostProfile["hostSubtype"],
    payload: KycSubmitInput,
  ): void {
    const requiredFields = REQUIRED_DOCS_BY_SUBTYPE[hostSubtype] ?? [];
    const missingFields = requiredFields.filter((field) => {
      const value = payload[field];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missingFields.length > 0) {
      throw badRequestError({
        code: "KYC_INVALID_DOCS",
        message: "Missing required KYC documents",
        message_en: "Missing required KYC documents",
        details: {
          missingFields,
          hostSubtype,
        },
      });
    }
  }

  private collectSubmittedKeys(payload: KycSubmitInput): string[] {
    const values = [
      payload.idFrontKey,
      payload.idBackKey,
      payload.selfieKey,
      payload.ownershipProofKey,
      payload.companyRegistrationKey,
      payload.taxCertificateKey,
      payload.authorizationLetterKey,
      payload.hotelLicenseKey,
    ];
    return values.filter((value): value is string => typeof value === "string" && value.length > 0);
  }

  private assertKeysBelongToUser(userId: string, keys: string[]): void {
    const expectedPrefix = `kyc/${userId}/`;
    const hasForeignKey = keys.some((key) => !key.startsWith(expectedPrefix));
    if (hasForeignKey) {
      throw forbiddenError({
        code: "KYC_INVALID_DOCS",
        message: "KYC storage key does not belong to current user",
        message_en: "KYC storage key does not belong to current user",
      });
    }
  }

  private assertKeysMatchExpectedKinds(userId: string, payload: KycSubmitInput): void {
    const expectedPrefix = `kyc/${userId}/`;
    const mismatchedFields = Object.entries(EXPECTED_KIND_BY_PAYLOAD_FIELD).flatMap(
      ([field, expectedKind]) => {
        const value = payload[field as keyof KycSubmitInput];
        if (typeof value !== "string" || value.length === 0) {
          return [];
        }

        const objectName = value.slice(expectedPrefix.length);
        return objectName.startsWith(`${expectedKind}-`) ? [] : [field];
      },
    );

    if (mismatchedFields.length > 0) {
      throw badRequestError({
        code: "KYC_INVALID_DOCS",
        message: "KYC document keys do not match their declared fields",
        message_en: "KYC document keys do not match their declared fields",
        details: {
          mismatchedFields,
        },
      });
    }
  }

  private async assertObjectsExist(keys: string[]): Promise<void> {
    await this.storage.ensureKycBucketExists();
    const existence = await Promise.all(
      keys.map((key) => this.storage.objectExists(this.storage.kycBucket, key)),
    );
    const missingKeys = keys.filter((_, idx) => !existence[idx]);
    if (missingKeys.length > 0) {
      throw badRequestError({
        code: "KYC_INVALID_DOCS",
        message: "Referenced KYC files are missing",
        message_en: "Referenced KYC files are missing",
        details: {
          missingCount: missingKeys.length,
        },
      });
    }
  }

  private toSafeSubmission(row: KycSubmission): KycSubmissionResponse {
    return {
      id: row.id,
      status: row.status,
      rejectionReason: row.rejectionReason,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      expiresAt: row.expiresAt,
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
