"use client";

import Image from "next/image";
import { useState } from "react";
import { Grid3x3, X } from "lucide-react";

export function HotelGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const main = images[0];
  const right = images.slice(1, 3);

  return (
    <>
      <div className="grid h-[420px] gap-2 overflow-hidden rounded-3xl md:h-[500px] md:grid-cols-[1.8fr_1fr]">
        <button
          type="button"
          onClick={() => {
            setActiveIndex(0);
            setOpen(true);
          }}
          className="relative h-full w-full overflow-hidden md:rounded-3xl"
        >
          <Image
            src={main}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            priority
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </button>

        <div className="hidden grid-rows-2 gap-2 md:grid">
          {Array.from({ length: 2 }).map((_, idx) => {
            const img = right[idx];
            if (!img) {
              return <div key={`ph-${idx}`} className="h-full w-full rounded-2xl bg-cream" />;
            }
            return (
              <button
                type="button"
                key={`${img}-${idx}`}
                onClick={() => {
                  setActiveIndex(idx + 1);
                  setOpen(true);
                }}
                className="relative h-full w-full overflow-hidden rounded-2xl"
              >
                <Image
                  src={img}
                  alt={`${alt} ${idx + 2}`}
                  fill
                  sizes="35vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setActiveIndex(0);
          setOpen(true);
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-4 py-2 text-sm font-bold text-charcoal shadow-warm-sm transition-colors hover:text-primary"
      >
        <Grid3x3 className="h-4 w-4" />
        عرض كل الصور ({images.length})
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="معرض الصور"
          className="fixed inset-0 z-[60] flex flex-col bg-charcoal/95 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="font-numeric text-sm">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label="إغلاق"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} ${activeIndex + 1}`}
              width={1400}
              height={900}
              className="max-h-full w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
