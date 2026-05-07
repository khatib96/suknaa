import { NextRequest } from "next/server";
import { backendRequest } from "@/lib/server/api-client";
import { bffError } from "@/lib/server/api-errors";
import { fromBackendResult } from "@/lib/server/bff-response";
import { assertCsrf } from "@/lib/server/csrf";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return bffError(403, "CSRF_INVALID", "رمز الحماية غير صالح");
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return bffError(400, "VALIDATION_ERROR", "بيانات الطلب غير صالحة");
  }

  const result = await backendRequest({
    path: "/auth/password-reset/request",
    method: "POST",
    body: body as Record<string, unknown>,
    request,
  });
  return fromBackendResult(result);
}
