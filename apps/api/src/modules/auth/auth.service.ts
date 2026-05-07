import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import {
  HostCategory,
  HostSubtype,
  UserExperience,
  type AuthSession,
  type User,
  type WithdrawalSchedule,
} from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import {
  conflictError,
  forbiddenError,
  notFoundError,
  unauthorizedError,
} from "../../shared/errors/api-error.helpers";
import { AuditService } from "../../shared/audit/audit.service";
import { MessagingService } from "../../shared/messaging/messaging.service";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { PasswordService } from "./services/password.service";
import {
  PASSWORD_BREACH_CHECKER,
  type PasswordBreachChecker,
} from "./services/password-breach-checker.interface";
import { TokensService } from "./services/tokens.service";
import { TwoFactorService } from "./services/two-factor.service";
import type { AuthenticatedUser } from "./types/authenticated-user.type";
import { Inject } from "@nestjs/common";
import type { Env } from "../../shared/config/env.schema";

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

interface SignupInput {
  fullName?: string;
  email: string;
  password: string;
  preferredLanguage: "ar" | "en";
  marketingOptIn: boolean;
}

interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface BecomeHostInput {
  hostCategory: HostCategory;
  hostSubtype: HostSubtype;
  displayName: string;
  companyName?: string | null;
  companyRegistration?: string | null;
  taxId?: string | null;
  bioAr?: string | null;
  bioEn?: string | null;
  withdrawalSchedule: WithdrawalSchedule;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    @Inject(PASSWORD_BREACH_CHECKER)
    private readonly passwordBreachChecker: PasswordBreachChecker,
    private readonly tokensService: TokensService,
    private readonly twoFactorService: TwoFactorService,
    private readonly messagingService: MessagingService,
    private readonly auditService: AuditService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async signup(input: SignupInput, ctx: RequestContext): Promise<{ userId: string }> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw conflictError({
        code: "EMAIL_ALREADY_EXISTS",
        message: "Email already exists",
        message_en: "Email already exists",
      });
    }

    await this.passwordBreachChecker.assertPasswordIsSafe(input.password);
    const passwordHash = await this.passwordService.hashPassword(input.password);
    const fullName = input.fullName?.trim() || this.deriveDefaultNameFromEmail(email);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        preferredLanguage: input.preferredLanguage,
        marketingOptIn: input.marketingOptIn,
        isGuest: true,
        isHost: false,
        isAdmin: false,
        isSuperAdmin: false,
      },
      select: { id: true, email: true },
    });

    await this.createEmailVerificationToken(user.id, user.email);

    await this.auditService.write({
      actorUserId: user.id,
      actorRole: "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.signup",
      entityType: "users",
      entityId: user.id,
      metadata: { email },
    });

    return { userId: user.id };
  }

  async verifyEmail(
    email: string,
    token: string,
    ctx: RequestContext,
  ): Promise<{ verified: true }> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
    });
    if (!user) {
      throw notFoundError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        message_en: "User not found",
      });
    }

    const candidates = await this.prisma.otpCode.findMany({
      where: {
        userId: user.id,
        channel: "email",
        purpose: "email_verification",
        deliveryTarget: normalizedEmail,
        consumedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    let matchedCodeId: string | null = null;
    for (const code of candidates) {
      const matches = await this.passwordService.verifyOpaqueToken(code.codeHash, token);
      if (matches) {
        matchedCodeId = code.id;
        break;
      }
    }

    if (!matchedCodeId) {
      throw unauthorizedError({
        code: "TOKEN_EXPIRED",
        message: "Invalid or expired verification token",
        message_en: "Invalid or expired verification token",
      });
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      this.prisma.otpCode.update({
        where: { id: matchedCodeId },
        data: { consumedAt: new Date() },
      }),
    ]);

    await this.auditService.write({
      actorUserId: user.id,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.email_verified",
      entityType: "users",
      entityId: user.id,
      metadata: { email: normalizedEmail },
    });

    return { verified: true };
  }

  async login(input: LoginInput, ctx: RequestContext) {
    const user = await this.prisma.user.findFirst({
      where: { email: input.email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      throw unauthorizedError({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        message_en: "Invalid email or password",
      });
    }

    const passwordValid = await this.passwordService.verifyPassword(
      user.passwordHash,
      input.password,
    );
    if (!passwordValid) {
      throw unauthorizedError({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        message_en: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      throw forbiddenError({
        code: "EMAIL_NOT_VERIFIED",
        message: "Email verification is required",
        message_en: "Email verification is required",
      });
    }

    if (await this.twoFactorService.isTotpEnabled(user.id)) {
      const mfa_token = await this.tokensService.issueMfaChallengeToken(
        user.id,
        input.rememberMe,
      );
      await this.auditService.write({
        actorUserId: user.id,
        actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
        actorIp: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
        requestId: ctx.requestId ?? null,
        action: "auth.2fa_challenge",
        entityType: "users",
        entityId: user.id,
        metadata: {},
      });
      return {
        requires_2fa: true as const,
        mfa_token,
      };
    }

    const tokens = await this.issueAndPersistSession(user, input.rememberMe, ctx);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ctx.ipAddress ?? null },
    });

    await this.auditService.write({
      actorUserId: user.id,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.login",
      entityType: "users",
      entityId: user.id,
      metadata: {},
    });

    return {
      ...tokens,
      user: this.toAuthUserPayload(user),
    };
  }

  async completeMfaLogin(mfaToken: string, code: string, ctx: RequestContext) {
    const mfaClaims = await this.tokensService.verifyMfaChallengeToken(mfaToken);
    if (!mfaClaims) {
      throw unauthorizedError({
        code: "INVALID_MFA_TOKEN",
        message: "Invalid or expired MFA token",
        message_en: "Invalid or expired MFA token",
      });
    }

    const user = await this.prisma.user.findFirst({
      where: { id: mfaClaims.sub, deletedAt: null },
    });
    if (!user) {
      throw unauthorizedError({
        code: "INVALID_MFA_TOKEN",
        message: "Invalid or expired MFA token",
        message_en: "Invalid or expired MFA token",
      });
    }

    await this.twoFactorService.verifySecondFactor(user.id, code);

    await this.auditService.write({
      actorUserId: user.id,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.2fa_success",
      entityType: "users",
      entityId: user.id,
      metadata: {},
    });

    const tokens = await this.issueAndPersistSession(user, mfaClaims.rememberMe, ctx);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ctx.ipAddress ?? null },
    });

    await this.auditService.write({
      actorUserId: user.id,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.login",
      entityType: "users",
      entityId: user.id,
      metadata: {},
    });

    return {
      ...tokens,
      user: this.toAuthUserPayload(user),
    };
  }

  async refresh(refreshToken: string, ctx: RequestContext) {
    const session = await this.resolveSessionFromRefreshToken(refreshToken);
    if (!session) {
      throw unauthorizedError({
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
        message_en: "Invalid refresh token",
      });
    }

    if (session.revokedAt) {
      throw unauthorizedError({
        code: "SESSION_REVOKED",
        message: "Session is revoked",
        message_en: "Session is revoked",
      });
    }

    if (session.expiresAt <= new Date()) {
      throw unauthorizedError({
        code: "TOKEN_EXPIRED",
        message: "Refresh token expired",
        message_en: "Refresh token expired",
      });
    }

    const matches = await this.passwordService.verifyOpaqueToken(
      session.refreshTokenHash,
      refreshToken,
    );
    if (!matches) {
      throw unauthorizedError({
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
        message_en: "Invalid refresh token",
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.deletedAt) {
      throw unauthorizedError({
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
        message_en: "Invalid refresh token",
      });
    }

    const tokens = await this.issueAndPersistSession(user, session.rememberMe, ctx);

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    await this.auditService.write({
      actorUserId: user.id,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.refresh",
      entityType: "auth_sessions",
      entityId: session.id,
      metadata: {},
    });

    return {
      ...tokens,
      user: this.toAuthUserPayload(user),
    };
  }

  async logout(refreshToken: string, ctx: RequestContext): Promise<{ revoked: true }> {
    const session = await this.resolveSessionFromRefreshToken(refreshToken);
    if (!session) {
      throw unauthorizedError({
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
        message_en: "Invalid refresh token",
      });
    }

    if (session.revokedAt) {
      throw unauthorizedError({
        code: "SESSION_REVOKED",
        message: "Session is revoked",
        message_en: "Session is revoked",
      });
    }

    const matches = await this.passwordService.verifyOpaqueToken(
      session.refreshTokenHash,
      refreshToken,
    );
    if (!matches) {
      throw unauthorizedError({
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
        message_en: "Invalid refresh token",
      });
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    await this.auditService.write({
      actorUserId: session.userId,
      actorRole: null,
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.logout",
      entityType: "auth_sessions",
      entityId: session.id,
      metadata: {},
    });

    return { revoked: true };
  }

  async logoutAll(user: AuthenticatedUser, ctx: RequestContext): Promise<{ revokedCount: number }> {
    const result = await this.prisma.authSession.updateMany({
      where: {
        userId: user.sub,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.auditService.write({
      actorUserId: user.sub,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.logout_all",
      entityType: "auth_sessions",
      entityId: null,
      metadata: { revokedCount: result.count },
    });

    return { revokedCount: result.count };
  }

  async listSessions(user: AuthenticatedUser, limit: number) {
    const sessions = await this.prisma.authSession.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        loginIntent: true,
        rememberMe: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
    return { sessions };
  }

  async revokeSession(
    user: AuthenticatedUser,
    sessionId: string,
    ctx: RequestContext,
  ): Promise<{ revoked: true }> {
    const session = await this.prisma.authSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, revokedAt: true },
    });
    if (!session || session.userId !== user.sub) {
      throw notFoundError({
        code: "SESSION_NOT_FOUND",
        message: "Session not found",
        message_en: "Session not found",
      });
    }
    if (session.revokedAt) {
      throw unauthorizedError({
        code: "SESSION_REVOKED",
        message: "Session is revoked",
        message_en: "Session is revoked",
      });
    }

    await this.prisma.authSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.auditService.write({
      actorUserId: user.sub,
      actorRole: user.isAdmin ? "admin" : user.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.session_revoked",
      entityType: "auth_sessions",
      entityId: sessionId,
      metadata: {},
    });

    return { revoked: true };
  }

  async getCurrentUser(user: AuthenticatedUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        phone: true,
        phoneVerified: true,
        fullName: true,
        isGuest: true,
        isHost: true,
        isAdmin: true,
        isSuperAdmin: true,
        lastLoginAs: true,
        preferredLanguage: true,
      },
    });
    if (!dbUser) {
      throw notFoundError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        message_en: "User not found",
      });
    }
    return dbUser;
  }

  async setLoginIntent(
    user: AuthenticatedUser,
    intent: "guest" | "host",
    ctx: RequestContext,
  ): Promise<{
    intent: "guest" | "host";
    becomeHostRequired: boolean;
    redirectTo: string;
  }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, isHost: true, isAdmin: true, isSuperAdmin: true },
    });
    if (!dbUser) {
      throw notFoundError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        message_en: "User not found",
      });
    }

    await this.prisma.user.update({
      where: { id: user.sub },
      data: { lastLoginAs: intent === "host" ? UserExperience.host : UserExperience.guest },
    });

    const becomeHostRequired = intent === "host" && !dbUser.isHost;
    await this.auditService.write({
      actorUserId: user.sub,
      actorRole: dbUser.isAdmin || dbUser.isSuperAdmin ? "admin" : dbUser.isHost ? "host" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "auth.login_intent_updated",
      entityType: "users",
      entityId: user.sub,
      metadata: { intent, becomeHostRequired },
    });

    return {
      intent,
      becomeHostRequired,
      redirectTo: becomeHostRequired
        ? "/become-a-host/apply"
        : intent === "host"
          ? "/host/dashboard"
          : "/dashboard",
    };
  }

  async becomeHost(
    user: AuthenticatedUser,
    input: BecomeHostInput,
    ctx: RequestContext,
  ): Promise<{ hostProfile: { userId: string; isVerified: boolean } }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        isHost: true,
        isAdmin: true,
        isSuperAdmin: true,
        phoneVerified: true,
        hostProfile: { select: { userId: true } },
      },
    });
    if (!dbUser) {
      throw notFoundError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        message_en: "User not found",
      });
    }
    if (!dbUser.phoneVerified) {
      throw forbiddenError({
        code: "PHONE_VERIFICATION_REQUIRED",
        message: "Phone verification is required before becoming a host",
        message_en: "Phone verification is required before becoming a host",
      });
    }
    if (dbUser.hostProfile) {
      throw conflictError({
        code: "HOST_PROFILE_ALREADY_EXISTS",
        message: "Host profile already exists",
        message_en: "Host profile already exists",
      });
    }

    this.assertHostCategorySubtype(input.hostCategory, input.hostSubtype);

    const result = await this.prisma.$transaction(async (tx) => {
      const hostProfile = await tx.hostProfile.create({
        data: {
          userId: user.sub,
          hostCategory: input.hostCategory,
          hostSubtype: input.hostSubtype,
          displayName: input.displayName,
          companyName: input.companyName ?? null,
          companyRegistration: input.companyRegistration ?? null,
          taxId: input.taxId ?? null,
          bioAr: input.bioAr ?? null,
          bioEn: input.bioEn ?? null,
          withdrawalSchedule: input.withdrawalSchedule,
        },
        select: { userId: true, isVerified: true },
      });
      await tx.user.update({
        where: { id: user.sub },
        data: { isHost: true, lastLoginAs: UserExperience.host },
      });
      return hostProfile;
    });

    await this.auditService.write({
      actorUserId: user.sub,
      actorRole: dbUser.isAdmin || dbUser.isSuperAdmin ? "admin" : "guest",
      actorIp: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,
      action: "host.become_host",
      entityType: "host_profiles",
      entityId: user.sub,
      metadata: {
        hostCategory: input.hostCategory,
        hostSubtype: input.hostSubtype,
      },
    });

    return { hostProfile: result };
  }

  private async createEmailVerificationToken(userId: string, email: string): Promise<void> {
    const token = this.tokensService.generateRefreshToken();
    const tokenHash = await this.passwordService.hashOpaqueToken(token);

    await this.prisma.otpCode.create({
      data: {
        userId,
        purpose: "email_verification",
        channel: "email",
        deliveryTarget: email.toLowerCase(),
        codeHash: tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.messagingService.send({
      recipient: { channel: "email", value: email.toLowerCase() },
      subject: "Verify your Suknaa email",
      body: `Use this verification token to verify your email: ${token}`,
      metadata: { kind: "email_verification", userId },
    });
  }

  private async issueAndPersistSession(
    user: User,
    rememberMe: boolean,
    ctx: RequestContext,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.tokensService.issueTokens({
      sub: user.id,
      isGuest: user.isGuest,
      isHost: user.isHost,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      lastLoginAs: user.lastLoginAs,
    });

    const sessionId = randomUUID();
    const sessionScopedRefreshToken = `${sessionId}.${tokens.refreshToken}`;
    const refreshTokenHash =
      await this.passwordService.hashOpaqueToken(sessionScopedRefreshToken);

    await this.prisma.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash,
        loginIntent: user.lastLoginAs ?? UserExperience.guest,
        rememberMe,
        userAgent: ctx.userAgent ?? null,
        ipAddress: ctx.ipAddress ?? null,
        expiresAt: this.getRefreshExpiryDate(rememberMe),
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: sessionScopedRefreshToken,
    };
  }

  private async resolveSessionFromRefreshToken(
    refreshToken: string,
  ): Promise<AuthSession | null> {
    const [sessionId] = refreshToken.split(".");
    if (!sessionId) {
      return null;
    }
    return this.prisma.authSession.findUnique({ where: { id: sessionId } });
  }

  private getRefreshExpiryDate(rememberMe: boolean): Date {
    if (rememberMe) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    const refreshTtl = this.config.get("JWT_REFRESH_TTL", { infer: true });
    return new Date(Date.now() + this.parseDurationMs(refreshTtl));
  }

  private parseDurationMs(raw: string): number {
    const normalized = raw.trim();
    const match = normalized.match(/^(\d+)([mhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const value = Number(match[1]);
    const unit = match[2];
    if (unit === "m") return value * 60 * 1000;
    if (unit === "h") return value * 60 * 60 * 1000;
    return value * 24 * 60 * 60 * 1000;
  }

  private deriveDefaultNameFromEmail(email: string): string {
    const localPart = email.split("@")[0] ?? "guest";
    return localPart.slice(0, 1).toUpperCase() + localPart.slice(1);
  }

  private assertHostCategorySubtype(
    hostCategory: HostCategory,
    hostSubtype: HostSubtype,
  ): void {
    if (
      (hostCategory === HostCategory.real_estate &&
        hostSubtype === HostSubtype.hotel_company) ||
      (hostCategory === HostCategory.hospitality &&
        hostSubtype !== HostSubtype.hotel_company)
    ) {
      throw forbiddenError({
        code: "WRONG_HOST_CATEGORY",
        message: "Host subtype does not match host category",
        message_en: "Host subtype does not match host category",
      });
    }
  }

  private toAuthUserPayload(user: User) {
    return {
      id: user.id,
      isGuest: user.isGuest,
      isHost: user.isHost,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      lastLoginAs: user.lastLoginAs,
    };
  }
}
