import { ChevronDown } from "lucide-react";
import {
  HELP_CATEGORIES,
  HELP_FAQ,
  type HelpCategoryId,
} from "@/data/help-faq";

export function HelpFAQAccordion() {
  return (
    <section className="bg-cream px-4 py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-extrabold text-charcoal md:text-3xl">
          الأسئلة الشائعة
        </h2>
        <p className="mt-2 text-center text-sm text-muted md:text-base">
          إجابات سريعة على الأسئلة الأكثر تكراراً.
        </p>

        <div className="mt-10 space-y-10">
          {HELP_CATEGORIES.map((category) => (
            <CategoryGroup key={category.id} categoryId={category.id} title={category.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryGroup({
  categoryId,
  title,
}: {
  categoryId: HelpCategoryId;
  title: string;
}) {
  const items = HELP_FAQ.filter((item) => item.categoryId === categoryId);
  if (items.length === 0) return null;

  return (
    <div id={`category-${categoryId}`} className="scroll-mt-28">
      <h3 className="mb-3 text-lg font-extrabold text-primary">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <details className="group rounded-2xl border border-[#F5EFE6] bg-white p-1 shadow-warm-sm transition-shadow open:shadow-warm-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 text-base font-bold text-charcoal transition-colors hover:text-primary">
                <span>{item.question}</span>
                <ChevronDown
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="px-5 pb-5 pt-1 text-sm leading-7 text-charcoal/80">
                {item.answer}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
