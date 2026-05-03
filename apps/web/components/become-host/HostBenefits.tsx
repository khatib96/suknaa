import type { ReactNode } from "react";
import { Headphones, ShieldCheck, Wallet } from "lucide-react";

type Benefit = {
  icon: ReactNode;
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    icon: <Wallet className="h-7 w-7" />,
    title: "اختر طريقة العمولة",
    description:
      "عمولتنا 8-12% فقط. اختر تتحملها أنت أو يدفعها الزبون — التحكم الكامل لك بدون تعقيد.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: "حماية كاملة",
    description:
      "نتحقق من كل ضيف قبل الحجز. الدفعة محجوزة لدينا حتى تسجيل دخول الضيف. لا متأخرات ولا احتيال.",
  },
  {
    icon: <Headphones className="h-7 w-7" />,
    title: "دعم بالعربي",
    description:
      "فريق سوري يفهم احتياجاتك. WhatsApp مباشر وبريد إلكتروني — استجابة في أقل من 30 دقيقة.",
  },
];

export function HostBenefits() {
  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            لماذا تختار سُكنى؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            ثلاثة أسباب رئيسية تجعل آلاف المضيفين يثقون بنا.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-2xl border border-[#F5EFE6] bg-cream p-7 shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md"
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-warm-sm">
                {benefit.icon}
              </span>
              <h3 className="mt-5 text-xl font-bold text-charcoal">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
