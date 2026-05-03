"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "relevance", label: "الأكثر صلة" },
  { value: "price_asc", label: "السعر: من الأرخص" },
  { value: "price_desc", label: "السعر: من الأغلى" },
  { value: "rating", label: "التقييم" },
] as const;

export type SortValue = (typeof OPTIONS)[number]["value"];

export function SearchSortBar({
  resultsCount,
  currentSort,
}: {
  resultsCount: number;
  currentSort: SortValue;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (value: SortValue) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F5EFE6] bg-white p-3 shadow-warm-sm">
      <p className="text-sm text-muted">
        <span className="font-numeric font-bold text-charcoal">{resultsCount}</span>
        <span className="ms-1">نتيجة متاحة</span>
      </p>
      <label className="flex items-center gap-2 text-sm text-charcoal">
        <span className="text-muted">ترتيب حسب:</span>
        <select
          value={currentSort}
          onChange={(e) => onChange(e.target.value as SortValue)}
          className="h-9 rounded-xl border border-[#E8E0D3] bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
