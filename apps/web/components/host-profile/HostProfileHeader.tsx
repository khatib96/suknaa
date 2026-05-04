import { Building2, ShieldCheck, Sparkles, Star } from "lucide-react";
import {
  formatMemberSince,
  HOST_KIND_LABELS,
  type Host,
} from "@/data/hosts";

type Props = {
  host: Host;
  listingsCount: number;
};

export function HostProfileHeader({ host, listingsCount }: Props) {
  const isCompany = host.kind === "hotel_company";
  const initial = host.displayName.slice(0, 1);
  const greeting = HOST_KIND_LABELS[host.kind].greeting;

  return (
    <section className="bg-gradient-to-bl from-cream via-white to-cream px-4 pt-32 pb-12 md:px-6 lg:px-8 lg:pt-36">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-muted">{greeting}</p>

        <div className="mt-3 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-7">
          {isCompany ? (
            <span className="inline-flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#FBF5E8] text-[#B0863F] shadow-warm-sm md:h-28 md:w-28">
              <Building2 className="h-10 w-10 md:h-12 md:w-12" />
            </span>
          ) : (
            <span className="font-numeric inline-flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-extrabold text-primary shadow-warm-sm md:h-28 md:w-28 md:text-4xl">
              {initial}
            </span>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-charcoal md:text-4xl">
                {host.displayName}
              </h1>
              {host.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F3EE] px-2.5 py-1 text-[11px] font-bold text-[#2C6850]">
                  <ShieldCheck className="h-3 w-3" />
                  موثَّق
                </span>
              ) : null}
              {host.superHost ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-[#B0863F]">
                  <Sparkles className="h-3 w-3" />
                  Super Host
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm text-muted">
              {HOST_KIND_LABELS[host.kind].typeLabel}
              {" · "}
              <span className="font-numeric">عضو منذ {formatMemberSince(host.memberSince)}</span>
            </p>

            <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-charcoal">
              <li className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-numeric font-bold">{host.rating}</span>
                <span className="font-numeric text-muted">
                  ({host.reviewsCount} تقييم)
                </span>
              </li>
              <li className="font-numeric inline-flex items-center gap-1.5">
                <span className="font-bold">{listingsCount}</span>
                <span className="text-muted">إعلان نشط</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
