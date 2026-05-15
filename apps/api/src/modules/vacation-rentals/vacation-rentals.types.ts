import type { Decimal } from "@prisma/client/runtime/library";
import type {
  BookingMode,
  CancellationPolicy,
  LocationPrecision,
  VacationRentalListingStatus,
  VacationRentalType,
} from "@prisma/client";
import type { VacationRental } from "@prisma/client";

export interface VacationRentalLocation {
  lat: number;
  lng: number;
}

export interface VacationRentalApiListing {
  id: string;
  host_id: string;
  vacation_rental_type: VacationRentalType;
  title_ar: string;
  title_en: string | null;
  description_ar: string;
  description_en: string | null;
  country_code: string;
  governorate: string;
  city: string;
  neighborhood: string | null;
  address_line: string | null;
  location: VacationRentalLocation;
  location_precision: LocationPrecision;
  max_guests: number;
  bedrooms_count: number;
  beds_count: number;
  bathrooms_count: number;
  area_sqm: number | null;
  base_price_cents: string;
  weekly_price_cents: string | null;
  monthly_price_cents: string | null;
  weekend_uplift_pct: number;
  cleaning_fee_cents: string;
  minimum_stay_nights: number;
  maximum_stay_nights: number | null;
  currency: string;
  commission_passthrough: boolean;
  booking_mode: BookingMode;
  cancellation_policy: CancellationPolicy;
  status: VacationRentalListingStatus;
  rejection_reason: string | null;
  submitted_for_review_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VacationRentalListResponse {
  data: VacationRentalApiListing[];
  meta?: { next_cursor: string | null };
}

export interface VacationRentalSingleResponse {
  data: VacationRentalApiListing;
}

export interface LocationCoordinateRow {
  id: string;
  lat: number;
  lng: number;
}

function centsToString(value: bigint | null | undefined): string | null {
  if (value == null) return null;
  return value.toString();
}

function decimalToNumber(value: Decimal | number): number {
  if (typeof value === "number") return value;
  return value.toNumber();
}

function dateToIso(value: Date | null | undefined): string | null {
  if (value == null) return null;
  return value.toISOString();
}

export function mapVacationRentalToApi(
  row: VacationRental,
  location: VacationRentalLocation,
): VacationRentalApiListing {
  return {
    id: row.id,
    host_id: row.hostId,
    vacation_rental_type: row.rentalType,
    title_ar: row.titleAr,
    title_en: row.titleEn,
    description_ar: row.descriptionAr,
    description_en: row.descriptionEn,
    country_code: row.countryCode,
    governorate: row.governorate,
    city: row.city,
    neighborhood: row.neighborhood,
    address_line: row.addressLine,
    location,
    location_precision: row.locationPrecision,
    max_guests: row.maxGuests,
    bedrooms_count: row.bedroomsCount,
    beds_count: row.bedsCount,
    bathrooms_count: decimalToNumber(row.bathroomsCount),
    area_sqm: row.areaSqm,
    base_price_cents: row.basePriceCents.toString(),
    weekly_price_cents: centsToString(row.weeklyPriceCents),
    monthly_price_cents: centsToString(row.monthlyPriceCents),
    weekend_uplift_pct: row.weekendUpliftPct,
    cleaning_fee_cents: row.cleaningFeeCents.toString(),
    minimum_stay_nights: row.minimumStayNights,
    maximum_stay_nights: row.maximumStayNights,
    currency: row.currency,
    commission_passthrough: row.commissionPassthrough,
    booking_mode: row.bookingMode,
    cancellation_policy: row.cancellationPolicy,
    status: row.status,
    rejection_reason: row.rejectionReason,
    submitted_for_review_at: dateToIso(row.submittedForReviewAt),
    approved_at: dateToIso(row.approvedAt),
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}
