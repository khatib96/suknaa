import { CalendarDays, MapPin, Search as SearchIcon, Users } from "lucide-react";
import type { TabValue } from "@/lib/tab";
import { SearchTabs } from "@/components/search/SearchTabs";

type Props = {
  activeTab: TabValue;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

export function SearchHeader({ activeTab, city, checkIn, checkOut, guests }: Props) {
  return (
    <div className="sticky top-[72px] z-30 border-b border-[#E8E0D3] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto rounded-full border border-[#E8E0D3] bg-white px-2 py-1.5 shadow-warm-sm">
          <Field icon={<MapPin className="h-4 w-4" />} value={city || "أي مدينة"} />
          <span className="hidden h-6 w-px bg-[#E8E0D3] md:block" />
          <Field icon={<CalendarDays className="h-4 w-4" />} value={checkIn || "تاريخ الوصول"} />
          <span className="hidden h-6 w-px bg-[#E8E0D3] md:block" />
          <Field icon={<CalendarDays className="h-4 w-4" />} value={checkOut || "تاريخ المغادرة"} />
          <span className="hidden h-6 w-px bg-[#E8E0D3] md:block" />
          <Field icon={<Users className="h-4 w-4" />} value={guests || "عدد الضيوف"} />
          <button
            type="button"
            aria-label="بحث"
            className="ms-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>

        <SearchTabs activeTab={activeTab} />
      </div>
    </div>
  );
}

function Field({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs text-charcoal md:text-sm">
      <span className="text-muted">{icon}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
