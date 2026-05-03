import { findAmenity } from "@/data/amenities";
import { AmenityIcon } from "@/components/shared/AmenityIcon";

export function HotelAmenities({ amenityIds }: { amenityIds: string[] }) {
  if (amenityIds.length === 0) return null;
  const amenities = amenityIds
    .map((id) => findAmenity(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <section aria-labelledby="hotel-amenities-heading">
      <h2 id="hotel-amenities-heading" className="text-xl font-bold text-charcoal">
        مرافق الفندق
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {amenities.map((a) => (
          <li
            key={a.id}
            className="inline-flex items-center gap-3 rounded-xl border border-[#F5EFE6] bg-white p-3 shadow-warm-sm"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBF5E8] text-[#B0863F]">
              <AmenityIcon name={a.icon} className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-charcoal">{a.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
