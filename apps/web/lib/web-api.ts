import { ensureCsrfToken } from "@/lib/csrf-client";

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    message_en?: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const KNOWN_ERROR_MESSAGES_AR: Record<string, string> = {
  INVALID_CREDENTIALS: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  EMAIL_NOT_VERIFIED: "يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول.",
  EMAIL_ALREADY_EXISTS: "هذا البريد مستخدم مسبقًا. جرّب تسجيل الدخول.",
  PHONE_VERIFICATION_REQUIRED: "لازم توثّق رقم الهاتف أولاً قبل تفعيل حساب المضيف.",
  SESSION_EXPIRED: "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.",
  INVALID_MFA_TOKEN: "جلسة التحقق بخطوتين انتهت. أعد تسجيل الدخول.",
  OTP_INVALID: "رمز التحقق غير صحيح.",
  OTP_EXPIRED: "رمز التحقق انتهت صلاحيته.",
  KYC_INVALID_DOCS: "ملفات التحقق غير مكتملة أو غير مطابقة.",
  INVALID_PASSWORD_RESET_TOKEN: "رابط أو رمز إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته.",
  PASSWORD_BREACHED: "كلمة المرور ضعيفة أو مستخدمة في تسريبات معروفة. اختر كلمة أقوى.",
};

function toApiError(status: number, body: unknown): ApiError {
  const parsed = body as Partial<ApiErrorShape>;
  const code = parsed?.error?.code ?? "UNKNOWN_ERROR";
  const message = parsed?.error?.message ?? "حدث خطأ غير متوقع.";
  const details = parsed?.error?.details;
  return new ApiError(status, code, message, details);
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T = unknown>(options: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | FormData;
  requireCsrf?: boolean;
}): Promise<T> {
  const method = options.method ?? "GET";
  const headers = new Headers();
  const isMutation = method !== "GET";

  if (isMutation && (options.requireCsrf ?? true)) {
    const csrfToken = await ensureCsrfToken();
    headers.set("X-CSRF-Token", csrfToken);
  }

  if (!(options.body instanceof FormData) && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(options.path, {
    method,
    headers,
    credentials: "same-origin",
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    cache: "no-store",
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    throw toApiError(response.status, payload);
  }
  return payload as T;
}

export function getErrorMessageAr(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "حدث خطأ غير متوقع. حاول مرة أخرى.";
  }
  return KNOWN_ERROR_MESSAGES_AR[error.code] ?? error.message;
}
