import type { NextRequest, NextResponse } from "next/server";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const ACCESS_TOKEN_COOKIE = "suknaa_access_token";
export const REFRESH_TOKEN_COOKIE = "suknaa_refresh_token";

const ACCESS_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function readAuthCookies(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthTokens,
): void {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: tokens.refreshToken,
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 0,
  });
}
