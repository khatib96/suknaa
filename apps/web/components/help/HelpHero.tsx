import { Search } from "lucide-react";

export function HelpHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-primary via-[#A84A33] to-[#8a3d2a] px-4 pt-32 pb-20 text-white md:px-6 lg:px-8 lg:pt-40 lg:pb-24">
      <div
        aria-hidden
        className="absolute -top-32 -end-32 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
          مركز المساعدة
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
          كيف يمكننا مساعدتك؟
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/85 md:text-lg">
          اختر الفئة المناسبة، أو ابحث في الأسئلة الشائعة. لم تجد ما تريد؟
          راسلنا.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <label htmlFor="help-search" className="sr-only">
            ابحث في مركز المساعدة
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="absolute inset-y-0 start-4 inline-flex items-center text-charcoal/55"
            >
              <Search className="h-5 w-5" />
            </span>
            <input
              id="help-search"
              type="search"
              disabled
              placeholder="ابحث عن سؤال... (قريباً)"
              className="block h-14 w-full rounded-full border border-white/30 bg-white/95 ps-12 pe-5 text-sm text-charcoal placeholder:text-charcoal/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
