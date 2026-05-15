import "reflect-metadata";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { inspect } from "node:util";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
  HostCategory,
  HostSubtype,
  WithdrawalSchedule,
} from "@prisma/client";
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/auth.service";
import { GlobalExceptionFilter } from "../src/shared/errors/global-exception.filter";
import { PrismaService } from "../src/shared/prisma/prisma.service";

const PASSWORD = "Passw0rd1234";
const CREATE_PAYLOAD = {
  vacation_rental_type: "house",
  title_ar: "بيت عطلة تجريبي للتحقق",
  description_ar: "وصف تجريبي لبيت عطلة يستخدم في سكربت التحقق اليدوي.",
  governorate: "دمشق",
  city: "Damascus",
  location: { lat: 33.5138, lng: 36.2765 },
  max_guests: 4,
  bedrooms_count: 2,
  beds_count: 3,
  bathrooms_count: 1.5,
  base_price_cents: 50_000,
  cleaning_fee_cents: 500,
  minimum_stay_nights: 1,
  cancellation_policy: "medium",
} as const;

function testClientIp(runId: string, scope: string): string {
  const digest = createHash("sha256").update(`${runId}:${scope}`).digest();
  const a = 10;
  const b = digest.readUInt8(0) % 255 || 1;
  const c = digest.readUInt8(1) % 255 || 1;
  const d = digest.readUInt8(2) % 255 || 1;
  return `${a}.${b}.${c}.${d}`;
}

function ctxForScope(runId: string, scope: string): {
  ipAddress: string;
  userAgent: string;
  requestId: string;
} {
  return {
    ipAddress: testClientIp(runId, scope),
    userAgent: "p3-m4-manual-script",
    requestId: `req-${runId}-${scope}`,
  };
}

function readApiErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  const err = root.error;
  if (!err || typeof err !== "object" || Array.isArray(err)) return undefined;
  const e = err as Record<string, unknown>;
  if (typeof e.code === "string") return e.code;
  const msg = e.message;
  if (msg && typeof msg === "object" && !Array.isArray(msg)) {
    const nested = msg as Record<string, unknown>;
    if (typeof nested.code === "string") return nested.code;
  }
  return undefined;
}

interface ListingPayload {
  data: {
    id: string;
    status: string;
    vacation_rental_type: string;
    host_id: string;
    location: { lat: number; lng: number };
  };
}

interface ListPayload {
  data: Array<{ id: string; host_id: string }>;
}

let currentStep = "starting";
const createdListingIds: string[] = [];
const createdUserIds: string[] = [];

async function signupVerifyAndLogin(
  auth: AuthService,
  email: string,
  ctx: { ipAddress: string; userAgent: string; requestId: string },
): Promise<{ userId: string; accessToken: string }> {
  const signup = await auth.signup(
    {
      fullName: "P3 M4 Verify User",
      email,
      password: PASSWORD,
      preferredLanguage: "ar",
      marketingOptIn: false,
    },
    ctx,
  );
  createdUserIds.push(signup.userId);

  const outboxDir = path.resolve(process.cwd(), ".dev-outbox");
  const verifyFiles = readdirSync(outboxDir).sort().reverse();
  let verifyToken: string | null = null;
  for (const file of verifyFiles) {
    const raw = readFileSync(path.join(outboxDir, file), "utf8");
    const parsed = JSON.parse(raw) as {
      body: string;
      metadata?: { kind?: string; userId?: string };
    };
    if (
      parsed.metadata?.kind !== "email_verification" ||
      parsed.metadata.userId !== signup.userId
    ) {
      continue;
    }
    const tokenMatch = parsed.body.match(/([A-Za-z0-9_-]{32,})/);
    if (tokenMatch?.[1]) {
      verifyToken = tokenMatch[1];
      break;
    }
  }
  if (!verifyToken) throw new Error("Email token missing for user");
  await auth.verifyEmail(email, verifyToken, ctx);

  const login = await auth.login({ email, password: PASSWORD, rememberMe: false }, ctx);
  if (!("accessToken" in login)) {
    throw new Error("Expected access token from login");
  }
  return { userId: signup.userId, accessToken: login.accessToken };
}

async function becomeVacationRentalHost(
  auth: AuthService,
  prisma: PrismaService,
  userId: string,
  accessToken: string,
  ctx: { ipAddress: string; userAgent: string; requestId: string },
  hostCategory: HostCategory,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { phone: `+9639${String(Date.now()).slice(-8)}`, phoneVerified: true },
  });

  const me = await auth.getCurrentUser({
    sub: userId,
    isGuest: true,
    isHost: false,
    isAdmin: false,
    isSuperAdmin: false,
    lastLoginAs: "guest",
  });

  await auth.becomeHost(
    {
      sub: userId,
      isGuest: me.isGuest,
      isHost: me.isHost,
      isAdmin: me.isAdmin,
      isSuperAdmin: me.isSuperAdmin,
      lastLoginAs: me.lastLoginAs,
    },
    {
      hostCategory,
      hostSubtype:
        hostCategory === HostCategory.hospitality
          ? HostSubtype.hotel_company
          : HostSubtype.individual,
      displayName: hostCategory === HostCategory.hospitality ? "Hotel Co" : "VR Host",
      withdrawalSchedule: WithdrawalSchedule.monthly,
    },
    ctx,
  );

  void accessToken;
}

async function apiFetch(
  base: string,
  method: string,
  path: string,
  token: string | null,
  body?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  return fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function expectStatus(
  res: Response,
  expected: number,
  label: string,
): Promise<void> {
  if (res.status !== expected) {
    const text = await res.text();
    throw new Error(`${label}: expected HTTP ${expected}, got ${res.status}: ${text}`);
  }
}

async function run(): Promise<void> {
  const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  currentStep = "create application";
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
    abortOnError: false,
  });
  app.setGlobalPrefix("v1");
  app.useGlobalFilters(new GlobalExceptionFilter());

  const auth = app.get(AuthService);
  const prisma = app.get(PrismaService);

  try {
    await app.listen(0, "127.0.0.1");
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Could not resolve listen address");
    }
    const base = `http://127.0.0.1:${address.port}`;

    currentStep = "guest cannot create";
    const guestEmail = `p3m4_guest_${runId}@example.com`;
    const guest = await signupVerifyAndLogin(
      auth,
      guestEmail,
      ctxForScope(runId, "guest"),
    );
    const guestCreate = await apiFetch(
      base,
      "POST",
      "/v1/me/vacation-rentals",
      guest.accessToken,
      CREATE_PAYLOAD,
    );
    await expectStatus(guestCreate, 403, "guest create");
    const guestErrBody: unknown = await guestCreate.json();
    if (readApiErrorCode(guestErrBody) !== "NOT_A_HOST") {
      throw new Error(
        `guest create: expected NOT_A_HOST, got ${readApiErrorCode(guestErrBody) ?? "none"}`,
      );
    }

    currentStep = "host A create draft";
    const hostAEmail = `p3m4_hosta_${runId}@example.com`;
    const hostACtx = ctxForScope(runId, "hostA");
    const hostA = await signupVerifyAndLogin(auth, hostAEmail, hostACtx);
    await becomeVacationRentalHost(
      auth,
      prisma,
      hostA.userId,
      hostA.accessToken,
      hostACtx,
      HostCategory.real_estate,
    );
    const hostALogin = await auth.login(
      { email: hostAEmail, password: PASSWORD, rememberMe: false },
      hostACtx,
    );
    if (!("accessToken" in hostALogin)) throw new Error("host A re-login failed");
    const hostAToken = hostALogin.accessToken;

    currentStep = "invalid uuid param returns 400";
    const invalidIdRes = await apiFetch(
      base,
      "GET",
      "/v1/me/vacation-rentals/not-a-uuid",
      hostAToken,
    );
    await expectStatus(invalidIdRes, 400, "invalid vacation rental id");
    const invalidIdBody: unknown = await invalidIdRes.json();
    if (readApiErrorCode(invalidIdBody) !== "VALIDATION_ERROR") {
      throw new Error(
        `invalid id: expected VALIDATION_ERROR, got ${readApiErrorCode(invalidIdBody) ?? "none"}`,
      );
    }

    const createRes = await apiFetch(
      base,
      "POST",
      "/v1/me/vacation-rentals",
      hostAToken,
      CREATE_PAYLOAD,
    );
    if (createRes.status !== 200 && createRes.status !== 201) {
      const text = await createRes.text();
      throw new Error(`host A create: expected HTTP 200/201, got ${createRes.status}: ${text}`);
    }
    const created = (await createRes.json()) as ListingPayload;
    if (created.data.status !== "draft") {
      throw new Error(`expected draft status, got ${created.data.status}`);
    }
    if (created.data.vacation_rental_type !== "house") {
      throw new Error("expected vacation_rental_type house in response");
    }
    if (!created.data.location?.lat || !created.data.location?.lng) {
      throw new Error("expected location in create response");
    }
    createdListingIds.push(created.data.id);

    currentStep = "host A list own only";
    const listRes = await apiFetch(base, "GET", "/v1/me/vacation-rentals", hostAToken);
    await expectStatus(listRes, 200, "host A list");
    const listBody = (await listRes.json()) as ListPayload;
    if (listBody.data.length !== 1 || listBody.data[0]?.id !== created.data.id) {
      throw new Error("host A list should contain exactly their listing");
    }

    currentStep = "host B cross-host 404";
    const hostBEmail = `p3m4_hostb_${runId}@example.com`;
    const hostBCtx = ctxForScope(runId, "hostB");
    const hostB = await signupVerifyAndLogin(auth, hostBEmail, hostBCtx);
    await becomeVacationRentalHost(
      auth,
      prisma,
      hostB.userId,
      hostB.accessToken,
      hostBCtx,
      HostCategory.real_estate,
    );
    const hostBLogin = await auth.login(
      { email: hostBEmail, password: PASSWORD, rememberMe: false },
      hostBCtx,
    );
    if (!("accessToken" in hostBLogin)) throw new Error("host B re-login failed");
    const hostBToken = hostBLogin.accessToken;

    for (const [method, apiPath] of [
      ["GET", `/v1/me/vacation-rentals/${created.data.id}`],
      ["PATCH", `/v1/me/vacation-rentals/${created.data.id}`],
      ["DELETE", `/v1/me/vacation-rentals/${created.data.id}`],
    ] as const) {
      const res = await apiFetch(
        base,
        method,
        apiPath,
        hostBToken,
        method === "PATCH" ? { title_ar: "محاولة تعديل" } : undefined,
      );
      await expectStatus(res, 404, `host B ${method}`);
    }

    currentStep = "host A patch stay range validation";
    const patchMaxRes = await apiFetch(
      base,
      "PATCH",
      `/v1/me/vacation-rentals/${created.data.id}`,
      hostAToken,
      { maximum_stay_nights: 2 },
    );
    await expectStatus(patchMaxRes, 200, "host A patch maximum_stay_nights");

    const patchInvalidRangeRes = await apiFetch(
      base,
      "PATCH",
      `/v1/me/vacation-rentals/${created.data.id}`,
      hostAToken,
      { minimum_stay_nights: 3 },
    );
    await expectStatus(patchInvalidRangeRes, 422, "host A patch invalid stay range");
    const invalidRangeBody: unknown = await patchInvalidRangeRes.json();
    if (readApiErrorCode(invalidRangeBody) !== "VACATION_RENTAL_INVALID_STAY_RANGE") {
      throw new Error(
        `invalid stay range: expected VACATION_RENTAL_INVALID_STAY_RANGE, got ${readApiErrorCode(invalidRangeBody) ?? "none"}`,
      );
    }

    currentStep = "host A patch draft";
    const patchRes = await apiFetch(
      base,
      "PATCH",
      `/v1/me/vacation-rentals/${created.data.id}`,
      hostAToken,
      { title_ar: "بيت عطلة محدّث", minimum_stay_nights: 1 },
    );
    await expectStatus(patchRes, 200, "host A patch");

    currentStep = "host A delete draft";
    const deleteRes = await apiFetch(
      base,
      "DELETE",
      `/v1/me/vacation-rentals/${created.data.id}`,
      hostAToken,
    );
    await expectStatus(deleteRes, 200, "host A delete");
    createdListingIds.pop();

    const listAfterDelete = await apiFetch(
      base,
      "GET",
      "/v1/me/vacation-rentals",
      hostAToken,
    );
    await expectStatus(listAfterDelete, 200, "host A list after delete");
    const listAfterBody = (await listAfterDelete.json()) as ListPayload;
    if (listAfterBody.data.length !== 0) {
      throw new Error("deleted listing should not appear in list");
    }

    currentStep = "hospitality host cannot create";
    const hospEmail = `p3m4_hosp_${runId}@example.com`;
    const hospCtx = ctxForScope(runId, "hospitality");
    const hosp = await signupVerifyAndLogin(auth, hospEmail, hospCtx);
    await becomeVacationRentalHost(
      auth,
      prisma,
      hosp.userId,
      hosp.accessToken,
      hospCtx,
      HostCategory.hospitality,
    );
    const hospLogin = await auth.login(
      { email: hospEmail, password: PASSWORD, rememberMe: false },
      hospCtx,
    );
    if (!("accessToken" in hospLogin)) throw new Error("hospitality re-login failed");

    const hospCreate = await apiFetch(
      base,
      "POST",
      "/v1/me/vacation-rentals",
      hospLogin.accessToken,
      CREATE_PAYLOAD,
    );
    await expectStatus(hospCreate, 403, "hospitality create");
    const hospErrBody: unknown = await hospCreate.json();
    if (readApiErrorCode(hospErrBody) !== "WRONG_HOST_CATEGORY") {
      throw new Error(
        `hospitality create: expected WRONG_HOST_CATEGORY, got ${readApiErrorCode(hospErrBody) ?? "none"}`,
      );
    }

    console.log(
      inspect(
        {
          ok: true,
          runId,
          hostAUserId: hostA.userId,
          listingDeleted: created.data.id,
        },
        { depth: null, colors: true },
      ),
    );
  } finally {
    currentStep = "cleanup";
    const now = new Date();
    for (const listingId of createdListingIds) {
      await prisma.vacationRental
        .update({
          where: { id: listingId },
          data: { deletedAt: now },
        })
        .catch(() => undefined);
    }
    await app.close();
  }
}

run().catch((error: unknown) => {
  console.error(`P3 M4 manual verification failed at step: ${currentStep}`);
  console.error(
    error instanceof Error ? error.stack ?? error.message : inspect(error),
  );
  process.exit(1);
});
