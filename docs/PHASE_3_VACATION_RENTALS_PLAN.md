# Phase 3 Vacation Rentals Plan

> **Status: Ready to start**  
> Date: 2026-05-13  
> Scope: build the end-to-end **Vacation Rentals / Holiday Homes** system.

## Product Naming Decision

Phase 3 is not a general real-estate marketplace. Suknaa is building short-stay rental supply: houses, apartments, villas, farms, cabins, chalets, and studios that guests book as stays.

Use these terms from Phase 3 onward:

| Context | Preferred Arabic | Preferred English |
|---|---|---|
| Product area | بيوت العطلات | Vacation Rentals / Holiday Homes |
| One listing | بيت عطلات | Vacation rental / holiday home |
| Host | مضيف بيوت عطلات | Vacation rental host |
| Guest action | حجز إقامة | Book a stay |

Avoid these terms for user-facing product copy:

- عقارات
- Real Estate
- RE
- Property owner, unless the context is legal ownership proof

Technical naming should also move toward the product domain:

- API/module names: prefer `vacation-rentals` over `real-estate`.
- Domain names: prefer `vacationRental` over `realEstate`.
- Database naming: Phase 3 M1 must decide and document the final table naming before migrations are written. Because the app is not in production yet, renaming from `properties`/`real_estate` concepts to `vacation_rentals` is still practical.

## Current Verified State

M0 has been completed by Mohammad on 2026-05-13.

Command:

```powershell
npx pnpm@9.15.4 verify:phase2.5
```

Recorded result:

- `web lint`: passed
- `web build`: passed, 57 routes generated
- `api lint`: passed
- `api build`: passed
- `api prisma validate`: passed
- `api test`: passed, 11/11 auth tests
- Final script result: `[verify:phase2.5] All steps passed.`

## Phase 3 Goal

A vacation rental host can create a real holiday-home listing with location, spaces/rooms, amenities, photos, pricing, rules, and availability. An admin can review it. A guest can find it through search, view a complete listing page, inspect the map, and understand availability.

Bookings and payments stay mostly for Phase 5. Phase 3 may display availability and pricing, but it should not build the full payment flow.

## Milestones

### M0 - Pre-Phase Health Gate

**Status:** Completed 2026-05-13.

Purpose: prove the Phase 2.5 base is healthy before adding the vacation rentals domain.

Acceptance criteria:

- `npx pnpm@9.15.4 verify:phase2.5` passes.
- Any failures are fixed before Phase 3 schema or UI work starts.

### M1 - Domain Naming And Contracts

Purpose: remove the misleading Real Estate terminology before building new surface area.

Scope:

- Update planning docs to use **Vacation Rentals / Holiday Homes**.
- Decide final internal naming for API paths, modules, DTOs, and database tables.
- Decide whether existing frontend routes like `/property/[id]` become `/vacation-rentals/[id]` now or in a compatibility step.
- Update shared type names before they spread into more code.

Acceptance criteria:

- No new Phase 3 code uses `real-estate`, `real_estate`, or `RE` as the domain name.
- Any intentionally retained legacy name is documented with a migration reason.
- Future agents know the correct domain term from `BUILD_PLAN`, this file, and project rules.

### M2 - Database Schema And Migration

Purpose: add the persistent vacation rentals data model.

Scope:

- Listing table for vacation rentals.
- Spaces/rooms table for bedrooms, bathrooms, kitchens, living rooms, outdoor spaces, and other areas.
- Listing images and space images.
- Amenities plus listing/space amenity joins.
- Availability blocks.
- Pricing overrides.
- PostGIS location storage and indexes.
- Status lifecycle: `draft`, `pending_review`, `published`, `paused`, `rejected`, `archived`.

Acceptance criteria:

- Prisma schema validates.
- Migration applies cleanly on local Postgres.
- Seed data includes vacation rental types and amenities.
- Indexes exist for host ownership, status, city/governorate, and geo search.

### M3 - Reference Data

Purpose: expose stable metadata needed by forms and filters.

Scope:

- Vacation rental types.
- Space types.
- Amenity catalogue with flags for listing-level and space-level usage.
- Cancellation policies and booking modes if needed by the wizard.

Acceptance criteria:

- Public reference endpoints return localized Arabic/English labels.
- Responses can be cached safely.
- Frontend can render type and amenity pickers without hardcoded mock lists.

### M4 - Host Vacation Rental CRUD

Purpose: let an authenticated host create and manage draft listings.

Scope:

- List own vacation rentals.
- Create draft.
- Get one listing.
- Patch editable fields.
- Soft-delete/archive when appropriate.
- Ownership checks.
- Basic audit events for important state changes.

Acceptance criteria:

- Non-host users cannot create listings.
- Hosts can only access their own drafts/listings.
- Validation rejects incomplete or invalid location, capacity, and pricing values.

### M5 - Spaces, Amenities, Pricing, And Availability

Purpose: complete the core listing content beyond the top-level record.

Scope:

- Add/edit/delete spaces.
- Reorder spaces.
- Attach listing-level amenities.
- Attach space-level amenities.
- Add availability blocks.
- Add pricing overrides.
- Commission passthrough setting with clear internal semantics.

Acceptance criteria:

- A listing can represent bedroom and bathroom breakdowns accurately.
- Availability block ranges are validated.
- Pricing override ranges are validated.
- Derived summary counts can be checked against spaces.

### M6 - Image Upload And Optimization

Purpose: support real listing media.

Scope:

- Upload listing-wide images.
- Upload per-space images.
- Store via MinIO.
- Generate optimized sizes with `sharp` such as original, large, medium, small.
- Store dimensions, alt text, order, and cover image.

Acceptance criteria:

- Uploads reject unsafe file types and oversized files.
- Optimized image records are persisted.
- Exactly one cover image is allowed per listing.
- Deleting a listing or space cleans owned image records safely.

### M7 - Admin Review Queue

Purpose: prevent unreviewed listings from being publicly searchable.

Scope:

- Admin queue for `pending_review`.
- Approve and reject actions.
- Rejection reason.
- Audit log for every review decision.

Acceptance criteria:

- Submitted listings are not public until approved.
- Published listings appear in search.
- Rejected listings return to host with a reason.

### M8 - Search API

Purpose: guests can find published vacation rentals from real database records.

Scope:

- Text search.
- Geographic search with PostGIS.
- Filters: type, bedrooms, bathrooms, capacity, amenities, date range, price range.
- Sort: relevance, price ascending/descending, rating/newest where data exists.
- Cursor pagination.
- Redis cache with short TTL, around 60 seconds.

Acceptance criteria:

- Only `published` and non-deleted listings are returned.
- Date filters exclude blocked ranges.
- Search returns enough data for result cards and map markers.
- Cached responses invalidate or expire predictably.

### M9 - Host Creation Wizard

Purpose: provide the host-side UI for creating a complete holiday-home listing.

Steps:

1. Type
2. Location with map picker
3. Basic information and capacity
4. Spaces/rooms breakdown
5. Listing-wide amenities
6. Photo gallery
7. Pricing
8. Commission passthrough
9. House rules and cancellation policy
10. Review and submit

Acceptance criteria:

- Wizard saves progress as draft.
- Required fields are enforced before submit.
- Review step shows exactly what will be submitted.
- Submit changes status to `pending_review`.

### M10 - Guest Search And Detail UI

Purpose: replace mock vacation rental browsing with API-backed pages.

Scope:

- Search results page uses real API data.
- Listing detail page uses real API data.
- Map display uses real coordinates.
- Availability calendar displays real blocked dates.
- Existing visual direction is preserved, but copy changes to بيوت العطلات.

Acceptance criteria:

- A guest can search and open a complete listing page.
- Empty, loading, and error states are handled.
- Mobile and desktop layouts remain usable.

### M11 - Phase 3 Verification Gate

Purpose: create a repeatable check before Phase 3 is marked complete.

Scope:

- API lint/build.
- Web lint/build.
- Prisma validate.
- Focused tests for vacation rental creation, submission, admin approval, and search.
- Seed verification for reference data.

Acceptance criteria:

- One root command verifies Phase 3 health.
- The command is documented in this file and `PHASE_2_TRACKER.md`.
- The final gate passes before Phase 3 is closed.

## Non-Goals

- Full booking and payment flow. That belongs to Phase 5.
- Hospitality/hotel creation flow. That belongs to Phase 4.
- Full reviews, chat, and host wallet. Those belong to later phases.
- Large visual redesign unrelated to vacation rental creation/search.
- Production SEO work beyond preserving functional page metadata.

## Exit Criteria

Phase 3 is complete when:

- A verified vacation rental host can create a complete holiday-home listing.
- The listing includes spaces/rooms, amenities, images, pricing, location, rules, and availability.
- An admin can approve or reject the listing.
- A guest can find the approved listing through search.
- A guest can open a complete listing detail page with map and availability data.
- The Phase 3 verification gate passes.
