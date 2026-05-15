import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";
import {
  BOOKING_MODE_LABELS,
  CANCELLATION_POLICY_LABELS,
  SPACE_TYPE_LABELS,
  VACATION_RENTAL_TYPE_LABELS,
} from "./reference.catalog";
import type {
  ReferenceAmenitiesResponse,
  ReferenceAmenityItem,
  ReferenceLabelsResponse,
} from "./reference.types";

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  getVacationRentalTypes(): ReferenceLabelsResponse {
    return { data: VACATION_RENTAL_TYPE_LABELS };
  }

  getSpaceTypes(): ReferenceLabelsResponse {
    return { data: SPACE_TYPE_LABELS };
  }

  getBookingModes(): ReferenceLabelsResponse {
    return { data: BOOKING_MODE_LABELS };
  }

  getCancellationPolicies(): ReferenceLabelsResponse {
    return { data: CANCELLATION_POLICY_LABELS };
  }

  async getAmenities(): Promise<ReferenceAmenitiesResponse> {
    const rows = await this.prisma.amenity.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
        iconName: true,
        category: true,
        appliesToVacationRental: true,
        appliesToVacationRentalSpace: true,
        appliesToHotel: true,
        appliesToRoomType: true,
      },
    });

    const data: ReferenceAmenityItem[] = rows.map((row) => ({
      id: row.id,
      code: row.code,
      name_ar: row.nameAr,
      name_en: row.nameEn,
      icon_name: row.iconName,
      category: row.category,
      applies_to_vacation_rental: row.appliesToVacationRental,
      applies_to_vacation_rental_space: row.appliesToVacationRentalSpace,
      applies_to_hotel: row.appliesToHotel,
      applies_to_room_type: row.appliesToRoomType,
    }));

    return { data };
  }
}
