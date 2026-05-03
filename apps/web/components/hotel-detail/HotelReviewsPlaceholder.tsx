type Props = {
  score: number;
  reviewsCount: number;
};

export function HotelReviewsPlaceholder({ score, reviewsCount }: Props) {
  const breakdown = [
    { label: "النظافة", value: 9.0 },
    { label: "الموقع", value: 9.4 },
    { label: "الخدمة", value: 8.8 },
    { label: "السعر/الجودة", value: 8.6 },
  ];

  return (
    <section aria-labelledby="hotel-reviews-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="hotel-reviews-heading" className="text-xl font-bold text-charcoal">
          تقييمات الضيوف
        </h2>
        <span className="font-numeric inline-flex items-center gap-2 text-base font-bold text-charcoal">
          <span className="rounded-lg bg-[#FBF5E8] px-2.5 py-1 text-[#B0863F]">
            {score}/10
          </span>
          <span className="text-sm font-medium text-muted">({reviewsCount} تقييم)</span>
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
          آراء ضيوف حقيقيين تظهر هنا بعد إقامتهم في الفندق.
        </p>
      </div>
    </section>
  );
}
