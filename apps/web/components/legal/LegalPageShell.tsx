import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  /** Page title displayed in the hero. */
  title: string;
  /** Short subtitle / lede paragraph under the title. */
  subtitle?: string;
  /** ISO date string ("YYYY-MM-DD") of the last legal review. */
  lastUpdatedISO: string;
  children: ReactNode;
};

/**
 * Wrapper for /terms, /privacy, /cookies. Renders:
 *   - a warm hero with the page title + last-updated date
 *   - a prominent "محتوى مبدئي" disclaimer
 *   - a centered prose container that styles whatever children provide
 *
 * Children are expected to be a series of `<LegalSection>` components
 * (see ./LegalSection.tsx) but anything works thanks to the prose-like
 * default styles.
 */
export function LegalPageShell({
  title,
  subtitle,
  lastUpdatedISO,
  children,
}: LegalPageShellProps) {
  return (
    <main className="bg-cream pt-28 pb-20 md:pt-32">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-charcoal md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-charcoal/75 md:text-lg">
              {subtitle}
            </p>
          ) : null}
          <p className="font-numeric mt-5 text-xs text-muted">
            آخر تحديث: {lastUpdatedISO}
          </p>
        </header>

        <aside
          role="note"
          className="mb-10 flex items-start gap-3 rounded-2xl border border-[#E8C68A] bg-[#FBF5E8] p-5"
        >
          <AlertCircle
            aria-hidden
            className="h-5 w-5 shrink-0 text-[#B0863F]"
          />
          <div className="text-sm leading-7 text-[#7A5C24]">
            <p className="font-bold">محتوى مبدئي</p>
            <p className="mt-1">
              هذا النص هو نسخة أولية لأغراض العرض والمراجعة. سيتم تحديثه
              قانونياً بالتعاون مع مستشارين متخصِّصين قبل الإطلاق الرسمي.
            </p>
          </div>
        </aside>

        <article className="space-y-10 rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-sm md:p-10">
          {children}
        </article>
      </div>
    </main>
  );
}

type LegalSectionProps = {
  /** Numeric position used for the small "1." prefix in front of the heading. */
  index: number;
  /** Heading text (Arabic). */
  title: string;
  children: ReactNode;
};

/**
 * Numbered section block used inside `LegalPageShell`. Each section gets
 * a heading plus a vertical stack of paragraphs (from `children`).
 */
export function LegalSection({ index, title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-charcoal md:text-2xl">
        <span className="font-numeric me-2 text-primary">{index}.</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-8 text-charcoal/80 md:text-base">
        {children}
      </div>
    </section>
  );
}
