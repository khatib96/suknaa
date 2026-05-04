"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { HotelResultCard } from "@/components/search/HotelResultCard";
import { PropertyResultCard } from "@/components/search/PropertyResultCard";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TAB,
  parseTab,
  TAB_LABELS,
  TAB_VALUES,
  type TabValue,
} from "@/lib/tab";
import type { HotelListing, PropertyListing } from "@/data/listings";

type Props = {
  properties: PropertyListing[];
  hotels: HotelListing[];
};

export function HostListingsTabs({ properties, hotels }: Props) {
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

  const visibleProperties = showProperties ? properties : [];
  const visibleHotels = showHotels ? hotels : [];
  const totalVisible = visibleProperties.length + visibleHotels.length;

  return (
    <section className="bg-cream px-4 py-14 md:px-6 lg:px-8" aria-labelledby="host-listings-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            id="host-listings-heading"
            className="text-2xl font-extrabold text-charcoal md:text-3xl"
          >
            الإعلانات
          </h2>
          <div className="inline-flex items-center rounded-full border border-[#E8E0D3] bg-white p-1 shadow-warm-sm">
            {TAB_VALUES.map((tab) => {
              const disabled =
                (tab === "real_estate" && properties.length === 0) ||
                (tab === "hospitality" && hotels.length === 0);
              if (disabled) {
                return (
                  <span
                    key={tab}
                    aria-disabled
                    className="cursor-not-allowed rounded-full px-4 py-1.5 text-sm font-medium text-muted/50"
                  >
                    {TAB_LABELS[tab]}
                  </span>
                );
              }
              return (
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
              );
            })}
          </div>
        </div>

        {totalVisible === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#E8E0D3] bg-white p-10 text-center text-muted">
            لا توجد إعلانات نشطة في هذا التبويب.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleProperties.map((p) => (
              <PropertyResultCard key={`prop-${p.id}`} item={p} />
            ))}
            {visibleHotels.map((h) => (
              <HotelResultCard key={`hotel-${h.id}`} item={h} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
