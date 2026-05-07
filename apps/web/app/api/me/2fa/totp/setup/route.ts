import { NextRequest } from "next/server";
import { backendAuthedRequest } from "@/lib/server/api-client";
import { bffError } from "@/lib/server/api-errors";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/server/auth-cookies";
import { fromBackendResult } from "@/lib/server/bff-response";
import { assertCsrf } from "@/lib/server/csrf";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return bffError(403, "CSRF_INVALID", "رمز الحماية غير صالح");
  }
  const { accessToken, refreshToken } = readAuthCookies(request);
  const { result, rotatedTokens, shouldClearAuthCookies } =
    await backendAuthedRequest({
      request,
      path: "/me/2fa/totp/setup",
      method: "POST",
      accessToken,
      refreshToken,
    });
  const response = fromBackendResult(result);
  if (rotatedTokens) setAuthCookies(response, rotatedTokens);
  if (shouldClearAuthCookies) clearAuthCookies(response);
  return response;
}
