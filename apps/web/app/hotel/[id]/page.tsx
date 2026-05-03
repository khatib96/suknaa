import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HotelAmenities } from "@/components/hotel-detail/HotelAmenities";
import { HotelCompanySnippet } from "@/components/hotel-detail/HotelCompanySnippet";
import { HotelDatePickerSticky } from "@/components/hotel-detail/HotelDatePickerSticky";
import { HotelDescription } from "@/components/hotel-detail/HotelDescription";
import { HotelGallery } from "@/components/hotel-detail/HotelGallery";
import { HotelHeader } from "@/components/hotel-detail/HotelHeader";
import { HotelMapAndNearby } from "@/components/hotel-detail/HotelMapAndNearby";
import { HotelReviewsPlaceholder } from "@/components/hotel-detail/HotelReviewsPlaceholder";
import { RoomTypesList } from "@/components/hotel-detail/RoomTypesList";
import { CITY_LABELS, findHotel, HOTELS } from "@/data/listings";
import { getRoomTypes } from "@/data/room-types";

type Params = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const hotel = findHotel(id);
  if (!hotel) {
    return { title: "الفندق غير موجود" };
  }
  return {
    title: hotel.title,
    description: hotel.description.slice(0, 160),
  };
}

export function generateStaticParams() {
  return HOTELS.map((h) => ({ id: h.id }));
}

export default async function HotelDetailPage({ params }: Params) {
  const { id } = await params;
  const hotel = findHotel(id);
  if (!hotel) notFound();

  const roomTypes = getRoomTypes(hotel.id);
  const cityLabel = CITY_LABELS[hotel.cityId];

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
              <Link href="/search?tab=hospitality" className="hover:text-primary">
                فنادق
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link
                href={`/search?tab=hospitality&city=${hotel.cityId}`}
                className="hover:text-primary"
              >
                {cityLabel}
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="font-medium text-charcoal">{hotel.title}</li>
          </ol>
        </nav>

        <HotelGallery images={hotel.images} alt={hotel.title} />

        <div className="mt-8">
          <HotelHeader hotel={hotel} />
        </div>

        <div className="mt-8">
          <HotelDatePickerSticky />
        </div>

        <div className="space-y-10">
          <HotelDescription description={hotel.description} />
          <HotelAmenities amenityIds={hotel.amenityIds} />
          <RoomTypesList roomTypes={roomTypes} />
          <HotelMapAndNearby
            preciseAddress={hotel.preciseAddress}
            nearby={hotel.nearby}
          />
          <HotelReviewsPlaceholder
            score={hotel.score}
            reviewsCount={hotel.reviewsCount}
          />
          <HotelCompanySnippet
            hostSlug={hotel.hostSlug}
            hostDisplayName={hotel.hostDisplayName}
          />
        </div>
      </div>
    </main>
  );
}
