import { Star } from "lucide-react";
import type { Host } from "@/data/hosts";

type Props = {
  host: Host;
};

export function HostReviewsPlaceholder({ host }: Props) {
  return (
    <section
      aria-labelledby="host-reviews-heading"
      className="bg-white px-4 py-14 md:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="host-reviews-heading"
            className="text-2xl font-extrabold text-charcoal md:text-3xl"
          >
            تقييمات الضيوف
          </h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-charcoal">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-numeric">{host.rating}</span>
            <span className="font-numeric text-muted">
              من {host.reviewsCount} تقييم
            </span>
          </div>
        </div>

        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {host.reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-[#F5EFE6] bg-cream p-6 shadow-warm-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-charcoal">
                  {review.guestName}
                </h3>
                <span className="font-numeric inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-charcoal">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  {review.rating}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-charcoal/85">
                “{review.comment}”
              </p>
              <p className="font-numeric mt-3 text-xs text-muted">{review.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
