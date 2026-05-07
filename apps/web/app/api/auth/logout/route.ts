import { NextRequest, NextResponse } from "next/server";
import { backendRequest } from "@/lib/server/api-client";
import { bffError } from "@/lib/server/api-errors";
import { clearAuthCookies, readAuthCookies } from "@/lib/server/auth-cookies";
import { assertCsrf } from "@/lib/server/csrf";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return bffError(403, "CSRF_INVALID", "رمز الحماية غير صالح");
  }

  const { refreshToken } = readAuthCookies(request);
  const response = NextResponse.json({ revoked: true }, { status: 200 });

  if (!refreshToken) {
    clearAuthCookies(response);
    return response;
  }

  await backendRequest({
    path: "/auth/logout",
    method: "POST",
    body: { refreshToken },
    request,
  });

  clearAuthCookies(response);
  return response;
}
