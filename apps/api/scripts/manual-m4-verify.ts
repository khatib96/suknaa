import "reflect-metadata";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const auth = app.get(AuthService);
  const prisma = app.get(PrismaService);
  const jwt = app.get(JwtService);

  const email = `m4_${Date.now()}@example.com`;
  const ctx = {
    ipAddress: "127.0.0.1",
    userAgent: "m4-manual-script",
    requestId: `req-${Date.now()}`,
  };

  const signup = await auth.signup(
    {
      fullName: "M4 Test User",
      email,
      password: "Passw0rd1234",
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );

  const outboxDir = path.resolve(".dev-outbox");
  const newestOutboxFile = readdirSync(outboxDir).sort().at(-1);
  if (!newestOutboxFile) {
    throw new Error("No outbox file found");
  }
  const outboxRaw = readFileSync(path.join(outboxDir, newestOutboxFile), "utf8");
  const outboxJson = JSON.parse(outboxRaw) as { body: string };
  const tokenMatch = outboxJson.body.match(/([A-Za-z0-9_-]{32,})/);
  if (!tokenMatch) {
    throw new Error("Verification token missing in outbox");
  }

  await auth.verifyEmail(email, tokenMatch[1], ctx);
  const login = await auth.login({ email, password: "Passw0rd1234", rememberMe: false }, ctx);

  const sessionId1 = login.refreshToken.split(".")[0];
  const session1 = await prisma.authSession.findUniqueOrThrow({ where: { id: sessionId1 } });
  const refreshHashDiffers = session1.refreshTokenHash !== login.refreshToken;

  const refreshed = await auth.refresh(login.refreshToken, ctx);
  const oldSessionAfterRefresh = await prisma.authSession.findUniqueOrThrow({
    where: { id: sessionId1 },
  });
  const sessionId2 = refreshed.refreshToken.split(".")[0];

  await auth.logout(refreshed.refreshToken, ctx);
  const claims = await jwt.verifyAsync(refreshed.accessToken);
  const me = await auth.getCurrentUser(claims);

  const auditCount = await prisma.auditLog.count({
    where: {
      actorUserId: signup.userId,
      action: {
        in: ["auth.signup", "auth.email_verified", "auth.login", "auth.refresh", "auth.logout"],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        email,
        signupUserId: signup.userId,
        refreshHashDiffers,
        oldSessionRevokedAfterRefresh: oldSessionAfterRefresh.revokedAt !== null,
        secondSessionId: sessionId2,
        meUserId: me.id,
        auditCount,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
