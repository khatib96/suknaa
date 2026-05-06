import { randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { UserExperience } from "@prisma/client";
import type { Env } from "../../../shared/config/env.schema";

export interface AccessTokenClaims {
  sub: string;
  isGuest: boolean;
  isHost: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  lastLoginAs: UserExperience;
}

export type IssueTokensInput = AccessTokenClaims;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async issueTokens(input: IssueTokensInput): Promise<IssuedTokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: input.sub,
        isGuest: input.isGuest,
        isHost: input.isHost,
        isAdmin: input.isAdmin,
        isSuperAdmin: input.isSuperAdmin,
        lastLoginAs: input.lastLoginAs,
      } satisfies AccessTokenClaims,
      {
        algorithm: "RS256",
        expiresIn: this.config.get("JWT_ACCESS_TTL", { infer: true }),
      },
    );

    return {
      accessToken,
      refreshToken: this.generateRefreshToken(),
    };
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString("base64url");
  }

  /**
   * RS256 JWT used only to complete MFA after password login. Not valid as an API access token.
   */
  async issueMfaChallengeToken(sub: string, rememberMe: boolean): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub,
        tokenUse: "mfa_challenge",
        rememberMe,
      },
      {
        algorithm: "RS256",
        expiresIn: this.config.get("JWT_MFA_TTL", { infer: true }),
      },
    );
  }

  async verifyMfaChallengeToken(
    token: string,
  ): Promise<{ sub: string; rememberMe: boolean } | null> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        tokenUse?: string;
        rememberMe?: boolean;
      }>(token);
      if (payload.tokenUse !== "mfa_challenge" || typeof payload.sub !== "string") {
        return null;
      }
      return { sub: payload.sub, rememberMe: Boolean(payload.rememberMe) };
    } catch {
      return null;
    }
  }
}
