import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./env.schema";

/**
 * Wraps `@nestjs/config` with a Zod validator so the app fails fast on
 * misconfigured env vars (e.g. missing DATABASE_URL).
 *
 * `ConfigService<Env, true>` can then be injected anywhere with full type
 * safety:
 *
 *   constructor(private config: ConfigService<Env, true>) {}
 *   const port = this.config.get("PORT", { infer: true });
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (raw) => {
        const result = envSchema.safeParse(raw);
        if (!result.success) {
          const fieldErrors = result.error.flatten().fieldErrors;
          const summary = Object.entries(fieldErrors)
            .map(([key, msgs]) => `${key}: ${(msgs ?? []).join(", ")}`)
            .join("; ");
          throw new Error(`Invalid environment configuration — ${summary}`);
        }
        return result.data;
      },
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
