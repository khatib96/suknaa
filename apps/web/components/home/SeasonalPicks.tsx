import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SEASONAL_PICKS, SEASONAL_TITLE } from "@/data/seasonal-picks";

export function SeasonalPicks() {
  if (SEASONAL_PICKS.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream px-4 py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-extrabold text-charcoal">{SEASONAL_TITLE}</h2>
            <p className="mt-1 text-sm text-muted">
              تجارب إقامة مختارة بعناية حسب موسم السنة.
            </p>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-2">
          {SEASONAL_PICKS.map((pick) => (
            <Link
              key={pick.id}
              href={pick.href}
              className="group relative h-[420px] w-[320px] shrink-0 overflow-hidden rounded-3xl shadow-warm-md transition-transform duration-300 hover:-translate-y-1"
            >
              <Image
                src={pick.image}
                alt={pick.title}
                fill
                sizes="320px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent"
              />
              <div className="absolute inset-0 flex flex-col p-5 text-white">
                <span className="self-start rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs backdrop-blur-md">
                  {pick.badge}
                </span>
                <div className="mt-auto">
                  <h3 className="text-2xl font-extrabold leading-snug">
                    {pick.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    {pick.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                    اكتشف
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
