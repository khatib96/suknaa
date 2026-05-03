import { Building2, ShieldCheck } from "lucide-react";

type Props = {
  hostSlug: string;
  hostDisplayName: string;
};

export function HotelCompanySnippet({ hostDisplayName }: Props) {
  return (
    <section aria-labelledby="hotel-company-heading">
      <h2 id="hotel-company-heading" className="text-xl font-bold text-charcoal">
        المُشغِّل
      </h2>
      <article className="mt-4 flex items-start gap-4 rounded-2xl border border-[#F5EFE6] bg-white p-5 shadow-warm-sm">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FBF5E8] text-[#B0863F]">
          <Building2 className="h-6 w-6" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-charcoal">{hostDisplayName}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EE] px-2 py-0.5 text-[11px] font-bold text-[#2C6850]">
              <ShieldCheck className="h-3 w-3" />
              شركة موثَّقة
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-charcoal/80">
            شركة فنادق نشطة على سُكنى. عدة فروع، خدمات استقبال 24 ساعة، فريق
            مدرَّب ومستجيب لرسائل الضيوف.
          </p>
        </div>
      </article>
    </section>
  );
}
