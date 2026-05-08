"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  BIGGEST_CHALLENGE_OPTIONS,
  PORTFOLIO_SIZE_OPTIONS,
  START_TIMELINE_OPTIONS,
} from "@/data/host-onboarding-options";
import {
  type BiggestChallenge,
  type HostApplyValues,
  type PortfolioSize,
  type StartTimeline,
} from "@/lib/auth-schemas";

/**
 * Step 4 — qualitative questions used by the team to tailor onboarding
 * support. Every field is optional. The wizard's "تخطي" button bypasses
 * this step entirely.
 */
export function Step4QuickContext() {
  const { control, setValue } = useFormContext<HostApplyValues>();

  const portfolio = useWatch({ control, name: "portfolioSize" });
  const timeline = useWatch({ control, name: "startTimeline" });
  const challenge = useWatch({ control, name: "biggestChallenge" });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          عرّفنا أكثر على مشروعك
        </h2>
        <p className="text-sm text-muted md:text-base">
          إجاباتك تساعدنا في تخصيص تجربة دعم تناسبك. كل الأسئلة اختيارية —
          تقدر تتخطى الخطوة بالكامل.
        </p>
      </header>

      <FieldGroup
        title="كم عدد بيوت العطلات التي تخطط لعرضها؟"
        hint="تقدير تقريبي."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {PORTFOLIO_SIZE_OPTIONS.map((opt) => (
            <Choice
              key={opt.id}
              selected={portfolio === opt.id}
              onSelect={() =>
                setValue("portfolioSize", opt.id as PortfolioSize, {
                  shouldDirty: true,
                })
              }
              title={opt.labelAr}
              hint={opt.hint}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="متى تخطط للبدء؟">
        <div className="grid gap-2 sm:grid-cols-2">
          {START_TIMELINE_OPTIONS.map((opt) => (
            <Choice
              key={opt.id}
              selected={timeline === opt.id}
              onSelect={() =>
                setValue("startTimeline", opt.id as StartTimeline, {
                  shouldDirty: true,
                })
              }
              title={opt.labelAr}
              hint={opt.hint}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="ما أكبر تحدٍّ تواجهه حالياً؟">
        <div className="grid gap-2 sm:grid-cols-2">
          {BIGGEST_CHALLENGE_OPTIONS.map((opt) => (
            <Choice
              key={opt.id}
              selected={challenge === opt.id}
              onSelect={() =>
                setValue("biggestChallenge", opt.id as BiggestChallenge, {
                  shouldDirty: true,
                })
              }
              title={opt.labelAr}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function FieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-charcoal">{title}</legend>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

function Choice({
  selected,
  onSelect,
  title,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-xl border p-4 text-start text-sm transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-warm-sm"
          : "border-[#E8E0D3] bg-white hover:border-primary/60",
      )}
    >
      <p className="font-bold text-charcoal">{title}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </button>
  );
}
