import { NextRequest, NextResponse } from "next/server";
import { backendRequest } from "@/lib/server/api-client";
import { bffError } from "@/lib/server/api-errors";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/server/auth-cookies";
import { fromBackendResult } from "@/lib/server/bff-response";
import { assertCsrf } from "@/lib/server/csrf";

interface RefreshSuccessBody {
  accessToken?: string;
  refreshToken?: string;
  user?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return bffError(403, "CSRF_INVALID", "رمز الحماية غير صالح");
  }

  const { refreshToken } = readAuthCookies(request);
  if (!refreshToken) {
    const response = bffError(401, "SESSION_EXPIRED", "انتهت الجلسة");
    clearAuthCookies(response);
    return response;
  }

  const result = await backendRequest<RefreshSuccessBody>({
    path: "/auth/refresh",
    method: "POST",
    body: { refreshToken },
    request,
  });
  if (!result.ok) {
    const response = fromBackendResult(result);
    clearAuthCookies(response);
    return response;
  }
  if (!result.data?.accessToken || !result.data?.refreshToken) {
    const response = bffError(502, "BFF_TOKEN_MISSING", "تعذر إنشاء الجلسة");
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json(
    {
      user: result.data.user ?? null,
    },
    { status: result.status },
  );
  setAuthCookies(response, {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  });
  return response;
}
