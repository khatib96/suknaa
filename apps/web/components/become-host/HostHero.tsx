import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const heroBackground =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80";

export function HostHero() {
  return (
    <section
      className="relative flex min-h-[88vh] items-center px-4 pt-28 pb-24 md:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, rgba(44,40,38,0.78) 0%, rgba(44,40,38,0.42) 55%, rgba(44,40,38,0.12) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-2xl text-white">
          <span className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            انضم لمجتمع المضيفين السوريين
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
            حوّل بيت عطلاتك إلى مصدر دخل
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/90 md:text-xl">
            مع سُكنى، أنت تتحكَّم بكل شيء — السعر، التوفر، القواعد. نحن نتولّى
            باقي التفاصيل: التحقق من الضيف، الدفعات، والدعم بالعربي.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/become-a-host/apply"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95"
            >
              ابدأ الاستضافة الآن
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              كيف تعمل المنصة؟
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
