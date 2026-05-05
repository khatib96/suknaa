import type { ReactNode } from "react";
import { Layers3, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const mapImage =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1800&q=80";

const pins = [
  { id: 1, price: "$45", type: "property", top: "24%", right: "22%" },
  { id: 2, price: "$70", type: "hotel", top: "38%", right: "40%" },
  { id: 3, price: "$38", type: "property", top: "58%", right: "65%" },
  { id: 4, price: "$92", type: "hotel", top: "66%", right: "30%" },
] as const;

export function MapExplorer() {
  return (
    <section className="px-4 py-14 md:px-6 md:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FloatingMapPreview />

        <div className="mt-5 flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-extrabold text-charcoal md:text-3xl">
              استكشف على الخريطة
            </h2>
            <p className="mt-1 text-sm text-muted">
              اعثر على أفضل الأسعار حسب الموقع مباشرة.
            </p>
          </div>
          <button
            type="button"
            className="hidden text-sm font-semibold text-primary hover:underline md:inline-flex"
          >
            عرض النتائج كقائمة ←
          </button>
        </div>
      </div>
    </section>
  );
}

export function FloatingMapPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/65 bg-white/80 p-2 shadow-warm-2xl backdrop-blur-xl md:rounded-[28px]",
        className,
      )}
    >
      {/* TODO: integrate MapLibre here. The #map-container element below is the
          mount target for the upcoming MapLibre GL JS instance. The placeholder
          background and overlay pins are temporary until MapLibre renders markers. */}
      <div
        id="map-container"
        data-map-ready="false"
        className="relative h-[260px] overflow-hidden rounded-[18px] bg-cover bg-center md:h-[320px] md:rounded-[22px] lg:h-[360px]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), url(${mapImage})`,
        }}
        aria-label="خريطة سُكنى التفاعلية"
        role="region"
      >
        <div className="pointer-events-none absolute inset-0">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="absolute"
              style={{ top: pin.top, right: pin.right }}
            >
              <span
                className={`pointer-events-auto inline-flex rounded-full border bg-white px-3 py-1 text-sm font-bold shadow-warm-sm transition-transform duration-200 hover:-translate-y-0.5 ${
                  pin.type === "property"
                    ? "border-primary text-primary"
                    : "border-gold text-gold"
                }`}
              >
                {pin.price}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute start-4 top-4 z-10 flex flex-col gap-2 rounded-full bg-white/95 p-1.5 shadow-warm-sm backdrop-blur">
          <IconButton
            label="الفلاتر"
            icon={<SlidersHorizontal className="h-4 w-4" />}
          />
          <IconButton label="الطبقات" icon={<Layers3 className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E0D3] bg-white text-charcoal transition-colors hover:text-primary"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
