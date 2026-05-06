import { randomInt } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OtpChannel, OtpPurpose } from "@prisma/client";
import {
  conflictError,
  forbiddenError,
  rateLimitedError,
  unauthorizedError,
} from "../../../shared/errors/api-error.helpers";
import { AuditService } from "../../../shared/audit/audit.service";
import { MessagingService } from "../../../shared/messaging/messaging.service";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { RedisService } from "../../../shared/redis/redis.service";
import { PasswordService } from "./password.service";
import type { Env } from "../../../shared/config/env.schema";

export interface OtpRequestInput {
  purpose: OtpPurpose;
  channel: OtpChannel;
  destination: string;
}

export interface OtpVerifyInput {
  purpose: OtpPurpose;
  destination: string;
  code: string;
}

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly messagingService: MessagingService,
    private readonly auditService: AuditService,
    private readonly redis: RedisService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async requestPhoneVerificationOtp(
    userId: string,
    input: OtpRequestInput,
    ctx: RequestContext,
  ): Promise<{ requested: true }> {
    if (input.purpose !== "phone_verification" || input.channel !== "phone") {
      throw forbiddenError({
        code: "OTP_PURPOSE_NOT_ALLOWED",
        message: "Unsupported OTP request",
        message_en: "Unsupported OTP request",
      });
    }

    const ttlSeconds = this.config.get("OTP_CODE_TTL_SECONDS", { infer: true });
    const maxPerHour = this.config.get("OTP_PHONE_RATE_LIMIT_PER_HOUR", { infer: true });
    const rateKey = `otp:rl:${input.purpose}:${input.destination}`;
    const count = await this.redis.incrementWithTtl(rateKey, 3600);
    if (count > maxPerHour) {
      throw rateLimitedError({
        code: "OTP_RATE_LIMITED",
        message: "Too many OTP requests for this destination",
        message_en: "Too many OTP requests for this destination",
      });
    }

    await this.prisma.otpCode.updateMany({
      where: {
        userId,
        purpose: OtpPurpose.phone_verification,
        channel: OtpChannel.phone,
        deliveryTarget: input.destination,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await this.passwordService.hashOpaqueToken(code);

    await this.prisma.otpCode.create({
      data: {
        userId,
        purpose: OtpPurpose.phone_verification,
        channel: OtpChannel.phone,
        deliveryTarget: input.destination,
        codeHash,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        attemptsCount: 0,
      },
    });

    await this.messagingService.send({
      recipient: { channel: "phone", value: input.destination },
      subject: "Suknaa phone verification",
      body: `Your Suknaa verification code is: ${code}`,
      metadata: { kind: "phone_verification_otp", userId },
    });

    await this.auditService.write({
      actorUserId: userId,
      actorRole: "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.otp_requested",
      entityType: "users",
      entityId: userId,
      metadata: {
        purpose: "phone_verification",
        channel: "phone",
      },
    });

    return { requested: true };
  }

  async verifyPhoneOtp(
    userId: string,
    input: OtpVerifyInput,
    ctx: RequestContext,
  ): Promise<{ verified: true }> {
    if (input.purpose !== "phone_verification") {
      throw forbiddenError({
        code: "OTP_PURPOSE_NOT_ALLOWED",
        message: "Unsupported OTP verification",
        message_en: "Unsupported OTP verification",
      });
    }

    const maxAttempts = this.config.get("OTP_MAX_ATTEMPTS", { infer: true });

    const latest = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        purpose: OtpPurpose.phone_verification,
        channel: OtpChannel.phone,
        deliveryTarget: input.destination,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latest) {
      throw unauthorizedError({
        code: "OTP_INVALID",
        message: "Invalid or expired OTP",
        message_en: "Invalid or expired OTP",
      });
    }

    if (latest.lockedUntil && latest.lockedUntil > new Date()) {
      throw unauthorizedError({
        code: "OTP_LOCKED",
        message: "Too many failed attempts",
        message_en: "Too many failed attempts",
      });
    }

    if (latest.expiresAt <= new Date()) {
      throw unauthorizedError({
        code: "OTP_EXPIRED",
        message: "Invalid or expired OTP",
        message_en: "Invalid or expired OTP",
      });
    }

    if (latest.attemptsCount >= maxAttempts) {
      throw unauthorizedError({
        code: "OTP_MAX_ATTEMPTS",
        message: "Too many failed attempts",
        message_en: "Too many failed attempts",
      });
    }

    const matches = await this.passwordService.verifyOpaqueToken(latest.codeHash, input.code);
    if (!matches) {
      const nextAttempts = latest.attemptsCount + 1;
      const lockedUntil =
        nextAttempts >= maxAttempts ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await this.prisma.otpCode.update({
        where: { id: latest.id },
        data: {
          attemptsCount: nextAttempts,
          lockedUntil,
        },
      });
      throw unauthorizedError({
        code: "OTP_INVALID",
        message: "Invalid or expired OTP",
        message_en: "Invalid or expired OTP",
      });
    }

    const conflict = await this.prisma.user.findFirst({
      where: {
        phone: input.destination,
        deletedAt: null,
        NOT: { id: userId },
      },
      select: { id: true },
    });
    if (conflict) {
      throw conflictError({
        code: "PHONE_ALREADY_IN_USE",
        message: "This phone number is already verified on another account",
        message_en: "This phone number is already verified on another account",
      });
    }

    await this.prisma.$transaction([
      this.prisma.otpCode.update({
        where: { id: latest.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          phone: input.destination,
          phoneVerified: true,
        },
      }),
    ]);

    await this.auditService.write({
      actorUserId: userId,
      actorRole: "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.phone_verified",
      entityType: "users",
      entityId: userId,
      metadata: {},
    });

    return { verified: true };
  }
}
