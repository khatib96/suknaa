import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HostListingsTabs } from "@/components/host-profile/HostListingsTabs";
import { HostProfileBio } from "@/components/host-profile/HostProfileBio";
import { HostProfileHeader } from "@/components/host-profile/HostProfileHeader";
import { HostReviewsPlaceholder } from "@/components/host-profile/HostReviewsPlaceholder";
import { findHost, getAllHostSlugs } from "@/data/hosts";
import { HOTELS, PROPERTIES } from "@/data/listings";

type Params = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const host = findHost(username);
  if (!host) {
    return { title: "المضيف غير موجود" };
  }
  return {
    title: host.displayName,
    description: host.bio.slice(0, 160),
  };
}

export function generateStaticParams() {
  return getAllHostSlugs().map((username) => ({ username }));
}

export default async function HostProfilePage({ params }: Params) {
  const { username } = await params;
  const host = findHost(username);
  if (!host) notFound();

  const properties = PROPERTIES.filter((p) => p.hostSlug === host.slug);
  const hotels = HOTELS.filter((h) => h.hostSlug === host.slug);
  const listingsCount = properties.length + hotels.length;

  return (
    <main className="bg-cream pb-20">
      <HostProfileHeader host={host} listingsCount={listingsCount} />
      <HostProfileBio host={host} />
      <Suspense fallback={<div className="h-[600px] bg-cream" />}>
        <HostListingsTabs properties={properties} hotels={hotels} />
      </Suspense>
      <HostReviewsPlaceholder host={host} />
    </main>
  );
}
