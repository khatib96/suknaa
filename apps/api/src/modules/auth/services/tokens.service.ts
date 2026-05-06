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
}
