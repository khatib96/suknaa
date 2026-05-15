import "reflect-metadata";
import { inspect } from "node:util";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";

interface LabelsPayload {
  data: Array<{ key: string; label_ar: string; label_en: string }>;
}

interface AmenitiesPayload {
  data: Array<{
    id: string;
    code: string;
    applies_to_vacation_rental: boolean;
  }>;
}

const REFERENCE_PATHS = [
  "/v1/reference/vacation-rental-types",
  "/v1/reference/space-types",
  "/v1/reference/booking-modes",
  "/v1/reference/cancellation-policies",
  "/v1/reference/amenities",
] as const;

function assertLabels(path: string, body: LabelsPayload): void {
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new Error(`${path}: expected non-empty data array`);
  }
  const first = body.data[0];
  if (!first?.key || !first.label_ar || !first.label_en) {
    throw new Error(`${path}: missing key/label_ar/label_en on first item`);
  }
  if ("meta" in (body as object)) {
    throw new Error(`${path}: response must not include meta`);
  }
}

async function run(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
    abortOnError: false,
  });

  // Match main.ts — routes live under /v1/* per API_SPEC.
  app.setGlobalPrefix("v1");

  try {
    await app.listen(0, "127.0.0.1");
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Could not resolve listen address");
    }
    const port = address.port;
    const base = `http://127.0.0.1:${port}`;

    for (const path of REFERENCE_PATHS.slice(0, 4)) {
      const res = await fetch(`${base}${path}`);
      if (!res.ok) {
        throw new Error(`${path}: HTTP ${res.status}`);
      }
      const cache = res.headers.get("cache-control") ?? "";
      if (!cache.includes("max-age=300")) {
        throw new Error(`${path}: expected Cache-Control max-age=300, got ${cache}`);
      }
      const body = (await res.json()) as LabelsPayload;
      assertLabels(path, body);
    }

    const amenitiesRes = await fetch(`${base}/v1/reference/amenities`);
    if (!amenitiesRes.ok) {
      throw new Error(`/v1/reference/amenities: HTTP ${amenitiesRes.status}`);
    }
    const amenitiesCache = amenitiesRes.headers.get("cache-control") ?? "";
    if (!amenitiesCache.includes("max-age=300")) {
      throw new Error(
        `/v1/reference/amenities: expected Cache-Control max-age=300, got ${amenitiesCache}`,
      );
    }
    const amenitiesBody = (await amenitiesRes.json()) as AmenitiesPayload;
    if (!Array.isArray(amenitiesBody.data) || amenitiesBody.data.length === 0) {
      throw new Error(
        "/v1/reference/amenities: expected seeded amenities — run db:seed first",
      );
    }
    if ("meta" in (amenitiesBody as object)) {
      throw new Error("/v1/reference/amenities: response must not include meta");
    }

    const result = {
      ok: true,
      amenityCount: amenitiesBody.data.length,
    };
    console.log(inspect(result, { depth: null, colors: true }));
  } finally {
    await app.close();
  }
}

run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
