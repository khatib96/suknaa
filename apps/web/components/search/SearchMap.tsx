import { Layers3, MapPin, SlidersHorizontal } from "lucide-react";
import type { HotelListing, PropertyListing } from "@/data/listings";

const mapImage =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1800&q=80";

type Props = {
  properties: PropertyListing[];
  hotels: HotelListing[];
};

export function SearchMap({ properties, hotels }: Props) {
  const totalCount = properties.length + hotels.length;

  return (
    <section
      id="search-map"
      aria-label="خريطة نتائج البحث"
      className="my-8 overflow-hidden rounded-3xl border border-[#F5EFE6] bg-white p-2 shadow-warm-md"
    >
      <div
        className="relative h-[480px] overflow-hidden rounded-[22px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), url(${mapImage})`,
        }}
        role="region"
      >
        <div className="absolute start-4 top-4 flex flex-col gap-2 rounded-full bg-white/95 p-1.5 shadow-warm-sm backdrop-blur">
          <button
            type="button"
            aria-label="الفلاتر"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:text-primary"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="الطبقات"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:text-primary"
          >
            <Layers3 className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute end-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-charcoal shadow-warm-sm">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-numeric">{totalCount}</span> نتيجة على الخريطة
        </div>

        {/* Pseudo-pins distributed from a stable hash so positions feel
            different per result without needing a real geocoder yet. */}
        <div className="pointer-events-none absolute inset-0">
          {properties.slice(0, 10).map((p, idx) => (
            <span
              key={p.id}
              className="absolute pointer-events-auto inline-flex rounded-full border border-primary bg-white px-3 py-1 text-xs font-bold text-primary shadow-warm-sm"
              style={{
                top: `${15 + (idx * 13) % 70}%`,
                insetInlineEnd: `${15 + (idx * 17) % 70}%`,
              }}
              title={`${p.title} — $${p.basePriceUsd}`}
            >
              ${p.basePriceUsd}
            </span>
          ))}
          {hotels.slice(0, 10).map((h, idx) => (
            <span
              key={h.id}
              className="absolute pointer-events-auto inline-flex rounded-full border border-gold bg-white px-3 py-1 text-xs font-bold text-gold shadow-warm-sm"
              style={{
                top: `${20 + (idx * 19) % 65}%`,
                insetInlineEnd: `${30 + (idx * 23) % 60}%`,
              }}
              title={`${h.title} — من $${h.fromPriceUsd}`}
            >
              ${h.fromPriceUsd}+
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
