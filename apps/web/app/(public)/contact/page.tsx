import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactSidebar } from "@/components/contact/ContactSidebar";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع فريق سُكنى عبر النموذج، أو على WhatsApp والبريد الإلكتروني. الدعم متاح 24/7 خلال البيتا.",
};

export default function ContactPage() {
  return (
    <main className="bg-cream pb-24">
      <ContactHero />
      <section className="px-4 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ContactForm />
          <ContactSidebar />
        </div>
      </section>
    </main>
  );
}
