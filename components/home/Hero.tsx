"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_SLIDES, SLIDE_INTERVAL_MS } from "@/data/hero-slides";

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4 pb-44 pt-28 md:px-6 md:pb-48 lg:px-8">
      <div className="absolute inset-0">
        {HERO_SLIDES.map(({ src, alt, motion }, index) => (
          <div
            key={src}
            aria-hidden={index !== currentIndex}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <div className={cn("absolute inset-0", motion)}>
              <Image
                src={src}
                alt={alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
          سكنك في كل مكان بسوريا
        </h1>
        <p className="mt-4 text-lg text-white/90 md:text-2xl">
          واكتشف أفضل الأماكن للإقامة بأسعار تناسبك
        </p>

        <SlideIndicators
          total={HERO_SLIDES.length}
          current={currentIndex}
          onSelect={setCurrentIndex}
        />

        <div
          className={cn(
            "mt-10 rounded-full border border-white/25 bg-white/15 p-2 shadow-warm-lg backdrop-blur-2xl",
            "transition-all duration-300 hover:border-white/35",
          )}
        >
          <div className="grid grid-cols-1 gap-1 rounded-full md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center">
            <SearchField
              icon={<MapPin className="h-4 w-4 text-white" />}
              label="الموقع"
              value="إلى أين تريد الذهاب؟"
              isFirst
            />
            <SearchField
              icon={<CalendarDays className="h-4 w-4 text-white" />}
              label="تاريخ الوصول"
              value="أضف التاريخ"
            />
            <SearchField
              icon={<CalendarDays className="h-4 w-4 text-white" />}
              label="تاريخ المغادرة"
              value="أضف التاريخ"
            />
            <SearchField
              icon={<Users className="h-4 w-4 text-white" />}
              label="عدد الضيوف"
              value="أضف الضيوف"
            />

            <button
              type="button"
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
      </div>
    </section>
  );
}

function SearchField({
  icon,
  label,
  value,
  isFirst,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isFirst?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-full px-4 py-3 text-start transition-all duration-200",
        "bg-white/5 hover:bg-white/20 focus-within:bg-white/25 focus-within:ring-2 focus-within:ring-primary",
        !isFirst && "md:border-s md:border-white/20",
      )}
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-white">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm text-white/85 transition-colors group-hover:text-white">
        {value}
      </p>
    </div>
  );
}

function SlideIndicators({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="مؤشرات الشرائح">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`الشريحة ${index + 1}`}
          aria-selected={index === current}
          role="tab"
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
          )}
        />
      ))}
    </div>
  );
}
