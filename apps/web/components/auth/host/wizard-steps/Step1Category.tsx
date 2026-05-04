"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { HOST_CATEGORY_LABELS } from "@/data/host-onboarding-options";
import {
  HOST_CATEGORIES,
  type HostApplyValues,
  type HostCategory,
} from "@/lib/auth-schemas";

export function Step1Category() {
  const { control, setValue, formState } = useFormContext<HostApplyValues>();
  const value = useWatch({ control, name: "hostCategory" });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          ماذا تريد أن تستضيف؟
        </h2>
        <p className="text-sm text-muted md:text-base">
          اختر النوع الأقرب لما تنوي عرضه — كل نوع له تجربة مخصصة لاحقاً.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {HOST_CATEGORIES.map((cat) => {
          const labels = HOST_CATEGORY_LABELS[cat];
          const selected = value === cat;
          return (
            <button
              type="button"
              key={cat}
              onClick={() =>
                setValue("hostCategory", cat as HostCategory, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              aria-pressed={selected}
              className={cn(
                "group relative overflow-hidden rounded-3xl border-2 p-6 text-start transition-all duration-200",
                selected
                  ? "border-primary bg-primary/5 shadow-warm-md"
                  : "border-[#E8E0D3] bg-white hover:border-primary/60 hover:shadow-warm-sm",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-3xl"
                  aria-hidden
                >
                  {labels.emoji}
                </span>
                {selected ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    اختيارك
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-charcoal">
                {labels.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {labels.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {formState.errors.hostCategory ? (
        <p role="alert" className="text-sm text-[#B83A3A]">
          {formState.errors.hostCategory.message}
        </p>
      ) : null}
    </div>
  );
}
