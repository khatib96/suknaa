import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { AuditLog } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AuditWriteInput } from "./audit.types";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(input: AuditWriteInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        actorRole: input.actorRole ?? null,
        actorIp: input.actorIp ?? null,
        userAgent: input.userAgent ?? null,
        requestId: input.requestId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        beforeJson: input.before ?? Prisma.JsonNull,
        afterJson: input.after ?? Prisma.JsonNull,
        metadata: input.metadata ?? {},
      },
    });
  }
}
