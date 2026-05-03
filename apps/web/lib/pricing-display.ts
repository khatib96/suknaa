/**
 * Frontend-only price display helpers for Phase 1.
 *
 * IMPORTANT: this file deliberately does NOT compute or expose the host
 * commission. The guest-facing breakdown is always:
 *
 *     property_subtotal + service_fee = guest_total
 *
 * The real engine (with commission passthrough math) lives at
 * `packages/pricing/` and runs server-side. See docs/PAYMENT_SYSTEM.md.
 */

const SERVICE_FEE_BPS = 200; // 2%

export type GuestPriceBreakdown = {
  /** What the host listed × nights (or post-passthrough display price × nights). */
  propertySubtotalUsd: number;
  /** 2% of the subtotal, rounded to whole USD for the mock. */
  serviceFeeUsd: number;
  /** Total the guest will pay. */
  guestTotalUsd: number;
  nights: number;
};

export function diffNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Compute a guest-visible price breakdown.
 * `displayedNightlyUsd` is the price the guest sees on the listing card —
 * already gross-up-adjusted upstream if the host chose passthrough mode.
 */
export function computeGuestBreakdown({
  displayedNightlyUsd,
  nights,
}: {
  displayedNightlyUsd: number;
  nights: number;
}): GuestPriceBreakdown {
  const safeNights = Math.max(0, nights);
  const subtotal = displayedNightlyUsd * safeNights;
  const fee = Math.round((subtotal * SERVICE_FEE_BPS) / 10000);
  return {
    propertySubtotalUsd: subtotal,
    serviceFeeUsd: fee,
    guestTotalUsd: subtotal + fee,
    nights: safeNights,
  };
}
