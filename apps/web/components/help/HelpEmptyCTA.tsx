import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function HelpEmptyCTA() {
  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#F5EFE6] bg-cream p-8 text-center shadow-warm-sm md:p-12">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-charcoal md:text-3xl">
          لم تجد إجابتك؟
        </h2>
        <p className="mt-3 text-sm leading-7 text-charcoal/75 md:text-base">
          فريق دعم سُكنى متاح للإجابة على أي استفسار. أرسل رسالتك وسنرد خلال
          أقصى 24 ساعة.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95"
        >
          تواصل معنا
        </Link>
      </div>
    </section>
  );
}
