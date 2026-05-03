"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { computeGuestBreakdown, diffNights } from "@/lib/pricing-display";

type Props = {
  basePriceUsd: number;
  maxGuests: number;
};

export function BookingWidget({ basePriceUsd, maxGuests }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const nights = useMemo(() => diffNights(checkIn, checkOut), [checkIn, checkOut]);
  const breakdown = useMemo(
    () =>
      computeGuestBreakdown({ displayedNightlyUsd: basePriceUsd, nights }),
    [basePriceUsd, nights],
  );

  const isReady = nights > 0 && guests > 0 && guests <= maxGuests;

  return (
    <aside
      aria-label="حجز سريع"
      className="sticky top-24 rounded-2xl border border-[#F5EFE6] bg-white p-5 shadow-warm-md"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-numeric text-2xl font-extrabold text-charcoal">
          ${basePriceUsd}
          <span className="ms-1 text-sm font-medium text-muted">/ ليلة</span>
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#E8E0D3]">
          <label className="flex flex-col gap-1 border-e border-[#E8E0D3] p-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
              تسجيل الوصول
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-sm text-charcoal focus-visible:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 p-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
              المغادرة
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm text-charcoal focus-visible:outline-none"
            />
          </label>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-[#E8E0D3] p-3">
          <span className="text-xs font-bold text-muted">عدد الضيوف</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={maxGuests}
            value={guests}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              setGuests(Math.max(1, Math.min(maxGuests, next)));
            }}
            className="font-numeric w-16 bg-transparent text-end text-sm font-bold text-charcoal focus-visible:outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={!isReady}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#a84a33] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isReady ? "احجز الآن" : "اختر التواريخ أولاً"}
      </button>

      {nights > 0 ? (
        <dl className="mt-5 space-y-2 border-t border-[#F5EFE6] pt-4 text-sm">
          <div className="flex justify-between text-charcoal/85">
            <dt>
              <span className="font-numeric">${basePriceUsd}</span>
              <span className="ms-1">×</span>
              <span className="font-numeric ms-1">{nights}</span>
              <span className="ms-1">ليلة</span>
            </dt>
            <dd className="font-numeric font-bold text-charcoal">
              ${breakdown.propertySubtotalUsd}
            </dd>
          </div>
          <div className="flex justify-between text-charcoal/85">
            <dt>رسوم الخدمة (2%)</dt>
            <dd className="font-numeric font-bold text-charcoal">
              ${breakdown.serviceFeeUsd}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[#F5EFE6] pt-3 text-base font-bold text-charcoal">
            <dt>المجموع</dt>
            <dd className="font-numeric">${breakdown.guestTotalUsd}</dd>
          </div>
        </dl>
      ) : null}

      <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted">
        <Clock className="h-3.5 w-3.5" />
        لن يُحسب أي مبلغ الآن — فقط بعد تأكيد الحجز.
      </p>
    </aside>
  );
}
