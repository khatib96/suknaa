import Image from "next/image";
import { findAmenity } from "@/data/amenities";
import {
  SPACE_ICON_NAMES,
  SPACE_LABELS,
  type PropertySpace,
} from "@/data/property-spaces";
import { AmenityIcon } from "@/components/shared/AmenityIcon";

export function PropertySpaces({ spaces }: { spaces: PropertySpace[] }) {
  if (spaces.length === 0) return null;

  return (
    <section aria-labelledby="property-spaces-heading">
      <h2 id="property-spaces-heading" className="text-xl font-bold text-charcoal">
        غرف ومساحات هذا المكان
      </h2>
      <p className="mt-1 text-sm text-muted">
        تفاصيل لكل مساحة بصور خاصة بها — لتعرف بالضبط ما الذي ستحجزه.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {spaces.map((space) => (
          <article
            key={space.id}
            className="overflow-hidden rounded-2xl border border-[#F5EFE6] bg-white shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md"
          >
            <div className="relative h-48 overflow-hidden">
              {space.images[0] ? (
                <Image
                  src={space.images[0]}
                  alt={space.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-cream" />
              )}
              <span className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-charcoal shadow-warm-sm">
                <AmenityIcon
                  name={SPACE_ICON_NAMES[space.kind]}
                  className="h-3.5 w-3.5 text-primary"
                />
                {SPACE_LABELS[space.kind]}
              </span>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-bold text-charcoal">{space.name}</h3>
                {space.bedConfig ? (
                  <span className="text-xs text-muted">{space.bedConfig}</span>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-charcoal/80">{space.description}</p>

              {space.amenityIds.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {space.amenityIds.map((id) => {
                    const amenity = findAmenity(id);
                    if (!amenity) return null;
                    return (
                      <li
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-xs text-charcoal"
                      >
                        <AmenityIcon
                          name={amenity.icon}
                          className="h-3 w-3 text-muted"
                        />
                        {amenity.label}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
