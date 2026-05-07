import { NextRequest, NextResponse } from "next/server";
import { backendRequest } from "@/lib/server/api-client";
import { bffError } from "@/lib/server/api-errors";
import { fromBackendResult } from "@/lib/server/bff-response";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { assertCsrf } from "@/lib/server/csrf";

interface LoginSuccessBody {
  requires_2fa?: boolean;
  mfa_token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return bffError(403, "CSRF_INVALID", "رمز الحماية غير صالح");
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return bffError(400, "VALIDATION_ERROR", "بيانات الطلب غير صالحة");
  }

  const result = await backendRequest<LoginSuccessBody>({
    path: "/auth/login",
    method: "POST",
    body: body as Record<string, unknown>,
    request,
  });
  if (!result.ok) {
    return fromBackendResult(result);
  }

  if (result.data?.requires_2fa) {
    return NextResponse.json(
      {
        requires_2fa: true,
        mfa_token: result.data.mfa_token,
      },
      { status: result.status },
    );
  }

  if (!result.data?.accessToken || !result.data?.refreshToken) {
    return bffError(502, "BFF_TOKEN_MISSING", "تعذر إنشاء الجلسة");
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
