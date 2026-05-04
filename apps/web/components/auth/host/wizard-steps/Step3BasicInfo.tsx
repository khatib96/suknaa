"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  inputClass,
} from "@/components/auth/form-primitives";
import { SYRIAN_GOVERNORATES } from "@/data/syrian-governorates";
import { type HostApplyValues } from "@/lib/auth-schemas";

export function Step3BasicInfo() {
  const { register, formState } = useFormContext<HostApplyValues>();
  const { errors } = formState;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          معلوماتك الأساسية
        </h2>
        <p className="text-sm text-muted md:text-base">
          هذه المعلومات تخصك وحدك — لن نشاركها مع الضيوف إلا بحدود الحجوزات
          الفعلية.
        </p>
      </header>

      <Field id="fullName" label="الاسم الكامل" error={errors.fullName?.message}>
        <input
          id="fullName"
          autoComplete="name"
          placeholder="اسمك كما يظهر في الهوية"
          {...register("fullName")}
          className={inputClass(Boolean(errors.fullName))}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="البريد الإلكتروني" error={errors.email?.message}>
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

        <Field id="phone" label="رقم الهاتف" error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="+963 9X XXX XXXX"
            {...register("phone")}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>
      </div>

      <Field id="cityId" label="المحافظة" error={errors.cityId?.message}>
        <select
          id="cityId"
          {...register("cityId")}
          className={cn(inputClass(Boolean(errors.cityId)), "appearance-none")}
          defaultValue=""
        >
          <option value="" disabled>
            اختر المحافظة
          </option>
          {SYRIAN_GOVERNORATES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.labelAr}
            </option>
          ))}
        </select>
      </Field>

      <Field id="password" label="كلمة المرور" error={errors.password?.message}>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            placeholder="10 أحرف على الأقل، حروف وأرقام"
            {...register("password")}
            className={cn(inputClass(Boolean(errors.password)), "pe-12")}
          />
          <button
            type="button"
            aria-label={
              showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
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
          <Link
            href="#"
            className="ms-1 font-semibold text-primary hover:underline"
          >
            سياسة الخصوصية
          </Link>{" "}
          و
          <Link
            href="#"
            className="ms-1 font-semibold text-primary hover:underline"
          >
            ميثاق المضيفين
          </Link>
          .
        </span>
      </label>
      {errors.acceptTerms ? (
        <p role="alert" className="-mt-3 text-xs text-[#B83A3A]">
          {errors.acceptTerms.message}
        </p>
      ) : null}
    </div>
  );
}
