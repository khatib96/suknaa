import type { Prisma } from "@prisma/client";

export interface AuditWriteInput {
  actorUserId?: string | null;
  actorRole?: string | null;
  actorIp?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue;
}
