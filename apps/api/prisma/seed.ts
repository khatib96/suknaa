import { PrismaClient } from "@prisma/client";
import { seedAmenities } from "./seed-amenities";

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const count = await seedAmenities(prisma);
    console.log(`Seeded ${count} amenities`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
