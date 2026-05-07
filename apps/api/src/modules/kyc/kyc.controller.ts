import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import type { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { kycSubmitSchema } from "@suknaa/types";
import { badRequestError } from "../../shared/errors/api-error.helpers";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { KycService } from "./kyc.service";
import { kycHistoryQuerySchema, kycUploadRequestSchema } from "./kyc.types";

interface UploadedKycFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post("me/kyc/upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedKycFile | undefined,
    @Body() body: unknown,
  ) {
    if (!file) {
      throw badRequestError({
        code: "VALIDATION_ERROR",
        message: "Missing file in multipart payload",
        message_en: "Missing file in multipart payload",
      });
    }

    const parsed = this.parse(kycUploadRequestSchema.safeParse(body));
    return this.kycService.uploadDocument({
      userId: user.sub,
      fileKind: parsed.fileKind,
      fileBuffer: file.buffer,
      declaredMimeType: file.mimetype,
      sizeBytes: file.size,
    });
  }

  @Post("me/kyc")
  async submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsed = this.parse(kycSubmitSchema.safeParse(body));
    return this.kycService.submitKyc({
      userId: user.sub,
      payload: parsed,
      ctx: this.requestContext(req),
    });
  }

  @Get("me/kyc")
  async latest(@CurrentUser() user: AuthenticatedUser) {
    return this.kycService.getLatestSubmission(user.sub);
  }

  @Get("me/kyc/history")
  async history(@CurrentUser() user: AuthenticatedUser, @Query() query: unknown) {
    const parsed = this.parse(kycHistoryQuerySchema.safeParse(query));
    return this.kycService.getSubmissionHistory({
      userId: user.sub,
      limit: parsed.limit,
      cursor: parsed.cursor,
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
