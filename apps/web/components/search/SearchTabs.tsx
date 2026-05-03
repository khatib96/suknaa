"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DEFAULT_TAB, TAB_LABELS, TAB_VALUES, type TabValue } from "@/lib/tab";

export function SearchTabs({ activeTab }: { activeTab: TabValue }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildHref = (tab: TabValue) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (tab === DEFAULT_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  const onClick = (tab: TabValue) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.replace(buildHref(tab), { scroll: false });
  };

  return (
    <div className="flex items-center rounded-full border border-[#E8E0D3] bg-white p-1 shadow-warm-sm">
      {TAB_VALUES.map((tab) => (
        <Link
          key={tab}
          href={buildHref(tab)}
          onClick={onClick(tab)}
          aria-pressed={activeTab === tab}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            activeTab === tab
              ? "bg-primary font-bold text-white"
              : "font-medium text-muted hover:text-primary",
          )}
        >
          {TAB_LABELS[tab]}
        </Link>
      ))}
    </div>
  );
}
