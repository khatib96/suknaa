import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

type Props = {
  hostSlug: string;
  hostDisplayName: string;
};

export function PropertyHostSnippet({ hostSlug, hostDisplayName }: Props) {
  const initial = hostDisplayName.slice(0, 1);

  return (
    <section aria-labelledby="property-host-heading">
      <h2 id="property-host-heading" className="text-xl font-bold text-charcoal">
        تعرَّف على المضيف
      </h2>
      <article className="mt-4 flex items-start gap-4 rounded-2xl border border-[#F5EFE6] bg-white p-5 shadow-warm-sm">
        <span className="font-numeric inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/host/${hostSlug}`}
              className="text-base font-bold text-charcoal transition-colors hover:text-primary hover:underline"
            >
              {hostDisplayName}
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EE] px-2 py-0.5 text-[11px] font-bold text-[#2C6850]">
              <ShieldCheck className="h-3 w-3" />
              موثَّق
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-charcoal/80">
            مضيف نشط على سُكنى منذ سنوات. معدّل استجابة عالٍ خلال أقل من ساعة،
            ونسبة قبول حجوزات 95%.
          </p>
          <Link
            href={`/host/${hostSlug}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
          >
            عرض كل عقارات هذا المضيف
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </section>
  );
}
