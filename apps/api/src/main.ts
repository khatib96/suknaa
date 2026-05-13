import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import type { Env } from "./shared/config/env.schema";
import { GlobalExceptionFilter } from "./shared/errors/global-exception.filter";

function parseCorsOrigins(raw: string): Set<string> {
  return new Set(
    raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  );
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Wire Pino as the framework logger so Nest's own logs go through it too.
  app.useLogger(app.get(PinoLogger));

  const config = app.get(ConfigService<Env, true>);

  // Helmet: CSP disabled temporarily so Swagger UI at /api/docs keeps working.
  // CSP remains important for production APIs; a tailored policy (or hosting Swagger separately) is deferred.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // All controllers live under /v1/* per docs/API_SPEC.md.
  // Swagger UI mounts at /api/docs and is excluded from the prefix below.
  app.setGlobalPrefix("v1");

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.set("trust proxy", 1);

  const allowedOriginSet = parseCorsOrigins(
    config.get("CORS_ORIGINS", { infer: true }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOriginSet.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-CSRF-Token",
      "X-Request-Id",
      "Accept-Language",
    ],
  });

  const port = config.get("PORT", { infer: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Suknaa API")
    .setDescription(
      "Suknaa internal API. Phase 2 (Auth + KYC) — Milestone 1 scaffold.",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, "0.0.0.0");

  const logger = app.get(PinoLogger);
  logger.log(`Suknaa API listening on http://localhost:${port}`);
  logger.log(`Health: http://localhost:${port}/v1/health`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  process.stderr.write(`Fatal error during bootstrap: ${String(err)}\n`);
  process.exit(1);
});
