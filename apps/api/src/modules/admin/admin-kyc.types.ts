import { z } from "zod";
import { KycStatus, type HostCategory, type HostSubtype, type KycDocType } from "@prisma/client";

export const adminKycQueueQuerySchema = z.object({
  status: z.nativeEnum(KycStatus).optional().default(KycStatus.pending),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  cursor: z.string().uuid().optional(),
});

export interface AdminKycQueueItem {
  id: string;
  status: KycStatus;
  userId: string;
  submitterEmail: string;
  submitterFullName: string;
  intendedHostCategory: HostCategory | null;
  intendedHostSubtype: HostSubtype | null;
  hostDisplayName: string | null;
  hostCompanyName: string | null;
  idDocumentType: KycDocType;
  submittedAt: Date;
  reviewedAt: Date | null;
  expiresAt: Date | null;
  rejectionReason: string | null;
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
