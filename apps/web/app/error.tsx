"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[suknaa] page error", error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center bg-cream px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FBE9E7] text-[#B83A3A]">
          <AlertTriangle className="h-9 w-9" />
        </span>
        <h1 className="mt-8 text-3xl font-extrabold text-charcoal md:text-4xl">
          صار خطأ غير متوقع
        </h1>
        <p className="mt-3 text-base leading-7 text-muted">
          مشكلة فنية على جهتنا. حاول إعادة تحميل الصفحة. إذا استمر الخطأ، تواصل
          معنا وسنحل المشكلة بأسرع وقت.
        </p>

        {error.digest ? (
          <p className="font-numeric mt-4 text-xs text-muted">
            رقم الخطأ: <span className="font-bold">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#a84a33]"
          >
            <RefreshCw className="h-4 w-4" />
            حاول مجدداً
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-6 py-3 text-sm font-bold text-charcoal transition-colors hover:text-primary"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
