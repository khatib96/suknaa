import { Heart, MapPin, Share2, Star } from "lucide-react";
import {
  CITY_LABELS,
  PROPERTY_TYPE_LABELS,
  type PropertyListing,
} from "@/data/listings";

export function PropertyHeader({ property }: { property: PropertyListing }) {
  const cityLabel = CITY_LABELS[property.cityId];
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-charcoal md:text-4xl">
          {property.title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="مشاركة"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal transition-colors hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="إضافة للمفضلة"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal transition-colors hover:text-primary"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {cityLabel} · {property.neighbourhood}
        </span>
        <span aria-hidden>·</span>
        <span className="rounded-full bg-[#FBF1E5] px-3 py-1 text-xs font-bold text-primary">
          {PROPERTY_TYPE_LABELS[property.type]}
        </span>
        <span aria-hidden>·</span>
        <span className="font-numeric inline-flex items-center gap-1 text-charcoal">
          <Star className="h-4 w-4 fill-gold text-gold" />
          {property.rating}
          <span className="ms-1 text-muted">({property.reviewsCount} تقييم)</span>
        </span>
      </div>
    </header>
  );
}
