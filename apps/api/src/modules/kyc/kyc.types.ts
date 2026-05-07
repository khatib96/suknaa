import { HostSubtype, KycStatus } from "@prisma/client";
import { z } from "zod";
import { kycFileKindSchema } from "@suknaa/types";

export const kycUploadRequestSchema = z.object({
  fileKind: kycFileKindSchema,
});

export const kycHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  cursor: z.string().uuid().optional(),
});

export interface KycSubmissionResponse {
  id: string;
  status: KycStatus;
  rejectionReason: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  expiresAt: Date | null;
  documentPresence: {
    idFront: boolean;
    idBack: boolean;
    selfie: boolean;
    ownershipProof: boolean;
    companyRegistration: boolean;
    taxCertificate: boolean;
    authorizationLetter: boolean;
    hotelLicense: boolean;
  };
}

export const REQUIRED_DOCS_BY_SUBTYPE: Record<HostSubtype, Array<keyof KycSubmitLike>> = {
  individual: ["idFrontKey", "idBackKey", "selfieKey", "ownershipProofKey"],
  real_estate_office: [
    "idFrontKey",
    "idBackKey",
    "selfieKey",
    "companyRegistrationKey",
    "taxCertificateKey",
  ],
  hotel_company: [
    "idFrontKey",
    "idBackKey",
    "selfieKey",
    "companyRegistrationKey",
    "taxCertificateKey",
    "hotelLicenseKey",
  ],
};

export interface KycSubmitLike {
  idFrontKey: string;
  idBackKey?: string;
  selfieKey: string;
  ownershipProofKey?: string;
  companyRegistrationKey?: string;
  taxCertificateKey?: string;
  authorizationLetterKey?: string;
  hotelLicenseKey?: string;
}
