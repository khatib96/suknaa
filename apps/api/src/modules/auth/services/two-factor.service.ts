import { randomInt } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateSecret, generateURI, verify } from "otplib";
import {
  forbiddenError,
  notFoundError,
  unauthorizedError,
} from "../../../shared/errors/api-error.helpers";
import { AuditService } from "../../../shared/audit/audit.service";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { PasswordService } from "./password.service";
import { TotpSecretCryptoService } from "./totp-secret-crypto.service";
import type { Env } from "../../../shared/config/env.schema";
import type { Prisma } from "@prisma/client";

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

function generateBackupCodePlain(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[randomInt(alphabet.length)]).join("");
  return `${pick(4)}-${pick(4)}`;
}

function normalizeBackupInput(raw: string): string {
  return raw.trim().replace(/\s+/g, "").replace(/-/g, "").toUpperCase();
}

function canonicalBackupCode(raw: string): string | null {
  const n = normalizeBackupInput(raw);
  if (n.length !== 8) return null;
  return `${n.slice(0, 4)}-${n.slice(4)}`;
}

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly crypto: TotpSecretCryptoService,
    private readonly auditService: AuditService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async isTotpEnabled(userId: string): Promise<boolean> {
    const row = await this.prisma.twoFactorSecret.findUnique({
      where: { userId },
      select: { enabledAt: true },
    });
    return row?.enabledAt != null;
  }

  async setupTotp(
    userId: string,
    ctx: RequestContext,
  ): Promise<{ otpauthUrl: string; manualEntryKey: string }> {
    const existing = await this.prisma.twoFactorSecret.findUnique({
      where: { userId },
      select: { enabledAt: true },
    });
    if (existing?.enabledAt) {
      throw forbiddenError({
        code: "TOTP_ALREADY_ENABLED",
        message: "Two-factor authentication is already enabled",
        message_en: "Two-factor authentication is already enabled",
      });
    }

    const account = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!account) {
      throw notFoundError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        message_en: "User not found",
      });
    }

    const issuer = this.config.get("TWO_FACTOR_ISSUER", { infer: true });
    const secret = generateSecret();
    const encrypted = this.crypto.encrypt(secret);

    await this.prisma.twoFactorSecret.upsert({
      where: { userId },
      create: {
        userId,
        totpSecretEncrypted: encrypted,
        backupCodesHashes: [],
      },
      update: {
        totpSecretEncrypted: encrypted,
        backupCodesHashes: [],
        enabledAt: null,
        verifiedAt: null,
      },
    });

    const otpauthUrl = generateURI({
      issuer,
      label: account.email,
      secret,
    });

    await this.auditService.write({
      actorUserId: userId,
      actorRole: await this.resolveActorRole(userId),
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.2fa_setup_started",
      entityType: "two_factor_secrets",
      entityId: userId,
      metadata: {},
    });

    return { otpauthUrl, manualEntryKey: secret };
  }

  async confirmTotp(
    userId: string,
    code: string,
    ctx: RequestContext,
  ): Promise<{ backupCodes: string[] }> {
    const row = await this.prisma.twoFactorSecret.findUnique({
      where: { userId },
    });
    if (!row?.totpSecretEncrypted) {
      throw forbiddenError({
        code: "TOTP_SETUP_REQUIRED",
        message: "Start TOTP setup first",
        message_en: "Start TOTP setup first",
      });
    }
    if (row.enabledAt) {
      throw forbiddenError({
        code: "TOTP_ALREADY_ENABLED",
        message: "Two-factor authentication is already enabled",
        message_en: "Two-factor authentication is already enabled",
      });
    }

    const tempTtl = this.config.get("TWO_FACTOR_TEMP_SECRET_TTL_SECONDS", { infer: true });
    const ageMs = Date.now() - row.updatedAt.getTime();
    if (ageMs > tempTtl * 1000) {
      throw forbiddenError({
        code: "TOTP_SETUP_EXPIRED",
        message: "TOTP setup expired; start again",
        message_en: "TOTP setup expired; start again",
      });
    }

    const plainSecret = this.crypto.decrypt(row.totpSecretEncrypted);
    const result = await verify({ secret: plainSecret, token: code.trim() });
    if (!result.valid) {
      throw unauthorizedError({
        code: "TOTP_INVALID",
        message: "Invalid authenticator code",
        message_en: "Invalid authenticator code",
      });
    }

    const plainBackupCodes = Array.from({ length: 10 }, () => generateBackupCodePlain());
    const backupHashes: string[] = [];
    for (const plain of plainBackupCodes) {
      backupHashes.push(await this.passwordService.hashOpaqueToken(plain));
    }

    const now = new Date();
    await this.prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        backupCodesHashes: backupHashes as unknown as Prisma.InputJsonValue,
        enabledAt: now,
        verifiedAt: now,
      },
    });

    await this.auditService.write({
      actorUserId: userId,
      actorRole: await this.resolveActorRole(userId),
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.2fa_enabled",
      entityType: "two_factor_secrets",
      entityId: userId,
      metadata: {},
    });

    return { backupCodes: plainBackupCodes };
  }

  async disableTotp(
    userId: string,
    input: { password?: string; totpCode?: string },
    ctx: RequestContext,
  ): Promise<{ disabled: true }> {
    const row = await this.prisma.twoFactorSecret.findUnique({
      where: { userId },
      include: {
        user: { select: { passwordHash: true } },
      },
    });
    if (!row?.enabledAt) {
      throw forbiddenError({
        code: "TOTP_NOT_ENABLED",
        message: "Two-factor authentication is not enabled",
        message_en: "Two-factor authentication is not enabled",
      });
    }

    let authorized = false;
    if (input.password) {
      const ok = await this.passwordService.verifyPassword(
        row.user.passwordHash,
        input.password,
      );
      if (ok) {
        authorized = true;
      }
    }
    if (!authorized && input.totpCode && row.totpSecretEncrypted) {
      const plainSecret = this.crypto.decrypt(row.totpSecretEncrypted);
      const result = await verify({ secret: plainSecret, token: input.totpCode.trim() });
      if (result.valid) {
        authorized = true;
      }
    }

    if (!authorized) {
      throw unauthorizedError({
        code: "TOTP_DISABLE_UNAUTHORIZED",
        message: "Invalid password or authenticator code",
        message_en: "Invalid password or authenticator code",
      });
    }

    await this.prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        totpSecretEncrypted: null,
        backupCodesHashes: [],
        enabledAt: null,
        verifiedAt: null,
      },
    });

    await this.auditService.write({
      actorUserId: userId,
      actorRole: await this.resolveActorRole(userId),
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.2fa_disabled",
      entityType: "two_factor_secrets",
      entityId: userId,
      metadata: {},
    });

    return { disabled: true };
  }

  /**
   * Verifies a TOTP code or a one-time backup code. Backup codes are removed after successful use.
   */
  async verifySecondFactor(userId: string, rawCode: string): Promise<void> {
    const row = await this.prisma.twoFactorSecret.findUnique({
      where: { userId },
    });
    if (!row?.enabledAt || !row.totpSecretEncrypted) {
      throw unauthorizedError({
        code: "TOTP_NOT_ENABLED",
        message: "Two-factor authentication is not enabled",
        message_en: "Two-factor authentication is not enabled",
      });
    }

    const trimmed = rawCode.trim();
    if (/^\d{6}$/.test(trimmed)) {
      const plainSecret = this.crypto.decrypt(row.totpSecretEncrypted);
      const result = await verify({ secret: plainSecret, token: trimmed });
      if (result.valid) {
        return;
      }
      throw unauthorizedError({
        code: "SECOND_FACTOR_INVALID",
        message: "Invalid code",
        message_en: "Invalid code",
      });
    }

    const hashes = row.backupCodesHashes as unknown;
    if (!Array.isArray(hashes) || hashes.length === 0) {
      throw unauthorizedError({
        code: "SECOND_FACTOR_INVALID",
        message: "Invalid code",
        message_en: "Invalid code",
      });
    }

    const canonical = canonicalBackupCode(trimmed);
    if (!canonical) {
      throw unauthorizedError({
        code: "SECOND_FACTOR_INVALID",
        message: "Invalid code",
        message_en: "Invalid code",
      });
    }

    let matchedIndex = -1;
    for (let i = 0; i < hashes.length; i++) {
      const h = hashes[i];
      if (typeof h !== "string") continue;
      if (await this.passwordService.verifyOpaqueToken(h, canonical)) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex < 0) {
      throw unauthorizedError({
        code: "SECOND_FACTOR_INVALID",
        message: "Invalid code",
        message_en: "Invalid code",
      });
    }

    const nextHashes = hashes.filter((_, idx) => idx !== matchedIndex);
    await this.prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        backupCodesHashes: nextHashes as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private async resolveActorRole(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, isHost: true },
    });
    if (!user) return "guest";
    return user.isAdmin ? "admin" : user.isHost ? "host" : "guest";
  }
}
