# 📡 API_SPEC — Suknaa REST API (v2)

> Base URL: `https://api.suknaa.com/v1`
> **v2 changes**: Vacation rentals use `/me/vacation-rentals` and `/vacation-rentals/:id` (not a general “real estate” API). Hospitality uses `/me/hotels` and `/hotels/:id`. See [PHASE_3_M1_NAMING_PLAN.md](./PHASE_3_M1_NAMING_PLAN.md). Added endpoints for: pricing tiers, commission passthrough, price intelligence, anti-circumvention, sharing wishlists, comparisons, price alerts, nearby attractions, host profiles.

---

## 0. Conventions

### Response Format

**Success:**
```json
{ "data": { ... }, "meta": { "request_id": "uuid" } }
```

**Error:**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "message_en": "Invalid email or password",
    "details": { ... }
  },
  "meta": { "request_id": "uuid" }
}
```

### Status Codes
200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 / 422 / 429 / 500

### Pagination
Cursor-based: `?limit=20&cursor=...`

### Localization
`Accept-Language: ar` or `en`

### Idempotency
`Idempotency-Key: <uuid>` on POSTs that create things

---

## 1. Authentication

### `POST /auth/signup`
```json
{
  "email": "user@example.com",
  "phone": "+963991234567",
  "password": "SecurePass123",
  "full_name": "محمد أحمد",
  "preferred_language": "ar",
  "marketing_opt_in": false
}
```

### `POST /auth/verify-email`
### `POST /auth/otp/request`
### `POST /auth/otp/verify`
### `POST /auth/login`
**Response (success, no 2FA):**
```json
{
  "data": {
    "access_token": "jwt...",
    "user": {
      "id": "...",
      "is_guest": true,
      "is_host": true,
      "is_admin": false,
      "last_login_as": "guest"
    }
  }
}
```

### `POST /auth/login/intent`
**NEW v2** — User picks "Login as Guest" vs "Login as Host" before/after auth. This endpoint just records the preference for the session and routes them correctly.
```json
{ "intent": "guest" | "host" }
```
If `intent=host` and the user is not yet a host, response includes `become_host_required: true` to trigger the onboarding flow.

### `POST /auth/login/2fa`
### `POST /auth/refresh`
### `POST /auth/logout`
### `POST /auth/logout-all`
### `POST /auth/password/forgot`
### `POST /auth/password/reset`
### `GET /auth/sessions`
### `DELETE /auth/sessions/:id`

---

## 2. 2FA Management

### `POST /me/2fa/totp/setup`
### `POST /me/2fa/totp/confirm`
### `POST /me/2fa/sms/enable`
### `DELETE /me/2fa/:method`
### `POST /me/2fa/backup-codes/regenerate`

---

## 3. User Profile

### `GET /me`
Returns profile with `is_guest`, `is_host`, `is_admin` flags.

### `PATCH /me`
### `POST /me/email/change`
### `POST /me/phone/change`
### `DELETE /me`

---

## 4. KYC

### `POST /me/kyc`
**v2 expanded**:
```json
{
  "intended_host_category": "vacation_rentals",  // or "hospitality" (DB may still store legacy `real_estate` until M2b migration)
  "intended_host_subtype": "individual",     // or "vacation_rental_operator" (replaces legacy `real_estate_office`), "hotel_company"
  "id_document_type": "national_id",
  "id_front_url": "minio_key",
  "id_back_url": "minio_key",
  "selfie_url": "minio_key",
  "ownership_proof_url": "minio_key",         // for individual vacation rental hosts
  "company_registration_url": "minio_key",    // for operators / hotels
  "tax_certificate_url": "minio_key",
  "authorization_letter_url": "minio_key",
  "hotel_license_url": "minio_key"            // for hospitality only
}
```

### `GET /me/kyc`
### `GET /me/kyc/history`

---

## 5. Become Host

### `POST /me/become-host`
**v2**: User chooses category + subtype.
```json
{
  "host_category": "vacation_rentals",   // or "hospitality"
  "host_subtype": "individual",     // or "vacation_rental_operator", "hotel_company"
  "display_name": "محمد أحمد",       // or company name
  "company_name": null,
  "company_registration": null,
  "tax_id": null,
  "bio_ar": "...",
  "bio_en": "...",
  "withdrawal_schedule": "monthly"
}
```

### `PATCH /me/host-profile`
### `POST /me/host-profile/bank-details`

---

## 6. Reference Data (Public, Cached)

All reference routes are **public** (no auth). Responses use `{ "data": [ ... ] }` only (no `meta` on success). `Cache-Control: public, max-age=300`.

### `GET /reference/vacation-rental-types`
Returns enum values for `vacation_rental_type` with AR/EN labels.

```json
{ "data": [{ "key": "apartment", "label_ar": "شقة", "label_en": "Apartment" }] }
```

### `GET /reference/space-types`
Returns enum values for `space_type` (bedroom, bathroom, kitchen, etc.) with AR/EN labels.

### `GET /reference/booking-modes`
Returns `booking_mode` values (`instant`, `request`, `contact_only`) with AR/EN labels.

### `GET /reference/cancellation-policies`
Returns `cancellation_policy` values (`flexible`, `medium`, `strict`) with AR/EN labels.

### `GET /reference/amenities`
Returns all **active** rows from `amenities`, ordered by `sort_order` then `name_ar`. Clients filter by applicability flags.

```json
{
  "data": [{
    "id": "uuid",
    "code": "wifi",
    "name_ar": "واي فاي",
    "name_en": "Wi-Fi",
    "icon_name": "Wifi",
    "category": "essentials",
    "applies_to_vacation_rental": true,
    "applies_to_vacation_rental_space": false,
    "applies_to_hotel": true,
    "applies_to_room_type": false
  }]
}
```

### `GET /reference/hotel-types` — **Deferred to Phase 4**

Not implemented in Phase 3 M3. Requires hospitality schema (`hotel_type` enum/table). This is an intentional deferral, not a broken endpoint.

---

## 7. Vacation Rentals — Host Endpoints

### `GET /me/vacation-rentals`
List own vacation rentals (excludes soft-deleted). Cursor pagination: `?limit=20&cursor=<uuid>`.

**Response (M4):** `{ "data": [ VacationRentalListing, ... ], "meta": { "next_cursor": "uuid" | null } }`

Each listing includes `vacation_rental_type` (wire name), `location: { lat, lng }`, and `*_cents` fields as **strings**.

### `POST /me/vacation-rentals`
**v2 expanded**:
```json
{
  "vacation_rental_type": "house",
  "title_ar": "...",
  "title_en": "...",
  "description_ar": "...",
  "description_en": "...",
  "governorate": "دمشق",
  "city": "Damascus",
  "neighborhood": "Old City",
  "address_line": "...",
  "location": { "lat": 33.5, "lng": 36.3 },
  "location_precision": "approximate",
  "max_guests": 4,
  "bedrooms_count": 2,
  "beds_count": 3,
  "bathrooms_count": 1.5,
  "area_sqm": 120,
  "base_price_cents": 5000,
  "weekly_price_cents": 4200,
  "monthly_price_cents": 3500,
  "weekend_uplift_pct": 20,
  "cleaning_fee_cents": 500,
  "minimum_stay_nights": 1,
  "commission_passthrough": false,
  "booking_mode": "request",
  "cancellation_policy": "medium",
  "amenity_ids": ["uuid"]
}
```

### `GET /me/vacation-rentals/:id`
Returns one listing owned by the current host. Cross-host access returns **404** `VACATION_RENTAL_NOT_FOUND` (no existence leak).

**Response** (snake_case; money as string; location as `{ lat, lng }`):

```json
{
  "data": {
    "id": "uuid",
    "host_id": "uuid",
    "vacation_rental_type": "house",
    "status": "draft",
    "title_ar": "...",
    "location": { "lat": 33.5, "lng": 36.3 },
    "base_price_cents": "5000",
    "cleaning_fee_cents": "500",
    "booking_mode": "request",
    "cancellation_policy": "medium"
  }
}
```

### `PATCH /me/vacation-rentals/:id`
Partial update. Allowed only when `status` is `draft` or `rejected`. Returns **422** `VACATION_RENTAL_NOT_EDITABLE` otherwise. `host_id` and `status` cannot be set via body.

### `POST /me/vacation-rentals/:id/submit-for-review`
**Deferred (M7)** — not implemented in M4.

### `POST /me/vacation-rentals/:id/pause`
**Deferred (M7)** — not implemented in M4.

### `POST /me/vacation-rentals/:id/resume`
**Deferred (M7)** — not implemented in M4.

### `DELETE /me/vacation-rentals/:id`
Soft delete (`deleted_at` set). Allowed only for `draft` or `rejected`. **422** for `published`, `pending_review`, or `paused`. Returns `{ "data": { "id": "...", "deleted": true } }`.

### `PATCH /me/vacation-rentals/:id/commission-passthrough` — NEW v2
Toggles the commission passthrough setting.
```json
{ "commission_passthrough": true }
```
Returns 422 if the vacation rental has active confirmed bookings.

### `POST /me/vacation-rentals/:id/spaces` — NEW v2
Add a space (bedroom, bathroom, kitchen, etc.).
```json
{
  "space_type": "bedroom",
  "label_ar": "غرفة النوم الرئيسية",
  "label_en": "Master Bedroom",
  "description_ar": "...",
  "beds": [{"type": "queen", "count": 1}],
  "has_ensuite": true,
  "area_sqm": 16,
  "amenity_ids": ["uuid"]
}
```

### `GET /me/vacation-rentals/:id/spaces`
### `PATCH /me/vacation-rentals/:id/spaces/:space_id`
### `DELETE /me/vacation-rentals/:id/spaces/:space_id`
### `POST /me/vacation-rentals/:id/spaces/reorder` — body: `{ "ordered_ids": [...] }`

### `POST /me/vacation-rentals/:id/spaces/:space_id/images`
Multipart upload (per-space images).

### `DELETE /me/vacation-rentals/:id/spaces/:space_id/images/:image_id`

### `POST /me/vacation-rentals/:id/images`
Property-wide hero/cover gallery.

### `DELETE /me/vacation-rentals/:id/images/:image_id`
### `PATCH /me/vacation-rentals/:id/images/reorder`

### `GET /me/vacation-rentals/:id/availability`
### `POST /me/vacation-rentals/:id/availability/block`
**v2 expanded** (records reduction event for risk scoring):
```json
{
  "starts_on": "2026-06-01",
  "ends_on": "2026-06-15",
  "reason": "personal_use",        // NEW: required from enum
  "reason_note": "زيارة عائلية"
}
```

### `POST /me/vacation-rentals/:id/pricing-overrides`
**v2 expanded**:
```json
{
  "starts_on": "2026-07-01",
  "ends_on": "2026-08-31",
  "base_price_cents": 6500,
  "weekly_price_cents": 5500,
  "monthly_price_cents": 4500,
  "label_ar": "موسم الصيف",
  "label_en": "Summer Season",
  "season_type": "summer"
}
```

### `GET /me/vacation-rentals/:id/pricing-overrides`
### `DELETE /me/vacation-rentals/:id/pricing-overrides/:override_id`

### `GET /me/vacation-rentals/:id/pricing-suggestions` — NEW v2
Returns active suggestions for this property.

### `POST /me/vacation-rentals/:id/pricing-suggestions/:sug_id/accept`
### `POST /me/vacation-rentals/:id/pricing-suggestions/:sug_id/dismiss`

---

## 8. Hotels — Hospitality (Host Endpoints) — NEW v2

### `GET /me/hotels`
List own hotels.

### `POST /me/hotels`
```json
{
  "hotel_type": "hotel",
  "name_ar": "فندق الشام الكبير",
  "name_en": "Grand Sham Hotel",
  "description_ar": "...",
  "description_en": "...",
  "star_rating": 4,
  "governorate": "دمشق",
  "city": "Damascus",
  "neighborhood": "Mezzeh",
  "address_line": "شارع كذا، رقم 5",
  "location": { "lat": 33.5, "lng": 36.3 },
  "floors_count": 8,
  "year_built": 2010,
  "year_renovated": 2022,
  "checkin_from": "14:00",
  "checkin_to": "23:00",
  "checkout_from": "06:00",
  "checkout_to": "12:00",
  "accepts_children": true,
  "accepts_pets": false,
  "smoking_policy": "designated_areas",
  "languages_spoken": ["ar", "en", "fr"],
  "commission_passthrough": false,
  "default_cancellation_policy": "medium"
}
```

### `GET /me/hotels/:id`
### `PATCH /me/hotels/:id`
### `POST /me/hotels/:id/submit-for-review`
### `POST /me/hotels/:id/pause`
### `POST /me/hotels/:id/resume`
### `DELETE /me/hotels/:id`

### `PATCH /me/hotels/:id/commission-passthrough`

### `POST /me/hotels/:id/images`
Multipart, with `category` field (lobby/restaurant/exterior/etc.).

### `DELETE /me/hotels/:id/images/:image_id`
### `PATCH /me/hotels/:id/images/reorder`

### `GET /me/hotels/:id/amenities`
### `POST /me/hotels/:id/amenities`
```json
{
  "amenity_id": "uuid",
  "is_free": false,
  "fee_cents": 500,
  "notes_ar": "إفطار بوفيه مفتوح"
}
```

### `DELETE /me/hotels/:id/amenities/:amenity_id`

### `GET /me/hotels/:id/room-types`

### `POST /me/hotels/:id/room-types`
```json
{
  "name_ar": "غرفة دبل ستاندرد",
  "name_en": "Standard Double Room",
  "description_ar": "...",
  "code": "DBL-STD",
  "total_units": 5,
  "max_occupancy": 2,
  "max_adults": 2,
  "max_children": 0,
  "beds": [{"type": "double", "count": 1}],
  "area_sqm": 22,
  "base_price_cents": 6000,
  "weekly_price_cents": 5400,
  "monthly_price_cents": 4500,
  "weekend_uplift_pct": 0,
  "breakfast_included": true,
  "cancellation_policy": null,
  "amenity_ids": ["uuid"]
}
```
*Backend creates `total_units` rows in `room_units` automatically.*

### `GET /me/hotels/:id/room-types/:rt_id`
### `PATCH /me/hotels/:id/room-types/:rt_id`
### `DELETE /me/hotels/:id/room-types/:rt_id`

### `POST /me/hotels/:id/room-types/:rt_id/images`
### `DELETE /me/hotels/:id/room-types/:rt_id/images/:image_id`

### `GET /me/hotels/:id/room-types/:rt_id/units`
List physical units.

### `PATCH /me/hotels/:id/room-types/:rt_id/units/:unit_id`
Edit a single unit (number, floor, active flag).

### `POST /me/hotels/:id/room-types/:rt_id/units/:unit_id/block`
Block a specific unit for dates (with reason).

### `POST /me/hotels/:id/room-types/:rt_id/pricing-overrides`
### `GET /me/hotels/:id/room-types/:rt_id/pricing-suggestions`

---

## 9. Public Browsing — Unified

### `GET /search`
**NEW v2**: Single search endpoint. Returns mixed results unless filtered.

```
?q=damascus
&kind=all                      // 'all' (default), 'vacation_rentals', 'hospitality'
&city=Damascus
&governorate=دمشق
&type=house,apartment           // for vacation_rentals (see vacation_rental_type enum)
&hotel_type=hotel,resort        // for hospitality
&star_rating=4,5                // hospitality only
&check_in=2026-06-01
&check_out=2026-06-05
&adults=2
&children=1
&min_price=20
&max_price=200
&amenities=wifi,parking
&sort=relevance|price_asc|price_desc|rating|newest
&limit=20
&cursor=...
```

Each result item has a `kind` field: `"vacation_rentals"` or `"hospitality"`.

### `GET /search/map`
Lightweight: returns coordinates + price + cover only, optimized for map display.

### `GET /search/suggestions`
Type-ahead for cities, neighborhoods, popular hotels.

---

## 10. Public Vacation Rental Endpoints

### `GET /vacation-rentals/:id`
Full detail. Includes embedded `spaces` (with images/amenities), `host` summary, `reviews_summary`.

### `GET /vacation-rentals/:id/availability`
Date ranges blocked for next 12 months.

### `GET /vacation-rentals/:id/quote`
**v2 expanded** (returns full breakdown):
```
?check_in=2026-06-01&check_out=2026-06-05&adults=2&children=0
```
Response:
```json
{
  "data": {
    "vacation_rental_id": "...",
    "check_in": "2026-06-01",
    "check_out": "2026-06-05",
    "nights": 4,
    "available": true,
    "tier_used": "weekly",
    "nightly_rate_cents": 4200,
    "nights_subtotal_cents": 16800,
    "cleaning_fee_cents": 500,
    "discount_cents": 0,
    "listing_subtotal_cents": 17300,
    "service_fee_cents": 346,
    "service_fee_basis_points": 200,
    "guest_total_cents": 17646,
    "currency": "USD"
  }
}
```
Note: NO commission shown to public.

### `GET /vacation-rentals/:id/reviews`
Paginated reviews (listing + host ratings shown separately).

### `GET /vacation-rentals/:id/nearby` — NEW v2
Returns nearby attractions within 2km, with distance.
```
?radius_meters=2000&categories=restaurant,mosque,park
```

---

## 11. Public Hotel Endpoints — NEW v2

### `GET /hotels/:id`
Full detail. Returns hotel info + list of room types (without dates) + amenities + image gallery.

### `GET /hotels/:id/availability`
**Date-aware availability per room type:**
```
?check_in=2026-06-01&check_out=2026-06-05&adults=2&children=0&rooms=1
```
Response:
```json
{
  "data": {
    "hotel_id": "...",
    "check_in": "...",
    "nights": 4,
    "room_types_available": [
      {
        "room_type_id": "...",
        "name_ar": "غرفة دبل ستاندرد",
        "available_units": 3,
        "total_units": 5,
        "tier_used": "weekly",
        "nightly_rate_cents": 5400,
        "nights_subtotal_cents": 21600,
        "service_fee_cents": 432,
        "guest_total_cents": 22032,
        "scarcity_signal": null
      },
      {
        "room_type_id": "...",
        "name_ar": "جناح عائلي",
        "available_units": 1,
        "total_units": 2,
        "nightly_rate_cents": 12000,
        "nights_subtotal_cents": 48000,
        "service_fee_cents": 960,
        "guest_total_cents": 48960,
        "scarcity_signal": "last_unit_at_this_price"
      }
    ]
  }
}
```

### `GET /hotels/:id/reviews`

### `GET /hotels/:id/nearby` — same as vacation-rentals

### `GET /hotels/:id/upgrades` — NEW v2
For a given selected room type and dates, returns upgrade options.
```
?room_type_id=...&check_in=...&check_out=...
```
Response:
```json
{
  "data": [
    {
      "upgrade_to_room_type_id": "...",
      "name_ar": "غرفة دبل سوبيريور",
      "extra_per_night_cents": 1500,
      "extra_total_cents": 6000,
      "highlight": "إطلالة على الحديقة + شرفة"
    }
  ]
}
```

---

## 12. Host Profiles (Public) — NEW v2

### `GET /hosts/:id`
Public profile of a host.
```json
{
  "data": {
    "id": "...",
    "display_name": "محمد أحمد",
    "host_category": "vacation_rentals",
    "host_subtype": "individual",
    "is_verified": true,
    "verified_at": "...",
    "host_since": "2024-01-15",
    "bio_ar": "...",
    "average_rating": 4.8,
    "total_reviews": 124,
    "response_rate": 98,
    "response_time_minutes": 30,
    "total_listings": 8
  }
}
```

### `GET /hosts/:id/listings`
Returns all vacation rentals + hotels of this host.

### `GET /hosts/:id/reviews`
Reviews of the host (separate from listing reviews).

---

## 13. Bookings

### `POST /bookings`
**v2 polymorphic**:
```json
// For vacation_rentals
{
  "kind": "vacation_rentals",
  "vacation_rental_id": "...",
  "check_in": "2026-06-01",
  "check_out": "2026-06-05",
  "adults": 2,
  "children": 1,
  "guest_message": "..."
}

// For hospitality
{
  "kind": "hospitality",
  "hotel_id": "...",
  "room_type_id": "...",
  "rooms_count": 2,
  "check_in": "2026-06-01",
  "check_out": "2026-06-05",
  "adults": 4,
  "children": 0,
  "guest_message": "...",
  "upgrade_from_room_type_id": null     // if accepted upgrade
}
```

### `GET /me/bookings`
### `GET /me/bookings/:id`
### `POST /me/bookings/:id/cancel`

### `GET /me/host/bookings`
### `POST /me/host/bookings/:id/approve`
### `POST /me/host/bookings/:id/decline`
### `POST /me/host/bookings/:id/check-in`

---

## 14. Payments
*(Same as v1 — Sham Cash, MTN Cash, Manual, International endpoints. Webhooks unchanged.)*

---

## 15. Wallet (Host)
*(Same as v1)*

---

## 16. Reviews

### `POST /me/bookings/:id/review`
**v2 expanded** — separate ratings for property and host:
```json
{
  // Property/hotel rating (or skip section if reviewing as host)
  "property_or_hotel_rating": 5,
  "cleanliness": 5,
  "accuracy": 5,
  "location_rating": 4,
  "value": 5,
  "facilities": 5,                   // hotels only
  // Host rating
  "host_rating": 5,
  "host_communication": 5,
  "host_responsiveness": 5,
  "host_hospitality": 5,
  // Comment
  "comment": "..."
}
```
Backend creates two `reviews` rows: one with `review_target='property'` (or `'hotel'`) and one with `review_target='host'`.

### `POST /me/reviews/:id/respond`

---

## 17. Chat / Messages
*(Same as v1)*

---

## 18. Notifications
*(Same as v1, with new notification types from the schema)*

---

## 19. Wishlists (with sharing) — UPDATED v2

### `GET /me/wishlists`
### `POST /me/wishlists`
### `PATCH /me/wishlists/:id`
### `DELETE /me/wishlists/:id`

### `POST /me/wishlists/:id/items`
**v2 polymorphic**:
```json
{
  "kind": "vacation_rentals",
  "vacation_rental_id": "..."          // OR hotel_id, OR room_type_id
}
```

### `DELETE /me/wishlists/:id/items/:item_id`

### `POST /me/wishlists/:id/share` — NEW v2
Generates a share token.
```json
// Response
{ "data": { "share_url": "https://suknaa.com/wishlists/shared/<token>" } }
```

### `DELETE /me/wishlists/:id/share` — Revokes the share

### `GET /wishlists/shared/:token` — Public, no auth
Returns wishlist for viewing.

### `POST /me/wishlists/:id/collaborators` — NEW (Phase 5+)
Invite a user to collaborate.

---

## 20. Comparisons — NEW v2

### `POST /me/comparisons`
Add an item to comparison.
```json
{ "kind": "vacation_rentals", "id": "..." }
```

### `GET /me/comparisons/current`
Returns current comparison session (up to 4 items).

### `DELETE /me/comparisons/current/items/:item_id`
### `DELETE /me/comparisons/current`
Clear all.

---

## 21. Price Alerts — NEW v2

### `POST /me/price-alerts`
```json
{
  "kind": "vacation_rentals",
  "vacation_rental_id": "...",
  "alert_when": "price_below",
  "target_price_cents": 4000
}
```

### `GET /me/price-alerts`
### `PATCH /me/price-alerts/:id`
### `DELETE /me/price-alerts/:id`

---

## 22. Pricing Intelligence (Host) — NEW v2

### `GET /me/pricing-suggestions`
All suggestions for the host's listings.

### `POST /me/pricing-suggestions/:id/accept`
Applies the suggested price (updates the property/room_type).

### `POST /me/pricing-suggestions/:id/dismiss`

### `GET /me/market-insights`
Aggregate insights about the host's market areas.
```
?city=Damascus&kind=vacation_rentals
```

---

## 23. Admin Endpoints

### KYC
- `GET /admin/kyc/queue`
- `POST /admin/kyc/:id/approve`
- `POST /admin/kyc/:id/reject`

### Listings
- `GET /admin/vacation-rentals/queue`
- `POST /admin/vacation-rentals/:id/approve`
- `POST /admin/vacation-rentals/:id/reject`
- `GET /admin/hotels/queue` — NEW v2
- `POST /admin/hotels/:id/approve` — NEW v2
- `POST /admin/hotels/:id/reject` — NEW v2

### Bookings
- `GET /admin/bookings`
- `POST /admin/bookings/:id/refund`

### Manual Payments / Withdrawals / Disputes
*(Same as v1)*

### Financial Rules
Financial values are rules, not fixed constants. Commission/service/tax/discount endpoints can be implemented as separate resources or a unified financial-rules API, but must support audit logs, effective dates, scopes, permission checks, and booking snapshots.

- `GET /admin/commission-rates`
- `POST /admin/commission-rates`
- `PATCH /admin/commission-rates/:id`
- `GET /admin/service-fee-rates` — NEW v2
- `POST /admin/service-fee-rates` — NEW v2
- `PATCH /admin/service-fee-rates/:id` — NEW v2
- `GET /admin/tax-rules` — host/hotel-entered and admin-entered rules
- `POST /admin/tax-rules`
- `PATCH /admin/tax-rules/:id`
- `POST /admin/tax-rules/:id/approve`
- `POST /admin/tax-rules/:id/reject`
- `GET /admin/discount-codes`
- `POST /admin/discount-codes`
- `PATCH /admin/discount-codes/:id`
- `POST /admin/bookings/:id/financial-override` — audited manual exception for authorized staff only

### Anti-Circumvention — NEW v2
- `GET /admin/anti-circumvention/queue`
  Lists `availability_reduction_events` with `triggered_admin_review = true`
- `POST /admin/anti-circumvention/events/:id/decision`
  ```json
  { "decision": "warned", "note": "..." }
  ```
- `GET /admin/hosts/:id/risk-signals`
- `POST /admin/hosts/:id/recompute-risk`

### Price Intelligence — NEW v2
- `GET /admin/market-snapshots`
- `POST /admin/market-snapshots/recompute` (manual trigger)
- `GET /admin/pricing-suggestions/stats` (engagement metrics)

### Nearby Attractions — NEW v2
- `GET /admin/attractions`
- `POST /admin/attractions`
- `PATCH /admin/attractions/:id`
- `DELETE /admin/attractions/:id`
- `POST /admin/attractions/import-osm` (bulk import from OpenStreetMap)

### Reports
- `GET /admin/reports/bookings`
- `GET /admin/reports/revenue`
- `GET /admin/reports/hosts`
- `GET /admin/reports/pricing-suggestions-effectiveness` — NEW v2
- `GET /admin/reports/anti-circumvention` — NEW v2

---

## 24. WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `message:new` | Server → Client | message object |
| `message:read` | Server → Client | `{ message_id, read_at }` |
| `notification:new` | Server → Client | notification object |
| `typing:start` | Both | `{ conversation_id }` |
| `typing:stop` | Both | `{ conversation_id }` |
| `booking:status_changed` | Server → Client | `{ booking_id, status }` |
| `availability:changed` | Server → Client | NEW v2: `{ entity_kind, entity_id, dates }` — for date pickers to refresh |

---

## 25. Error Codes (Sample, expanded)

| Code | Meaning |
|---|---|
| `INVALID_CREDENTIALS` | Login failed |
| `EMAIL_ALREADY_EXISTS` | Signup with existing email |
| `OTP_EXPIRED`, `OTP_INVALID`, `OTP_MAX_ATTEMPTS` | OTP issues |
| `2FA_REQUIRED` | Login needs 2FA |
| `KYC_REQUIRED`, `KYC_PENDING` | Host action requires KYC |
| `WRONG_HOST_CATEGORY` | NEW v2: category mismatch (e.g. vacation rental host calling a hotel-only endpoint, or vice versa) |
| `PROPERTY_NOT_AVAILABLE`, `ROOM_TYPE_NOT_AVAILABLE` | Dates booked |
| `INSUFFICIENT_INVENTORY` | NEW v2: requested rooms_count > available_units |
| `COMMISSION_PASSTHROUGH_LOCKED` | NEW v2: cannot toggle while active bookings exist |
| `INSUFFICIENT_PERMISSIONS` | Permission/capability denial |
| `RATE_LIMITED` | Too many requests |
| `PAYMENT_PROVIDER_ERROR` | Provider returned error |
| `WALLET_INSUFFICIENT` | Withdrawal > available |
| `BLOCKED_CONTENT` | Detected blocked pattern |
| `BOOKING_CANNOT_BE_CANCELLED` | Outside cancellation window |
| `IDEMPOTENCY_KEY_REUSED` | Different payload, same idempotency key |
| `PRICING_TIER_INVALID` | NEW v2: weekly/monthly price not less than base |
| `STAR_RATING_INVALID` | NEW v2: hotel star_rating must be 1–5 |
| `INVENTORY_REDUCTION_REASON_REQUIRED` | NEW v2: must provide reason for reducing availability |
| `RISK_LIMIT_EXCEEDED` | NEW v2: host's risk score blocks the action |

Full list maintained in `apps/api/src/shared/errors.ts`.
