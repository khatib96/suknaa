import type { Metadata } from "next";
import { HotelResultCard } from "@/components/search/HotelResultCard";
import { MapToggleButton } from "@/components/search/MapToggleButton";
import { PropertyResultCard } from "@/components/search/PropertyResultCard";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchMap } from "@/components/search/SearchMap";
import { SearchSortBar } from "@/components/search/SearchSortBar";
import { runSearch, type SearchParamsRecord } from "@/lib/search-utils";

export const metadata: Metadata = {
  title: "البحث",
  description: "ابحث عن السكن المثالي في سوريا — عقارات وفنادق بأسعار تناسبك.",
};

type PageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { params, properties, hotels } = runSearch(sp);
  const totalCount = properties.length + hotels.length;

  const cityValue = typeof sp.city === "string" ? sp.city : undefined;
  const propertyTypesValue =
    typeof sp.property_type === "string"
      ? [sp.property_type]
      : Array.isArray(sp.property_type)
        ? sp.property_type
        : [];
  const hotelTypesValue =
    typeof sp.hotel_type === "string"
      ? [sp.hotel_type]
      : Array.isArray(sp.hotel_type)
        ? sp.hotel_type
        : [];
  const amenityValue =
    typeof sp.amenity === "string"
      ? [sp.amenity]
      : Array.isArray(sp.amenity)
        ? sp.amenity
        : [];

  return (
    <main className="bg-cream min-h-screen">
      <SearchHeader
        activeTab={params.tab}
        city={cityValue && cityValue !== "all" ? cityValue : undefined}
      />

      <div className="mx-auto max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid lg:grid-cols-[280px_1fr] lg:px-8">
        <div className="hidden lg:block">
          <SearchFilters
            activeTab={params.tab}
            initialCity={cityValue ?? "all"}
            initialMinPrice={
              params.minPrice !== undefined ? String(params.minPrice) : ""
            }
            initialMaxPrice={
              params.maxPrice !== undefined ? String(params.maxPrice) : ""
            }
            initialBedrooms={
              params.bedrooms !== undefined ? String(params.bedrooms) : "any"
            }
            initialStars={
              params.stars !== undefined ? String(params.stars) : "any"
            }
            initialPropertyTypes={propertyTypesValue}
            initialHotelTypes={hotelTypesValue}
            initialAmenities={amenityValue}
            initialBreakfast={params.breakfastOnly ? "yes" : "any"}
          />
        </div>

        <section>
          <SearchSortBar resultsCount={totalCount} currentSort={params.sort} />

          {totalCount === 0 ? (
            <SearchEmptyState />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((p) => (
                <PropertyResultCard key={p.id} item={p} />
              ))}
              {hotels.map((h) => (
                <HotelResultCard key={h.id} item={h} />
              ))}
            </div>
          )}

          <SearchMap properties={properties} hotels={hotels} />
        </section>
      </div>

      <MapToggleButton />
    </main>
  );
}
