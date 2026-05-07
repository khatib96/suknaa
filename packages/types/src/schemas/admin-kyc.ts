import { z } from "zod";

export const adminKycRejectSchema = z.object({
  rejectionReason: z.string().trim().min(1).max(1000),
});

export type AdminKycRejectInput = z.infer<typeof adminKycRejectSchema>;
