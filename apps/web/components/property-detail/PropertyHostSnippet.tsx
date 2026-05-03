import { ShieldCheck } from "lucide-react";

type Props = {
  hostSlug: string;
  hostDisplayName: string;
};

export function PropertyHostSnippet({ hostDisplayName }: Props) {
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
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-charcoal">{hostDisplayName}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EE] px-2 py-0.5 text-[11px] font-bold text-[#2C6850]">
              <ShieldCheck className="h-3 w-3" />
              موثَّق
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-charcoal/80">
            مضيف نشط على سُكنى منذ سنوات. معدّل استجابة عالٍ خلال أقل من ساعة،
            ونسبة قبول حجوزات 95%.
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            عرض كل عقارات هذا المضيف
          </button>
        </div>
      </article>
    </section>
  );
}
