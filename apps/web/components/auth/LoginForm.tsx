"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isLoginIntent,
  loginSchema,
  type LoginFormValues,
  type LoginIntent,
} from "@/lib/auth-schemas";

const INTENT_LABELS: Record<LoginIntent, { title: string; subtitle: string }> = {
  guest: {
    title: "دخول كزبون",
    subtitle: "ابحث، احجز، وأقم بأمان.",
  },
  host: {
    title: "دخول كمؤجِّر",
    subtitle: "أدِر عقاراتك، حجوزاتك، وأرباحك من مكان واحد.",
  },
};

export function LoginForm({ initialIntent }: { initialIntent?: string }) {
  const intent: LoginIntent = isLoginIntent(initialIntent) ? initialIntent : "guest";
  const labels = INTENT_LABELS[intent];

  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "ok">(
    "idle",
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", intent },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = (values: LoginFormValues) => {
    setSubmitState("submitting");
    // Phase 1: no backend yet. Pretend the request takes 600ms.
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        console.info("[mock] login submitted", values);
        setSubmitState("ok");
        resolve();
      }, 600),
    );
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-md md:p-9">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/login?intent=guest"
            aria-pressed={intent === "guest"}
            className={cn(
              "flex-1 rounded-r-full rounded-l-none border-y border-l border-[#E8E0D3] px-4 py-2 text-center text-sm font-bold transition-colors",
              intent === "guest"
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted hover:text-primary",
            )}
          >
            كزبون
          </Link>
          <Link
            href="/login?intent=host"
            aria-pressed={intent === "host"}
            className={cn(
              "flex-1 rounded-l-full rounded-r-none border-y border-r border-[#E8E0D3] px-4 py-2 text-center text-sm font-bold transition-colors",
              intent === "host"
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted hover:text-primary",
            )}
          >
            كمؤجِّر
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-charcoal">{labels.title}</h1>
        <p className="mt-1 text-sm text-muted">{labels.subtitle}</p>

        {submitState === "ok" ? (
          <div
            role="status"
            className="mt-5 rounded-xl border border-[#E8F3EE] bg-[#E8F3EE] p-3 text-sm text-[#2C6850]"
          >
            تم استلام بياناتك. (بدون باك‌اند فعلي بعد — Phase 2)
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <input type="hidden" {...register("intent")} value={intent} />

          <Field
            label="البريد الإلكتروني"
            error={errors.email?.message}
            id="email"
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder="you@example.com"
              {...register("email")}
              className={inputClass(Boolean(errors.email))}
            />
          </Field>

          <Field
            label="كلمة المرور"
            error={errors.password?.message}
            id="password"
            extra={
              <Link href="#" className="text-xs font-semibold text-primary hover:underline">
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
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute end-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#a84a33] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "جارٍ التسجيل..." : "تسجيل الدخول"}
          </button>

          <p className="text-center text-sm text-muted">
            ما عندك حساب؟{" "}
            <Link
              href={`/signup?intent=${intent}`}
              className="font-semibold text-primary hover:underline"
            >
              أنشئ حساباً جديداً
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  extra,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-charcoal">
          {label}
        </label>
        {extra}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-[#B83A3A]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "block h-12 w-full rounded-xl border bg-white px-4 text-sm text-charcoal placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2",
    hasError
      ? "border-[#B83A3A] focus-visible:border-[#B83A3A] focus-visible:ring-[#B83A3A]/20"
      : "border-[#E8E0D3] focus-visible:border-primary focus-visible:ring-primary/20",
  );
}
