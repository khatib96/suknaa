import "reflect-metadata";
import { readFileSync, readdirSync } from "node:fs";
import { inspect } from "node:util";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { HostCategory, HostSubtype, WithdrawalSchedule } from "@prisma/client";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { PrismaService } from "../src/shared/prisma/prisma.service";

let currentStep = "starting";

async function run(): Promise<void> {
  currentStep = "create application context";
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });
  const auth = app.get(AuthService);
  const prisma = app.get(PrismaService);

  const ctx = {
    ipAddress: "127.0.0.1",
    userAgent: "m6-manual-script",
    requestId: `req-${Date.now()}`,
  };

  currentStep = "signup and verify user";
  const email = `m6_${Date.now()}@example.com`;
  const signup = await auth.signup(
    {
      fullName: "M6 Host Candidate",
      email,
      password: "Passw0rd1234",
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );
  const outboxDir = path.resolve(process.cwd(), ".dev-outbox");
  const verifyFile = readdirSync(outboxDir).sort().at(-1);
  if (!verifyFile) throw new Error("No outbox file for email verification");
  const raw = readFileSync(path.join(outboxDir, verifyFile), "utf8");
  const tokenMatch = (JSON.parse(raw) as { body: string }).body.match(/([A-Za-z0-9_-]{32,})/);
  if (!tokenMatch) throw new Error("Email token missing");
  await auth.verifyEmail(email, tokenMatch[1], ctx);

  currentStep = "login user";
  const login = await auth.login({ email, password: "Passw0rd1234", rememberMe: false }, ctx);
  if (!("accessToken" in login)) {
    throw new Error("Expected login to issue tokens for non-2FA user");
  }
  const user = await auth.getCurrentUser({
    sub: signup.userId,
    isGuest: true,
    isHost: false,
    isAdmin: false,
    isSuperAdmin: false,
    lastLoginAs: "guest",
  });

  currentStep = "set guest login intent";
  const guestIntent = await auth.setLoginIntent(
    {
      sub: user.id,
      isGuest: user.isGuest,
      isHost: user.isHost,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      lastLoginAs: user.lastLoginAs,
    },
    "guest",
    ctx,
  );
  if (guestIntent.becomeHostRequired || guestIntent.redirectTo !== "/dashboard") {
    throw new Error("Guest intent response is wrong");
  }

  currentStep = "set host login intent before host profile";
  const hostIntentBefore = await auth.setLoginIntent(
    {
      sub: user.id,
      isGuest: user.isGuest,
      isHost: user.isHost,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      lastLoginAs: user.lastLoginAs,
    },
    "host",
    ctx,
  );
  if (!hostIntentBefore.becomeHostRequired) {
    throw new Error("Host intent should require become-host before host profile exists");
  }

  currentStep = "verify become-host requires phone";
  let phoneRequired = false;
  try {
    await auth.becomeHost(
      {
        sub: user.id,
        isGuest: user.isGuest,
        isHost: user.isHost,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        lastLoginAs: user.lastLoginAs,
      },
      {
        hostCategory: HostCategory.real_estate,
        hostSubtype: HostSubtype.individual,
        displayName: "M6 Host",
        withdrawalSchedule: WithdrawalSchedule.monthly,
      },
      ctx,
    );
  } catch (error) {
    phoneRequired =
      error instanceof Error && error.message.includes("Phone verification is required");
  }
  if (!phoneRequired) {
    throw new Error("Expected PHONE_VERIFICATION_REQUIRED before become-host");
  }

  currentStep = "mark phone verified for host precondition";
  await prisma.user.update({
    where: { id: user.id },
    data: { phone: "+441632960962", phoneVerified: true },
  });

  currentStep = "create host profile";
  const becomeHost = await auth.becomeHost(
    {
      sub: user.id,
      isGuest: user.isGuest,
      isHost: user.isHost,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      lastLoginAs: user.lastLoginAs,
    },
    {
      hostCategory: HostCategory.real_estate,
      hostSubtype: HostSubtype.individual,
      displayName: "M6 Host",
      bioAr: "مضيف تجريبي",
      withdrawalSchedule: WithdrawalSchedule.monthly,
    },
    ctx,
  );
  if (becomeHost.hostProfile.isVerified) {
    throw new Error("New host profile must start unverified");
  }

  currentStep = "verify host profile and user flags";
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      isHost: true,
      lastLoginAs: true,
      hostProfile: { select: { hostCategory: true, hostSubtype: true, isVerified: true } },
    },
  });
  if (!dbUser.isHost || dbUser.lastLoginAs !== "host" || !dbUser.hostProfile) {
    throw new Error("User host flags/profile were not updated");
  }

  currentStep = "set host login intent after host profile";
  const hostIntentAfter = await auth.setLoginIntent(
    {
      sub: user.id,
      isGuest: true,
      isHost: true,
      isAdmin: false,
      isSuperAdmin: false,
      lastLoginAs: "host",
    },
    "host",
    ctx,
  );
  if (hostIntentAfter.becomeHostRequired || hostIntentAfter.redirectTo !== "/host/dashboard") {
    throw new Error("Host intent after profile is wrong");
  }

  currentStep = "verify audit logs";
  const auditActions = await prisma.auditLog.findMany({
    where: {
      actorUserId: user.id,
      action: { in: ["auth.login_intent_updated", "host.become_host"] },
    },
    select: { action: true },
  });
  const seen = new Set(auditActions.map((a) => a.action));
  if (!seen.has("auth.login_intent_updated") || !seen.has("host.become_host")) {
    throw new Error("Missing M6 audit actions");
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: user.id,
        isHost: dbUser.isHost,
        hostCategory: dbUser.hostProfile.hostCategory,
        hostSubtype: dbUser.hostProfile.hostSubtype,
      },
      null,
      2,
    ),
  );

  await app.close();
}

run().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`M6 manual verification failed at step: ${currentStep}`);
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.stack ?? error.message : inspect(error));
  process.exit(1);
});
