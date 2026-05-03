import { findAmenity } from "@/data/amenities";
import { AmenityIcon } from "@/components/shared/AmenityIcon";

export function PropertyAmenities({ amenityIds }: { amenityIds: string[] }) {
  if (amenityIds.length === 0) return null;

  const amenities = amenityIds
    .map((id) => findAmenity(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <section aria-labelledby="property-amenities-heading">
      <h2 id="property-amenities-heading" className="text-xl font-bold text-charcoal">
        المميزات والخدمات
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {amenities.map((a) => (
          <li
            key={a.id}
            className="inline-flex items-center gap-3 rounded-xl border border-[#F5EFE6] bg-white p-3 shadow-warm-sm"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-primary">
              <AmenityIcon name={a.icon} className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-charcoal">{a.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
