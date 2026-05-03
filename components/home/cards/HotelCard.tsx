import { Heart, MapPin, Star } from "lucide-react";

export type HotelCardData = {
  id: number;
  title: string;
  location: string;
  fromPrice: number;
  score: number;
  stars: number;
  image: string;
};

export function HotelCard({ item }: { item: HotelCardData }) {
  return (
    <article className="group overflow-hidden rounded-[16px] border border-[#E8E0D3] bg-white shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${item.image})` }} />
        <button
          type="button"
          className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-charcoal"
          aria-label="إضافة للمفضلة"
        >
          <Heart className="h-4 w-4" />
        </button>
        <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-white">
          فندق
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-bold text-charcoal">{item.title}</h3>
          <span className="font-numeric rounded-full bg-[#FBF5E8] px-2.5 py-1 text-sm font-bold text-[#B0863F]">
            {item.score}/10
          </span>
        </div>

        <div className="flex items-center gap-1 text-gold">
          {Array.from({ length: item.stars }).map((_, index) => (
            <Star key={`${item.id}-${index}`} className="h-4 w-4 fill-gold" />
          ))}
        </div>

        <p className="inline-flex items-center gap-1 text-sm text-muted">
          <MapPin className="h-4 w-4" />
          {item.location}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-numeric rounded-full bg-[#FBF5E8] px-3 py-1.5 text-sm font-bold text-[#B0863F]">
            من ${item.fromPrice} / ليلة
          </span>
          <button type="button" className="text-sm font-semibold text-primary hover:underline">
            اطلع
          </button>
        </div>
      </div>
    </article>
  );
}
