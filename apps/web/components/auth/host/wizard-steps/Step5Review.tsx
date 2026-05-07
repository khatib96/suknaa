"use client";

import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import {
  BIGGEST_CHALLENGE_OPTIONS,
  HOST_CATEGORY_LABELS,
  HOST_SUBTYPE_LABELS,
  PORTFOLIO_SIZE_OPTIONS,
  START_TIMELINE_OPTIONS,
} from "@/data/host-onboarding-options";
import { findGovernorate } from "@/data/syrian-governorates";
import { type HostApplyValues } from "@/lib/auth-schemas";

/**
 * Step 5 — review summary + create button.
 *
 * After a successful submit, swaps to a "what happens next" panel that
 * lists the post-signup steps (verify email, KYC, add property, edit
 * public profile).
 */
export function Step5Review({ submitted }: { submitted: boolean }) {
  const { control } = useFormContext<HostApplyValues>();
  const values = useWatch<HostApplyValues>({ control });

  if (submitted) {
    return <SuccessPanel email={values.email} />;
  }

  const cat = values.hostCategory
    ? HOST_CATEGORY_LABELS[values.hostCategory]
    : undefined;
  const subtype = values.hostSubtype
    ? HOST_SUBTYPE_LABELS[values.hostSubtype]
    : undefined;
  const governorate = findGovernorate(values.cityId);
  const portfolio = PORTFOLIO_SIZE_OPTIONS.find(
    (o) => o.id === values.portfolioSize,
  );
  const timeline = START_TIMELINE_OPTIONS.find(
    (o) => o.id === values.startTimeline,
  );
  const challenge = BIGGEST_CHALLENGE_OPTIONS.find(
    (o) => o.id === values.biggestChallenge,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          خطوة أخيرة قبل الانطلاق
        </h2>
        <p className="text-sm text-muted md:text-base">
          راجع المعلومات. تقدر ترجع لأي خطوة وتعدّلها قبل التأكيد.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-[#E8E0D3] bg-white p-5 md:p-6">
        <SummaryRow
          stepHref="?step=1"
          label="نوع الاستضافة"
          value={cat ? `${cat.emoji} ${cat.title}` : "—"}
        />
        <SummaryRow
          stepHref="?step=2"
          label="نوع الحساب"
          value={subtype?.title ?? "—"}
        />
        <SummaryRow
          stepHref="?step=3"
          label="الاسم"
          value={values.fullName || "—"}
        />
        <SummaryRow
          stepHref="?step=3"
          label="البريد الإلكتروني"
          value={values.email || "—"}
          dir="ltr"
        />
        <SummaryRow
          stepHref="?step=3"
          label="رقم الهاتف"
          value={values.phone || "—"}
          dir="ltr"
        />
        <SummaryRow
          stepHref="?step=3"
          label="المحافظة"
          value={governorate?.labelAr ?? "—"}
        />
        <SummaryRow
          stepHref="?step=4"
          label="عدد العقارات"
          value={portfolio?.labelAr ?? "لم يُحدَّد"}
          muted={!portfolio}
        />
        <SummaryRow
          stepHref="?step=4"
          label="موعد البدء"
          value={timeline?.labelAr ?? "لم يُحدَّد"}
          muted={!timeline}
        />
        <SummaryRow
          stepHref="?step=4"
          label="أكبر تحدّ"
          value={challenge?.labelAr ?? "لم يُحدَّد"}
          muted={!challenge}
        />
      </div>

      <div className="rounded-2xl border border-[#F1E5C9] bg-[#FFF8E6] p-4 text-xs leading-relaxed text-[#8A6A1F] md:text-sm">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            بعد إنشاء الحساب، سنرسل لك رابط تأكيد البريد، ونوجّهك لرفع
            وثائق التحقق الخاصة بنوع حسابك. لا تستطيع نشر عقار قبل اكتمال
            التحقق.
          </span>
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  stepHref,
  dir,
  muted,
}: {
  label: string;
  value: string;
  stepHref: string;
  dir?: "ltr" | "rtl";
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#F1ECE2] pb-3 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p
          dir={dir}
          className={
            muted ? "mt-0.5 text-sm text-muted" : "mt-0.5 text-sm font-bold text-charcoal"
          }
        >
          {value}
        </p>
      </div>
      <Link
        href={stepHref}
        className="shrink-0 text-xs font-semibold text-primary hover:underline"
      >
        تعديل
      </Link>
    </div>
  );
}

function SuccessPanel({ email }: { email?: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#D5E9DD] bg-[#EDF7F1] p-7 md:p-9">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2C6850] text-white">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[#1F4C3A] md:text-2xl">
              أهلاً بك في عائلة سُكنى! 🎉
            </h2>
            {email ? (
              <p className="mt-0.5 text-sm text-[#2C6850]" dir="ltr">
                {email}
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#2C6850]">
          تم تفعيل حساب المضيف. أكمل رفع وثائق KYC ثم تابع إضافة عقارك الأول.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-charcoal">الخطوات التالية:</h3>
        <NextStepCard
          icon={<UserCheck className="h-5 w-5" />}
          title="تأكيد البريد الإلكتروني"
          description="سترسل لك رسالة فيها رابط تأكيد. هذا يحمي حسابك."
        />
        <NextStepCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="رفع وثائق التحقق (KYC)"
          description="هوية، إثبات ملكية، أو رخصة فندق — حسب نوع حسابك."
        />
        <NextStepCard
          icon={<Sparkles className="h-5 w-5" />}
          title="إضافة عقارك الأول"
          description="تجهيز الإعلان: صور، تسعير، قواعد الإقامة. نُعاين قبل النشر."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/become-a-host/kyc"
          className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] active:scale-95"
        >
          ابدأ رفع وثائق KYC
        </Link>
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-[#E8E0D3] bg-white px-6 py-3.5 text-sm font-bold text-charcoal transition-colors hover:border-primary hover:text-primary"
        >
          الرجوع للصفحة العامة
        </Link>
      </div>
    </div>
  );
}

function NextStepCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#E8E0D3] bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-charcoal">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
