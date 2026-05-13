import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../../../shared/config/env.schema";
import { rateLimitedError } from "../../../shared/errors/api-error.helpers";
import { RedisService } from "../../../shared/redis/redis.service";

export interface AuthRateLimitRequestContext {
  ipAddress?: string | null;
}

function hashMaterial(material: string): string {
  return createHash("sha256").update(material, "utf8").digest("hex").slice(0, 32);
}

function clientIp(ctx: AuthRateLimitRequestContext): string {
  const raw = ctx.ipAddress?.trim();
  return raw && raw.length > 0 ? raw : "unknown";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthRateLimitService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async consumeLoginAttempt(email: string, ctx: AuthRateLimitRequestContext): Promise<void> {
    const material = `login|v1|${clientIp(ctx)}|${normalizeEmail(email)}`;
    await this.hitOrThrow({
      redisKeySuffix: `login:${hashMaterial(material)}`,
      ttlSeconds: this.config.get("AUTH_RL_LOGIN_WINDOW_SEC", { infer: true }),
      max: this.config.get("AUTH_RL_LOGIN_MAX", { infer: true }),
      error: {
        code: "AUTH_LOGIN_RATE_LIMITED",
        message: "تم تجاوز حد محاولات تسجيل الدخول. حاول لاحقاً.",
        message_en: "Too many login attempts. Try again later.",
      },
    });
  }

  async consumeSignupAttempt(ctx: AuthRateLimitRequestContext): Promise<void> {
    const material = `signup|v1|${clientIp(ctx)}`;
    await this.hitOrThrow({
      redisKeySuffix: `signup:${hashMaterial(material)}`,
      ttlSeconds: this.config.get("AUTH_RL_SIGNUP_WINDOW_SEC", { infer: true }),
      max: this.config.get("AUTH_RL_SIGNUP_MAX", { infer: true }),
      error: {
        code: "AUTH_SIGNUP_RATE_LIMITED",
        message: "تم تجاوز حد محاولات إنشاء الحساب من هذا العنوان. حاول لاحقاً.",
        message_en: "Too many signup attempts from this address. Try again later.",
      },
    });
  }

  async consumePasswordResetRequest(
    email: string,
    ctx: AuthRateLimitRequestContext,
  ): Promise<void> {
    const material = `pw_reset_req|v1|${clientIp(ctx)}|${normalizeEmail(email)}`;
    await this.hitOrThrow({
      redisKeySuffix: `pw_reset_req:${hashMaterial(material)}`,
      ttlSeconds: this.config.get("AUTH_RL_PASSWORD_RESET_WINDOW_SEC", { infer: true }),
      max: this.config.get("AUTH_RL_PASSWORD_RESET_MAX", { infer: true }),
      error: {
        code: "AUTH_PASSWORD_RESET_RATE_LIMITED",
        message: "تم تجاوز حد طلبات إعادة تعيين كلمة المرور. حاول لاحقاً.",
        message_en: "Too many password reset attempts. Try again later.",
      },
    });
  }

  async consumePasswordResetConfirm(
    email: string,
    token: string,
    ctx: AuthRateLimitRequestContext,
  ): Promise<void> {
    const tokenFp = createHash("sha256").update(token, "utf8").digest("hex");
    const material = `pw_reset_conf|v1|${clientIp(ctx)}|${normalizeEmail(email)}|${tokenFp}`;
    await this.hitOrThrow({
      redisKeySuffix: `pw_reset_conf:${hashMaterial(material)}`,
      ttlSeconds: this.config.get("AUTH_RL_PASSWORD_RESET_WINDOW_SEC", { infer: true }),
      max: this.config.get("AUTH_RL_PASSWORD_RESET_MAX", { infer: true }),
      error: {
        code: "AUTH_PASSWORD_RESET_RATE_LIMITED",
        message: "تم تجاوز حد محاولات تأكيد إعادة تعيين كلمة المرور. حاول لاحقاً.",
        message_en: "Too many password reset confirmation attempts. Try again later.",
      },
    });
  }

  async consumeMfaLoginAttempt(
    userId: string,
    ctx: AuthRateLimitRequestContext,
  ): Promise<void> {
    const material = `mfa_login|v1|${clientIp(ctx)}|${userId}`;
    await this.hitOrThrow({
      redisKeySuffix: `mfa_login:${hashMaterial(material)}`,
      ttlSeconds: this.config.get("AUTH_RL_MFA_WINDOW_SEC", { infer: true }),
      max: this.config.get("AUTH_RL_MFA_MAX", { infer: true }),
      error: {
        code: "AUTH_MFA_RATE_LIMITED",
        message: "تم تجاوز حد محاولات التحقق بخطوتين. حاول لاحقاً.",
        message_en: "Too many two-factor login attempts. Try again later.",
      },
    });
  }

  private async hitOrThrow(params: {
    redisKeySuffix: string;
    ttlSeconds: number;
    max: number;
    error: { code: string; message: string; message_en: string };
  }): Promise<void> {
    const key = `auth:rl:${params.redisKeySuffix}`;
    const count = await this.redis.incrementWithTtl(key, params.ttlSeconds);
    if (count > params.max) {
      throw rateLimitedError(params.error);
    }
  }
}
