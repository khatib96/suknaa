import {
  BookingMode,
  CancellationPolicy,
  LocationPrecision,
  VacationRentalType,
} from "@prisma/client";
import { z } from "zod";

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const moneyCentsSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);

const optionalMoneyCentsSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER)
  .nullable()
  .optional();

const vacationRentalBodySchema = z
  .object({
    vacation_rental_type: z.nativeEnum(VacationRentalType),
    title_ar: z.string().min(5).max(200),
    title_en: z.string().min(5).max(200).optional(),
    description_ar: z.string().min(1),
    description_en: z.string().optional(),
    governorate: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
    neighborhood: z.string().max(150).optional(),
    address_line: z.string().max(255).optional(),
    location: locationSchema,
    location_precision: z.nativeEnum(LocationPrecision).optional(),
    max_guests: z.number().int().min(1).max(32767),
    bedrooms_count: z.number().int().min(0).max(32767).optional(),
    beds_count: z.number().int().min(0).max(32767).optional(),
    bathrooms_count: z.coerce.number().min(0),
    area_sqm: z.number().int().positive().max(2_147_483_647).optional(),
    base_price_cents: moneyCentsSchema,
    weekly_price_cents: optionalMoneyCentsSchema,
    monthly_price_cents: optionalMoneyCentsSchema,
    weekend_uplift_pct: z.number().int().min(0).max(100).optional(),
    cleaning_fee_cents: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
    minimum_stay_nights: z.number().int().min(1).max(32767).optional(),
    maximum_stay_nights: z.number().int().min(1).max(32767).nullable().optional(),
    currency: z
      .string()
      .length(3)
      .regex(/^[A-Z]{3}$/)
      .optional(),
    commission_passthrough: z.boolean().optional(),
    booking_mode: z.nativeEnum(BookingMode).optional(),
    cancellation_policy: z.nativeEnum(CancellationPolicy).optional(),
  })
  .strict();

function refineStayNights(
  data: {
    minimum_stay_nights?: number;
    maximum_stay_nights?: number | null;
  },
  ctx: z.RefinementCtx,
  defaultMinimum = 1,
): void {
  const minimum = data.minimum_stay_nights ?? defaultMinimum;
  if (data.maximum_stay_nights != null && data.maximum_stay_nights < minimum) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "maximum_stay_nights must be >= minimum_stay_nights",
      path: ["maximum_stay_nights"],
    });
  }
}

export const createVacationRentalSchema = vacationRentalBodySchema.superRefine(
  (data, ctx) => refineStayNights(data, ctx),
);

export const patchVacationRentalSchema = vacationRentalBodySchema
  .partial()
  .strict()
  .superRefine((data, ctx) => refineStayNights(data, ctx));

export const vacationRentalIdParamSchema = z.string().uuid();

export const listVacationRentalsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  cursor: z.string().uuid().optional(),
});

export type CreateVacationRentalInput = z.infer<typeof createVacationRentalSchema>;
export type PatchVacationRentalInput = z.infer<typeof patchVacationRentalSchema>;
