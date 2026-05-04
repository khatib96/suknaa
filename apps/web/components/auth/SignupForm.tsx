"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, inputClass, MockSuccessBanner } from "./form-primitives";
import {
  guestSignupSchema,
  type GuestSignupValues,
} from "@/lib/auth-schemas";

/**
 * Guest signup form — fast, single page, ~30 seconds.
 * Email + password are required, full name is optional.
 *
 * Hosts go through `/become-a-host/apply` (5-step wizard) instead.
 */
export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "ok">("idle");

  const form = useForm<GuestSignupValues>({
    resolver: zodResolver(guestSignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = (values: GuestSignupValues) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        console.info("[mock] guest signup submitted", values);
        setSubmitState("ok");
        resolve();
      }, 700),
    );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-md md:p-9">
        <h1 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          ابدأ رحلتك على سُكنى
        </h1>
        <p className="mt-2 text-sm text-muted md:text-base">
          ثلاثون ثانية فقط، وتصير جاهزاً للحجز.
        </p>

        <MockSuccessBanner show={submitState === "ok"} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          <Field id="fullName" label="الاسم (اختياري)" error={errors.fullName?.message}>
            <input
              id="fullName"
              autoComplete="name"
              placeholder="ما اسمك؟"
              {...register("fullName")}
              className={inputClass(Boolean(errors.fullName))}
            />
          </Field>

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

          <Field id="password" label="كلمة المرور" error={errors.password?.message}>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                dir="ltr"
                placeholder="10 أحرف على الأقل، تتضمن حروف وأرقام"
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

          <label className="flex items-start gap-3 rounded-xl border border-[#F5EFE6] bg-cream p-3 text-sm text-charcoal">
            <input
              type="checkbox"
              {...register("acceptTerms")}
              className="mt-0.5 h-4 w-4 rounded border-[#E8E0D3] text-primary focus:ring-primary"
            />
            <span>
              أوافق على{" "}
              <Link href="#" className="font-semibold text-primary hover:underline">
                شروط الاستخدام
              </Link>{" "}
              و
              <Link href="#" className="ms-1 font-semibold text-primary hover:underline">
                سياسة الخصوصية
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms ? (
            <p role="alert" className="-mt-3 text-xs text-[#B83A3A]">
              {errors.acceptTerms.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "جارٍ إنشاء الحساب..." : "ابدأ رحلتي"}
          </button>

          <p className="text-center text-sm text-muted">
            عندك حساب؟{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E8E0D3] bg-cream/70 p-4 text-center text-sm">
        <span className="text-muted">تريد عرض عقار؟ </span>
        <Link
          href="/become-a-host/apply"
          className="font-bold text-primary hover:underline"
        >
          ابدأ التسجيل كمضيف →
        </Link>
      </div>
    </div>
  );
}
