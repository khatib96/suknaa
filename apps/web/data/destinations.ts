/**
 * Data-driven destination helpers for Phase 1.
 *
 * Search uses every Syrian governorate. The homepage "featured destinations"
 * is derived from current mock inventory and only shows governorates that have
 * both inventory and a local image.
 */

import { HOTELS, PROPERTIES } from "@/data/listings";
import {
  SYRIAN_GOVERNORATES,
  type Governorate,
  type GovernorateId,
} from "@/data/syrian-governorates";

export type SearchDestination = {
  id: GovernorateId;
  city: string;
};

export type FeaturedDestination = SearchDestination & {
  image: string;
  staysCount: number;
  countLabel: string;
};

export const SEARCH_DESTINATIONS: SearchDestination[] = SYRIAN_GOVERNORATES.map(
  (g) => ({
    id: g.id,
    city: g.labelAr,
  }),
);

function countStays(governorateId: GovernorateId) {
  return (
    PROPERTIES.filter((p) => p.cityId === governorateId).length +
    HOTELS.filter((h) => h.cityId === governorateId).length
  );
}

function countLabel(count: number) {
  if (count === 1) return "إقامة واحدة";
  if (count === 2) return "إقامتان";
  if (count >= 3 && count <= 10) return `${count} إقامات`;
  return `${count} إقامة`;
}

function hasImage(
  governorate: Governorate,
): governorate is Governorate & { image: string } {
  return (
    "image" in governorate &&
    typeof governorate.image === "string" &&
    governorate.image.length > 0
  );
}

export function getFeaturedDestinations(limit = 6): FeaturedDestination[] {
  return SYRIAN_GOVERNORATES.map((g) => ({
    governorate: g,
    staysCount: countStays(g.id),
  }))
    .filter(
      (item): item is { governorate: Governorate & { image: string }; staysCount: number } =>
        item.staysCount > 0 && hasImage(item.governorate),
    )
    .sort((a, b) => b.staysCount - a.staysCount)
    .slice(0, limit)
    .map(({ governorate, staysCount }) => ({
      id: governorate.id,
      city: governorate.labelAr,
      image: governorate.image,
      staysCount,
      countLabel: countLabel(staysCount),
    }));
}
