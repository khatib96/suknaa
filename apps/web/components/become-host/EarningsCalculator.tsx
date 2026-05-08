"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import {
  DEFAULT_OCCUPANCY_RATIO,
  EARNINGS_CITIES,
  EARNINGS_PROPERTY_TYPES,
  NIGHTS_PER_MONTH,
} from "@/data/earnings-rates";

const MIN_BEDROOMS = 1;
const MAX_BEDROOMS = 8;

export function EarningsCalculator() {
  const [propertyTypeId, setPropertyTypeId] = useState(
    EARNINGS_PROPERTY_TYPES[0].id,
  );
  const [cityId, setCityId] = useState(EARNINGS_CITIES[0].id);
  const [bedrooms, setBedrooms] = useState(2);

  const result = useMemo(() => {
    const propertyType = EARNINGS_PROPERTY_TYPES.find(
      (pt) => pt.id === propertyTypeId,
    )!;
    const city = EARNINGS_CITIES.find((c) => c.id === cityId)!;

    // Each extra bedroom over 1 adds ~25% to the base nightly rate.
    const bedroomFactor = 1 + (bedrooms - 1) * 0.25;
    const suggestedNightly = Math.round(
      propertyType.baseNightlyUsd * city.multiplier * bedroomFactor,
    );

    const occupiedNights = Math.round(NIGHTS_PER_MONTH * DEFAULT_OCCUPANCY_RATIO);
    const grossMonthly = suggestedNightly * occupiedNights;
    const commissionRate = propertyType.commissionBps / 10000;
    const netMonthly = Math.round(grossMonthly * (1 - commissionRate));

    return {
      suggestedNightly,
      occupiedNights,
      occupancyPercent: Math.round(DEFAULT_OCCUPANCY_RATIO * 100),
      netMonthly,
      commissionPercent: Math.round(commissionRate * 100),
    };
  }, [propertyTypeId, cityId, bedrooms]);

  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
            احسب دخلك التقديري
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            أدخل تفاصيل بيت عطلاتك واحصل على تقدير سريع لدخلك الشهري.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-[#F5EFE6] bg-cream shadow-warm-md">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-6 p-8 md:p-10">
              <div>
                <label className="mb-2 block text-sm font-bold text-charcoal">
                  نوع بيت العطلة
                </label>
                <select
                  value={propertyTypeId}
                  onChange={(e) => setPropertyTypeId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E8E0D3] bg-white px-4 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {EARNINGS_PROPERTY_TYPES.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-charcoal">
                  المدينة
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E8E0D3] bg-white px-4 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {EARNINGS_CITIES.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-charcoal">
                  عدد غرف النوم
                </label>
                <div className="flex items-center justify-between rounded-xl border border-[#E8E0D3] bg-white px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setBedrooms((b) => Math.max(MIN_BEDROOMS, b - 1))}
                    disabled={bedrooms <= MIN_BEDROOMS}
                    aria-label="تقليل عدد الغرف"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E0D3] text-charcoal transition-colors hover:text-primary disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-numeric text-2xl font-bold text-charcoal">
                    {bedrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBedrooms((b) => Math.min(MAX_BEDROOMS, b + 1))}
                    disabled={bedrooms >= MAX_BEDROOMS}
                    aria-label="زيادة عدد الغرف"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E0D3] text-charcoal transition-colors hover:text-primary disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-charcoal p-8 text-white md:p-10">
              <p className="text-sm text-white/70">سعر مقترح / ليلة</p>
              <p className="font-numeric mt-1 text-4xl font-extrabold">
                ${result.suggestedNightly}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-5">
                <div>
                  <p className="text-xs text-white/60">معدل الإشغال المتوقع</p>
                  <p className="font-numeric mt-1 text-lg font-bold">
                    {result.occupancyPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60">ليالي محجوزة شهرياً</p>
                  <p className="font-numeric mt-1 text-lg font-bold">
                    {result.occupiedNights} ليلة
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm text-white/70">دخلك الشهري التقديري بعد العمولة</p>
              <p className="font-numeric mt-1 text-5xl font-extrabold text-gold">
                ${result.netMonthly}
              </p>
              <p className="mt-2 text-xs text-white/60">
                مبني على عمولة {result.commissionPercent}% — تقدير مرن، الأرقام
                الحقيقية تتغير حسب موسم السنة وجودة الإعلان.
              </p>

              <Link
                href="/become-a-host/apply"
                className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#a84a33] active:scale-95"
              >
                ابدأ بهذا السعر
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
