import "reflect-metadata";
import { createHash } from "node:crypto";
import { inspect } from "node:util";
import { HttpException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { RedisService } from "../src/shared/redis/redis.service";

function assertRateLimited(err: unknown): void {
  if (!(err instanceof HttpException)) {
    throw new Error(`Expected HttpException, got ${inspect(err)}`);
  }
  if (err.getStatus() !== 429) {
    throw new Error(`Expected HTTP 429, got ${err.getStatus()}`);
  }
  const body = err.getResponse();
  if (typeof body !== "object" || body === null || !("code" in body)) {
    throw new Error(`Expected error body with code, got ${inspect(body)}`);
  }
  const b = body as { code?: string; message?: string; message_en?: string };
  if (b.code !== "AUTH_LOGIN_RATE_LIMITED") {
    throw new Error(`Expected code AUTH_LOGIN_RATE_LIMITED, got ${inspect(b.code)}`);
  }
  if (typeof b.message !== "string" || b.message.length === 0) {
    throw new Error("Expected non-empty message");
  }
  if (typeof b.message_en !== "string" || b.message_en.length === 0) {
    throw new Error("Expected non-empty message_en");
  }
}

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  const redis = app.get(RedisService);
  await redis.ping();

  const auth = app.get(AuthService);
  const runId = Date.now().toString();
  const ctx = {
    ipAddress: "127.0.0.1",
    userAgent: "manual-m3-verify",
    requestId: `req-m3-${runId}`,
  };
  const email = `m3_rl_probe_${runId}@example.com`;

  const rlKeyMaterial = `login|v1|${ctx.ipAddress}|${email.toLowerCase()}`;
  const suffix = createHash("sha256").update(rlKeyMaterial, "utf8").digest("hex").slice(0, 32);
  const fullKey = redis.buildKey(`auth:rl:login:${suffix}`);
  await redis.client.del(fullKey);

  for (let i = 1; i <= 5; i += 1) {
    try {
      await auth.login(
        { email, password: "WrongPassword999!", rememberMe: false },
        ctx,
      );
      throw new Error(`Attempt ${i}: expected INVALID_CREDENTIALS`);
    } catch (e: unknown) {
      if (e instanceof HttpException && e.getStatus() === 429) {
        throw new Error(`Attempt ${i}: unexpected 429 before 6th try`);
      }
      if (!(e instanceof HttpException) || e.getStatus() !== 401) {
        throw new Error(`Attempt ${i}: expected 401, got ${inspect(e)}`);
      }
      const body = e.getResponse();
      if (
        typeof body !== "object" ||
        body === null ||
        (body as { code?: string }).code !== "INVALID_CREDENTIALS"
      ) {
        throw new Error(`Attempt ${i}: expected INVALID_CREDENTIALS`);
      }
    }
  }

  try {
    await auth.login(
      { email, password: "WrongPassword999!", rememberMe: false },
      ctx,
    );
    throw new Error("6th login attempt should have been rate limited");
  } catch (e: unknown) {
    assertRateLimited(e);
  }

  await app.close();
  console.log(
    JSON.stringify({ ok: true, checked: "AUTH_LOGIN_RATE_LIMITED after 6 attempts" }),
  );
}

run().catch((error: unknown) => {
  console.error("M3 manual verification failed");
  console.error(error instanceof Error ? error.stack ?? error.message : inspect(error));
  process.exit(1);
});
