import { NextRequest } from "next/server";
import { backendAuthedRequest } from "@/lib/server/api-client";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/server/auth-cookies";
import { fromBackendResult } from "@/lib/server/bff-response";

export async function GET(request: NextRequest) {
  const { accessToken, refreshToken } = readAuthCookies(request);
  const search = request.nextUrl.search;
  const path = search ? `/me/kyc/history${search}` : "/me/kyc/history";

  const { result, rotatedTokens, shouldClearAuthCookies } =
    await backendAuthedRequest({
      request,
      path,
      method: "GET",
      accessToken,
      refreshToken,
    });
  const response = fromBackendResult(result);
  if (rotatedTokens) setAuthCookies(response, rotatedTokens);
  if (shouldClearAuthCookies) clearAuthCookies(response);
  return response;
}
