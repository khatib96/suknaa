import type { Metadata } from "next";
import { Suspense } from "react";
import { HowItWorksCTA } from "@/components/how-it-works/HowItWorksCTA";
import { HowItWorksHero } from "@/components/how-it-works/HowItWorksHero";
import { HowItWorksTabs } from "@/components/how-it-works/HowItWorksTabs";

export const metadata: Metadata = {
  title: "كيف يعمل الموقع",
  description:
    "اكتشف كيف يعمل سُكنى للضيوف والمضيفين—4 خطوات بسيطة لكلا الطرفين، من البحث حتى الإقامة.",
};

export default function HowItWorksPage() {
  return (
    <main>
      <HowItWorksHero />
      <Suspense fallback={<div className="h-[400px] bg-white" />}>
        <HowItWorksTabs />
      </Suspense>
      <HowItWorksCTA />
    </main>
  );
}
