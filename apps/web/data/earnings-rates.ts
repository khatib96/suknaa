/**
 * Earnings calculator inputs for /become-a-host.
 *
 * Phase 1: rough manual estimates. Phase 8 will replace this with the real
 * `pricing-suggestions` module fed from market_demand_snapshots.
 */

export type EarningsCity = {
  id: string;
  /** Display label in Arabic */
  label: string;
  /** Multiplier on top of the base property type rate */
  multiplier: number;
};

export type EarningsPropertyType = {
  id: string;
  /** Display label in Arabic */
  label: string;
  /** Estimated nightly rate in USD (base) */
  baseNightlyUsd: number;
  /** Default commission basis points (1200 = 12%) */
  commissionBps: number;
};

/** Cities mock-priced relative to Damascus (=1.0). */
export const EARNINGS_CITIES: EarningsCity[] = [
  { id: "damascus", label: "دمشق", multiplier: 1.0 },
  { id: "latakia", label: "اللاذقية", multiplier: 1.1 },
  { id: "tartus", label: "طرطوس", multiplier: 1.05 },
  { id: "aleppo", label: "حلب", multiplier: 0.85 },
  { id: "hamah", label: "حماة", multiplier: 0.75 },
  { id: "homs", label: "حمص", multiplier: 0.8 },
  { id: "sweida", label: "السويداء", multiplier: 0.9 },
];

/** Property type → base nightly rate (USD) and default commission. */
export const EARNINGS_PROPERTY_TYPES: EarningsPropertyType[] = [
  { id: "apartment", label: "شقة", baseNightlyUsd: 35, commissionBps: 1200 },
  { id: "house", label: "بيت / دار شامي", baseNightlyUsd: 55, commissionBps: 1200 },
  { id: "villa", label: "فيلا", baseNightlyUsd: 110, commissionBps: 1200 },
  { id: "farm", label: "مزرعة", baseNightlyUsd: 70, commissionBps: 1000 },
  { id: "chalet", label: "شاليه", baseNightlyUsd: 65, commissionBps: 1000 },
  { id: "cabin", label: "كابينة", baseNightlyUsd: 45, commissionBps: 1000 },
  { id: "studio", label: "استوديو", baseNightlyUsd: 30, commissionBps: 1000 },
];

/** Default occupancy assumptions (proportion of nights booked per month). */
export const DEFAULT_OCCUPANCY_RATIO = 0.45;
export const NIGHTS_PER_MONTH = 30;
