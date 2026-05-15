import { Injectable } from "@nestjs/common";
import {
  BookingMode,
  CancellationPolicy,
  HostCategory,
  LocationPrecision,
  Prisma,
  VacationRentalListingStatus,
  type HostProfile,
  type VacationRental,
} from "@prisma/client";
import { AuditService } from "../../shared/audit/audit.service";
import {
  forbiddenError,
  notFoundError,
  unprocessableError,
} from "../../shared/errors/api-error.helpers";
import { PrismaService } from "../../shared/prisma/prisma.service";
import type {
  CreateVacationRentalInput,
  PatchVacationRentalInput,
} from "./vacation-rentals.schemas";
import {
  mapVacationRentalToApi,
  type LocationCoordinateRow,
  type VacationRentalListResponse,
  type VacationRentalLocation,
  type VacationRentalSingleResponse,
} from "./vacation-rentals.types";

const EDITABLE_STATUSES: VacationRentalListingStatus[] = ["draft", "rejected"];
const DELETABLE_STATUSES: VacationRentalListingStatus[] = ["draft", "rejected"];

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

@Injectable()
export class VacationRentalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listForHost(params: {
    userId: string;
    jwtIsHost: boolean;
    limit: number;
    cursor?: string;
  }): Promise<VacationRentalListResponse> {
    await this.assertVacationRentalHost(params.userId, params.jwtIsHost);

    const rows = await this.prisma.vacationRental.findMany({
      where: { hostId: params.userId, deletedAt: null },
      orderBy: [{ createdAt: "desc" }],
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > params.limit;
    const sliced = hasMore ? rows.slice(0, params.limit) : rows;
    const coords = await this.fetchCoordinatesByIds(sliced.map((r) => r.id));
    const coordMap = new Map(coords.map((c) => [c.id, c]));

    const data = sliced.map((row) => {
      const location = coordMap.get(row.id);
      if (!location) {
        throw notFoundError({
          code: "VACATION_RENTAL_NOT_FOUND",
          message: "Vacation rental not found",
          message_en: "Vacation rental not found",
        });
      }
      return mapVacationRentalToApi(row, location);
    });

    return {
      data,
      meta: {
        next_cursor: hasMore ? (sliced[sliced.length - 1]?.id ?? null) : null,
      },
    };
  }

  async createForHost(params: {
    userId: string;
    jwtIsHost: boolean;
    input: CreateVacationRentalInput;
    ctx: RequestContext;
  }): Promise<VacationRentalSingleResponse> {
    await this.assertVacationRentalHost(params.userId, params.jwtIsHost);

    const input = params.input;
    const rentalType = input.vacation_rental_type;
    const bookingMode = input.booking_mode ?? BookingMode.request;
    const cancellationPolicy =
      input.cancellation_policy ?? CancellationPolicy.medium;
    const locationPrecision =
      input.location_precision ?? LocationPrecision.approximate;
    const currency = input.currency ?? "USD";
    const bedroomsCount = input.bedrooms_count ?? 0;
    const bedsCount = input.beds_count ?? 0;
    const weekendUpliftPct = input.weekend_uplift_pct ?? 0;
    const cleaningFeeCents = BigInt(input.cleaning_fee_cents ?? 0);
    const minimumStayNights = input.minimum_stay_nights ?? 1;
    const commissionPassthrough = input.commission_passthrough ?? false;

    const inserted = await this.prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO vacation_rentals (
        host_id,
        rental_type,
        title_ar,
        title_en,
        description_ar,
        description_en,
        country_code,
        governorate,
        city,
        neighborhood,
        address_line,
        location,
        location_precision,
        max_guests,
        bedrooms_count,
        beds_count,
        bathrooms_count,
        area_sqm,
        base_price_cents,
        weekly_price_cents,
        monthly_price_cents,
        weekend_uplift_pct,
        cleaning_fee_cents,
        minimum_stay_nights,
        maximum_stay_nights,
        currency,
        commission_passthrough,
        booking_mode,
        cancellation_policy,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${params.userId}::uuid,
        ${rentalType}::vacation_rental_type,
        ${input.title_ar},
        ${input.title_en ?? null},
        ${input.description_ar},
        ${input.description_en ?? null},
        ${"SY"},
        ${input.governorate},
        ${input.city},
        ${input.neighborhood ?? null},
        ${input.address_line ?? null},
        ST_SetSRID(ST_MakePoint(${input.location.lng}, ${input.location.lat}), 4326)::geography,
        ${locationPrecision}::location_precision,
        ${input.max_guests},
        ${bedroomsCount},
        ${bedsCount},
        ${input.bathrooms_count},
        ${input.area_sqm ?? null},
        ${BigInt(input.base_price_cents)},
        ${input.weekly_price_cents != null ? BigInt(input.weekly_price_cents) : null},
        ${input.monthly_price_cents != null ? BigInt(input.monthly_price_cents) : null},
        ${weekendUpliftPct},
        ${cleaningFeeCents},
        ${minimumStayNights},
        ${input.maximum_stay_nights ?? null},
        ${currency},
        ${commissionPassthrough},
        ${bookingMode}::booking_mode,
        ${cancellationPolicy}::cancellation_policy,
        ${"draft"}::vacation_rental_listing_status,
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    const id = inserted[0]?.id;
    if (!id) {
      throw unprocessableError({
        code: "VACATION_RENTAL_CREATE_FAILED",
        message: "Failed to create vacation rental",
        message_en: "Failed to create vacation rental",
      });
    }

    const listing = await this.getOwnedRowOrThrow(params.userId, id);
    const location: VacationRentalLocation = {
      lat: input.location.lat,
      lng: input.location.lng,
    };

    await this.audit.write({
      actorUserId: params.userId,
      actorRole: "host",
      actorIp: params.ctx.ipAddress ?? null,
      userAgent: params.ctx.userAgent ?? null,
      requestId: params.ctx.requestId ?? null,
      action: "vacation_rental.created",
      entityType: "vacation_rentals",
      entityId: id,
      metadata: {
        vacation_rental_type: rentalType,
        status: listing.status,
      },
    });

    return { data: mapVacationRentalToApi(listing, location) };
  }

  async getForHost(params: {
    userId: string;
    jwtIsHost: boolean;
    vacationRentalId: string;
  }): Promise<VacationRentalSingleResponse> {
    await this.assertVacationRentalHost(params.userId, params.jwtIsHost);
    const row = await this.getOwnedRowOrThrow(params.userId, params.vacationRentalId);
    const location = await this.fetchCoordinateOrThrow(params.vacationRentalId);
    return { data: mapVacationRentalToApi(row, location) };
  }

  async patchForHost(params: {
    userId: string;
    jwtIsHost: boolean;
    vacationRentalId: string;
    input: PatchVacationRentalInput;
    ctx: RequestContext;
  }): Promise<VacationRentalSingleResponse> {
    await this.assertVacationRentalHost(params.userId, params.jwtIsHost);

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.vacationRental.findFirst({
        where: {
          id: params.vacationRentalId,
          hostId: params.userId,
          deletedAt: null,
        },
      });
      if (!row) {
        throw notFoundError({
          code: "VACATION_RENTAL_NOT_FOUND",
          message: "Vacation rental not found",
          message_en: "Vacation rental not found",
        });
      }
      this.assertEditableStatus(row.status);
      this.assertMergedStayRange(params.input, row);

      if (params.input.location) {
        await tx.$executeRaw`
          UPDATE vacation_rentals
          SET location = ST_SetSRID(
            ST_MakePoint(${params.input.location.lng}, ${params.input.location.lat}),
            4326
          )::geography,
          updated_at = NOW()
          WHERE id = ${params.vacationRentalId}::uuid
            AND host_id = ${params.userId}::uuid
            AND deleted_at IS NULL
        `;
      }

      const prismaData = this.buildPrismaPatchData(params.input);
      if (Object.keys(prismaData).length > 0) {
        await tx.vacationRental.update({
          where: { id: row.id },
          data: prismaData,
        });
      }

      return tx.vacationRental.findUniqueOrThrow({ where: { id: row.id } });
    });

    const location = params.input.location
      ? { lat: params.input.location.lat, lng: params.input.location.lng }
      : await this.fetchCoordinateOrThrow(params.vacationRentalId);

    await this.audit.write({
      actorUserId: params.userId,
      actorRole: "host",
      actorIp: params.ctx.ipAddress ?? null,
      userAgent: params.ctx.userAgent ?? null,
      requestId: params.ctx.requestId ?? null,
      action: "vacation_rental.updated",
      entityType: "vacation_rentals",
      entityId: params.vacationRentalId,
      metadata: {
        vacation_rental_type: updated.rentalType,
        status: updated.status,
      },
    });

    return { data: mapVacationRentalToApi(updated, location) };
  }

  async deleteForHost(params: {
    userId: string;
    jwtIsHost: boolean;
    vacationRentalId: string;
    ctx: RequestContext;
  }): Promise<{ data: { id: string; deleted: true } }> {
    await this.assertVacationRentalHost(params.userId, params.jwtIsHost);

    const deleted = await this.prisma.$transaction(async (tx) => {
      const row = await tx.vacationRental.findFirst({
        where: {
          id: params.vacationRentalId,
          hostId: params.userId,
          deletedAt: null,
        },
      });
      if (!row) {
        throw notFoundError({
          code: "VACATION_RENTAL_NOT_FOUND",
          message: "Vacation rental not found",
          message_en: "Vacation rental not found",
        });
      }
      if (!DELETABLE_STATUSES.includes(row.status)) {
        this.assertEditableStatus(row.status);
      }

      const now = new Date();
      await tx.vacationRental.update({
        where: { id: row.id },
        data: { deletedAt: now },
      });
      return { id: row.id, status: row.status, rentalType: row.rentalType };
    });

    await this.audit.write({
      actorUserId: params.userId,
      actorRole: "host",
      actorIp: params.ctx.ipAddress ?? null,
      userAgent: params.ctx.userAgent ?? null,
      requestId: params.ctx.requestId ?? null,
      action: "vacation_rental.deleted",
      entityType: "vacation_rentals",
      entityId: params.vacationRentalId,
      metadata: {
        vacation_rental_type: deleted.rentalType,
        status: deleted.status,
      },
    });

    return { data: { id: deleted.id, deleted: true } };
  }

  private async assertVacationRentalHost(
    userId: string,
    jwtIsHost: boolean,
  ): Promise<HostProfile> {
    if (!jwtIsHost) {
      throw forbiddenError({
        code: "NOT_A_HOST",
        message: "Host account is required",
        message_en: "Host account is required",
      });
    }

    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });
    if (!hostProfile) {
      throw forbiddenError({
        code: "HOST_PROFILE_REQUIRED",
        message: "Host profile is required",
        message_en: "Host profile is required",
      });
    }

    // M2b deferred: Phase 2 DB still uses real_estate for vacation-rental hosts.
    // Do not rename to vacation_rentals until M2b lands.
    if (hostProfile.hostCategory !== HostCategory.real_estate) {
      throw forbiddenError({
        code: "WRONG_HOST_CATEGORY",
        message: "This endpoint is only available for vacation rental hosts",
        message_en: "This endpoint is only available for vacation rental hosts",
      });
    }

    return hostProfile;
  }

  private async getOwnedRowOrThrow(
    userId: string,
    vacationRentalId: string,
  ): Promise<VacationRental> {
    const row = await this.prisma.vacationRental.findFirst({
      where: { id: vacationRentalId, hostId: userId, deletedAt: null },
    });
    if (!row) {
      throw notFoundError({
        code: "VACATION_RENTAL_NOT_FOUND",
        message: "Vacation rental not found",
        message_en: "Vacation rental not found",
      });
    }
    return row;
  }

  private assertEditableStatus(status: VacationRentalListingStatus): void {
    if (!EDITABLE_STATUSES.includes(status)) {
      throw unprocessableError({
        code: "VACATION_RENTAL_NOT_EDITABLE",
        message: "This vacation rental cannot be modified in its current status",
        message_en: "This vacation rental cannot be modified in its current status",
        details: { status },
      });
    }
  }

  private assertMergedStayRange(
    input: PatchVacationRentalInput,
    row: VacationRental,
  ): void {
    const nextMinimum = input.minimum_stay_nights ?? row.minimumStayNights;
    const nextMaximum =
      input.maximum_stay_nights !== undefined
        ? input.maximum_stay_nights
        : row.maximumStayNights;

    if (nextMaximum != null && nextMaximum < nextMinimum) {
      throw unprocessableError({
        code: "VACATION_RENTAL_INVALID_STAY_RANGE",
        message: "maximum_stay_nights must be greater than or equal to minimum_stay_nights",
        message_en: "maximum_stay_nights must be greater than or equal to minimum_stay_nights",
        details: {
          minimum_stay_nights: nextMinimum,
          maximum_stay_nights: nextMaximum,
        },
      });
    }
  }

  private buildPrismaPatchData(
    input: PatchVacationRentalInput,
  ): Prisma.VacationRentalUpdateInput {
    const data: Prisma.VacationRentalUpdateInput = {};

    if (input.vacation_rental_type !== undefined) {
      data.rentalType = input.vacation_rental_type;
    }
    if (input.title_ar !== undefined) data.titleAr = input.title_ar;
    if (input.title_en !== undefined) data.titleEn = input.title_en;
    if (input.description_ar !== undefined) data.descriptionAr = input.description_ar;
    if (input.description_en !== undefined) data.descriptionEn = input.description_en;
    if (input.governorate !== undefined) data.governorate = input.governorate;
    if (input.city !== undefined) data.city = input.city;
    if (input.neighborhood !== undefined) data.neighborhood = input.neighborhood;
    if (input.address_line !== undefined) data.addressLine = input.address_line;
    if (input.location_precision !== undefined) {
      data.locationPrecision = input.location_precision;
    }
    if (input.max_guests !== undefined) data.maxGuests = input.max_guests;
    if (input.bedrooms_count !== undefined) data.bedroomsCount = input.bedrooms_count;
    if (input.beds_count !== undefined) data.bedsCount = input.beds_count;
    if (input.bathrooms_count !== undefined) {
      data.bathroomsCount = input.bathrooms_count;
    }
    if (input.area_sqm !== undefined) data.areaSqm = input.area_sqm;
    if (input.base_price_cents !== undefined) {
      data.basePriceCents = BigInt(input.base_price_cents);
    }
    if (input.weekly_price_cents !== undefined) {
      data.weeklyPriceCents =
        input.weekly_price_cents == null
          ? null
          : BigInt(input.weekly_price_cents);
    }
    if (input.monthly_price_cents !== undefined) {
      data.monthlyPriceCents =
        input.monthly_price_cents == null
          ? null
          : BigInt(input.monthly_price_cents);
    }
    if (input.weekend_uplift_pct !== undefined) {
      data.weekendUpliftPct = input.weekend_uplift_pct;
    }
    if (input.cleaning_fee_cents !== undefined) {
      data.cleaningFeeCents = BigInt(input.cleaning_fee_cents);
    }
    if (input.minimum_stay_nights !== undefined) {
      data.minimumStayNights = input.minimum_stay_nights;
    }
    if (input.maximum_stay_nights !== undefined) {
      data.maximumStayNights = input.maximum_stay_nights;
    }
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.commission_passthrough !== undefined) {
      data.commissionPassthrough = input.commission_passthrough;
    }
    if (input.booking_mode !== undefined) data.bookingMode = input.booking_mode;
    if (input.cancellation_policy !== undefined) {
      data.cancellationPolicy = input.cancellation_policy;
    }

    return data;
  }

  private async fetchCoordinatesByIds(
    ids: string[],
  ): Promise<LocationCoordinateRow[]> {
    if (ids.length === 0) return [];

    return this.prisma.$queryRaw<LocationCoordinateRow[]>`
      SELECT
        id,
        ST_Y(location::geometry)::float8 AS lat,
        ST_X(location::geometry)::float8 AS lng
      FROM vacation_rentals
      WHERE id IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))})
    `;
  }

  private async fetchCoordinateOrThrow(
    vacationRentalId: string,
  ): Promise<VacationRentalLocation> {
    const rows = await this.prisma.$queryRaw<LocationCoordinateRow[]>`
      SELECT
        id,
        ST_Y(location::geometry)::float8 AS lat,
        ST_X(location::geometry)::float8 AS lng
      FROM vacation_rentals
      WHERE id = ${vacationRentalId}::uuid
    `;
    const row = rows[0];
    if (!row) {
      throw notFoundError({
        code: "VACATION_RENTAL_NOT_FOUND",
        message: "Vacation rental not found",
        message_en: "Vacation rental not found",
      });
    }
    return { lat: row.lat, lng: row.lng };
  }
}
