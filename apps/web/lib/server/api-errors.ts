import { NextResponse } from "next/server";

export interface BffErrorPayload {
  error: {
    code: string;
    message: string;
    message_en?: string;
    details?: Record<string, unknown>;
  };
}

export function bffError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): NextResponse<BffErrorPayload> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}
