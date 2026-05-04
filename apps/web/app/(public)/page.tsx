import { Suspense } from "react";
import { Destinations } from "@/components/home/Destinations";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Hero } from "@/components/home/Hero";
import { SeasonalPicks } from "@/components/home/SeasonalPicks";
import { WhySuknaaStrip } from "@/components/home/WhySuknaaStrip";

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="pt-40 md:pt-48 lg:pt-52">
        <Destinations />
      </div>
      <Suspense fallback={<div className="h-[600px] bg-cream" />}>
        <FeaturedListings />
      </Suspense>
      <WhySuknaaStrip />
      <SeasonalPicks />
    </main>
  );
}
