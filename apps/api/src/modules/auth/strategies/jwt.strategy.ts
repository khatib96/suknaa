import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Env } from "../../../shared/config/env.schema";
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

  validate(payload: AuthenticatedUser): AuthenticatedUser {
    return payload;
  }
}
