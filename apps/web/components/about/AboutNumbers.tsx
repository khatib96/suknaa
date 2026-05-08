type StatItem = {
  value: string;
  label: string;
};

const STATS: StatItem[] = [
  { value: "+500", label: "بيت عطلات وفندق" },
  { value: "+50", label: "مضيف موثَّق" },
  { value: "+1,000", label: "ضيف مسجَّل" },
  { value: "+200", label: "حجز مكتمل" },
];

export function AboutNumbers() {
  return (
    <section className="bg-charcoal px-4 py-20 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">أرقامنا</h2>
        <p className="mt-3 text-base text-white/70 md:text-lg">
          أهداف السنة الأولى — نسير نحوها يوماً بعد يوم.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="font-numeric text-4xl font-extrabold text-gold md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/85 md:text-base">
                {stat.label}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs text-white/60">
          * أرقام مستهدفة للسنة الأولى من الإطلاق.
        </p>
      </div>
    </section>
  );
}
