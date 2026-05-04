"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HERO_SLIDES, SLIDE_INTERVAL_MS } from "@/data/hero-slides";

type Props = {
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Slides, gradient, headline (SSR children), indicators, and footer slot (HeroSearchBar).
 * Keeps a single source of truth for the active slide index.
 */
export function HeroPresentation({ children, footer }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="relative z-30 isolate mx-auto w-full max-w-5xl px-0 text-center @container">
        {children}

        <SlideIndicators
          total={HERO_SLIDES.length}
          current={currentIndex}
          onSelect={setCurrentIndex}
        />

        {footer}
      </div>
    </>
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
    <div className="mt-6 flex justify-center gap-2 md:mt-8" role="tablist" aria-label="مؤشرات الشرائح">
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
