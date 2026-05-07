import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { adminKycRejectSchema } from "@suknaa/types";
import { badRequestError } from "../../shared/errors/api-error.helpers";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AdminKycService } from "./admin-kyc.service";
import { adminKycQueueQuerySchema } from "./admin-kyc.types";

@Controller("admin/kyc")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminKycController {
  constructor(private readonly adminKycService: AdminKycService) {}

  @Get("queue")
  async listQueue(@Query() query: unknown) {
    const parsed = this.parse(adminKycQueueQuerySchema.safeParse(query));
    return this.adminKycService.listQueue({
      status: parsed.status,
      limit: parsed.limit,
      cursor: parsed.cursor,
    });
  }

  @Post(":id/approve")
  async approve(
    @Param("id") submissionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminKycService.approveKyc({
      adminUserId: user.sub,
      submissionId,
      ctx: this.requestContext(req),
    });
  }

  @Post(":id/reject")
  async reject(
    @Param("id") submissionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsed = this.parse(adminKycRejectSchema.safeParse(body));
    return this.adminKycService.rejectKyc({
      adminUserId: user.sub,
      submissionId,
      rejectionReason: parsed.rejectionReason,
      ctx: this.requestContext(req),
    });
  }

  private requestContext(req: Request): {
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string | null;
  } {
    return {
      ipAddress: req.ip ?? null,
      userAgent: req.headers["user-agent"] ?? null,
      requestId:
        typeof req.id === "string" || typeof req.id === "number"
          ? String(req.id)
          : typeof req.headers["x-request-id"] === "string"
            ? req.headers["x-request-id"]
            : null,
    };
  }

  private parse<T>(result: { success: true; data: T } | { success: false }): T {
    if (!result.success) {
      throw badRequestError({
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        message_en: "Invalid request payload",
      });
    }
    return result.data;
  }
}
