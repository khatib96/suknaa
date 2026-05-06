import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Env } from "../../../shared/config/env.schema";
import { unauthorizedError } from "../../../shared/errors/api-error.helpers";
import type { AuthenticatedUser } from "../types/authenticated-user.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const publicKeyPath = resolve(
      process.cwd(),
      config.get("JWT_PUBLIC_KEY_PATH", { infer: true }),
    );
    const publicKey = readFileSync(publicKeyPath, "utf8");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ["RS256"],
      secretOrKey: publicKey,
    });
  }

  validate(payload: AuthenticatedUser & { tokenUse?: string }): AuthenticatedUser {
    if (payload.tokenUse === "mfa_challenge") {
      throw unauthorizedError({
        code: "INVALID_TOKEN_TYPE",
        message: "This token is only for completing two-factor sign-in",
        message_en: "This token is only for completing two-factor sign-in",
      });
    }
    return payload;
  }
}
