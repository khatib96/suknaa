# 🗄️ DATABASE_SCHEMA — Suknaa Data Model (v2)

> Complete schema for the PostgreSQL 16 + PostGIS database.
> **v2 changes**: Real Estate and Hospitality systems are fully separated. Hotels have their own tables (hotels, room_types, room_units). New tables for price intelligence, anti-circumvention, scarcity tracking, wishlists, comparisons, price alerts, and detailed room/space descriptions.

---

## Conventions

- Table names: **snake_case, plural** (`users`, `properties`, `bookings`)
- Column names: **snake_case** (`created_at`, `host_id`)
- Primary keys: `id` of type `UUID` (generated server-side via `uuid_generate_v7()` for time-ordered UUIDs)
- All tables have `created_at` and `updated_at` timestamps with timezone (`TIMESTAMPTZ`)
- Soft deletes via `deleted_at TIMESTAMPTZ NULL` where applicable (NOT for financial records — those are immutable)
- All money stored as `BIGINT` representing **USD cents**
- Enums declared as Postgres native enums for performance
- Foreign keys: `ON DELETE RESTRICT` for financial data, `ON DELETE CASCADE` for owned data

---

## SECTION A: SHARED CORE TABLES

These tables are used by both Real Estate and Hospitality systems.

---

## A1. Users & Authentication

### `users`
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    email_verified  BOOLEAN NOT NULL DEFAULT false,
    phone           VARCHAR(20) UNIQUE NOT NULL,
    phone_verified  BOOLEAN NOT NULL DEFAULT false,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    avatar_url      VARCHAR(500),
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'ar',
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Damascus',
    -- Roles: a user can simultaneously be a guest AND a host
    is_guest        BOOLEAN NOT NULL DEFAULT true,
    is_host         BOOLEAN NOT NULL DEFAULT false,
    is_admin        BOOLEAN NOT NULL DEFAULT false,
    is_super_admin  BOOLEAN NOT NULL DEFAULT false,
    -- Last selected experience (for "remember which dashboard I prefer")
    last_login_as   user_experience NOT NULL DEFAULT 'guest',
    status          user_status NOT NULL DEFAULT 'active',
    last_login_at   TIMESTAMPTZ,
    last_login_ip   INET,
    marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
    -- Aggregate stats (denormalized)
    average_rating_as_guest NUMERIC(3,2),
    total_reviews_as_guest INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TYPE user_experience AS ENUM ('guest', 'host', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'banned');

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_is_host ON users(is_host) WHERE deleted_at IS NULL AND is_host = true;
```

### `host_profiles`
Extended info for users where `is_host=true`.
```sql
CREATE TABLE host_profiles (
    user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
    -- Host taxonomy
    host_category        host_category NOT NULL,
    host_subtype         host_subtype NOT NULL,
    -- Identity
    display_name         VARCHAR(200) NOT NULL,        -- name shown to guests (could be "أحمد" or "Al-Cham Hotels Co.")
    company_name         VARCHAR(200),                 -- if applicable
    company_registration VARCHAR(100),                 -- commercial registration
    tax_id               VARCHAR(100),
    bio_ar               TEXT,
    bio_en               TEXT,
    -- Performance metrics
    response_rate        SMALLINT DEFAULT 0,           -- 0-100
    response_time_minutes INTEGER DEFAULT 0,
    acceptance_rate      SMALLINT DEFAULT 0,           -- request bookings only
    -- Real Estate aggregates
    re_total_listings    INTEGER NOT NULL DEFAULT 0,
    -- Hospitality aggregates
    hotel_total          INTEGER NOT NULL DEFAULT 0,
    -- Combined
    total_bookings       INTEGER NOT NULL DEFAULT 0,
    average_rating       NUMERIC(3,2),
    total_reviews        INTEGER NOT NULL DEFAULT 0,
    -- Verification
    is_verified          BOOLEAN NOT NULL DEFAULT false,
    verified_at          TIMESTAMPTZ,
    -- Wallet behavior
    withdrawal_schedule  withdrawal_schedule NOT NULL DEFAULT 'monthly',
    bank_details_encrypted TEXT,
    -- Anti-circumvention monitoring
    suspicious_activity_score SMALLINT NOT NULL DEFAULT 0,
    last_flagged_at      TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE host_category AS ENUM ('real_estate', 'hospitality');
CREATE TYPE host_subtype AS ENUM (
    -- For category=real_estate
    'individual', 'real_estate_office',
    -- For category=hospitality
    'hotel_company'
);
CREATE TYPE withdrawal_schedule AS ENUM ('weekly', 'monthly', 'manual');
```

### `kyc_submissions`
```sql
CREATE TABLE kyc_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    intended_host_category host_category,           -- real_estate or hospitality (different docs needed)
    intended_host_subtype host_subtype,
    id_document_type    kyc_doc_type NOT NULL,
    id_front_url        VARCHAR(500) NOT NULL,
    id_back_url         VARCHAR(500),
    selfie_url          VARCHAR(500) NOT NULL,
    -- For real_estate hosts
    ownership_proof_url VARCHAR(500),
    -- For real_estate_office and hospitality hosts
    company_registration_url VARCHAR(500),
    tax_certificate_url VARCHAR(500),
    authorization_letter_url VARCHAR(500),
    -- For hospitality hosts (additional)
    hotel_license_url   VARCHAR(500),
    -- Status
    status              kyc_status NOT NULL DEFAULT 'pending',
    rejection_reason    TEXT,
    reviewed_by         UUID REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ
);

CREATE TYPE kyc_doc_type AS ENUM ('national_id', 'passport', 'driver_license');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
```

### `auth_sessions`, `otp_codes`, `two_factor_secrets`
*(Same as v1 — see prior version)*

---

## SECTION B: REAL ESTATE SYSTEM

For houses, apartments, villas, farms, cabins, chalets. Modeled after Airbnb.

---

## B1. `properties` (Real Estate)
```sql
CREATE TABLE properties (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    host_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    property_type       re_property_type NOT NULL,
    -- Names & descriptions
    title_ar            VARCHAR(200) NOT NULL,
    title_en            VARCHAR(200),
    description_ar      TEXT NOT NULL,
    description_en      TEXT,
    -- Location
    country_code        CHAR(2) NOT NULL DEFAULT 'SY',
    governorate         VARCHAR(100) NOT NULL,
    city                VARCHAR(100) NOT NULL,
    neighborhood        VARCHAR(150),
    address_line        VARCHAR(255),
    location            GEOGRAPHY(POINT, 4326) NOT NULL,
    location_precision  location_precision NOT NULL DEFAULT 'approximate',
    -- Top-level capacity
    max_guests          SMALLINT NOT NULL,
    bedrooms_count      SMALLINT NOT NULL DEFAULT 0,        -- summary number
    beds_count          SMALLINT NOT NULL DEFAULT 0,        -- summary number
    bathrooms_count     NUMERIC(3,1) NOT NULL DEFAULT 1.0,  -- 1.5, 2.5
    area_sqm            INTEGER,                            -- optional, helpful for villas
    -- ===== PRICING (4 tiers) =====
    base_price_cents    BIGINT NOT NULL,                    -- per night, default
    weekly_price_cents  BIGINT,                             -- per night when stay >= 7 nights
    monthly_price_cents BIGINT,                             -- per night when stay >= 30 nights
    weekend_uplift_pct  SMALLINT NOT NULL DEFAULT 0,        -- +X% on Fri/Sat (0-100)
    cleaning_fee_cents  BIGINT NOT NULL DEFAULT 0,
    minimum_stay_nights SMALLINT NOT NULL DEFAULT 1,
    maximum_stay_nights SMALLINT,
    currency            CHAR(3) NOT NULL DEFAULT 'USD',
    -- ===== COMMISSION PASSTHROUGH (NEW v2) =====
    commission_passthrough BOOLEAN NOT NULL DEFAULT false,
    -- if false (default): host absorbs commission. Host writes $50, gets $44, guest sees $50.
    -- if true: host wants $50 net. System grosses up. Guest sees $56.82. Host gets $50.
    -- Behavior: invoice NEVER mentions commission either way.
    -- Booking
    booking_mode        booking_mode NOT NULL DEFAULT 'request',
    cancellation_policy cancellation_policy NOT NULL,
    -- Status
    status              property_status NOT NULL DEFAULT 'draft',
    rejection_reason    TEXT,
    submitted_for_review_at TIMESTAMPTZ,
    approved_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES users(id),
    -- Aggregates
    total_bookings      INTEGER NOT NULL DEFAULT 0,
    total_views         INTEGER NOT NULL DEFAULT 0,
    average_rating      NUMERIC(3,2),
    total_reviews       INTEGER NOT NULL DEFAULT 0,
    -- Anti-circumvention tracking
    last_availability_reduction_at TIMESTAMPTZ,
    availability_reductions_count INTEGER NOT NULL DEFAULT 0,
    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE TYPE re_property_type AS ENUM (
    'house', 'apartment', 'villa', 'farm', 'cabin', 'chalet', 'studio'
);
CREATE TYPE location_precision AS ENUM ('precise', 'approximate');
CREATE TYPE booking_mode AS ENUM ('instant', 'request', 'contact_only');
CREATE TYPE cancellation_policy AS ENUM ('flexible', 'medium', 'strict');
CREATE TYPE property_status AS ENUM (
    'draft', 'pending_review', 'published', 'paused', 'rejected', 'archived'
);

CREATE INDEX idx_properties_host ON properties(host_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_status ON properties(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_type ON properties(property_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_city ON properties(city, governorate) WHERE status = 'published';
CREATE INDEX idx_properties_location ON properties USING GIST(location) WHERE status = 'published';
```

### B2. `property_spaces` — Per-room/space breakdown (Airbnb-style)
A property has many spaces: bedrooms, bathrooms, kitchens, living rooms, outdoor areas.
```sql
CREATE TABLE property_spaces (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    space_type          space_type NOT NULL,
    label_ar            VARCHAR(100) NOT NULL,             -- "غرفة النوم الرئيسية"
    label_en            VARCHAR(100),
    description_ar      TEXT,
    description_en      TEXT,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    -- Type-specific fields (most are nullable, only relevant ones used per type)
    -- For bedrooms:
    beds                JSONB,                              -- [{type:'queen', count:1}, {type:'single', count:2}]
    has_ensuite         BOOLEAN,
    -- For bathrooms:
    bathroom_type       bathroom_type,                      -- 'full', 'half', 'shower_only'
    is_shared           BOOLEAN,
    -- Common
    area_sqm            INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE space_type AS ENUM (
    'bedroom', 'bathroom', 'kitchen', 'living_room', 'dining_room',
    'balcony', 'terrace', 'garden', 'pool_area', 'rooftop',
    'parking', 'storage', 'office', 'gym', 'other'
);
CREATE TYPE bathroom_type AS ENUM ('full', 'half', 'shower_only', 'wc_only');

CREATE INDEX idx_spaces_property ON property_spaces(property_id, sort_order);
```

### B3. `property_space_images`
```sql
CREATE TABLE property_space_images (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    space_id     UUID NOT NULL REFERENCES property_spaces(id) ON DELETE CASCADE,
    storage_key  VARCHAR(500) NOT NULL,
    url_original VARCHAR(500) NOT NULL,
    url_large    VARCHAR(500) NOT NULL,
    url_medium   VARCHAR(500) NOT NULL,
    url_small    VARCHAR(500) NOT NULL,
    width        INTEGER,
    height       INTEGER,
    alt_text_ar  VARCHAR(255),
    alt_text_en  VARCHAR(255),
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_space_images ON property_space_images(space_id, sort_order);
```

### B4. `property_images` — Hero / cover gallery for the whole property
```sql
CREATE TABLE property_images (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    storage_key  VARCHAR(500) NOT NULL,
    url_original VARCHAR(500) NOT NULL,
    url_large    VARCHAR(500) NOT NULL,
    url_medium   VARCHAR(500) NOT NULL,
    url_small    VARCHAR(500) NOT NULL,
    width        INTEGER,
    height       INTEGER,
    alt_text_ar  VARCHAR(255),
    alt_text_en  VARCHAR(255),
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_cover     BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_images_property ON property_images(property_id, sort_order);
CREATE UNIQUE INDEX idx_property_one_cover ON property_images(property_id) WHERE is_cover = true;
```

### B5. `amenities` — Reference data
```sql
CREATE TABLE amenities (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code         VARCHAR(50) UNIQUE NOT NULL,
    name_ar      VARCHAR(100) NOT NULL,
    name_en      VARCHAR(100) NOT NULL,
    icon_name    VARCHAR(50),
    category     amenity_category NOT NULL,
    -- Where this amenity can apply
    applies_to_property BOOLEAN NOT NULL DEFAULT true,    -- whole property
    applies_to_space    BOOLEAN NOT NULL DEFAULT false,   -- specific room
    applies_to_hotel    BOOLEAN NOT NULL DEFAULT false,   -- hotel-wide
    applies_to_room_type BOOLEAN NOT NULL DEFAULT false,  -- specific room type
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_active    BOOLEAN NOT NULL DEFAULT true
);

CREATE TYPE amenity_category AS ENUM (
    'essentials', 'kitchen', 'bathroom', 'bedroom', 'living',
    'outdoor', 'pool_spa', 'parking', 'safety', 'family',
    'accessibility', 'work', 'entertainment', 'services'
);
```

### B6. `property_amenities` & `space_amenities`
```sql
CREATE TABLE property_amenities (
    property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id   UUID NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
    PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE space_amenities (
    space_id     UUID NOT NULL REFERENCES property_spaces(id) ON DELETE CASCADE,
    amenity_id   UUID NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
    PRIMARY KEY (space_id, amenity_id)
);
```

### B7. `property_availability_blocks` & `property_pricing_overrides`
```sql
CREATE TABLE property_availability_blocks (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    starts_on    DATE NOT NULL,
    ends_on      DATE NOT NULL,
    reason       availability_reason NOT NULL,
    booking_id   UUID,
    note         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_on >= starts_on)
);

CREATE TYPE availability_reason AS ENUM ('booked', 'host_blocked', 'maintenance');

CREATE INDEX idx_avail_property_dates ON property_availability_blocks(property_id, starts_on, ends_on);

-- Seasonal / date-range pricing overrides
CREATE TABLE property_pricing_overrides (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    starts_on       DATE NOT NULL,
    ends_on         DATE NOT NULL,
    -- Can override ALL three pricing tiers for this period
    base_price_cents    BIGINT NOT NULL,
    weekly_price_cents  BIGINT,
    monthly_price_cents BIGINT,
    label_ar        VARCHAR(100),                    -- "موسم الصيف", "عيد الأضحى"
    label_en        VARCHAR(100),
    season_type     season_type,                      -- categorization
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE season_type AS ENUM (
    'summer', 'winter', 'eid', 'ramadan', 'new_year', 'school_holiday', 'custom'
);

CREATE INDEX idx_pricing_overrides ON property_pricing_overrides(property_id, starts_on, ends_on);
```

---

## SECTION C: HOSPITALITY SYSTEM

For hotels, hotel-apartments, resorts, hostels. Modeled after Booking.com.

---

### C1. `hotels`
The establishment-level record.
```sql
CREATE TABLE hotels (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    host_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    hotel_type          hotel_type NOT NULL,
    -- Identity
    name_ar             VARCHAR(200) NOT NULL,
    name_en             VARCHAR(200),
    description_ar      TEXT NOT NULL,
    description_en      TEXT,
    -- Stars (official rating, 1-5)
    star_rating         SMALLINT CHECK (star_rating BETWEEN 1 AND 5),
    -- Location (always precise for hotels)
    country_code        CHAR(2) NOT NULL DEFAULT 'SY',
    governorate         VARCHAR(100) NOT NULL,
    city                VARCHAR(100) NOT NULL,
    neighborhood        VARCHAR(150),
    address_line        VARCHAR(255) NOT NULL,
    location            GEOGRAPHY(POINT, 4326) NOT NULL,
    -- Hotel-wide info
    total_rooms_count   INTEGER NOT NULL,           -- summary, computed from room_types
    floors_count        SMALLINT,
    year_built          SMALLINT,
    year_renovated      SMALLINT,
    -- Times
    checkin_from        TIME NOT NULL DEFAULT '14:00',
    checkin_to          TIME,                        -- e.g., '23:00' or NULL for "anytime"
    checkout_from       TIME,
    checkout_to         TIME NOT NULL DEFAULT '12:00',
    -- Policies
    accepts_children    BOOLEAN NOT NULL DEFAULT true,
    accepts_pets        BOOLEAN NOT NULL DEFAULT false,
    smoking_policy      smoking_policy NOT NULL DEFAULT 'designated_areas',
    payment_at_property BOOLEAN NOT NULL DEFAULT false,    -- legacy hotels still accept cash on arrival
    -- Languages spoken at front desk
    languages_spoken    VARCHAR(10)[] DEFAULT ARRAY['ar', 'en'],
    -- ===== COMMISSION PASSTHROUGH =====
    commission_passthrough BOOLEAN NOT NULL DEFAULT false,
    -- Default cancellation policy (can be overridden per room_type)
    default_cancellation_policy cancellation_policy NOT NULL DEFAULT 'medium',
    -- Status
    status              hotel_status NOT NULL DEFAULT 'draft',
    rejection_reason    TEXT,
    submitted_for_review_at TIMESTAMPTZ,
    approved_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES users(id),
    -- Aggregates
    total_bookings      INTEGER NOT NULL DEFAULT 0,
    total_views         INTEGER NOT NULL DEFAULT 0,
    average_rating      NUMERIC(3,2),
    total_reviews       INTEGER NOT NULL DEFAULT 0,
    -- Anti-circumvention
    last_availability_reduction_at TIMESTAMPTZ,
    availability_reductions_count INTEGER NOT NULL DEFAULT 0,
    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE TYPE hotel_type AS ENUM ('hotel', 'hotel_apartment', 'resort', 'hostel');
CREATE TYPE smoking_policy AS ENUM ('non_smoking', 'designated_areas', 'all_smoking');
CREATE TYPE hotel_status AS ENUM (
    'draft', 'pending_review', 'published', 'paused', 'rejected', 'archived'
);

CREATE INDEX idx_hotels_host ON hotels(host_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_hotels_status ON hotels(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_hotels_city ON hotels(city, governorate) WHERE status = 'published';
CREATE INDEX idx_hotels_location ON hotels USING GIST(location) WHERE status = 'published';
CREATE INDEX idx_hotels_stars ON hotels(star_rating) WHERE status = 'published';
```

### C2. `hotel_images`
Hotel-wide photos (lobby, exterior, restaurant, pool, gym).
```sql
CREATE TABLE hotel_images (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    storage_key  VARCHAR(500) NOT NULL,
    url_original VARCHAR(500) NOT NULL,
    url_large    VARCHAR(500) NOT NULL,
    url_medium   VARCHAR(500) NOT NULL,
    url_small    VARCHAR(500) NOT NULL,
    width        INTEGER,
    height       INTEGER,
    alt_text_ar  VARCHAR(255),
    alt_text_en  VARCHAR(255),
    category     hotel_image_category NOT NULL,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_cover     BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE hotel_image_category AS ENUM (
    'exterior', 'lobby', 'reception', 'restaurant', 'bar', 'pool',
    'gym', 'spa', 'meeting_room', 'common_area', 'view', 'other'
);

CREATE INDEX idx_hotel_images ON hotel_images(hotel_id, category, sort_order);
CREATE UNIQUE INDEX idx_hotel_one_cover ON hotel_images(hotel_id) WHERE is_cover = true;
```

### C3. `hotel_amenities`
```sql
CREATE TABLE hotel_amenities (
    hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    amenity_id   UUID NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
    -- Some amenities have additional metadata
    is_free      BOOLEAN,                    -- e.g., breakfast: free or paid?
    fee_cents    BIGINT,                     -- if not free
    notes_ar     VARCHAR(500),
    notes_en     VARCHAR(500),
    PRIMARY KEY (hotel_id, amenity_id)
);
```

### C4. `room_types`
The "templates" — defines a kind of room (e.g., "Standard Double Room").
```sql
CREATE TABLE room_types (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    hotel_id            UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    -- Naming
    name_ar             VARCHAR(150) NOT NULL,            -- "غرفة دبل ستاندرد"
    name_en             VARCHAR(150),
    description_ar      TEXT,
    description_en      TEXT,
    code                VARCHAR(50),                       -- internal code, e.g., "DBL-STD"
    -- Inventory
    total_units         SMALLINT NOT NULL CHECK (total_units > 0),
    -- Capacity
    max_occupancy       SMALLINT NOT NULL,
    max_adults          SMALLINT NOT NULL,
    max_children        SMALLINT NOT NULL DEFAULT 0,
    -- Beds
    beds                JSONB NOT NULL,                    -- [{type:'double',count:1}, {type:'sofa',count:1}]
    -- Size
    area_sqm            INTEGER,
    -- ===== PRICING (4 tiers) =====
    base_price_cents    BIGINT NOT NULL,
    weekly_price_cents  BIGINT,
    monthly_price_cents BIGINT,
    weekend_uplift_pct  SMALLINT NOT NULL DEFAULT 0,
    breakfast_included  BOOLEAN NOT NULL DEFAULT false,
    breakfast_extra_cents BIGINT,                          -- if not included, can be added
    currency            CHAR(3) NOT NULL DEFAULT 'USD',
    -- Policy overrides
    cancellation_policy cancellation_policy,               -- NULL = inherit hotel default
    -- Display
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    -- Aggregates
    total_bookings      INTEGER NOT NULL DEFAULT 0,
    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_room_types_hotel ON room_types(hotel_id, sort_order) WHERE deleted_at IS NULL;
```

### C5. `room_type_images`
```sql
CREATE TABLE room_type_images (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    storage_key  VARCHAR(500) NOT NULL,
    url_original VARCHAR(500) NOT NULL,
    url_large    VARCHAR(500) NOT NULL,
    url_medium   VARCHAR(500) NOT NULL,
    url_small    VARCHAR(500) NOT NULL,
    width        INTEGER,
    height       INTEGER,
    alt_text_ar  VARCHAR(255),
    alt_text_en  VARCHAR(255),
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_cover     BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_type_images ON room_type_images(room_type_id, sort_order);
```

### C6. `room_type_amenities`
```sql
CREATE TABLE room_type_amenities (
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    amenity_id   UUID NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
    PRIMARY KEY (room_type_id, amenity_id)
);
```

### C7. `room_units` — The actual physical rooms
Each unit is one physical room. Inventory = COUNT(units WHERE active).
```sql
CREATE TABLE room_units (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    room_type_id    UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    -- Identity
    unit_number     VARCHAR(20),                    -- "Room 305", "Villa A"
    floor           SMALLINT,
    -- Status
    is_active       BOOLEAN NOT NULL DEFAULT true,  -- inactive = under maintenance / removed
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_units_type ON room_units(room_type_id) WHERE is_active = true;
CREATE INDEX idx_room_units_hotel ON room_units(hotel_id);
```

> **Why have `room_units` at all?** Two reasons:
> 1. **Anti-circumvention**: when a host says "I rented 2 rooms off-platform", the system marks 2 specific units as unavailable for date X — not just decrementing a counter (which is harder to audit).
> 2. **Future-proofing**: per-unit features (room 305 has a balcony but room 306 doesn't), maintenance tracking, eventual loyalty perks ("you stayed in room 305 last time, want it again?")

### C8. `room_type_availability_blocks`
Per-unit blocking. Allows precise inventory control.
```sql
CREATE TABLE room_unit_availability_blocks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    room_unit_id    UUID NOT NULL REFERENCES room_units(id) ON DELETE CASCADE,
    starts_on       DATE NOT NULL,
    ends_on         DATE NOT NULL,
    reason          availability_reason NOT NULL,
    booking_id      UUID,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_on >= starts_on)
);

CREATE INDEX idx_unit_avail_dates ON room_unit_availability_blocks(room_unit_id, starts_on, ends_on);
```

### C9. `room_type_pricing_overrides`
```sql
CREATE TABLE room_type_pricing_overrides (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    room_type_id        UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    starts_on           DATE NOT NULL,
    ends_on             DATE NOT NULL,
    base_price_cents    BIGINT NOT NULL,
    weekly_price_cents  BIGINT,
    monthly_price_cents BIGINT,
    label_ar            VARCHAR(100),
    label_en            VARCHAR(100),
    season_type         season_type,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_type_pricing ON room_type_pricing_overrides(room_type_id, starts_on, ends_on);
```

---

## SECTION D: BOOKINGS (Polymorphic — works for both systems)

### D1. `bookings`
```sql
CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    booking_reference   VARCHAR(20) UNIQUE NOT NULL,    -- "SUK-A1B2C3"
    -- Polymorphic target: either property OR room_type+units
    booking_kind        booking_kind NOT NULL,
    property_id         UUID REFERENCES properties(id) ON DELETE RESTRICT,    -- if real_estate
    hotel_id            UUID REFERENCES hotels(id) ON DELETE RESTRICT,        -- if hospitality
    room_type_id        UUID REFERENCES room_types(id) ON DELETE RESTRICT,    -- if hospitality
    -- Parties
    guest_id            UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    host_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- For hospitality: how many rooms of this type they booked
    rooms_count         SMALLINT NOT NULL DEFAULT 1,
    -- Stay details
    check_in            DATE NOT NULL,
    check_out           DATE NOT NULL,
    nights              SMALLINT NOT NULL,
    adults_count        SMALLINT NOT NULL,
    children_count      SMALLINT NOT NULL DEFAULT 0,
    -- ===== PRICING SNAPSHOT (in USD cents) =====
    -- This is the authoritative price record at time of booking
    nightly_rate_cents      BIGINT NOT NULL,                    -- final per-night rate after tier+season
    nights_subtotal_cents   BIGINT NOT NULL,                    -- nightly_rate * nights * rooms_count
    cleaning_fee_cents      BIGINT NOT NULL DEFAULT 0,
    seasonal_adjustment_cents BIGINT NOT NULL DEFAULT 0,        -- delta from base if season override applied
    discount_cents          BIGINT NOT NULL DEFAULT 0,          -- weekly/monthly discount
    -- COMMISSION & SERVICE FEE BREAKDOWN
    -- ALWAYS recorded for audit; what's SHOWN to guest on invoice depends on commission_passthrough
    property_subtotal_cents BIGINT NOT NULL,                    -- what guest sees as "property price"
    commission_basis_points INTEGER NOT NULL,                   -- e.g., 1200 = 12.00%
    commission_cents        BIGINT NOT NULL,                    -- actual commission
    commission_passthrough  BOOLEAN NOT NULL,                    -- snapshot from property/hotel at booking time
    service_fee_basis_points INTEGER NOT NULL,                  -- e.g., 200 = 2.00%
    service_fee_cents       BIGINT NOT NULL,                    -- always shown to guest
    -- COMPUTED TOTALS
    guest_total_cents       BIGINT NOT NULL,                    -- what guest pays = property_subtotal + service_fee
    host_payout_cents       BIGINT NOT NULL,                    -- what host receives
    currency            CHAR(3) NOT NULL DEFAULT 'USD',
    -- Snapshot of policies at booking time
    cancellation_policy cancellation_policy NOT NULL,
    money_flow          money_flow_type NOT NULL,
    -- Status
    status              booking_status NOT NULL DEFAULT 'pending_payment',
    -- Cancellation
    cancelled_at        TIMESTAMPTZ,
    cancelled_by        UUID REFERENCES users(id),
    cancellation_reason TEXT,
    refund_amount_cents BIGINT,
    -- Lifecycle
    confirmed_at        TIMESTAMPTZ,
    checked_in_at       TIMESTAMPTZ,
    checked_out_at      TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    -- Special requests
    guest_message       TEXT,
    -- Smart upgrade tracking (NEW v2)
    upgraded_from_room_type_id UUID REFERENCES room_types(id),
    upgrade_accepted_at TIMESTAMPTZ,
    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Polymorphic constraint
    CHECK (
        (booking_kind = 'real_estate' AND property_id IS NOT NULL AND hotel_id IS NULL AND room_type_id IS NULL)
        OR
        (booking_kind = 'hospitality' AND property_id IS NULL AND hotel_id IS NOT NULL AND room_type_id IS NOT NULL)
    ),
    CHECK (check_out > check_in),
    CHECK (nights = check_out - check_in),
    CHECK (rooms_count > 0)
);

CREATE TYPE booking_kind AS ENUM ('real_estate', 'hospitality');
CREATE TYPE money_flow_type AS ENUM ('escrow', 'direct');
CREATE TYPE booking_status AS ENUM (
    'pending_payment', 'pending_approval', 'confirmed',
    'checked_in', 'checked_out', 'completed',
    'cancelled', 'declined', 'expired', 'disputed'
);

CREATE INDEX idx_bookings_guest ON bookings(guest_id, created_at DESC);
CREATE INDEX idx_bookings_host ON bookings(host_id, created_at DESC);
CREATE INDEX idx_bookings_property ON bookings(property_id, check_in) WHERE property_id IS NOT NULL;
CREATE INDEX idx_bookings_room_type ON bookings(room_type_id, check_in) WHERE room_type_id IS NOT NULL;
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out) WHERE status IN ('confirmed', 'checked_in');
```

### D2. `booking_room_units` — Which specific units were assigned (hospitality only)
```sql
CREATE TABLE booking_room_units (
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_unit_id    UUID NOT NULL REFERENCES room_units(id) ON DELETE RESTRICT,
    PRIMARY KEY (booking_id, room_unit_id)
);
```

---

## SECTION E: PAYMENTS, WALLETS, COMMISSION

### E1. `payments`, `wallets`, `wallet_transactions`, `withdrawal_requests`
*(Same as v1 — see prior version. The only change: `payments.amount_cents` always equals `bookings.guest_total_cents`)*

### E2. `commission_rates` — Configurable commission per dimension
```sql
CREATE TABLE commission_rates (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    -- Scope (exactly one of: type-level, host-level, property-level, hotel-level)
    re_property_type        re_property_type,
    hotel_type              hotel_type,
    property_id             UUID REFERENCES properties(id),
    hotel_id                UUID REFERENCES hotels(id),
    host_id                 UUID REFERENCES users(id),
    -- Rate
    basis_points            INTEGER NOT NULL,           -- 1200 = 12.00%
    -- Effective period
    effective_from          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until         TIMESTAMPTZ,
    note                    TEXT,                        -- "promo: first 6 months free"
    created_by              UUID NOT NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (num_nonnulls(re_property_type, hotel_type, property_id, hotel_id, host_id) = 1)
);
```

### E3. `service_fee_rates` — Separately configurable from commission (NEW v2)
```sql
CREATE TABLE service_fee_rates (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    scope                   service_fee_scope NOT NULL DEFAULT 'global',
    -- For non-global scope:
    booking_kind            booking_kind,
    guest_id                UUID REFERENCES users(id),
    -- Rate
    basis_points            INTEGER NOT NULL,           -- 200 = 2.00%
    -- Effective period
    effective_from          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until         TIMESTAMPTZ,
    note                    TEXT,
    created_by              UUID NOT NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE service_fee_scope AS ENUM ('global', 'by_kind', 'by_guest');
```

### E4. `currency_rates`
*(Same as v1)*

---

## SECTION F: REVIEWS (DUAL — Property/Hotel + Host)

### F1. `reviews`
```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    reviewer_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewee_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- Polymorphic target
    review_target   review_target NOT NULL,
    property_id     UUID REFERENCES properties(id),
    hotel_id        UUID REFERENCES hotels(id),
    room_type_id    UUID REFERENCES room_types(id),
    direction       review_direction NOT NULL,
    -- Overall rating
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    -- Sub-ratings (guest → property/hotel)
    cleanliness     SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
    accuracy        SMALLINT CHECK (accuracy BETWEEN 1 AND 5),
    location_rating SMALLINT CHECK (location_rating BETWEEN 1 AND 5),
    value           SMALLINT CHECK (value BETWEEN 1 AND 5),
    facilities      SMALLINT CHECK (facilities BETWEEN 1 AND 5),       -- for hotels
    -- Sub-ratings (guest → host) — separate review on the host
    host_communication SMALLINT CHECK (host_communication BETWEEN 1 AND 5),
    host_responsiveness SMALLINT CHECK (host_responsiveness BETWEEN 1 AND 5),
    host_hospitality SMALLINT CHECK (host_hospitality BETWEEN 1 AND 5),
    comment         TEXT NOT NULL,
    response        TEXT,                              -- host's response
    response_at     TIMESTAMPTZ,
    -- Visibility
    is_published    BOOLEAN NOT NULL DEFAULT false,
    published_at    TIMESTAMPTZ,
    -- Moderation
    is_flagged      BOOLEAN NOT NULL DEFAULT false,
    moderation_status moderation_status NOT NULL DEFAULT 'approved',
    moderated_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (booking_id, direction, review_target)
);

CREATE TYPE review_target AS ENUM ('property', 'hotel', 'host', 'guest');
CREATE TYPE review_direction AS ENUM ('guest_to_host', 'host_to_guest');
CREATE TYPE moderation_status AS ENUM ('approved', 'pending', 'removed');

CREATE INDEX idx_reviews_property ON reviews(property_id) WHERE is_published = true AND property_id IS NOT NULL;
CREATE INDEX idx_reviews_hotel ON reviews(hotel_id) WHERE is_published = true AND hotel_id IS NOT NULL;
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id) WHERE is_published = true;
```

---

## SECTION G: NEW v2 — PRICE INTELLIGENCE

### G1. `market_demand_snapshots` — Daily aggregates per city/category
```sql
CREATE TABLE market_demand_snapshots (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    snapshot_date           DATE NOT NULL,
    booking_kind            booking_kind NOT NULL,
    governorate             VARCHAR(100) NOT NULL,
    city                    VARCHAR(100) NOT NULL,
    -- Supply
    total_listings          INTEGER NOT NULL,
    available_listings      INTEGER NOT NULL,            -- not booked for next 7 days
    -- Demand
    searches_7d             INTEGER NOT NULL DEFAULT 0,
    bookings_7d             INTEGER NOT NULL DEFAULT 0,
    booking_attempts_7d     INTEGER NOT NULL DEFAULT 0,
    -- Pricing
    avg_price_cents         BIGINT,
    median_price_cents      BIGINT,
    -- Computed signals
    demand_index            NUMERIC(5,2),                -- 0-100, our composite metric
    supply_change_pct       NUMERIC(5,2),                -- vs last week
    demand_change_pct       NUMERIC(5,2),
    suggested_price_change_pct NUMERIC(5,2),             -- recommendation
    UNIQUE (snapshot_date, booking_kind, governorate, city)
);

CREATE INDEX idx_market_snapshots ON market_demand_snapshots(snapshot_date DESC, city);
```

### G2. `pricing_suggestions` — Per-property suggestions to the host
```sql
CREATE TABLE pricing_suggestions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    target_kind             booking_kind NOT NULL,
    property_id             UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_type_id            UUID REFERENCES room_types(id) ON DELETE CASCADE,
    suggestion_type         pricing_suggestion_type NOT NULL,
    current_price_cents     BIGINT NOT NULL,
    suggested_price_cents   BIGINT NOT NULL,
    confidence              NUMERIC(3,2),                -- 0.00-1.00
    reasoning_ar            TEXT,
    reasoning_en            TEXT,
    -- Comparable listings considered
    similar_listings_count  INTEGER,
    similar_avg_price_cents BIGINT,
    -- Status
    status                  suggestion_status NOT NULL DEFAULT 'pending',
    seen_at                 TIMESTAMPTZ,
    actioned_at             TIMESTAMPTZ,
    dismissed_at            TIMESTAMPTZ,
    -- Timing
    valid_until             TIMESTAMPTZ NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (num_nonnulls(property_id, room_type_id) = 1)
);

CREATE TYPE pricing_suggestion_type AS ENUM (
    'demand_surge_raise',          -- demand high, raise prices
    'supply_shortage_raise',       -- supply low, raise prices
    'low_engagement_lower',        -- few clicks, lower prices
    'overpriced_vs_similar',       -- you're priced above similar listings
    'underpriced_vs_similar',      -- you're priced below similar listings
    'seasonal_opportunity'         -- upcoming holiday/season, adjust prices
);
CREATE TYPE suggestion_status AS ENUM ('pending', 'seen', 'accepted', 'dismissed', 'expired');

CREATE INDEX idx_pricing_suggestions_property ON pricing_suggestions(property_id) WHERE status IN ('pending','seen');
CREATE INDEX idx_pricing_suggestions_room ON pricing_suggestions(room_type_id) WHERE status IN ('pending','seen');
```

### G3. `listing_view_events` — For demand calculation
```sql
CREATE TABLE listing_view_events (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    booking_kind            booking_kind NOT NULL,
    property_id             UUID,
    hotel_id                UUID,
    room_type_id            UUID,
    user_id                 UUID,                        -- nullable (anonymous)
    session_id              VARCHAR(100),
    referrer                VARCHAR(255),
    duration_seconds        INTEGER,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioned by month for performance
CREATE INDEX idx_listing_views_recent ON listing_view_events(created_at DESC);
CREATE INDEX idx_listing_views_property ON listing_view_events(property_id, created_at DESC) WHERE property_id IS NOT NULL;
CREATE INDEX idx_listing_views_hotel ON listing_view_events(hotel_id, created_at DESC) WHERE hotel_id IS NOT NULL;
```

---

## SECTION H: NEW v2 — ANTI-CIRCUMVENTION

### H1. `availability_reduction_events`
Records every time a host manually decreases inventory.
```sql
CREATE TABLE availability_reduction_events (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    actor_id                UUID NOT NULL REFERENCES users(id),
    target_kind             booking_kind NOT NULL,
    property_id             UUID REFERENCES properties(id),
    room_type_id            UUID REFERENCES room_types(id),
    -- What changed
    units_blocked           SMALLINT NOT NULL,           -- for hotels: how many units removed/blocked
    days_affected           INTEGER NOT NULL,            -- date range size
    starts_on               DATE NOT NULL,
    ends_on                 DATE NOT NULL,
    reason                  reduction_reason NOT NULL,
    reason_note             TEXT,
    -- Risk scoring
    risk_score              SMALLINT NOT NULL DEFAULT 0, -- 0-100, computed
    triggered_admin_review  BOOLEAN NOT NULL DEFAULT false,
    admin_reviewed_by       UUID REFERENCES users(id),
    admin_decision          admin_decision,
    admin_note              TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (num_nonnulls(property_id, room_type_id) = 1)
);

CREATE TYPE reduction_reason AS ENUM (
    'maintenance', 'personal_use', 'rented_offline',
    'long_term_rental', 'renovation', 'other'
);
CREATE TYPE admin_decision AS ENUM ('cleared', 'warned', 'penalized', 'suspended');

CREATE INDEX idx_avail_reductions_actor ON availability_reduction_events(actor_id, created_at DESC);
CREATE INDEX idx_avail_reductions_review ON availability_reduction_events(created_at DESC) WHERE triggered_admin_review = true;
```

### H2. `host_risk_signals` — Aggregated signals
```sql
CREATE TABLE host_risk_signals (
    host_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    -- Reduction patterns
    reductions_30d          INTEGER NOT NULL DEFAULT 0,
    reductions_90d          INTEGER NOT NULL DEFAULT 0,
    -- Cancellation patterns
    cancellations_30d       INTEGER NOT NULL DEFAULT 0,
    cancellation_rate       NUMERIC(5,2) NOT NULL DEFAULT 0,
    -- Communication patterns
    blocked_messages_30d    INTEGER NOT NULL DEFAULT 0,    -- attempted to share contact info
    -- Composite score
    risk_score              SMALLINT NOT NULL DEFAULT 0,   -- 0-100
    risk_tier               risk_tier NOT NULL DEFAULT 'low',
    last_computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE risk_tier AS ENUM ('low', 'medium', 'high', 'critical');
```

---

## SECTION I: NEW v2 — GUEST FEATURES

### I1. `wishlists` (with sharing)
```sql
CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL DEFAULT 'My Favorites',
    is_default      BOOLEAN NOT NULL DEFAULT true,
    -- Sharing (NEW v2)
    is_public       BOOLEAN NOT NULL DEFAULT false,
    share_token     VARCHAR(40) UNIQUE,              -- random URL-safe token
    share_token_created_at TIMESTAMPTZ,
    -- Collaboration (Phase 5+)
    allow_collaborators BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wishlist_items (
    wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    -- Polymorphic
    property_id     UUID REFERENCES properties(id) ON DELETE CASCADE,
    hotel_id        UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id    UUID REFERENCES room_types(id) ON DELETE CASCADE,
    note            TEXT,
    added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (wishlist_id, property_id, hotel_id, room_type_id),
    CHECK (num_nonnulls(property_id, hotel_id, room_type_id) = 1)
);

-- Collaborators (Phase 5+)
CREATE TABLE wishlist_collaborators (
    wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission      collab_permission NOT NULL DEFAULT 'view',
    invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at     TIMESTAMPTZ,
    PRIMARY KEY (wishlist_id, user_id)
);

CREATE TYPE collab_permission AS ENUM ('view', 'edit');
```

### I2. `comparison_sessions`
```sql
CREATE TABLE comparison_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id      VARCHAR(100),                -- for anonymous users
    -- Items being compared (max 4)
    item_1_kind     booking_kind,
    item_1_id       UUID,
    item_2_kind     booking_kind,
    item_2_id       UUID,
    item_3_kind     booking_kind,
    item_3_id       UUID,
    item_4_kind     booking_kind,
    item_4_id       UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);
```

### I3. `price_alerts`
```sql
CREATE TABLE price_alerts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Polymorphic
    property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
    hotel_id            UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id        UUID REFERENCES room_types(id) ON DELETE CASCADE,
    -- Trigger conditions
    alert_when          alert_trigger NOT NULL,
    target_price_cents  BIGINT,                   -- if alert_when='price_below'
    target_date_range_starts_on DATE,             -- if alert_when='available_in_range'
    target_date_range_ends_on   DATE,
    -- Status
    is_active           BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at   TIMESTAMPTZ,
    times_triggered     INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,              -- auto-disable after this date
    CHECK (num_nonnulls(property_id, hotel_id, room_type_id) = 1)
);

CREATE TYPE alert_trigger AS ENUM (
    'price_drop', 'price_below', 'available_in_range', 'new_review'
);

CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;
```

---

## SECTION J: NEW v2 — NEARBY ATTRACTIONS

### J1. `nearby_attractions` — Curated POIs
```sql
CREATE TABLE nearby_attractions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    category        attraction_category NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    governorate     VARCHAR(100) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    description_ar  TEXT,
    description_en  TEXT,
    icon_name       VARCHAR(50),
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    image_url       VARCHAR(500),
    source          attraction_source NOT NULL DEFAULT 'manual',
    osm_id          VARCHAR(50),                       -- if from OpenStreetMap
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE attraction_category AS ENUM (
    'restaurant', 'cafe', 'supermarket', 'mall', 'pharmacy',
    'hospital', 'mosque', 'church', 'historical_site', 'park',
    'beach', 'museum', 'monument', 'market', 'atm', 'gas_station',
    'school', 'university', 'embassy', 'public_transport'
);
CREATE TYPE attraction_source AS ENUM ('manual', 'openstreetmap', 'partnership');

CREATE INDEX idx_attractions_location ON nearby_attractions USING GIST(location);
CREATE INDEX idx_attractions_category_city ON nearby_attractions(city, category);
```

> **Usage**: when displaying a property/hotel page, query `nearby_attractions` within 2km radius:
> ```sql
> SELECT *, ST_Distance(location, $1::geography) AS distance_meters
> FROM nearby_attractions
> WHERE ST_DWithin(location, $1::geography, 2000)
> ORDER BY distance_meters
> LIMIT 30;
> ```

---

## SECTION K: CHAT, NOTIFICATIONS, AUDIT, DISPUTES
*(Same as v1 — see prior version. The only change: `notifications.type` enum is extended.)*

```sql
CREATE TYPE notification_type AS ENUM (
    -- Booking lifecycle
    'booking_request', 'booking_confirmed', 'booking_cancelled', 'booking_reminder',
    -- Payments
    'payment_received', 'payment_failed', 'withdrawal_completed',
    -- Reviews
    'review_received', 'review_response',
    -- Messaging
    'message_received',
    -- KYC / Listings
    'kyc_approved', 'kyc_rejected',
    'property_approved', 'property_rejected',
    'hotel_approved', 'hotel_rejected',
    -- New v2
    'pricing_suggestion',          -- "raise your price 10%"
    'price_alert_triggered',        -- "the property you watched dropped to $X"
    'wishlist_shared',              -- "Ahmad shared a wishlist with you"
    'wishlist_item_changed',        -- "an item in your wishlist changed price"
    'availability_reduction_warning', -- admin → host warning
    -- System
    'system_announcement', 'marketing'
);
```

---

## CRITICAL CONSTRAINTS

- **No double-booking (real estate)**: exclusion constraint on `property_availability_blocks`
- **No double-booking (hospitality)**: exclusion constraint on `room_unit_availability_blocks`
- **Booking polymorphism**: `bookings` table CHECK enforces exactly one of (property_id) or (hotel_id+room_type_id)
- **Wallet balances never negative**: CHECK on `wallets`
- **Commission and service fee always recorded** even if commission_passthrough hides commission from guest
- **Guest invoice = property_subtotal + service_fee** — period. Commission is internal only.
