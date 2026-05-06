import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import type { Env } from "../../shared/config/env.schema";
import { AuditModule } from "../../shared/audit/audit.module";
import { MessagingModule } from "../../shared/messaging/messaging.module";
import { PrismaModule } from "../../shared/prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { MockPasswordBreachCheckerService } from "./services/mock-password-breach-checker.service";
import { PasswordService } from "./services/password.service";
import { PASSWORD_BREACH_CHECKER } from "./services/password-breach-checker.interface";
import { TokensService } from "./services/tokens.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PrismaModule,
    MessagingModule,
    AuditModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const privatePath = resolve(
          process.cwd(),
          config.get("JWT_PRIVATE_KEY_PATH", { infer: true }),
        );
        const publicPath = resolve(
          process.cwd(),
          config.get("JWT_PUBLIC_KEY_PATH", { infer: true }),
        );

        if (!existsSync(privatePath) || !existsSync(publicPath)) {
          throw new Error(
            `Missing JWT keys. Expected files at ${privatePath} and ${publicPath}`,
          );
        }

        return {
          privateKey: readFileSync(privatePath, "utf8"),
          publicKey: readFileSync(publicPath, "utf8"),
          signOptions: {
            algorithm: "RS256",
            expiresIn: config.get("JWT_ACCESS_TTL", { infer: true }),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokensService,
    JwtStrategy,
    JwtAuthGuard,
    MockPasswordBreachCheckerService,
    {
      provide: PASSWORD_BREACH_CHECKER,
      useExisting: MockPasswordBreachCheckerService,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
