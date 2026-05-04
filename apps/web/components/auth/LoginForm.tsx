"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, inputClass, MockSuccessBanner } from "./form-primitives";
import {
  guestLoginSchema,
  type GuestLoginValues,
} from "@/lib/auth-schemas";

/**
 * Guest login form — short, warm, focused on "welcome back".
 * Host login lives at `/host/login` with its own form + chrome.
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "ok">("idle");

  const form = useForm<GuestLoginValues>({
    resolver: zodResolver(guestLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = (values: GuestLoginValues) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        console.info("[mock] guest login submitted", values);
        setSubmitState("ok");
        resolve();
      }, 600),
    );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-md md:p-9">
        <h1 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          مرحباً بعودتك! 🌟
        </h1>
        <p className="mt-2 text-sm text-muted md:text-base">
          سجِّل دخولك وأكمل رحلتك على سُكنى.
        </p>

        <MockSuccessBanner show={submitState === "ok"} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          <Field id="email" label="البريد الإلكتروني" error={errors.email?.message}>
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
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <p className="text-center text-sm text-muted">
            ما عندك حساب؟{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
            >
              أنشئ حساباً جديداً
            </Link>
          </p>
        </form>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E8E0D3] bg-cream/70 p-4 text-center text-sm">
        <span className="text-muted">هل أنت مؤجِّر؟ </span>
        <Link
          href="/host/login"
          className="font-bold text-primary hover:underline"
        >
          ادخل من هنا →
        </Link>
      </div>
    </div>
  );
}
