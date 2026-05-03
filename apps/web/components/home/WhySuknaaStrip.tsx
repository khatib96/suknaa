import { CreditCard, Headphones, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Reason = {
  icon: ReactNode;
  title: string;
  description: string;
};

const reasons: Reason[] = [
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: "حجز موثَّق ومضمون",
    description: "نتحقق من كل عقار وكل مضيف قبل النشر.",
  },
  {
    icon: <CreditCard className="h-7 w-7" />,
    title: "الدفع آمن 100%",
    description: "لا تدفع للمضيف مباشرة — Sham Cash، MTN، تحويل بنكي.",
  },
  {
    icon: <Sparkles className="h-7 w-7" />,
    title: "تقييمات حقيقية",
    description: "كل مراجعة من ضيف حجز فعلاً وأقام بنفسه.",
  },
  {
    icon: <Headphones className="h-7 w-7" />,
    title: "دعم بالعربي 24/7",
    description: "WhatsApp وبريد إلكتروني، استجابة في أقل من 30 دقيقة.",
  },
];

export function WhySuknaaStrip() {
  return (
    <section
      aria-labelledby="why-suknaa-heading"
      className="border-y border-[#F5EFE6] bg-white px-4 py-14 md:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="why-suknaa-heading" className="sr-only">
          لماذا سُكنى
        </h2>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <li
              key={reason.title}
              className="flex items-start gap-4 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FBF1E5] text-primary">
                {reason.icon}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-charcoal md:text-lg">
                  {reason.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {reason.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
