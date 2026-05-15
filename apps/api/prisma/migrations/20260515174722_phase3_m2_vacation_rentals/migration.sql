-- Phase 3 M2 — vacation rentals / holiday homes schema (see docs/DATABASE_SCHEMA.md §B0).
-- Indexes (partial, GiST, child btree, cover unique) and CHECK constraints: SQL only (not in Prisma schema).

CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "vacation_rental_type" AS ENUM ('apartment', 'house', 'villa', 'farm', 'chalet', 'cabin', 'studio');

-- CreateEnum
CREATE TYPE "vacation_rental_listing_status" AS ENUM ('draft', 'pending_review', 'published', 'paused', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "location_precision" AS ENUM ('precise', 'approximate');

-- CreateEnum
CREATE TYPE "booking_mode" AS ENUM ('instant', 'request', 'contact_only');

-- CreateEnum
CREATE TYPE "cancellation_policy" AS ENUM ('flexible', 'medium', 'strict');

-- CreateEnum
CREATE TYPE "space_type" AS ENUM ('bedroom', 'bathroom', 'kitchen', 'living_room', 'dining_room', 'balcony', 'terrace', 'garden', 'pool_area', 'rooftop', 'parking', 'storage', 'office', 'gym', 'other');

-- CreateEnum
CREATE TYPE "bathroom_type" AS ENUM ('full', 'half', 'shower_only', 'wc_only');

-- CreateEnum
CREATE TYPE "amenity_category" AS ENUM ('essentials', 'kitchen', 'bathroom', 'bedroom', 'living', 'outdoor', 'pool_spa', 'parking', 'safety', 'family', 'accessibility', 'work', 'entertainment', 'services');

-- CreateEnum
CREATE TYPE "availability_reason" AS ENUM ('booked', 'host_blocked', 'maintenance');

-- CreateEnum
CREATE TYPE "season_type" AS ENUM ('summer', 'winter', 'eid', 'ramadan', 'new_year', 'school_holiday', 'custom');

-- CreateTable
CREATE TABLE "vacation_rentals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host_id" UUID NOT NULL,
    "rental_type" "vacation_rental_type" NOT NULL,
    "title_ar" VARCHAR(200) NOT NULL,
    "title_en" VARCHAR(200),
    "description_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "country_code" CHAR(2) NOT NULL DEFAULT 'SY',
    "governorate" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(150),
    "address_line" VARCHAR(255),
    "location" geography(Point, 4326) NOT NULL,
    "location_precision" "location_precision" NOT NULL DEFAULT 'approximate',
    "max_guests" SMALLINT NOT NULL,
    "bedrooms_count" SMALLINT NOT NULL DEFAULT 0,
    "beds_count" SMALLINT NOT NULL DEFAULT 0,
    "bathrooms_count" DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    "area_sqm" INTEGER,
    "base_price_cents" BIGINT NOT NULL,
    "weekly_price_cents" BIGINT,
    "monthly_price_cents" BIGINT,
    "weekend_uplift_pct" SMALLINT NOT NULL DEFAULT 0,
    "cleaning_fee_cents" BIGINT NOT NULL DEFAULT 0,
    "minimum_stay_nights" SMALLINT NOT NULL DEFAULT 1,
    "maximum_stay_nights" SMALLINT,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "commission_passthrough" BOOLEAN NOT NULL DEFAULT false,
    "booking_mode" "booking_mode" NOT NULL DEFAULT 'request',
    "cancellation_policy" "cancellation_policy" NOT NULL,
    "status" "vacation_rental_listing_status" NOT NULL DEFAULT 'draft',
    "rejection_reason" TEXT,
    "submitted_for_review_at" TIMESTAMPTZ(3),
    "approved_at" TIMESTAMPTZ(3),
    "approved_by" UUID,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "last_availability_reduction_at" TIMESTAMPTZ(3),
    "availability_reductions_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "vacation_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_rental_spaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacation_rental_id" UUID NOT NULL,
    "space_type" "space_type" NOT NULL,
    "label_ar" VARCHAR(100) NOT NULL,
    "label_en" VARCHAR(100),
    "description_ar" TEXT,
    "description_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "beds" JSONB,
    "has_ensuite" BOOLEAN,
    "bathroom_type" "bathroom_type",
    "is_shared" BOOLEAN,
    "area_sqm" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vacation_rental_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_rental_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacation_rental_id" UUID NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "url_original" VARCHAR(500) NOT NULL,
    "url_large" VARCHAR(500) NOT NULL,
    "url_medium" VARCHAR(500) NOT NULL,
    "url_small" VARCHAR(500) NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text_ar" VARCHAR(255),
    "alt_text_en" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_rental_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_rental_space_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacation_rental_space_id" UUID NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "url_original" VARCHAR(500) NOT NULL,
    "url_large" VARCHAR(500) NOT NULL,
    "url_medium" VARCHAR(500) NOT NULL,
    "url_small" VARCHAR(500) NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text_ar" VARCHAR(255),
    "alt_text_en" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_rental_space_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "icon_name" VARCHAR(50),
    "category" "amenity_category" NOT NULL,
    "applies_to_vacation_rental" BOOLEAN NOT NULL DEFAULT true,
    "applies_to_vacation_rental_space" BOOLEAN NOT NULL DEFAULT false,
    "applies_to_hotel" BOOLEAN NOT NULL DEFAULT false,
    "applies_to_room_type" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_rental_amenities" (
    "vacation_rental_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,

    CONSTRAINT "vacation_rental_amenities_pkey" PRIMARY KEY ("vacation_rental_id","amenity_id")
);

-- CreateTable
CREATE TABLE "vacation_rental_space_amenities" (
    "vacation_rental_space_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,

    CONSTRAINT "vacation_rental_space_amenities_pkey" PRIMARY KEY ("vacation_rental_space_id","amenity_id")
);

-- CreateTable
CREATE TABLE "vacation_rental_availability_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacation_rental_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "reason" "availability_reason" NOT NULL,
    "booking_id" UUID,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_rental_availability_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_rental_pricing_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacation_rental_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "base_price_cents" BIGINT NOT NULL,
    "weekly_price_cents" BIGINT,
    "monthly_price_cents" BIGINT,
    "label_ar" VARCHAR(100),
    "label_en" VARCHAR(100),
    "season_type" "season_type",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_rental_pricing_overrides_pkey" PRIMARY KEY ("id")
);

-- Prisma @unique on amenities.code
CREATE UNIQUE INDEX "amenities_code_key" ON "amenities"("code");

-- AddForeignKey
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_spaces" ADD CONSTRAINT "vacation_rental_spaces_vacation_rental_id_fkey" FOREIGN KEY ("vacation_rental_id") REFERENCES "vacation_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_images" ADD CONSTRAINT "vacation_rental_images_vacation_rental_id_fkey" FOREIGN KEY ("vacation_rental_id") REFERENCES "vacation_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_space_images" ADD CONSTRAINT "vacation_rental_space_images_vacation_rental_space_id_fkey" FOREIGN KEY ("vacation_rental_space_id") REFERENCES "vacation_rental_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_amenities" ADD CONSTRAINT "vacation_rental_amenities_vacation_rental_id_fkey" FOREIGN KEY ("vacation_rental_id") REFERENCES "vacation_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_amenities" ADD CONSTRAINT "vacation_rental_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_space_amenities" ADD CONSTRAINT "vacation_rental_space_amenities_vacation_rental_space_id_fkey" FOREIGN KEY ("vacation_rental_space_id") REFERENCES "vacation_rental_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_space_amenities" ADD CONSTRAINT "vacation_rental_space_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_availability_blocks" ADD CONSTRAINT "vacation_rental_availability_blocks_vacation_rental_id_fkey" FOREIGN KEY ("vacation_rental_id") REFERENCES "vacation_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_rental_pricing_overrides" ADD CONSTRAINT "vacation_rental_pricing_overrides_vacation_rental_id_fkey" FOREIGN KEY ("vacation_rental_id") REFERENCES "vacation_rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partial + GiST indexes (M2 — SQL only)
CREATE INDEX "idx_vacation_rentals_host" ON "vacation_rentals"("host_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_vacation_rentals_status" ON "vacation_rentals"("status") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_vacation_rentals_type" ON "vacation_rentals"("rental_type") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_vacation_rentals_city" ON "vacation_rentals"("city", "governorate")
  WHERE "status" = 'published' AND "deleted_at" IS NULL;
CREATE INDEX "idx_vacation_rentals_location" ON "vacation_rentals" USING GIST("location")
  WHERE "status" = 'published' AND "deleted_at" IS NULL;

-- Child / date btree indexes (M2 — SQL only)
CREATE INDEX "idx_vacation_rental_spaces_rental_sort" ON "vacation_rental_spaces"("vacation_rental_id", "sort_order");
CREATE INDEX "idx_vacation_rental_images_rental_sort" ON "vacation_rental_images"("vacation_rental_id", "sort_order");
CREATE INDEX "idx_vacation_rental_space_images_space_sort" ON "vacation_rental_space_images"("vacation_rental_space_id", "sort_order");
CREATE INDEX "idx_vacation_rental_avail_dates" ON "vacation_rental_availability_blocks"("vacation_rental_id", "starts_on", "ends_on");
CREATE INDEX "idx_vacation_rental_pricing_dates" ON "vacation_rental_pricing_overrides"("vacation_rental_id", "starts_on", "ends_on");

-- One cover image per listing
CREATE UNIQUE INDEX "idx_vacation_rental_one_cover" ON "vacation_rental_images"("vacation_rental_id")
  WHERE "is_cover" = true;

-- CHECK constraints
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_base_price_positive"
  CHECK ("base_price_cents" > 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_weekly_price_positive"
  CHECK ("weekly_price_cents" IS NULL OR "weekly_price_cents" > 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_monthly_price_positive"
  CHECK ("monthly_price_cents" IS NULL OR "monthly_price_cents" > 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_cleaning_fee_non_negative"
  CHECK ("cleaning_fee_cents" >= 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_max_guests_min"
  CHECK ("max_guests" >= 1);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_minimum_stay_min"
  CHECK ("minimum_stay_nights" >= 1);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_maximum_stay_gte_minimum"
  CHECK ("maximum_stay_nights" IS NULL OR "maximum_stay_nights" >= "minimum_stay_nights");
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_weekend_uplift_range"
  CHECK ("weekend_uplift_pct" >= 0 AND "weekend_uplift_pct" <= 100);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_bathrooms_non_negative"
  CHECK ("bathrooms_count" >= 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_bedrooms_non_negative"
  CHECK ("bedrooms_count" >= 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_beds_non_negative"
  CHECK ("beds_count" >= 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_area_sqm_positive"
  CHECK ("area_sqm" IS NULL OR "area_sqm" > 0);
ALTER TABLE "vacation_rentals" ADD CONSTRAINT "vacation_rentals_currency_iso"
  CHECK ("currency" ~ '^[A-Z]{3}$');

ALTER TABLE "vacation_rental_pricing_overrides" ADD CONSTRAINT "vacation_rental_pricing_base_positive"
  CHECK ("base_price_cents" > 0);
ALTER TABLE "vacation_rental_pricing_overrides" ADD CONSTRAINT "vacation_rental_pricing_weekly_positive"
  CHECK ("weekly_price_cents" IS NULL OR "weekly_price_cents" > 0);
ALTER TABLE "vacation_rental_pricing_overrides" ADD CONSTRAINT "vacation_rental_pricing_monthly_positive"
  CHECK ("monthly_price_cents" IS NULL OR "monthly_price_cents" > 0);
ALTER TABLE "vacation_rental_pricing_overrides" ADD CONSTRAINT "vacation_rental_pricing_dates_valid"
  CHECK ("ends_on" >= "starts_on");

ALTER TABLE "vacation_rental_availability_blocks" ADD CONSTRAINT "vacation_rental_avail_dates_valid"
  CHECK ("ends_on" >= "starts_on");

ALTER TABLE "vacation_rental_images" ADD CONSTRAINT "vacation_rental_images_sort_non_negative"
  CHECK ("sort_order" >= 0);
ALTER TABLE "vacation_rental_images" ADD CONSTRAINT "vacation_rental_images_width_positive"
  CHECK ("width" IS NULL OR "width" > 0);
ALTER TABLE "vacation_rental_images" ADD CONSTRAINT "vacation_rental_images_height_positive"
  CHECK ("height" IS NULL OR "height" > 0);

ALTER TABLE "vacation_rental_space_images" ADD CONSTRAINT "vacation_rental_space_images_sort_non_negative"
  CHECK ("sort_order" >= 0);
ALTER TABLE "vacation_rental_space_images" ADD CONSTRAINT "vacation_rental_space_images_width_positive"
  CHECK ("width" IS NULL OR "width" > 0);
ALTER TABLE "vacation_rental_space_images" ADD CONSTRAINT "vacation_rental_space_images_height_positive"
  CHECK ("height" IS NULL OR "height" > 0);

ALTER TABLE "vacation_rental_spaces" ADD CONSTRAINT "vacation_rental_spaces_sort_non_negative"
  CHECK ("sort_order" >= 0);

ALTER TABLE "amenities" ADD CONSTRAINT "amenities_sort_non_negative"
  CHECK ("sort_order" >= 0);
