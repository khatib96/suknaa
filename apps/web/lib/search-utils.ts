/**
 * Server-side filter + sort helpers for /search.
 * Pure functions — no React, no DOM.
 */

import {
  HOTELS,
  PROPERTIES,
  type HotelListing,
  type PropertyListing,
} from "@/data/listings";
import type { TabValue } from "@/lib/tab";
import type { SortValue } from "@/components/search/SearchSortBar";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export type ParsedSearchParams = {
  tab: TabValue;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  stars?: number;
  propertyTypes: string[];
  hotelTypes: string[];
  amenities: string[];
  breakfastOnly: boolean;
  sort: SortValue;
};

const SORT_VALUES: ReadonlyArray<SortValue> = [
  "relevance",
  "price_asc",
  "price_desc",
  "rating",
];

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function asNumber(value: string | string[] | undefined): number | undefined {
  const str = asString(value);
  if (!str) return undefined;
  const num = Number(str);
  return Number.isFinite(num) ? num : undefined;
}

export function parseSearchParams(sp: SearchParamsRecord): ParsedSearchParams {
  const tabRaw = asString(sp.tab);
  const tab: TabValue =
    tabRaw === "real_estate" || tabRaw === "hospitality" ? tabRaw : "all";

  const sortRaw = asString(sp.sort);
  const sort: SortValue = SORT_VALUES.includes(sortRaw as SortValue)
    ? (sortRaw as SortValue)
    : "relevance";

  return {
    tab,
    city: asString(sp.city),
    minPrice: asNumber(sp.min_price),
    maxPrice: asNumber(sp.max_price),
    bedrooms: asNumber(sp.bedrooms),
    stars: asNumber(sp.stars),
    propertyTypes: asArray(sp.property_type),
    hotelTypes: asArray(sp.hotel_type),
    amenities: asArray(sp.amenity),
    breakfastOnly: asString(sp.breakfast) === "yes",
    sort,
  };
}

export function filterProperties(
  list: PropertyListing[],
  params: ParsedSearchParams,
): PropertyListing[] {
  return list.filter((p) => {
    if (params.city && params.city !== "all" && p.cityId !== params.city) return false;
    if (params.minPrice !== undefined && p.basePriceUsd < params.minPrice) return false;
    if (params.maxPrice !== undefined && p.basePriceUsd > params.maxPrice) return false;
    if (params.bedrooms !== undefined && p.bedrooms < params.bedrooms) return false;
    if (params.propertyTypes.length > 0 && !params.propertyTypes.includes(p.type))
      return false;
    if (
      params.amenities.length > 0 &&
      !params.amenities.every((a) => p.amenityIds.includes(a))
    )
      return false;
    return true;
  });
}

export function filterHotels(
  list: HotelListing[],
  params: ParsedSearchParams,
): HotelListing[] {
  return list.filter((h) => {
    if (params.city && params.city !== "all" && h.cityId !== params.city) return false;
    if (params.minPrice !== undefined && h.fromPriceUsd < params.minPrice) return false;
    if (params.maxPrice !== undefined && h.fromPriceUsd > params.maxPrice) return false;
    if (params.stars !== undefined && h.stars < params.stars) return false;
    if (params.hotelTypes.length > 0 && !params.hotelTypes.includes(h.type))
      return false;
    if (params.breakfastOnly && !h.breakfastAvailable) return false;
    if (
      params.amenities.length > 0 &&
      !params.amenities.every((a) => h.amenityIds.includes(a))
    )
      return false;
    return true;
  });
}

export function sortProperties(
  list: PropertyListing[],
  sort: SortValue,
): PropertyListing[] {
  const next = [...list];
  switch (sort) {
    case "price_asc":
      return next.sort((a, b) => a.basePriceUsd - b.basePriceUsd);
    case "price_desc":
      return next.sort((a, b) => b.basePriceUsd - a.basePriceUsd);
    case "rating":
      return next.sort((a, b) => b.rating - a.rating);
    default:
      return next;
  }
}

export function sortHotels(list: HotelListing[], sort: SortValue): HotelListing[] {
  const next = [...list];
  switch (sort) {
    case "price_asc":
      return next.sort((a, b) => a.fromPriceUsd - b.fromPriceUsd);
    case "price_desc":
      return next.sort((a, b) => b.fromPriceUsd - a.fromPriceUsd);
    case "rating":
      return next.sort((a, b) => b.score - a.score);
    default:
      return next;
  }
}

/**
 * Run the full pipeline: parse → filter → sort, respecting the active tab.
 */
export function runSearch(sp: SearchParamsRecord) {
  const params = parseSearchParams(sp);

  const showProperties = params.tab !== "hospitality";
  const showHotels = params.tab !== "real_estate";

  const properties = showProperties
    ? sortProperties(filterProperties(PROPERTIES, params), params.sort)
    : [];
  const hotels = showHotels
    ? sortHotels(filterHotels(HOTELS, params), params.sort)
    : [];

  return { params, properties, hotels };
}
