"use client";

import { Drawer } from "@base-ui/react/drawer";
import {
  CalendarDays,
  MapPin,
  Minus,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DESTINATIONS } from "@/data/destinations";
import { CITY_LABELS, type CityId } from "@/data/listings";
import { validateHeroSearch } from "@/lib/hero-search-validation";

type OpenPanel = "location" | "checkin" | "checkout" | "guests" | null;

function isCityId(id: string): id is CityId {
  return id in CITY_LABELS;
}

function labelForLocationId(id: string | null): string {
  if (!id) return "إلى أين تريد الذهاب؟";
  if (isCityId(id)) return CITY_LABELS[id];
  const d = DESTINATIONS.find((x) => x.id === id);
  return d?.city ?? id;
}

function ic(compact: boolean) {
  return cn("shrink-0 text-white", compact ? "h-3.5 w-3.5" : "h-4 w-4");
}

export function HeroSearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) => d.city.toLowerCase().includes(q) || d.id.toLowerCase().includes(q),
    );
  }, [locationQuery]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const checkOutForMin = checkOut || undefined;

  const handleSearch = useCallback(() => {
    setError(null);
    const v = validateHeroSearch({
      locationId,
      checkIn,
      checkOut,
      guests,
    });
    if (!v.ok) {
      setError(v.message);
      return;
    }
    const params = new URLSearchParams();
    params.set("location", locationId!);
    params.set("checkin", checkIn);
    params.set("checkout", checkOut);
    params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  }, [router, locationId, checkIn, checkOut, guests]);

  return (
    <>
      {/* Mobile: CTA + bottom sheet (Airbnb-style) — &lt; md */}
      <div className="relative mt-6 w-full max-w-md md:hidden">
        <Drawer.Root>
          <Drawer.Trigger
            className={cn(
              "group w-full rounded-full border border-white/30 bg-primary py-3.5 text-center shadow-primary-glow",
              "transition-all duration-200 hover:border-white/50 hover:bg-[#a84a33] active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
            )}
          >
            <span className="flex flex-col items-center gap-0.5 px-2">
              <span className="flex items-center justify-center gap-2 text-base font-bold text-white">
                <Search className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
                ابحث عن سكنك
              </span>
              <span className="text-[11px] font-medium text-white/85">
                وجهة · تواريخ · عدد الضيوف
              </span>
            </span>
          </Drawer.Trigger>

          <Drawer.Portal>
            <Drawer.Backdrop className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px]" />
            <Drawer.Viewport className="fixed inset-x-0 bottom-0 z-[100] flex max-h-[100dvh] justify-center p-0">
              <Drawer.Popup
                className={cn(
                  "flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-warm-lg outline-none",
                )}
              >
                <Drawer.Content className="flex max-h-[90dvh] flex-col overflow-hidden rounded-t-2xl pb-safe">
                  <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-[#E8E0D3] bg-white px-4 py-3">
                    <Drawer.Title className="text-lg font-bold text-charcoal">
                      بحث عن إقامة
                    </Drawer.Title>
                    <Drawer.Close
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-[#F5EFE6] hover:text-charcoal"
                      aria-label="إغلاق"
                    >
                      <X className="h-5 w-5" />
                    </Drawer.Close>
                  </div>

                  <Drawer.Description className="sr-only">
                    اختر المدينة وتواريخ الوصول والمغادرة وعدد الضيوف ثم اضغط بحث
                  </Drawer.Description>

                  <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4" dir="rtl">
                    <section>
                      <label className="mb-2 block text-sm font-bold text-charcoal">الموقع</label>
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="ابحث عن مدينة..."
                        className="h-11 w-full rounded-xl border border-[#E8E0D3] bg-white px-3 text-sm text-charcoal placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                      <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-xl border border-[#F5EFE6] bg-[#FBF7F2] p-1">
                        {suggestions.map((d) => (
                          <li key={d.id}>
                            <button
                              type="button"
                              className={cn(
                                "w-full rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                                locationId === d.id
                                  ? "bg-primary font-semibold text-white"
                                  : "text-charcoal hover:bg-white",
                              )}
                              onClick={() => {
                                setLocationId(d.id);
                                setLocationQuery("");
                                setError(null);
                              }}
                            >
                              {d.city}
                            </button>
                          </li>
                        ))}
                      </ul>
                      {locationId && (
                        <p className="mt-2 text-xs text-muted">
                          المحدّد:{" "}
                          <span className="font-medium text-charcoal">
                            {labelForLocationId(locationId)}
                          </span>
                        </p>
                      )}
                    </section>

                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-charcoal">
                          الوصول
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            setError(null);
                          }}
                          max={checkOutForMin}
                          className="font-numeric h-11 w-full rounded-xl border border-[#E8E0D3] px-3 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-charcoal">
                          المغادرة
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => {
                            setCheckOut(e.target.value);
                            setError(null);
                          }}
                          min={checkIn ? nextDayString(checkIn) : undefined}
                          className="font-numeric h-11 w-full rounded-xl border border-[#E8E0D3] px-3 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                          dir="ltr"
                        />
                      </div>
                    </section>

                    <section>
                      <label className="mb-2 block text-center text-sm font-bold text-charcoal">
                        عدد الضيوف
                      </label>
                      <div className="flex items-center justify-center gap-6 rounded-xl border border-[#E8E0D3] bg-[#FBF7F2] py-3">
                        <button
                          type="button"
                          aria-label="تقليل الضيوف"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal transition-colors hover:border-primary hover:text-primary"
                          onClick={() => {
                            setGuests((g) => Math.max(1, g - 1));
                            setError(null);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-numeric min-w-[2ch] text-2xl font-bold text-charcoal">
                          {guests}
                        </span>
                        <button
                          type="button"
                          aria-label="زيادة الضيوف"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal transition-colors hover:border-primary hover:text-primary"
                          onClick={() => {
                            setGuests((g) => Math.min(50, g + 1));
                            setError(null);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </section>

                    {error && (
                      <p className="text-center text-sm font-medium text-primary" role="alert">
                        {error}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSearch}
                      className="w-full rounded-full bg-primary py-3.5 text-base font-bold text-white shadow-warm-md transition-colors hover:bg-[#a84a33]"
                    >
                      بحث
                    </button>
                  </div>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>

      {/* Tablet + Desktop inline bars */}
      <div ref={containerRef} className="hidden md:block">
        {/* Tablet: md–lg compact row */}
        <div className="relative mt-8 hidden w-full md:block lg:hidden">
          <div
            className={cn(
              "rounded-full border border-white/25 bg-white/15 p-1.5 shadow-warm-lg backdrop-blur-2xl",
              "transition-all duration-300 hover:border-white/35",
            )}
          >
            <div className="grid grid-cols-[1.15fr_1fr_1fr_0.85fr_auto] items-center gap-0 rounded-full">
              <div className="relative">
                <SearchFieldButton
                  compact
                  icon={<MapPin className={ic(true)} />}
                  label="الموقع"
                  value={labelForLocationId(locationId)}
                  isPlaceholder={!locationId}
                  isFirst
                  isOpen={openPanel === "location"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "location" ? null : "location"));
                    setError(null);
                  }}
                />
                {openPanel === "location" && (
                  <DropdownPanel compact>
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="ابحث عن مدينة..."
                      className="mb-2 h-9 w-full rounded-lg border border-[#E8E0D3] bg-white px-2.5 text-xs text-charcoal placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      autoFocus
                    />
                    <ul className="max-h-40 space-y-0.5 overflow-y-auto">
                      {suggestions.map((d) => (
                        <li key={d.id}>
                          <button
                            type="button"
                            className={cn(
                              "w-full rounded-md px-2 py-1.5 text-start text-xs text-charcoal transition-colors",
                              locationId === d.id
                                ? "bg-primary/10 font-semibold text-primary"
                                : "hover:bg-[#F5EFE6]",
                            )}
                            onClick={() => {
                              setLocationId(d.id);
                              setLocationQuery("");
                              setOpenPanel(null);
                              setError(null);
                            }}
                          >
                            {d.city}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </DropdownPanel>
                )}
              </div>

              <div className="relative">
                <SearchFieldButton
                  compact
                  icon={<CalendarDays className={ic(true)} />}
                  label="الوصول"
                  value={checkIn || "—"}
                  isPlaceholder={!checkIn}
                  isOpen={openPanel === "checkin"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "checkin" ? null : "checkin"));
                    setError(null);
                  }}
                />
                {openPanel === "checkin" && (
                  <DatePopover compact>
                    <label className="block text-xs font-semibold text-charcoal">الوصول</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        setError(null);
                      }}
                      max={checkOutForMin}
                      className="font-numeric mt-1.5 h-9 w-full rounded-lg border border-[#E8E0D3] px-2 text-xs text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="mt-2 w-full rounded-full bg-primary py-1.5 text-xs font-bold text-white hover:bg-[#a84a33]"
                    >
                      تم
                    </button>
                  </DatePopover>
                )}
              </div>

              <div className="relative">
                <SearchFieldButton
                  compact
                  icon={<CalendarDays className={ic(true)} />}
                  label="المغادرة"
                  value={checkOut || "—"}
                  isPlaceholder={!checkOut}
                  isOpen={openPanel === "checkout"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "checkout" ? null : "checkout"));
                    setError(null);
                  }}
                />
                {openPanel === "checkout" && (
                  <DatePopover compact>
                    <label className="block text-xs font-semibold text-charcoal">المغادرة</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        setError(null);
                      }}
                      min={checkIn ? nextDayString(checkIn) : undefined}
                      className="font-numeric mt-1.5 h-9 w-full rounded-lg border border-[#E8E0D3] px-2 text-xs text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="mt-2 w-full rounded-full bg-primary py-1.5 text-xs font-bold text-white hover:bg-[#a84a33]"
                    >
                      تم
                    </button>
                  </DatePopover>
                )}
              </div>

              <div className="relative">
                <SearchFieldButton
                  compact
                  icon={<Users className={ic(true)} />}
                  label="الضيوف"
                  value={guests >= 1 ? String(guests) : "—"}
                  isPlaceholder={guests < 1}
                  isOpen={openPanel === "guests"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "guests" ? null : "guests"));
                    setError(null);
                  }}
                />
                {openPanel === "guests" && (
                  <div
                    className={cn(
                      "absolute start-0 top-[calc(100%+0.35rem)] z-50 w-full min-w-[180px] rounded-xl border border-[#E8E0D3] bg-white p-3 shadow-warm-lg",
                    )}
                    dir="rtl"
                  >
                    <p className="mb-2 text-center text-xs font-semibold text-charcoal">الضيوف</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        aria-label="تقليل الضيوف"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E0D3] text-charcoal transition-colors hover:border-primary hover:text-primary"
                        onClick={() => {
                          setGuests((g) => Math.max(1, g - 1));
                          setError(null);
                        }}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-numeric min-w-[2ch] text-center text-base font-bold text-charcoal">
                        {guests}
                      </span>
                      <button
                        type="button"
                        aria-label="زيادة الضيوف"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E0D3] text-charcoal transition-colors hover:border-primary hover:text-primary"
                        onClick={() => {
                          setGuests((g) => Math.min(50, g + 1));
                          setError(null);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="mt-2 w-full rounded-full bg-primary py-1.5 text-xs font-bold text-white hover:bg-[#a84a33]"
                    >
                      تم
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className={cn(
                  "mx-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white",
                  "shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                )}
                aria-label="بحث"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-center text-sm font-medium text-amber-200" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Desktop: lg+ unchanged layout */}
        <div className="relative mt-10 hidden w-full text-center lg:block">
          <div
            className={cn(
              "rounded-full border border-white/25 bg-white/15 p-2 shadow-warm-lg backdrop-blur-2xl",
              "transition-all duration-300 hover:border-white/35",
            )}
          >
            <div className="grid grid-cols-1 gap-1 rounded-full md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center">
              <div className="relative">
                <SearchFieldButton
                  icon={<MapPin className={ic(false)} />}
                  label="الموقع"
                  value={labelForLocationId(locationId)}
                  isPlaceholder={!locationId}
                  isFirst
                  isOpen={openPanel === "location"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "location" ? null : "location"));
                    setError(null);
                  }}
                />
                {openPanel === "location" && (
                  <div
                    className={cn(
                      "absolute start-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-[min(100vw-2rem,280px)] rounded-2xl border border-[#E8E0D3] bg-white p-3 shadow-warm-lg",
                      "text-start",
                    )}
                    dir="rtl"
                  >
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="ابحث عن مدينة..."
                      className="mb-2 h-10 w-full rounded-xl border border-[#E8E0D3] bg-white px-3 text-sm text-charcoal placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      autoFocus
                    />
                    <ul className="max-h-48 space-y-1 overflow-y-auto">
                      {suggestions.map((d) => (
                        <li key={d.id}>
                          <button
                            type="button"
                            className={cn(
                              "w-full rounded-lg px-3 py-2 text-start text-sm text-charcoal transition-colors",
                              locationId === d.id
                                ? "bg-primary/10 font-semibold text-primary"
                                : "hover:bg-[#F5EFE6]",
                            )}
                            onClick={() => {
                              setLocationId(d.id);
                              setLocationQuery("");
                              setOpenPanel(null);
                              setError(null);
                            }}
                          >
                            {d.city}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {suggestions.length === 0 && (
                      <p className="py-2 text-center text-xs text-muted">لا توجد نتائج</p>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <SearchFieldButton
                  icon={<CalendarDays className={ic(false)} />}
                  label="تاريخ الوصول"
                  value={checkIn || "أضف التاريخ"}
                  isPlaceholder={!checkIn}
                  isOpen={openPanel === "checkin"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "checkin" ? null : "checkin"));
                    setError(null);
                  }}
                />
                {openPanel === "checkin" && (
                  <DatePopover>
                    <label className="block text-xs font-semibold text-charcoal">تاريخ الوصول</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        setError(null);
                      }}
                      max={checkOutForMin}
                      className="font-numeric mt-2 h-10 w-full rounded-xl border border-[#E8E0D3] px-3 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-bold text-white hover:bg-[#a84a33]"
                    >
                      تم
                    </button>
                  </DatePopover>
                )}
              </div>

              <div className="relative">
                <SearchFieldButton
                  icon={<CalendarDays className={ic(false)} />}
                  label="تاريخ المغادرة"
                  value={checkOut || "أضف التاريخ"}
                  isPlaceholder={!checkOut}
                  isOpen={openPanel === "checkout"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "checkout" ? null : "checkout"));
                    setError(null);
                  }}
                />
                {openPanel === "checkout" && (
                  <DatePopover>
                    <label className="block text-xs font-semibold text-charcoal">تاريخ المغادرة</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        setError(null);
                      }}
                      min={checkIn ? nextDayString(checkIn) : undefined}
                      className="font-numeric mt-2 h-10 w-full rounded-xl border border-[#E8E0D3] px-3 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-bold text-white hover:bg-[#a84a33]"
                    >
                      تم
                    </button>
                  </DatePopover>
                )}
              </div>

              <div className="relative">
                <SearchFieldButton
                  icon={<Users className={ic(false)} />}
                  label="عدد الضيوف"
                  value={guests >= 1 ? String(guests) : "أضف الضيوف"}
                  isPlaceholder={guests < 1}
                  isOpen={openPanel === "guests"}
                  onClick={() => {
                    setOpenPanel((p) => (p === "guests" ? null : "guests"));
                    setError(null);
                  }}
                />
                {openPanel === "guests" && (
                  <div
                    className={cn(
                      "absolute start-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-[200px] rounded-2xl border border-[#E8E0D3] bg-white p-4 shadow-warm-lg",
                    )}
                    dir="rtl"
                  >
                    <p className="mb-3 text-center text-sm font-semibold text-charcoal">الضيوف</p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        aria-label="تقليل الضيوف"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E0D3] text-charcoal transition-colors hover:border-primary hover:text-primary"
                        onClick={() => {
                          setGuests((g) => Math.max(1, g - 1));
                          setError(null);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-numeric min-w-[2ch] text-center text-lg font-bold text-charcoal">
                        {guests}
                      </span>
                      <button
                        type="button"
                        aria-label="زيادة الضيوف"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E0D3] text-charcoal transition-colors hover:border-primary hover:text-primary"
                        onClick={() => {
                          setGuests((g) => Math.min(50, g + 1));
                          setError(null);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="mt-4 w-full rounded-full bg-primary py-2 text-sm font-bold text-white hover:bg-[#a84a33]"
                    >
                      تم
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className={cn(
                  "mx-auto inline-flex h-13 w-13 items-center justify-center rounded-full bg-primary text-white",
                  "shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:mx-0",
                )}
                aria-label="بحث"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-center text-sm font-medium text-amber-200" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function nextDayString(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  date.setDate(date.getDate() + 1);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function DropdownPanel({ compact, children }: { compact?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute start-0 z-50 w-full rounded-xl border border-[#E8E0D3] bg-white shadow-warm-lg",
        compact ? "top-[calc(100%+0.35rem)] p-2 text-start" : "top-[calc(100%+0.5rem)] p-3",
      )}
      dir="rtl"
    >
      {children}
    </div>
  );
}

function DatePopover({
  compact,
  children,
}: {
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute start-0 z-50 w-full min-w-[min(100vw-2rem,260px)] rounded-xl border border-[#E8E0D3] bg-white shadow-warm-lg",
        compact ? "top-[calc(100%+0.35rem)] p-2" : "top-[calc(100%+0.5rem)] p-3",
      )}
      dir="rtl"
    >
      {children}
    </div>
  );
}

function SearchFieldButton({
  icon,
  label,
  value,
  isPlaceholder,
  isFirst,
  isOpen,
  compact,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isPlaceholder?: boolean;
  isFirst?: boolean;
  isOpen?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full cursor-pointer rounded-full text-start transition-all duration-200",
        compact ? "px-2.5 py-2" : "px-4 py-3",
        "bg-white/5 hover:bg-white/20 focus-visible:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isOpen && "bg-white/25 ring-2 ring-primary",
        !isFirst && "md:border-s md:border-white/20",
      )}
    >
      <div
        className={cn(
          "mb-0.5 flex items-center gap-1.5 font-semibold text-white",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={cn(
          "truncate transition-colors",
          compact ? "text-[11px]" : "text-sm",
          isPlaceholder ? "text-white/85 group-hover:text-white" : "font-medium text-white",
        )}
      >
        {value}
      </p>
    </button>
  );
}
