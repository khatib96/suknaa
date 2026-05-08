"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, getErrorMessageAr } from "@/lib/web-api";
import {
  Field,
  inputClass,
} from "@/components/auth/form-primitives";
import {
  hostLoginSchema,
  type HostLoginValues,
} from "@/lib/auth-schemas";

/**
 * Host login form — partner tone, gold accent, links to /become-a-host
 * for hosts who haven't joined yet, and to /login for guests who
 * landed here by mistake.
 */
export function HostLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [isSubmitting2fa, setIsSubmitting2fa] = useState(false);

  const form = useForm<HostLoginValues>({
    resolver: zodResolver(hostLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const completeIntentAndRedirect = async () => {
    const intentResult = await apiRequest<{
      becomeHostRequired?: boolean;
      redirectTo?: string;
    }>({
      path: "/api/auth/login/intent",
      method: "POST",
      body: { intent: "host" },
    });
    if (intentResult.becomeHostRequired) {
      router.push("/become-a-host/apply");
      return;
    }
    router.push(intentResult.redirectTo ?? "/host/dashboard");
  };

  const onSubmit = async (values: HostLoginValues) => {
    setErrorMessage(null);
    setMfaToken(null);
    try {
      const loginResult = await apiRequest<{
        requires_2fa?: boolean;
        mfa_token?: string;
      }>({
        path: "/api/auth/login",
        method: "POST",
        body: { ...values, rememberMe: false },
      });
      if (loginResult.requires_2fa && loginResult.mfa_token) {
        setMfaToken(loginResult.mfa_token);
        return;
      }
      await completeIntentAndRedirect();
    } catch (error) {
      setErrorMessage(getErrorMessageAr(error));
    }
  };

  const submit2fa = async () => {
    if (!mfaToken || !totpCode.trim()) {
      return;
    }
    setErrorMessage(null);
    setIsSubmitting2fa(true);
    try {
      await apiRequest({
        path: "/api/auth/login/2fa",
        method: "POST",
        body: { mfa_token: mfaToken, code: totpCode.trim() },
      });
      await completeIntentAndRedirect();
    } catch (error) {
      setErrorMessage(getErrorMessageAr(error));
    } finally {
      setIsSubmitting2fa(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border border-[#E8DEC3] bg-white shadow-warm-md">
        <div
          className="px-7 pt-7 pb-6 md:px-9 md:pt-9"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,162,76,0.12) 0%, rgba(255,255,255,0) 100%)",
          }}
        >
          <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-[#8C6A29]">
            منطقة المضيفين
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-charcoal md:text-3xl">
            أهلاً بعودتك يا شريكنا
          </h1>
          <p className="mt-2 text-sm text-muted md:text-base">
            أدِر بيوت عطلاتك، حجوزاتك، وأرباحك من مكان واحد.
          </p>
        </div>

        <div className="px-7 pb-7 md:px-9 md:pb-9">
          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-[#F8D7DA] bg-[#FFF1F2] px-4 py-3 text-sm text-[#9F1239]">
              {errorMessage}
            </p>
          ) : null}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-2 space-y-4"
            noValidate
          >
            <Field
              id="email"
              label="البريد الإلكتروني"
              error={errors.email?.message}
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                dir="ltr"
                placeholder="host@example.com"
                {...register("email")}
                className={inputClass(Boolean(errors.email))}
              />
            </Field>

            <Field
              id="password"
              label="كلمة المرور"
              error={errors.password?.message}
              extra={
                <Link
                  href="#"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              }
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  placeholder="••••••••••"
                  {...register("password")}
                  className={cn(inputClass(Boolean(errors.password)), "pe-12")}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute end-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-base font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#b88a36] hover:shadow-warm-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting
                ? "جارٍ تسجيل الدخول..."
                : "ادخل لوحة المضيفين"}
            </button>

            {mfaToken ? (
              <div className="space-y-3 rounded-2xl border border-[#E8E0D3] bg-cream/60 p-4">
                <p className="text-sm font-semibold text-charcoal">
                  أدخل رمز التحقق بخطوتين لإكمال الدخول
                </p>
                <input
                  value={totpCode}
                  onChange={(event) => setTotpCode(event.target.value)}
                  dir="ltr"
                  placeholder="123456"
                  className={inputClass(false)}
                />
                <button
                  type="button"
                  onClick={() => {
                    void submit2fa();
                  }}
                  disabled={isSubmitting2fa}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#b88a36] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting2fa ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isSubmitting2fa ? "جارٍ التحقق..." : "تأكيد التحقق"}
                </button>
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-[#E8DEC3] bg-white p-4 text-center text-sm">
          <span className="text-muted">لست مؤجراً بعد؟ </span>
          <Link
            href="/become-a-host"
            className="font-bold text-gold hover:underline"
          >
            تعرّف على البرنامج →
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E8E0D3] bg-cream/70 p-4 text-center text-sm">
          <span className="text-muted">هل أنت زبون؟ </span>
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            ادخل من هنا →
          </Link>
        </div>
      </div>
    </div>
  );
}
