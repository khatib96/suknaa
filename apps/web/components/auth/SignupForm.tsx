"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HOST_CATEGORIES,
  HOST_SUBTYPES,
  isLoginIntent,
  signupSchema,
  type HostCategory,
  type HostSubtype,
  type LoginIntent,
  type SignupFormValues,
} from "@/lib/auth-schemas";

const HOST_CATEGORY_LABELS: Record<HostCategory, { title: string; subtitle: string }> = {
  real_estate: {
    title: "عقارات",
    subtitle: "بيت، شقة، فيلا، مزرعة، شاليه...",
  },
  hospitality: {
    title: "فنادق",
    subtitle: "فندق، منتجع، شقق فندقية، هوستل.",
  },
};

const HOST_SUBTYPE_LABELS: Record<HostSubtype, string> = {
  individual: "فرد (مالك بيت/شاليه)",
  re_office: "مكتب عقاري",
  hotel_company: "شركة فندقية",
};

function subtypesForCategory(category?: HostCategory): HostSubtype[] {
  if (category === "real_estate") return ["individual", "re_office"];
  if (category === "hospitality") return ["hotel_company"];
  return [...HOST_SUBTYPES];
}

export function SignupForm({ initialIntent }: { initialIntent?: string }) {
  const initial: LoginIntent = isLoginIntent(initialIntent) ? initialIntent : "guest";

  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "ok">("idle");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      intent: initial,
      hostCategory: undefined,
      hostSubtype: undefined,
      acceptTerms: false,
    },
  });

  const { register, handleSubmit, control, setValue, formState } = form;
  const { errors, isSubmitting } = formState;

  const intent = useWatch({ control, name: "intent" });
  const hostCategory = useWatch({ control, name: "hostCategory" });
  const hostSubtype = useWatch({ control, name: "hostSubtype" });

  const onSubmit = (values: SignupFormValues) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        console.info("[mock] signup submitted", values);
        setSubmitState("ok");
        resolve();
      }, 700),
    );

  const subtypes = subtypesForCategory(hostCategory);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-md md:p-9">
        <h1 className="text-2xl font-extrabold text-charcoal">إنشاء حساب جديد</h1>
        <p className="mt-1 text-sm text-muted">
          أكمل المعلومات التالية للانضمام إلى سُكنى.
        </p>

        {submitState === "ok" ? (
          <div
            role="status"
            className="mt-5 rounded-xl border border-[#E8F3EE] bg-[#E8F3EE] p-3 text-sm text-[#2C6850]"
          >
            تم استلام بياناتك. (بدون باك‌اند فعلي بعد — Phase 2)
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
          {/* Intent toggle */}
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-charcoal">
              نوع الحساب
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <IntentChoice
                checked={intent === "guest"}
                onSelect={() => {
                  setValue("intent", "guest");
                  setValue("hostCategory", undefined);
                  setValue("hostSubtype", undefined);
                }}
                title="زبون / مستأجر"
                subtitle="ابحث واحجز سكناً يناسبك."
              />
              <IntentChoice
                checked={intent === "host"}
                onSelect={() => setValue("intent", "host")}
                title="مؤجِّر / مضيف"
                subtitle="اعرض عقارك أو فندقك للحجز."
              />
            </div>
          </fieldset>

          <Field id="fullName" label="الاسم الكامل" error={errors.fullName?.message}>
            <input
              id="fullName"
              autoComplete="name"
              placeholder="أدخل اسمك الكامل"
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
                placeholder="you@example.com"
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
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {intent === "host" ? (
            <div className="space-y-5 rounded-2xl border border-[#F5EFE6] bg-cream p-5">
              <p className="text-sm font-bold text-charcoal">
                نظراً لأنك ستسجِّل كمؤجِّر، نحتاج بعض المعلومات الإضافية:
              </p>

              <Field
                id="hostCategory"
                label="فئة الاستضافة"
                error={errors.hostCategory?.message}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {HOST_CATEGORIES.map((cat) => {
                    const labels = HOST_CATEGORY_LABELS[cat];
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          setValue("hostCategory", cat, { shouldValidate: true });
                          setValue("hostSubtype", undefined);
                        }}
                        aria-pressed={hostCategory === cat}
                        className={cn(
                          "rounded-xl border p-4 text-start transition-all duration-200",
                          hostCategory === cat
                            ? "border-primary bg-white shadow-warm-sm"
                            : "border-[#E8E0D3] bg-white/70 hover:border-primary/60",
                        )}
                      >
                        <p className="text-sm font-bold text-charcoal">{labels.title}</p>
                        <p className="mt-1 text-xs text-muted">{labels.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {hostCategory ? (
                <Field
                  id="hostSubtype"
                  label="نوع الحساب"
                  error={errors.hostSubtype?.message}
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {subtypes.map((sub) => {
                      const selected = hostSubtype === sub;
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() =>
                            setValue("hostSubtype", sub, { shouldValidate: true })
                          }
                          aria-pressed={selected}
                          className={cn(
                            "rounded-xl border p-4 text-start text-sm font-medium transition-all duration-200",
                            selected
                              ? "border-primary bg-white text-charcoal shadow-warm-sm"
                              : "border-[#E8E0D3] bg-white/70 text-muted hover:border-primary/60 hover:text-charcoal",
                          )}
                        >
                          {HOST_SUBTYPE_LABELS[sub]}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              ) : null}
            </div>
          ) : null}

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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#a84a33] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "جارٍ إنشاء الحساب..." : "إنشاء حسابي"}
          </button>

          <p className="text-center text-sm text-muted">
            عندك حساب؟{" "}
            <Link
              href={`/login?intent=${intent}`}
              className="font-semibold text-primary hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function IntentChoice({
  checked,
  onSelect,
  title,
  subtitle,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={checked}
      className={cn(
        "rounded-xl border p-4 text-start transition-all duration-200",
        checked
          ? "border-primary bg-cream shadow-warm-sm"
          : "border-[#E8E0D3] bg-white hover:border-primary/60",
      )}
    >
      <p className="text-sm font-bold text-charcoal">{title}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </button>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-charcoal">
        {label}
      </label>
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
