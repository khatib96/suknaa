import Image from "next/image";
import { getFeaturedDestinations } from "@/data/destinations";

export function Destinations() {
  const destinations = getFeaturedDestinations();

  return (
    <section className="bg-white px-4 py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-charcoal">وجهات مميزة</h2>
          <button type="button" className="text-sm font-semibold text-primary hover:underline">
            عرض الكل
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {destinations.map((destination) => (
            <article
              key={destination.id}
              className="group relative h-[250px] w-[200px] shrink-0 overflow-hidden rounded-[16px] shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-warm-md"
            >
              <Image
                src={destination.image}
                alt={destination.city}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 text-white">
                <h3 className="text-xl font-bold">{destination.city}</h3>
                <span className="mt-1 inline-flex rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-xs">
                  {destination.countLabel}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
