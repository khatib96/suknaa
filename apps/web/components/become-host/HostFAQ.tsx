import { ChevronDown } from "lucide-react";
import { HOST_FAQ } from "@/data/host-faq";

export function HostFAQ() {
  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            الأسئلة الشائعة للمضيفين
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            كل ما تحتاج معرفته قبل أن تبدأ.
          </p>
        </div>

        <ul className="mt-10 space-y-3">
          {HOST_FAQ.map((item) => (
            <li key={item.id}>
              <details className="group rounded-2xl border border-[#F5EFE6] bg-cream p-1 shadow-warm-sm transition-shadow open:shadow-warm-md">
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
    </section>
  );
}
