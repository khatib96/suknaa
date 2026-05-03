import { Heart, MapPin, Share2, Star } from "lucide-react";
import {
  CITY_LABELS,
  HOTEL_TYPE_LABELS,
  type HotelListing,
} from "@/data/listings";

export function HotelHeader({ hotel }: { hotel: HotelListing }) {
  const cityLabel = CITY_LABELS[hotel.cityId];
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-gold">
            {Array.from({ length: hotel.stars }).map((_, idx) => (
              <Star key={idx} className="h-4 w-4 fill-gold" />
            ))}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-charcoal md:text-4xl">
            {hotel.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="مشاركة"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="إضافة للمفضلة"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal hover:text-primary"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {cityLabel} · {hotel.preciseAddress}
        </span>
        <span aria-hidden>·</span>
        <span className="rounded-full bg-[#FBF5E8] px-3 py-1 text-xs font-bold text-[#B0863F]">
          {HOTEL_TYPE_LABELS[hotel.type]}
        </span>
      </div>

      <div className="inline-flex items-center gap-3 rounded-2xl bg-[#FBF5E8] px-4 py-2.5">
        <span className="font-numeric flex h-12 w-12 items-center justify-center rounded-xl bg-[#B0863F] text-lg font-extrabold text-white">
          {hotel.score}
        </span>
        <div>
          <p className="text-sm font-bold text-charcoal">
            {hotel.score >= 9 ? "ممتاز" : hotel.score >= 8 ? "جيد جداً" : "جيد"}
          </p>
          <p className="font-numeric text-xs text-muted">
            {hotel.reviewsCount} تقييم
          </p>
        </div>
      </div>
    </header>
  );
}
