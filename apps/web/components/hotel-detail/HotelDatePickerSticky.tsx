"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function HotelDatePickerSticky() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-[72px] z-30 -mx-4 mb-6 transition-all duration-300 md:mx-0",
        isStuck ? "shadow-warm-md" : "",
      )}
    >
      <div className="bg-white/95 px-4 py-3 backdrop-blur-xl md:rounded-2xl md:border md:border-[#F5EFE6] md:px-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 md:flex-nowrap">
          <Field icon={<CalendarDays className="h-4 w-4" />} label="الوصول">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-sm text-charcoal focus-visible:outline-none"
            />
          </Field>

          <Field icon={<CalendarDays className="h-4 w-4" />} label="المغادرة">
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm text-charcoal focus-visible:outline-none"
            />
          </Field>

          <Field icon={<Users className="h-4 w-4" />} label="ضيوف">
            <input
              type="number"
              min={1}
              max={12}
              value={guests}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setGuests(Math.max(1, Math.min(12, next)));
              }}
              className="font-numeric w-12 bg-transparent text-sm text-charcoal focus-visible:outline-none"
            />
          </Field>

          <Field icon={<Users className="h-4 w-4" />} label="غرف">
            <input
              type="number"
              min={1}
              max={6}
              value={rooms}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setRooms(Math.max(1, Math.min(6, next)));
              }}
              className="font-numeric w-12 bg-transparent text-sm text-charcoal focus-visible:outline-none"
            />
          </Field>

          <button
            type="button"
            className="ms-auto inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#a84a33]"
          >
            <Search className="h-4 w-4" />
            تحديث الأسعار
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex shrink-0 items-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-3 py-2">
      <span className="text-muted">{icon}</span>
      <span className="hidden text-[11px] font-bold uppercase tracking-wide text-muted md:inline">
        {label}
      </span>
      {children}
    </label>
  );
}
