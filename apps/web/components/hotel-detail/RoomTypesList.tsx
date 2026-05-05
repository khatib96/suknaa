import Image from "next/image";
import { BedDouble, Coffee, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeGuestBreakdown } from "@/lib/pricing-display";
import { findAmenity } from "@/data/amenities";
import type { RoomType } from "@/data/room-types";
import { AmenityIcon } from "@/components/shared/AmenityIcon";

export function RoomTypesList({
  roomTypes,
}: {
  roomTypes: RoomType[];
}) {
  if (roomTypes.length === 0) return null;

  return (
    <section aria-labelledby="hotel-rooms-heading">
      <h2 id="hotel-rooms-heading" className="text-xl font-bold text-charcoal">
        الغرف المتاحة
      </h2>
      <p className="mt-1 text-sm text-muted">
        اختر نوع الغرفة المناسب — رسوم الخدمة 2% تُحتسب منفصلة عن سعر الليلة.
      </p>

      <div className="mt-5 space-y-4">
        {roomTypes.map((rt) => {
          const isSoldOut = rt.availableUnits === 0;
          const isLow = rt.availableUnits > 0 && rt.availableUnits <= 2;
          const nightlyBreakdown = computeGuestBreakdown({
            displayedNightlyUsd: rt.nightlyPriceUsd,
            nights: 1,
          });

          return (
            <article
              key={rt.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white shadow-warm-sm transition-shadow hover:shadow-warm-md",
                isSoldOut ? "border-[#F5EFE6] opacity-70" : "border-[#F5EFE6]",
              )}
            >
              <div className="grid gap-0 md:grid-cols-[260px_1fr_240px]">
                <div className="relative h-48 md:h-full">
                  <Image
                    src={rt.images[0]}
                    alt={rt.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 260px"
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-charcoal">{rt.name}</h3>
                  </div>
                  <p className="text-sm leading-6 text-charcoal/80">
                    {rt.description}
                  </p>

                  <ul className="font-numeric flex flex-wrap items-center gap-3 text-xs text-muted">
                    <li className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      حتى {rt.maxOccupancy} ضيوف
                    </li>
                    <li className="inline-flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      {rt.bedConfig}
                    </li>
                    {rt.breakfastIncluded ? (
                      <li className="inline-flex items-center gap-1 text-[#2C6850]">
                        <Coffee className="h-3.5 w-3.5" />
                        إفطار مشمول
                      </li>
                    ) : null}
                  </ul>

                  {rt.amenityIds.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5 pt-1">
                      {rt.amenityIds.map((id) => {
                        const amenity = findAmenity(id);
                        if (!amenity) return null;
                        return (
                          <li
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-xs text-charcoal"
                          >
                            <AmenityIcon
                              name={amenity.icon}
                              className="h-3 w-3 text-muted"
                            />
                            {amenity.label}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  <p className="text-xs text-muted">
                    {rt.isRefundable ? (
                      <span className="text-[#2C6850]">إلغاء مجاني خلال 48 ساعة</span>
                    ) : (
                      <span className="text-charcoal/70">غير قابل للاسترداد</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-[#F5EFE6] p-5 md:border-s md:border-t-0">
                  <div>
                    {isSoldOut ? (
                      <span className="inline-flex rounded-full bg-[#FBE9E7] px-3 py-1 text-xs font-bold text-[#B83A3A]">
                        نفدت الغرف
                      </span>
                    ) : isLow ? (
                      <span className="font-numeric inline-flex rounded-full bg-[#FBF1DE] px-3 py-1 text-xs font-bold text-[#B07F2A]">
                        متبقّي {rt.availableUnits} فقط
                      </span>
                    ) : (
                      <span className="font-numeric inline-flex rounded-full bg-[#E8F3EE] px-3 py-1 text-xs font-bold text-[#2C6850]">
                        {rt.availableUnits} من {rt.totalUnits} متاحة
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-numeric text-2xl font-extrabold text-charcoal">
                      ${rt.nightlyPriceUsd}
                      <span className="ms-1 text-xs font-medium text-muted">/ ليلة</span>
                    </p>
                    <p className="font-numeric mt-1 text-xs text-muted">
                      + ${nightlyBreakdown.serviceFeeUsd} رسوم خدمة (2%)
                    </p>
                    <p className="font-numeric text-xs font-bold text-charcoal/80">
                      المجموع: ${nightlyBreakdown.guestTotalUsd} لليلة الواحدة
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSoldOut}
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#a84a33] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSoldOut ? "غير متاح" : "احجز هذه الغرفة"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
