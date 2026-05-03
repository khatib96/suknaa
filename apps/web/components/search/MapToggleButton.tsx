"use client";

import { Map } from "lucide-react";

export function MapToggleButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const target = document.getElementById("search-map");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="fixed bottom-6 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-bold text-white shadow-warm-lg transition-transform duration-200 hover:scale-105 active:scale-95"
      aria-label="عرض الخريطة"
    >
      <Map className="h-4 w-4" />
      عرض على الخريطة
    </button>
  );
}
