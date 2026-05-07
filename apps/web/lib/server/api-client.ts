import "server-only";

import type { NextRequest } from "next/server";
import type { AuthTokens } from "./auth-cookies";

type JsonLike = Record<string, unknown> | Array<unknown>;

interface BackendErrorShape {
  error?: {
    code?: string;
    message?: string;
    message_en?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    request_id?: string;
  };
}

export interface BackendResult<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: BackendErrorShape["error"];
  requestId?: string;
}

interface BackendRequestOptions {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: JsonLike | FormData;
  bearerToken?: string | null;
  request?: NextRequest;
}

interface ProtectedRequestResult<T> {
  result: BackendResult<T>;
  rotatedTokens?: AuthTokens;
  shouldClearAuthCookies?: boolean;
}

function getApiBaseUrl(): string {
  const base = process.env.SUKNAA_API_BASE_URL;
  if (!base) {
    throw new Error("Missing SUKNAA_API_BASE_URL");
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function shouldUseJsonBody(body: JsonLike | FormData | undefined): body is JsonLike {
  return Boolean(body && !(body instanceof FormData));
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return undefined;
  }
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function backendRequest<T = unknown>(
  options: BackendRequestOptions,
): Promise<BackendResult<T>> {
  const url = `${getApiBaseUrl()}${options.path.startsWith("/") ? options.path : `/${options.path}`}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const reqId = options.request?.headers.get("x-request-id");
  if (reqId) {
    headers.set("x-request-id", reqId);
  }
  const lang = options.request?.headers.get("accept-language");
  if (lang) {
    headers.set("accept-language", lang);
  }
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (internalApiKey) {
    headers.set("x-internal-api-key", internalApiKey);
  }
  if (options.bearerToken) {
    headers.set("Authorization", `Bearer ${options.bearerToken}`);
  }
  if (shouldUseJsonBody(options.body)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : shouldUseJsonBody(options.body)
          ? JSON.stringify(options.body)
          : undefined,
    cache: "no-store",
  });

  const raw = await parseResponseBody(response);
  const parsed = (raw ?? {}) as BackendErrorShape & Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: parsed.error ?? {
        code: "UPSTREAM_ERROR",
        message: "Request failed",
      },
      requestId: parsed.meta?.request_id,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: parsed as T,
    requestId: parsed.meta?.request_id,
  };
}

export async function backendAuthedRequest<T = unknown>(options: {
  request: NextRequest;
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: JsonLike | FormData;
  accessToken?: string | null;
  refreshToken?: string | null;
}): Promise<ProtectedRequestResult<T>> {
  const first = await backendRequest<T>({
    path: options.path,
    method: options.method,
    body: options.body,
    bearerToken: options.accessToken,
    request: options.request,
  });

  if (first.ok || first.status !== 401) {
    return { result: first };
  }

  if (!options.refreshToken) {
    return {
      result: {
        ok: false,
        status: 401,
        error: {
          code: "SESSION_EXPIRED",
          message: "Session expired",
          message_en: "Session expired",
        },
      },
      shouldClearAuthCookies: true,
    };
  }

  const refresh = await backendRequest<{
    accessToken: string;
    refreshToken: string;
  }>({
    path: "/auth/refresh",
    method: "POST",
    body: { refreshToken: options.refreshToken },
    request: options.request,
  });

  if (!refresh.ok || !refresh.data?.accessToken || !refresh.data?.refreshToken) {
    return {
      result: {
        ok: false,
        status: 401,
        error: {
          code: "SESSION_EXPIRED",
          message: "Session expired",
          message_en: "Session expired",
        },
      },
      shouldClearAuthCookies: true,
    };
  }

  const rotatedTokens: AuthTokens = {
    accessToken: refresh.data.accessToken,
    refreshToken: refresh.data.refreshToken,
  };
  const retry = await backendRequest<T>({
    path: options.path,
    method: options.method,
    body: options.body,
    bearerToken: rotatedTokens.accessToken,
    request: options.request,
  });

  return {
    result: retry,
    rotatedTokens,
    shouldClearAuthCookies: !retry.ok && retry.status === 401,
  };
}
