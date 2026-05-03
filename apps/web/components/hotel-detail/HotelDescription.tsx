"use client";

import { useState } from "react";

const COLLAPSED_LENGTH = 240;

export function HotelDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > COLLAPSED_LENGTH;
  const displayed =
    !expanded && isLong ? description.slice(0, COLLAPSED_LENGTH) + "…" : description;

  return (
    <section aria-labelledby="hotel-description-heading">
      <h2 id="hotel-description-heading" className="text-xl font-bold text-charcoal">
        عن الفندق
      </h2>
      <p className="mt-3 text-base leading-8 text-charcoal/85">{displayed}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          {expanded ? "عرض أقل" : "عرض المزيد"}
        </button>
      ) : null}
    </section>
  );
}
