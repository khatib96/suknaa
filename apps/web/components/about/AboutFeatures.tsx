import {
  Building2,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Building2,
    title: "نظامان متكاملان",
    description:
      "عقارات بأسلوب Airbnb (وصف غرفة بغرفة) وفنادق بأسلوب Booking (إدارة دقيقة للوحدات). كلٌّ بمنطقه الخاص دون خلط.",
  },
  {
    icon: Wallet,
    title: "مدفوعات محلِّية",
    description:
      "شام كاش و MTN كاش كأولوية، إلى جانب التحويل البنكي للمسافرين القادمين من الخارج. لا حواجز خارجية.",
  },
  {
    icon: ShieldCheck,
    title: "تحقُّق صارم",
    description:
      "كل مضيف يمر بإجراءات KYC قبل النشر. كل عقار يُراجَع يدوياً. التحقُّق ليس شعاراً—هو إجراء فعلي.",
  },
  {
    icon: Eye,
    title: "شفافية كاملة",
    description:
      "السعر الذي تراه هو السعر الذي تدفعه. لا رسوم خفيَّة، لا ذِكر للعمولات في فاتورة الضيف.",
  },
  {
    icon: HeartHandshake,
    title: "دعم بالعربي 24/7",
    description:
      "فريق دعم سوري يفهم سياقك المحلِّي ويتجاوب بسرعة عبر WhatsApp والبريد الإلكتروني خلال البيتا.",
  },
  {
    icon: Sparkles,
    title: "ذكاء بدون ضجيج",
    description:
      "اقتراحات أسعار، تنبيهات ندرة حقيقية، ومعالم قريبة على الخريطة. كلها تساعدك دون ما تضغطك.",
  },
];

export function AboutFeatures() {
  return (
    <section className="bg-cream px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            ما يميِّزنا
          </h2>
          <p className="mt-3 text-base text-muted md:text-lg">
            ست ميزات أساسية بنينا حولها كل قرار في المنصة.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-[#F5EFE6] bg-white p-6 shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-charcoal">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-charcoal/75">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
