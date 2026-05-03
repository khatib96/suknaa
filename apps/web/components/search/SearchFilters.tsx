"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { TabValue } from "@/lib/tab";
import { AMENITIES } from "@/data/amenities";
import { CITY_LABELS, HOTEL_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/data/listings";

type Props = {
  activeTab: TabValue;
  initialCity?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialBedrooms?: string;
  initialStars?: string;
  initialPropertyTypes?: string[];
  initialHotelTypes?: string[];
  initialAmenities?: string[];
  initialBreakfast?: string;
};

export function SearchFilters({
  activeTab,
  initialCity = "all",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialBedrooms = "any",
  initialStars = "any",
  initialPropertyTypes = [],
  initialHotelTypes = [],
  initialAmenities = [],
  initialBreakfast = "any",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(initialCity);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);
  const [stars, setStars] = useState(initialStars);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initialPropertyTypes);
  const [hotelTypes, setHotelTypes] = useState<string[]>(initialHotelTypes);
  const [amenities, setAmenities] = useState<string[]>(initialAmenities);
  const [breakfast, setBreakfast] = useState(initialBreakfast);

  const showRealEstate = activeTab !== "hospitality";
  const showHospitality = activeTab !== "real_estate";

  const visibleAmenities = useMemo(() => {
    if (activeTab === "real_estate") {
      return AMENITIES.filter((a) => a.appliesTo !== "hospitality");
    }
    if (activeTab === "hospitality") {
      return AMENITIES.filter((a) => a.appliesTo !== "real_estate");
    }
    return AMENITIES;
  }, [activeTab]);

  const toggleArray = (current: string[], value: string) =>
    current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const setOrDelete = (key: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
        return;
      }
      if (!value || value === "any" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    };

    setOrDelete("city", city);
    setOrDelete("min_price", minPrice);
    setOrDelete("max_price", maxPrice);
    if (showRealEstate) setOrDelete("bedrooms", bedrooms);
    if (showHospitality) {
      setOrDelete("stars", stars);
      setOrDelete("breakfast", breakfast);
    }
    setOrDelete("property_type", showRealEstate ? propertyTypes : []);
    setOrDelete("hotel_type", showHospitality ? hotelTypes : []);
    setOrDelete("amenity", amenities);

    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [
    searchParams,
    router,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    stars,
    breakfast,
    propertyTypes,
    hotelTypes,
    amenities,
    showRealEstate,
    showHospitality,
  ]);

  const reset = () => {
    setCity("all");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("any");
    setStars("any");
    setBreakfast("any");
    setPropertyTypes([]);
    setHotelTypes([]);
    setAmenities([]);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    [
      "city",
      "min_price",
      "max_price",
      "bedrooms",
      "stars",
      "breakfast",
      "property_type",
      "hotel_type",
      "amenity",
    ].forEach((k) => params.delete(k));
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  return (
    <aside className="space-y-6 rounded-2xl border border-[#F5EFE6] bg-white p-5 shadow-warm-sm">
      <Section title="المدينة">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 w-full rounded-xl border border-[#E8E0D3] bg-white px-3 text-sm text-charcoal focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="all">كل المدن</option>
          {Object.entries(CITY_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </Section>

      <Section title="نطاق السعر (USD / ليلة)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="من"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="font-numeric h-10 w-full rounded-xl border border-[#E8E0D3] bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="إلى"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="font-numeric h-10 w-full rounded-xl border border-[#E8E0D3] bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
      </Section>

      {showRealEstate && (
        <>
          <Section title="عدد غرف النوم">
            <ChoiceRow
              options={[
                { value: "any", label: "أي عدد" },
                { value: "1", label: "1+" },
                { value: "2", label: "2+" },
                { value: "3", label: "3+" },
                { value: "4", label: "4+" },
              ]}
              value={bedrooms}
              onChange={setBedrooms}
            />
          </Section>

          <Section title="نوع العقار">
            <ul className="space-y-2">
              {Object.entries(PROPERTY_TYPE_LABELS).map(([id, label]) => (
                <li key={id}>
                  <Checkbox
                    label={label}
                    checked={propertyTypes.includes(id)}
                    onChange={() => setPropertyTypes((prev) => toggleArray(prev, id))}
                  />
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {showHospitality && (
        <>
          <Section title="نجوم الفندق">
            <ChoiceRow
              options={[
                { value: "any", label: "الكل" },
                { value: "3", label: "3+" },
                { value: "4", label: "4+" },
                { value: "5", label: "5" },
              ]}
              value={stars}
              onChange={setStars}
            />
          </Section>

          <Section title="نوع الفندق">
            <ul className="space-y-2">
              {Object.entries(HOTEL_TYPE_LABELS).map(([id, label]) => (
                <li key={id}>
                  <Checkbox
                    label={label}
                    checked={hotelTypes.includes(id)}
                    onChange={() => setHotelTypes((prev) => toggleArray(prev, id))}
                  />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="الإفطار">
            <ChoiceRow
              options={[
                { value: "any", label: "الكل" },
                { value: "yes", label: "مع إفطار" },
              ]}
              value={breakfast}
              onChange={setBreakfast}
            />
          </Section>
        </>
      )}

      <Section title="مميزات">
        <ul className="space-y-2">
          {visibleAmenities.map((a) => (
            <li key={a.id}>
              <Checkbox
                label={a.label}
                checked={amenities.includes(a.id)}
                onChange={() => setAmenities((prev) => toggleArray(prev, a.id))}
              />
            </li>
          ))}
        </ul>
      </Section>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={apply}
          className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#a84a33]"
        >
          طبّق الفلاتر
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-[#E8E0D3] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          إعادة تعيين
        </button>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold text-charcoal">{title}</h4>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#E8E0D3] text-primary focus:ring-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "border-primary bg-primary text-white"
              : "border-[#E8E0D3] text-muted hover:text-primary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
