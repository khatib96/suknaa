import {
  CalendarCheck,
  MessagesSquare,
  ShieldCheck,
  UserCircle,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HELP_CATEGORIES, type HelpCategory } from "@/data/help-faq";

const ICON_MAP: Record<HelpCategory["iconName"], LucideIcon> = {
  CalendarCheck,
  Wallet,
  XCircle,
  ShieldCheck,
  UserCircle,
  MessagesSquare,
};

export function HelpCategories() {
  return (
    <section className="bg-white px-4 py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-extrabold text-charcoal md:text-3xl">
          تصفَّح حسب الموضوع
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted md:text-base">
          ست فئات تغطِّي معظم الاستفسارات الشائعة.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.iconName];
            return (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                className="group rounded-2xl border border-[#F5EFE6] bg-cream p-6 shadow-warm-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-warm-md"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-charcoal">
                  {category.label}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-charcoal/70">
                  {category.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
