import type { PrismaClient } from "@prisma/client";
import { AMENITY_SEEDS } from "./amenity-seeds";

export async function seedAmenities(prisma: PrismaClient): Promise<number> {
  for (const row of AMENITY_SEEDS) {
    await prisma.amenity.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        nameAr: row.name_ar,
        nameEn: row.name_en,
        iconName: row.icon_name,
        category: row.category,
        sortOrder: row.sort_order,
        isActive: true,
        appliesToVacationRental: row.applies_to_vacation_rental,
        appliesToVacationRentalSpace: row.applies_to_vacation_rental_space,
        appliesToHotel: row.applies_to_hotel,
        appliesToRoomType: row.applies_to_room_type,
      },
      update: {
        nameAr: row.name_ar,
        nameEn: row.name_en,
        iconName: row.icon_name,
        category: row.category,
        sortOrder: row.sort_order,
        isActive: true,
        appliesToVacationRental: row.applies_to_vacation_rental,
        appliesToVacationRentalSpace: row.applies_to_vacation_rental_space,
        appliesToHotel: row.applies_to_hotel,
        appliesToRoomType: row.applies_to_room_type,
      },
    });
  }

  return AMENITY_SEEDS.length;
}
