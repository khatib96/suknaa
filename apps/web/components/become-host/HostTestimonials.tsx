import { HOST_TESTIMONIALS } from "@/data/host-testimonials";

export function HostTestimonials() {
  if (HOST_TESTIMONIALS.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            مضيفون يحكون تجربتهم
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            تجارب حقيقية من مضيفين بدأوا معنا منذ الإطلاق.
          </p>
        </div>

        <div className="mt-12 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {HOST_TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-[#F5EFE6] bg-white p-6 shadow-warm-sm md:w-auto"
            >
              <div className="flex items-center gap-3">
                <span className="font-numeric inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                  {t.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-bold text-charcoal">{t.name}</p>
                  <p className="text-xs text-muted">{t.city}</p>
                </div>
              </div>

              <p className="mt-5 grow text-sm leading-7 text-charcoal/85">
                «{t.quote}»
              </p>

              <p className="font-numeric mt-5 self-start rounded-full bg-[#FBF5E8] px-3 py-1 text-xs font-bold text-[#B0863F]">
                {t.highlight}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
