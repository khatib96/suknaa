const CSRF_COOKIE = "suknaa_csrf_token";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const parts = document.cookie.split(";").map((v) => v.trim());
  const target = parts.find((v) => v.startsWith(`${name}=`));
  if (!target) {
    return null;
  }
  return decodeURIComponent(target.slice(name.length + 1));
}

export async function ensureCsrfToken(): Promise<string> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) {
    return existing;
  }
  const response = await fetch("/api/csrf", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  const body = (await response.json().catch(() => null)) as
    | { csrfToken?: string }
    | null;
  if (!response.ok || !body?.csrfToken) {
    throw new Error("تعذر تهيئة حماية الطلب");
  }
  return body.csrfToken;
}
