import type { Metadata } from "next";
import { AboutCTA } from "@/components/about/AboutCTA";
import { AboutFeatures } from "@/components/about/AboutFeatures";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutNumbers } from "@/components/about/AboutNumbers";
import { AboutTeam } from "@/components/about/AboutTeam";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutVision } from "@/components/about/AboutVision";

export const metadata: Metadata = {
  title: "عن سُكنى",
  description:
    "تعرَّف على قصة سُكنى—منصة سورية بأيدي سورية لاكتشاف وحجز السكن. رؤيتنا، قِيَمنا، وما يميِّزنا.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutVision />
      <AboutFeatures />
      <AboutNumbers />
      <AboutValues />
      <AboutTeam />
      <AboutCTA />
    </main>
  );
}
