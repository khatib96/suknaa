import { MapPin } from "lucide-react";
import {
  CATEGORY_LABELS,
  type NearbyAttraction,
} from "@/data/nearby-attractions";

const mapImage =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1800&q=80";

export function HotelMapAndNearby({
  preciseAddress,
  nearby,
}: {
  preciseAddress: string;
  nearby: NearbyAttraction[];
}) {
  return (
    <section aria-labelledby="hotel-location-heading">
      <h2 id="hotel-location-heading" className="text-xl font-bold text-charcoal">
        موقع الفندق
      </h2>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
        <MapPin className="h-4 w-4" />
        {preciseAddress}
      </p>

      <div
        className="mt-4 h-72 overflow-hidden rounded-2xl border border-[#F5EFE6] shadow-warm-sm"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), url(${mapImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label="خريطة موقع الفندق"
        role="img"
      />

      {nearby.length > 0 ? (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {nearby.slice(0, 8).map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#F5EFE6] bg-white p-3 text-sm shadow-warm-sm"
            >
              <div>
                <p className="font-medium text-charcoal">{n.name}</p>
                <p className="text-xs text-muted">{CATEGORY_LABELS[n.category]}</p>
              </div>
              <span className="font-numeric shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-charcoal">
                {n.distanceKm} كم
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
