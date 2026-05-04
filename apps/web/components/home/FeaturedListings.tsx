"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { HotelResultCard } from "@/components/search/HotelResultCard";
import { PropertyResultCard } from "@/components/search/PropertyResultCard";
import { HOTELS, PROPERTIES } from "@/data/listings";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TAB,
  parseTab,
  TAB_LABELS,
  TAB_VALUES,
  type TabValue,
} from "@/lib/tab";

const FEATURED_PROPERTIES = PROPERTIES.slice(0, 4);
const FEATURED_HOTELS = HOTELS.slice(0, 4);

export function FeaturedListings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = useMemo<TabValue>(
    () => parseTab(searchParams?.get("tab")),
    [searchParams],
  );

  const buildHref = (tab: TabValue) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (tab === DEFAULT_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  const onTabClick = (tab: TabValue) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.replace(buildHref(tab), { scroll: false });
  };

  const showProperties = activeTab !== "hospitality";
  const showHotels = activeTab !== "real_estate";

  // For "all" we mix and limit to ~4 of each so the grid stays balanced.
  const properties = showProperties ? FEATURED_PROPERTIES : [];
  const hotels = showHotels ? FEATURED_HOTELS : [];

  return (
    <section className="bg-cream px-4 py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-charcoal">أماكن مميزة</h2>
          <div className="flex items-center rounded-full border border-[#E8E0D3] bg-white p-1 shadow-warm-sm">
            {TAB_VALUES.map((tab) => (
              <Link
                key={tab}
                href={buildHref(tab)}
                onClick={onTabClick(tab)}
                aria-pressed={activeTab === tab}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm transition-colors",
                  activeTab === tab
                    ? "bg-primary font-bold text-white"
                    : "font-medium text-muted hover:text-primary",
                )}
              >
                {TAB_LABELS[tab]}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {properties.map((property) => (
            <PropertyResultCard
              key={`property-${property.id}`}
              item={property}
            />
          ))}
          {hotels.map((hotel) => (
            <HotelResultCard key={`hotel-${hotel.id}`} item={hotel} />
          ))}
        </div>
      </div>
    </section>
  );
}
