import type { Metadata } from "next";
import { EarningsCalculator } from "@/components/become-host/EarningsCalculator";
import { HostBenefits } from "@/components/become-host/HostBenefits";
import { HostFAQ } from "@/components/become-host/HostFAQ";
import { HostFinalCTA } from "@/components/become-host/HostFinalCTA";
import { HostHero } from "@/components/become-host/HostHero";
import { HostTestimonials } from "@/components/become-host/HostTestimonials";
import { HowItWorks } from "@/components/become-host/HowItWorks";
import { LiveNumbersStrip } from "@/components/become-host/LiveNumbersStrip";

export const metadata: Metadata = {
  title: "كن مضيفاً",
  description:
    "حوّل بيت عطلاتك أو فندقك إلى مصدر دخل عبر سُكنى. عمولة عادلة، حماية كاملة، ودعم بالعربي.",
};

export default function BecomeAHostPage() {
  return (
    <main>
      <HostHero />
      <LiveNumbersStrip />
      <HostBenefits />
      <HowItWorks />
      <EarningsCalculator />
      <HostTestimonials />
      <HostFAQ />
      <HostFinalCTA />
    </main>
  );
}
