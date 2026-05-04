"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  Calendar,
  CreditCard,
  Home,
  Inbox,
  Search,
  ShieldCheck,
  Smile,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const AUDIENCES = ["guest", "host"] as const;
type Audience = (typeof AUDIENCES)[number];
const DEFAULT_AUDIENCE: Audience = "guest";

const AUDIENCE_LABELS: Record<Audience, string> = {
  guest: "للمستأجرين",
  host: "للمؤجِّرين",
};

type Step = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const GUEST_STEPS: Step[] = [
  {
    number: "1",
    title: "ابحث",
    description:
      "حدِّد المدينة، التواريخ، وعدد الضيوف. استخدم الفلاتر للوصول للعقار الذي يناسبك تماماً.",
    icon: Search,
  },
  {
    number: "2",
    title: "احجز",
    description:
      "اطَّلع على الصور، الوصف، والتقييمات. اختر التواريخ وأكمل الحجز بنقرة واحدة.",
    icon: Calendar,
  },
  {
    number: "3",
    title: "ادفع بأمان",
    description:
      "ادفع عبر شام كاش، MTN كاش، أو تحويل بنكي. الدفع محمي حتى تأكيد الإقامة.",
    icon: CreditCard,
  },
  {
    number: "4",
    title: "استمتع",
    description:
      "ستصلك تفاصيل العقار والمضيف بعد التأكيد. استمتع بإقامتك ودع لنا الباقي.",
    icon: Smile,
  },
];

const HOST_STEPS: Step[] = [
  {
    number: "1",
    title: "سجِّل كمضيف",
    description:
      "أنشئ حساب مضيف عبر النموذج المختصر. اختر فئة الاستضافة (عقارات أو فنادق) ونوع حسابك.",
    icon: UserPlus,
  },
  {
    number: "2",
    title: "تحقَّق من هويتك",
    description:
      "قدِّم وثائق التحقُّق (هوية + إثبات ملكية أو تفويض). نراجعها يدوياً خلال 48 ساعة.",
    icon: ShieldCheck,
  },
  {
    number: "3",
    title: "أضف عقارك",
    description:
      "أدخِل تفاصيل العقار، الصور، والأسعار. أضف قواعد إقامتك وسياسة الإلغاء التي تناسبك.",
    icon: Home,
  },
  {
    number: "4",
    title: "استلم الحجوزات",
    description:
      "تتلقَّى إشعاراً مع كل حجز جديد. الأرباح تصل لمحفظتك تلقائياً وفق جدول السحب.",
    icon: Inbox,
  },
];

const STEPS_BY_AUDIENCE: Record<Audience, Step[]> = {
  guest: GUEST_STEPS,
  host: HOST_STEPS,
};

function isAudience(value: unknown): value is Audience {
  return typeof value === "string" && (AUDIENCES as readonly string[]).includes(value);
}

function parseAudience(value: unknown): Audience {
  return isAudience(value) ? value : DEFAULT_AUDIENCE;
}

export function HowItWorksTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audience = useMemo<Audience>(
    () => parseAudience(searchParams?.get("audience")),
    [searchParams],
  );

  const buildHref = (target: Audience) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (target === DEFAULT_AUDIENCE) {
      params.delete("audience");
    } else {
      params.set("audience", target);
    }
    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  const onTabClick = (target: Audience) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.replace(buildHref(target), { scroll: false });
  };

  const steps = STEPS_BY_AUDIENCE[audience];

  return (
    <section className="bg-white px-4 py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border border-[#E8E0D3] bg-cream p-1 shadow-warm-sm">
            {AUDIENCES.map((tab) => (
              <Link
                key={tab}
                href={buildHref(tab)}
                onClick={onTabClick(tab)}
                aria-pressed={audience === tab}
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm transition-colors",
                  audience === tab
                    ? "bg-primary font-bold text-white shadow-primary-glow"
                    : "font-medium text-muted hover:text-primary",
                )}
              >
                {AUDIENCE_LABELS[tab]}
              </Link>
            ))}
          </div>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="relative rounded-2xl border border-[#F5EFE6] bg-cream p-6 shadow-warm-sm transition-shadow duration-200 hover:shadow-warm-md"
              >
                <span className="font-numeric absolute -top-4 end-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-base font-extrabold text-white shadow-primary-glow">
                  {step.number}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-charcoal/75">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
