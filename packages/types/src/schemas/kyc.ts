import { z } from "zod";

export const KYC_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const kycFileKindSchema = z.enum([
  "id_front",
  "id_back",
  "selfie",
  "ownership_proof",
  "company_registration",
  "tax_certificate",
  "authorization_letter",
  "hotel_license",
]);

export const kycAllowedMimeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const kycIdDocumentTypeSchema = z.enum([
  "national_id",
  "passport",
  "driver_license",
]);

export const kycUploadMetadataSchema = z.object({
  fileKind: kycFileKindSchema,
  mimeType: kycAllowedMimeSchema,
  sizeBytes: z.number().int().positive().max(KYC_MAX_FILE_SIZE_BYTES),
});

const storageKeyField = z.string().trim().min(1).max(500);

export const kycSubmitSchema = z.object({
  idDocumentType: kycIdDocumentTypeSchema,
  idFrontKey: storageKeyField,
  idBackKey: storageKeyField.optional(),
  selfieKey: storageKeyField,
  ownershipProofKey: storageKeyField.optional(),
  companyRegistrationKey: storageKeyField.optional(),
  taxCertificateKey: storageKeyField.optional(),
  authorizationLetterKey: storageKeyField.optional(),
  hotelLicenseKey: storageKeyField.optional(),
});

export type KycFileKind = z.infer<typeof kycFileKindSchema>;
export type KycAllowedMime = z.infer<typeof kycAllowedMimeSchema>;
export type KycIdDocumentType = z.infer<typeof kycIdDocumentTypeSchema>;
export type KycUploadMetadataInput = z.infer<typeof kycUploadMetadataSchema>;
export type KycSubmitInput = z.infer<typeof kycSubmitSchema>;
