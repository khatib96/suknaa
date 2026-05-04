import { Clock, Globe, MessageSquare } from "lucide-react";
import { formatResponseTime, type Host } from "@/data/hosts";

type Props = {
  host: Host;
};

export function HostProfileBio({ host }: Props) {
  return (
    <section aria-labelledby="host-bio-heading" className="px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-sm md:p-8">
            <h2
              id="host-bio-heading"
              className="text-xl font-extrabold text-charcoal md:text-2xl"
            >
              نبذة عن {host.displayName}
            </h2>
            <p className="mt-4 text-sm leading-8 text-charcoal/85 md:text-base md:leading-9">
              {host.bio}
            </p>
          </article>

          <aside className="space-y-3">
            <BioStat
              icon={<Globe className="h-4 w-4" />}
              label="اللغات"
              value={host.languages.join("، ")}
            />
            <BioStat
              icon={<Clock className="h-4 w-4" />}
              label="وقت الاستجابة"
              value={formatResponseTime(host.responseTimeMinutes)}
              valueClassName="font-numeric"
            />
            <BioStat
              icon={<MessageSquare className="h-4 w-4" />}
              label="معدَّل الاستجابة"
              value={`${host.responseRatePercent}%`}
              valueClassName="font-numeric"
            />
          </aside>
        </div>
      </div>
    </section>
  );
}

function BioStat({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#F5EFE6] bg-white p-4 shadow-warm-sm">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className={`mt-0.5 text-sm font-bold text-charcoal ${valueClassName ?? ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
