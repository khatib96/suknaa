import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingWidget } from "@/components/property-detail/BookingWidget";
import { PropertyAmenities } from "@/components/property-detail/PropertyAmenities";
import { PropertyDescription } from "@/components/property-detail/PropertyDescription";
import { PropertyGallery } from "@/components/property-detail/PropertyGallery";
import { PropertyHeader } from "@/components/property-detail/PropertyHeader";
import { PropertyHostSnippet } from "@/components/property-detail/PropertyHostSnippet";
import { PropertyHouseRules } from "@/components/property-detail/PropertyHouseRules";
import { PropertyMapAndNearby } from "@/components/property-detail/PropertyMapAndNearby";
import { PropertyReviewsPlaceholder } from "@/components/property-detail/PropertyReviewsPlaceholder";
import { PropertySpaces } from "@/components/property-detail/PropertySpaces";
import { PropertyStatsStrip } from "@/components/property-detail/PropertyStatsStrip";
import { CITY_LABELS, findProperty, PROPERTIES } from "@/data/listings";
import { getPropertySpaces } from "@/data/property-spaces";

type Params = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const property = findProperty(id);
  if (!property) {
    return { title: "مكان الإقامة غير موجود" };
  }
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export default async function PropertyDetailPage({ params }: Params) {
  const { id } = await params;
  const property = findProperty(id);
  if (!property) notFound();

  const spaces = getPropertySpaces(property.id);
  const cityLabel = CITY_LABELS[property.cityId];

  return (
    <main className="bg-cream pt-24 pb-16 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <nav aria-label="breadcrumb" className="mb-4 text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary">
                الرئيسية
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/search?tab=real_estate" className="hover:text-primary">
                بيوت عطلات
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link
                href={`/search?tab=real_estate&city=${property.cityId}`}
                className="hover:text-primary"
              >
                {cityLabel}
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="font-medium text-charcoal">{property.title}</li>
          </ol>
        </nav>

        <PropertyGallery images={property.images} alt={property.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <PropertyHeader property={property} />
            <PropertyStatsStrip property={property} />
            <PropertyDescription description={property.description} />
            <PropertySpaces spaces={spaces} />
            <PropertyAmenities amenityIds={property.amenityIds} />
            <PropertyMapAndNearby
              approximateAddress={property.approximateAddress}
              nearby={property.nearby}
            />
            <PropertyHouseRules />
            <PropertyReviewsPlaceholder
              rating={property.rating}
              reviewsCount={property.reviewsCount}
            />
            <PropertyHostSnippet
              hostSlug={property.hostSlug}
              hostDisplayName={property.hostDisplayName}
            />
          </div>

          <div className="lg:block">
            <BookingWidget
              basePriceUsd={property.basePriceUsd}
              maxGuests={property.guests}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
