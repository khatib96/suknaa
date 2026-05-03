import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center bg-cream px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-numeric inline-flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl font-extrabold text-primary shadow-warm-md">
          404
        </span>
        <h1 className="mt-8 text-3xl font-extrabold text-charcoal md:text-4xl">
          هاي الصفحة ما لقيناها
        </h1>
        <p className="mt-3 text-base leading-7 text-muted">
          الرابط ربما يكون قديماً، أو الصفحة انتقلت لمكان آخر. لكن لا تقلق —
          عندنا الكثير من الأماكن الجميلة لتكتشفها.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#a84a33]"
          >
            <Compass className="h-4 w-4" />
            العودة للرئيسية
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-6 py-3 text-sm font-bold text-charcoal transition-colors hover:text-primary"
          >
            <Search className="h-4 w-4" />
            تصفح العقارات والفنادق
          </Link>
        </div>
      </div>
    </main>
  );
}
