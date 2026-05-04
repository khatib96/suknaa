import { Eye, Lock, Users } from "lucide-react";

const VALUES = [
  {
    icon: Eye,
    title: "الشفافية",
    text: "كل سعر، كل بند، كل قرار—واضح. الضيف يرى ما يدفع، والمضيف يرى ما يستلم. لا أحاجٍ مالية.",
  },
  {
    icon: Lock,
    title: "الأمان",
    text: "بياناتك مشفَّرة، هويتك محمية، ومعاملاتك المالية مرصودة. الأمن ليس ميزة—هو الافتراض.",
  },
  {
    icon: Users,
    title: "الدعم المحلِّي",
    text: "نتحدَّث لغتك، نفهم ثقافتك، ونعرف تفاصيل البلد. الدعم بالعربية أولاً وأخيراً.",
  },
];

export function AboutValues() {
  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            قِيَمنا
          </h2>
          <p className="mt-3 text-base text-muted md:text-lg">
            ثلاث قِيَم نختبرها مع كل قرار نتَّخذه.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <article
                key={value.title}
                className="rounded-3xl border border-[#F5EFE6] bg-cream p-7 text-center shadow-warm-sm"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-primary-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-charcoal">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-charcoal/75">
                  {value.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
