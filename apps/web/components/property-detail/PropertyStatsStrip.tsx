import { Bath, BedDouble, BedSingle, Users } from "lucide-react";
import type { PropertyListing } from "@/data/listings";

type Stat = {
  icon: React.ReactNode;
  label: string;
  value: number;
};

export function PropertyStatsStrip({ property }: { property: PropertyListing }) {
  const stats: Stat[] = [
    { icon: <Users className="h-5 w-5" />, label: "ضيوف", value: property.guests },
    { icon: <BedDouble className="h-5 w-5" />, label: "غرف نوم", value: property.bedrooms },
    { icon: <BedSingle className="h-5 w-5" />, label: "أسرّة", value: property.beds },
    { icon: <Bath className="h-5 w-5" />, label: "حمامات", value: property.bathrooms },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 rounded-2xl border border-[#F5EFE6] bg-cream p-4 md:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.label} className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
            {stat.icon}
          </span>
          <div>
            <p className="font-numeric text-lg font-bold text-charcoal">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
