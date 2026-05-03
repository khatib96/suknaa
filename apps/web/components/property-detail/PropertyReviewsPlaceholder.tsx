import { Star } from "lucide-react";

type Props = {
  rating: number;
  reviewsCount: number;
};

export function PropertyReviewsPlaceholder({ rating, reviewsCount }: Props) {
  const breakdown = [
    { label: "النظافة", value: 4.9 },
    { label: "الموقع", value: 4.8 },
    { label: "صحة الوصف", value: 4.7 },
    { label: "التواصل", value: 4.95 },
  ];

  return (
    <section aria-labelledby="property-reviews-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="property-reviews-heading" className="text-xl font-bold text-charcoal">
          التقييمات
        </h2>
        <span className="font-numeric inline-flex items-center gap-1 text-base font-bold text-charcoal">
          <Star className="h-5 w-5 fill-gold text-gold" />
          {rating}
          <span className="ms-1 text-sm font-medium text-muted">
            ({reviewsCount} تقييم)
          </span>
        </span>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {breakdown.map((b) => (
          <li
            key={b.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#F5EFE6] bg-white p-3 text-sm shadow-warm-sm"
          >
            <span className="text-charcoal">{b.label}</span>
            <span className="font-numeric font-bold text-charcoal">{b.value}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-dashed border-[#E8E0D3] bg-cream p-6 text-center">
        <p className="text-sm leading-7 text-muted">
          آراء الضيوف الفعلية تظهر هنا بعد إقامتهم. التقييمات في سُكنى من ضيوف
          حجزوا فعلاً وأقاموا.
        </p>
      </div>
    </section>
  );
}
