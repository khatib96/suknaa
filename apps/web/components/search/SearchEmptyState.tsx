import { SearchX } from "lucide-react";

export function SearchEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#E8E0D3] bg-white p-10 text-center shadow-warm-sm">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary">
        <SearchX className="h-8 w-8" />
      </span>
      <h3 className="mt-5 text-xl font-bold text-charcoal">
        ما لقينا شيئاً يطابق بحثك
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        جرّب توسيع نطاق الموقع أو التواريخ، أو إزالة بعض الفلاتر للحصول على
        نتائج أوسع.
      </p>
    </div>
  );
}
