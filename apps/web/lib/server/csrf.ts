import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE = "suknaa_csrf_token";
export const CSRF_HEADER = "x-csrf-token";

function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function createCsrfToken(): string {
  return randomUUID();
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: CSRF_COOKIE,
    value: token,
    httpOnly: false,
    sameSite: "strict",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 24 * 60 * 60,
  });
}

export function issueCsrfToken(response: NextResponse): string {
  const token = createCsrfToken();
  setCsrfCookie(response, token);
  return token;
}

export function readCsrfFromRequest(request: NextRequest): {
  cookieToken: string | null;
  headerToken: string | null;
} {
  return {
    cookieToken: request.cookies.get(CSRF_COOKIE)?.value ?? null,
    headerToken: request.headers.get(CSRF_HEADER),
  };
}

export function assertCsrf(request: NextRequest): boolean {
  const { cookieToken, headerToken } = readCsrfFromRequest(request);
  return Boolean(cookieToken && headerToken && cookieToken === headerToken);
}
