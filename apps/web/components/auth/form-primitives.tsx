import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared field row used across all auth forms (guest login, host login,
 * guest signup, host onboarding wizard). Renders a label, optional
 * trailing element (e.g. "نسيت كلمة المرور؟"), the input slot, and
 * an inline error message.
 */
export function Field({
  id,
  label,
  error,
  extra,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-charcoal">
          {label}
        </label>
        {extra}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-[#B83A3A]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Standard input class — 48px tall, rounded, warm error border.
 * Pass the boolean `hasError` to switch into the destructive style.
 */
export function inputClass(hasError: boolean) {
  return cn(
    "block h-12 w-full rounded-xl border bg-white px-4 text-sm text-charcoal placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2",
    hasError
      ? "border-[#B83A3A] focus-visible:border-[#B83A3A] focus-visible:ring-[#B83A3A]/20"
      : "border-[#E8E0D3] focus-visible:border-primary focus-visible:ring-primary/20",
  );
}

/**
 * Friendly success banner used after a mock submit succeeds.
 * Returns null when state is anything other than "ok".
 */
export function MockSuccessBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      role="status"
      className="mt-5 rounded-xl border border-[#E8F3EE] bg-[#E8F3EE] p-3 text-sm text-[#2C6850]"
    >
      تم استلام بياناتك. (بدون باك‌اند فعلي بعد — Phase 2)
    </div>
  );
}
