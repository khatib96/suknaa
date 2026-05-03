import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import {
  CITY_LABELS,
  HOTEL_TYPE_LABELS,
  type HotelListing,
} from "@/data/listings";

export function HotelResultCard({ item }: { item: HotelListing }) {
  const cityLabel = CITY_LABELS[item.cityId];
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#E8E0D3] bg-white shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md">
      <Link href={`/hotel/${item.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute end-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white">
            {HOTEL_TYPE_LABELS[item.type]}
          </span>
          <button
            type="button"
            aria-label="إضافة للمفضلة"
            className="absolute start-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal transition-colors hover:text-primary"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/hotel/${item.id}`} className="block">
            <h3 className="line-clamp-1 text-base font-bold text-charcoal hover:text-primary">
              {item.title}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {cityLabel}
            </p>
          </Link>
          <span className="font-numeric rounded-full bg-[#FBF5E8] px-2.5 py-1 text-sm font-bold text-[#B0863F]">
            {item.score}/10
          </span>
        </div>

        <div className="flex items-center gap-1 text-gold">
          {Array.from({ length: item.stars }).map((_, index) => (
            <Star key={`${item.id}-${index}`} className="h-4 w-4 fill-gold" />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#F5EFE6] pt-3">
          <span className="font-numeric rounded-full bg-[#FBF5E8] px-3 py-1.5 text-sm font-bold text-[#B0863F]">
            من ${item.fromPriceUsd} / ليلة
          </span>
          <Link
            href={`/hotel/${item.id}`}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#a84a33]"
          >
            عرض الفندق
          </Link>
        </div>
      </div>
    </article>
  );
}
