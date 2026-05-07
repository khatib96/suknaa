import { NextResponse } from "next/server";
import type { BackendResult } from "./api-client";

export function fromBackendResult<T>(result: BackendResult<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data ?? {}, { status: result.status });
  }
  return NextResponse.json(
    {
      error: {
        code: result.error?.code ?? "UPSTREAM_ERROR",
        message: result.error?.message ?? "Request failed",
        ...(result.error?.message_en
          ? { message_en: result.error.message_en }
          : {}),
        ...(result.error?.details ? { details: result.error.details } : {}),
      },
      ...(result.requestId ? { meta: { request_id: result.requestId } } : {}),
    },
    { status: result.status },
  );
}
