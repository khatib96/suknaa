"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { HotelCard, type HotelCardData } from "@/components/home/cards/HotelCard";
import { PropertyCard, type PropertyCardData } from "@/components/home/cards/PropertyCard";
import { cn } from "@/lib/utils";
import { DEFAULT_TAB, parseTab, TAB_LABELS, TAB_VALUES, type TabValue } from "@/lib/tab";

const properties: PropertyCardData[] = [
  {
    id: 1,
    title: "فيلا فاخرة بإطلالة بانورامية",
    location: "دمشق، أبو رمانة",
    price: 95,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "شقة عصرية قريبة من المركز",
    location: "اللاذقية، المشروع السابع",
    price: 52,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
  },
];

const hotels: HotelCardData[] = [
  {
    id: 1,
    title: "فندق البحر الكبير",
    location: "اللاذقية، الكورنيش",
    fromPrice: 78,
    score: 8.9,
    stars: 4,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "منتجع الشاطئ الذهبي",
    location: "طرطوس، الساحل",
    fromPrice: 120,
    score: 9.2,
    stars: 5,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
  },
];

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
          {showProperties &&
            properties.map((property) => (
              <PropertyCard key={`property-${property.id}`} item={property} />
            ))}
          {showHotels &&
            hotels.map((hotel) => <HotelCard key={`hotel-${hotel.id}`} item={hotel} />)}
        </div>
      </div>
    </section>
  );
}
