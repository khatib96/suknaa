"use client";

import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  HOST_SUBTYPE_LABELS,
  subtypesForCategory,
} from "@/data/host-onboarding-options";
import {
  type HostApplyValues,
  type HostSubtype,
} from "@/lib/auth-schemas";

export function Step2Subtype() {
  const { control, setValue, formState } = useFormContext<HostApplyValues>();
  const category = useWatch({ control, name: "hostCategory" });
  const value = useWatch({ control, name: "hostSubtype" });

  const subtypes = subtypesForCategory(category);

  if (!category) {
    return (
      <div className="rounded-2xl border border-[#F1E5C9] bg-[#FFF6E0] p-6 text-sm text-[#8A6A1F]">
        <p className="font-semibold">اختر نوع الاستضافة أولاً.</p>
        <p className="mt-1">
          عُد إلى{" "}
          <Link
            href="?step=1"
            className="underline-offset-2 font-bold underline"
          >
            الخطوة الأولى
          </Link>{" "}
          واختر بين عقارات وفنادق.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          من أنت بالنسبة لنا؟
        </h2>
        <p className="text-sm text-muted md:text-base">
          هذا يساعدنا في تخصيص متطلبات التحقق وأدوات الإدارة المناسبة لك.
        </p>
      </header>

      <div
        className={cn(
          "grid gap-4",
          subtypes.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        {subtypes.map((sub) => {
          const labels = HOST_SUBTYPE_LABELS[sub];
          const selected = value === sub;
          return (
            <button
              type="button"
              key={sub}
              onClick={() =>
                setValue("hostSubtype", sub as HostSubtype, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              aria-pressed={selected}
              className={cn(
                "rounded-2xl border-2 p-5 text-start transition-all duration-200",
                selected
                  ? "border-primary bg-primary/5 shadow-warm-md"
                  : "border-[#E8E0D3] bg-white hover:border-primary/60 hover:shadow-warm-sm",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-charcoal">
                    {labels.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {labels.subtitle}
                  </p>
                </div>
                {selected ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    اختيارك
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {formState.errors.hostSubtype ? (
        <p role="alert" className="text-sm text-[#B83A3A]">
          {formState.errors.hostSubtype.message}
        </p>
      ) : null}

      <div className="rounded-xl border border-[#E8E0D3] bg-cream/60 p-4 text-xs leading-relaxed text-muted">
        <p>
          <span className="font-bold text-charcoal">ملاحظة:</span> سنطلب وثائق
          تحقق إضافية تختلف حسب نوع حسابك (هوية، إثبات ملكية، سجل تجاري،
          رخصة فندق...). تفاصيل أكثر بعد إنشاء الحساب.
        </p>
      </div>
    </div>
  );
}
