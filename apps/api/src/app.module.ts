import { randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { AppConfigModule } from "./shared/config/app-config.module";
import type { Env } from "./shared/config/env.schema";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { RedisModule } from "./shared/redis/redis.module";
import { StorageModule } from "./shared/storage/storage.module";
import { MessagingModule } from "./shared/messaging/messaging.module";
import { AuditModule } from "./shared/audit/audit.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { KycModule } from "./modules/kyc/kyc.module";
import { AdminModule } from "./modules/admin/admin.module";
import { ReferenceModule } from "./modules/reference/reference.module";
import { VacationRentalsModule } from "./modules/vacation-rentals/vacation-rentals.module";

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isDev = config.get("NODE_ENV", { infer: true }) === "development";
        return {
          pinoHttp: {
            level: config.get("LOG_LEVEL", { infer: true }),
            genReqId: () => randomUUID(),
            customProps: () => ({ service: "suknaa-api" }),
            // Per docs/SECURITY.md §8.3 — never log secrets, tokens, OTPs.
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                'req.headers["x-csrf-token"]',
                "*.password",
                "*.password_hash",
                "*.token",
                "*.refresh_token",
                "*.access_token",
                "*.secret",
                "*.totp_secret",
                "*.code",
                "*.otp",
                "*.mfa_token",
                "*.storageKey",
                "*.idFrontKey",
                "*.idBackKey",
                "*.selfieKey",
                "*.ownershipProofKey",
                "*.companyRegistrationKey",
                "*.taxCertificateKey",
                "*.authorizationLetterKey",
                "*.hotelLicenseKey",
                "*.id_front_url",
                "*.id_back_url",
                "*.selfie_url",
              ],
              censor: "[redacted]",
            },
            transport: isDev
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: "SYS:HH:MM:ss.l",
                    ignore: "pid,hostname,service",
                  },
                }
              : undefined,
          },
        };
      },
    }),
    PrismaModule,
    RedisModule,
    StorageModule,
    MessagingModule,
    AuditModule,
    HealthModule,
    AuthModule,
    KycModule,
    AdminModule,
    ReferenceModule,
    VacationRentalsModule,
  ],
})
export class AppModule {}
