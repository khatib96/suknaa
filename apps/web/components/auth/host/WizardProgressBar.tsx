import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOST_APPLY_STEP_LABELS } from "@/data/host-onboarding-options";
import { HOST_APPLY_TOTAL_STEPS } from "@/lib/auth-schemas";

/**
 * Top-of-page progress bar for the host onboarding wizard.
 * Shows 5 steps with the current one highlighted in primary, completed
 * ones in gold with a check-mark, and upcoming ones muted.
 */
export function WizardProgressBar({ currentStep }: { currentStep: number }) {
  const total = HOST_APPLY_TOTAL_STEPS;

  return (
    <div className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-warm-sm">
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span className="font-numeric">
          الخطوة {currentStep} من {total}
        </span>
        <span className="text-charcoal">
          {HOST_APPLY_STEP_LABELS[currentStep] ?? ""}
        </span>
      </div>

      <ol
        aria-label="خطوات تسجيل المضيف"
        className="mt-4 grid grid-cols-5 gap-2"
      >
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => {
          const isDone = step < currentStep;
          const isActive = step === currentStep;
          return (
            <li key={step} className="flex flex-col items-center gap-1.5">
              <span
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 font-numeric",
                  isDone &&
                    "bg-gold text-white shadow-warm-sm",
                  isActive &&
                    "bg-primary text-white shadow-primary-glow",
                  !isDone &&
                    !isActive &&
                    "border border-[#E8E0D3] bg-white text-muted",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : step}
              </span>
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  isDone && "bg-gold/60",
                  isActive && "bg-primary/60",
                  !isDone && !isActive && "bg-[#F0E9DC]",
                )}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
