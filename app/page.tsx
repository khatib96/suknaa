import { Destinations } from "@/components/home/Destinations";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Hero } from "@/components/home/Hero";
import { MapExplorer } from "@/components/home/MapExplorer";

export default function Home() {
  return (
    <main>
      <Hero />
      <MapExplorer />
      <Destinations />
      <FeaturedListings />
    </main>
  );
}
