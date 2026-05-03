import type { ReactNode } from "react";
import { CalendarCheck, DollarSign, House, ShieldCheck } from "lucide-react";

type Step = {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "1",
    icon: <House className="h-6 w-6" />,
    title: "أضف عقارك",
    description: "صور + وصف + مميزات في أقل من 15 دقيقة.",
  },
  {
    number: "2",
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "نتحقق منك",
    description: "KYC سريع خلال 24-48 ساعة.",
  },
  {
    number: "3",
    icon: <CalendarCheck className="h-6 w-6" />,
    title: "افتح التقويم",
    description: "أنت تحدد متى متاح ومتى لا.",
  },
  {
    number: "4",
    icon: <DollarSign className="h-6 w-6" />,
    title: "استقبل الضيوف",
    description: "الدفع مضمون، والمحفظة تنمو.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-cream px-4 py-20 md:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            كيف تعمل سُكنى؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            أربع خطوات بسيطة تفصلك عن أول ضيف.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-6 md:grid-cols-4">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-12 hidden h-0.5 bg-[length:8px_2px] bg-repeat-x md:block"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(200,90,61,0.4) 50%, transparent 0%)",
            }}
          />
          {steps.map((step) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-[#F5EFE6] bg-white p-6 text-center shadow-warm-sm"
            >
              <span className="font-numeric absolute end-4 top-4 text-xs font-bold text-muted">
                {step.number}
              </span>
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBF1E5] text-primary">
                {step.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-charcoal">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
