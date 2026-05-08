"use client";

import { Home, Hotel } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { HOST_CATEGORY_LABELS } from "@/data/host-onboarding-options";
import {
  type HostApplyValues,
  type HostCategory,
} from "@/lib/auth-schemas";

const ENABLED_HOST_CATEGORIES: HostCategory[] = ["real_estate"];
const UPCOMING_HOST_CATEGORIES: HostCategory[] = ["hospitality"];
const CATEGORY_ICONS: Record<
  HostCategory,
  { Icon: LucideIcon; bgClassName: string; iconClassName: string }
> = {
  real_estate: {
    Icon: Home,
    bgClassName: "bg-primary/10",
    iconClassName: "text-primary",
  },
  hospitality: {
    Icon: Hotel,
    bgClassName: "bg-gold/10",
    iconClassName: "text-gold",
  },
};

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
          نبدأ حالياً ببيوت العطلات حتى تكون تجربة Phase 3 واضحة ومركزة.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ENABLED_HOST_CATEGORIES.map((cat) => {
          const labels = HOST_CATEGORY_LABELS[cat];
          const { Icon, bgClassName, iconClassName } = CATEGORY_ICONS[cat];
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
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl",
                    bgClassName,
                  )}
                  aria-hidden
                >
                  <Icon className={cn("h-7 w-7", iconClassName)} />
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

        {UPCOMING_HOST_CATEGORIES.map((cat) => {
          const labels = HOST_CATEGORY_LABELS[cat];
          const { Icon, bgClassName, iconClassName } = CATEGORY_ICONS[cat];
          return (
            <div
              key={cat}
              aria-disabled="true"
              className="relative overflow-hidden rounded-3xl border-2 border-[#E8E0D3] bg-white/70 p-6 text-start opacity-75"
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl",
                    bgClassName,
                  )}
                  aria-hidden
                >
                  <Icon className={cn("h-7 w-7", iconClassName)} />
                </span>
                <span className="rounded-full bg-[#F1E5C9] px-3 py-1 text-xs font-bold text-[#8A6A1F]">
                  قريباً
                </span>
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-charcoal">
                {labels.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                مسار الفنادق والشركات الفندقية سيُفتح لاحقاً ضمن تجربة مستقلة.
              </p>
            </div>
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
