import type { Metadata } from "next";
import { HelpCategories } from "@/components/help/HelpCategories";
import { HelpEmptyCTA } from "@/components/help/HelpEmptyCTA";
import { HelpFAQAccordion } from "@/components/help/HelpFAQAccordion";
import { HelpHero } from "@/components/help/HelpHero";

export const metadata: Metadata = {
  title: "مركز المساعدة",
  description:
    "إجابات على أكثر الأسئلة الشائعة في سُكنى—الحجز، الدفع، الإلغاء، الأمان، الحساب، والتواصل.",
};

export default function HelpPage() {
  return (
    <main>
      <HelpHero />
      <HelpCategories />
      <HelpFAQAccordion />
      <HelpEmptyCTA />
    </main>
  );
}
