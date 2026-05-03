import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function HostFinalCTA() {
  return (
    <section
      className="px-4 py-16 md:px-6 lg:px-8"
      style={{
        background: "linear-gradient(135deg, #C85A3D 0%, #D4A24C 100%)",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center text-white md:flex-row md:text-start">
        <div>
          <h2 className="text-3xl font-extrabold md:text-4xl">
            جاهز تبدأ رحلتك معنا؟
          </h2>
          <p className="mt-2 text-base text-white/85 md:text-lg">
            سجِّل كمضيف الآن — العملية سريعة، والخطوات واضحة.
          </p>
        </div>

        <Link
          href="/signup?intent=host"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-primary shadow-warm-md transition-all duration-200 hover:shadow-warm-lg active:scale-95"
        >
          سجِّل كمضيف الآن
          <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
