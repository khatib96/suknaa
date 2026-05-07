import { NextResponse } from "next/server";
import { createCsrfToken, setCsrfCookie } from "@/lib/server/csrf";

export async function GET() {
  const csrfToken = createCsrfToken();
  const response = NextResponse.json({ csrfToken }, { status: 200 });
  setCsrfCookie(response, csrfToken);
  return response;
}
