# 📘 COMPREHENSION REPORT — Suknaa (سُكنى)

> **Author**: AI assistant (initial deep-read pass)
> **Source of truth**: `/docs/*.md` (10 files, v2 — moved into the canonical location on 2026-04-30; v1 has been deleted; the temporary `docs/mnt/` path no longer exists).
> **Project rules file**: `.cursor/rules/suknaa.mdc` (loaded automatically via `alwaysApply: true`).
> **Date**: 2026-04-30 (updated after workspace cleanup)
> **Purpose**: Prove I've understood the project before writing a single line of code.

---

## 1. Project Summary (≈ 300 words)

**Suknaa (سُكنى)** is a Syria-first rental platform that does something deliberately ambitious: it operates as **two integrated but architecturally separate systems** under one brand at `suknaa.com`.

The first system is **Real Estate (P2P)** — modeled after Airbnb. An individual or a real-estate office lists a single property (house, apartment, villa, farm, cabin, chalet, studio). Each property is described room-by-room: each bedroom has its own bed configuration, photos, and amenities; bathrooms, kitchens, gardens, pool areas are each a `property_space` with its own data. The whole property rents as a single unit.

The second system is **Hospitality (B2B)** — modeled after Booking.com. A registered hotel company lists one *establishment* with multiple **room types** (e.g., "Standard Double", "Family Suite"). Each room type has a count and a price; the system tracks individual physical units (`room_units`) for inventory accuracy and audit. A guest books one or more rooms of a given type for given dates.

These two systems share a single auth layer, a single user model (a person can be both guest and host), a single polymorphic `bookings` table, and a single payment/wallet pipeline — but they have **separate tables, separate endpoints, separate NestJS modules, and separate UI flows**. The public site shows a permanent three-tab bar: `[الكل] [عقارات] [فنادق]` so the user always knows which system they are inside.

**Audience**: Syrian families looking for vacation homes, returning expatriates, foreign tourists, and business travelers — plus the hosts who serve them (individuals, real-estate offices, hotel companies).

**Business model**: Suknaa earns from two streams. (1) **Commission** charged to hosts (default ~12% on real-estate, ~8% on hotels, configurable per scope); the host can choose to absorb it or pass it through to the guest's displayed price. The **guest's invoice never mentions commission**. (2) A **service fee** (~2%, separately configurable) which is *always* visible to the guest as a transparent line item. This separation lets us run "0% commission" promos for hosts without losing all revenue.

---

## 2. Critical Architectural Decisions

### 2.1 Why Next.js 14 + NestJS + PostgreSQL?
- **TypeScript end-to-end** lets us share Zod schemas/DTOs between frontend and backend (`packages/types`). One source of truth for shape and validation.
- **Next.js 14 App Router** gives us SSR/streaming for slow Syrian connections, built-in i18n (`/ar/...`, `/en/...`), strong SEO, and a free path to PWA.
- **NestJS 10** enforces a modular folder structure (modules + services + controllers + DI) — exactly the kind of code AI assistants generate well. The dual-domain layout (`real-estate/` next to `hospitality/`) maps cleanly onto NestJS modules.
- **PostgreSQL 16 + PostGIS** because bookings, payments, and inventory are inherently relational. PostGIS gives us city/radius search natively. Prisma is the ORM (best type generation in the JS ecosystem; migration system that doesn't fight you).
- **Modular monolith** (not microservices) for Phase 1: one VPS, simple deploy, low cost. Section 9 of `ARCHITECTURE.md` documents the scale-out path when traffic warrants it.

### 2.2 Why are hotels in a separate database table from properties?
Houses and hotels are *not* the same product:
- A property is **one bookable unit**; a hotel is **one establishment with N bookable room types each with M physical units**.
- Properties have **per-room *spaces*** (purely descriptive: "this bedroom has a queen bed"); hotels have **per-room *types*** (each one is a separate inventory and price row).
- Date-aware availability is done at the property level for real estate but at the **room-unit** level for hospitality (5 doubles → 5 rows in `room_units`, each with its own availability blocks).
- The query patterns, the hosting onboarding flow, the KYC documents required, the cancellation policies, even the search filters are different.
- Cramming both into a single `properties` table would require a forest of nullable columns and runtime branches — exactly the kind of code that breeds bugs and slows AI assistants.
- Therefore: `properties` + `property_spaces` + `property_space_images` + `property_availability_blocks` + `property_pricing_overrides` for real estate; `hotels` + `room_types` + `room_units` + `room_unit_availability_blocks` + `room_type_pricing_overrides` for hospitality. Cleanly separated.

### 2.3 Why polymorphic bookings?
The booking *lifecycle* is identical for both domains: pending_payment → confirmed → checked_in → completed (or cancelled). The `bookings` table therefore lives in shared territory but uses a **discriminator column** (`booking_kind` enum) and a CHECK constraint:

```sql
CHECK (
    (booking_kind = 'real_estate' AND property_id IS NOT NULL AND hotel_id IS NULL AND room_type_id IS NULL)
 OR (booking_kind = 'hospitality' AND property_id IS NULL AND hotel_id IS NOT NULL AND room_type_id IS NOT NULL)
)
```

The `booking_room_units` join table records which specific physical units were locked for a hospitality booking. The same wallet, payments, reviews, and chat plumbing serves both kinds. This is a deliberate trade-off: one slightly more complex table in exchange for one shared lifecycle and one set of operations.

### 2.4 What is "commission passthrough" and how does it work?
Each host chooses, **per property/hotel**, between two pricing modes:

- **Setting A — "Commission on me"** (default). The host writes the price they want guests to *see*. Suknaa keeps the commission out of that price.
- **Setting B — "Pass commission to guest"**. The host writes the **net** they want to *receive*. Suknaa **grosses up** the displayed price so that, after deducting commission, the host nets exactly what they wrote.

In **both** modes, the guest's invoice shows only two lines (plus the subtotals): the property price and the 2% service fee. The word "commission" never appears.

#### Worked numerical example (commission 12%, service fee 2%)

Host writes **$100** in either mode.

| Quantity | Setting A — Absorb | Setting B — Passthrough |
|---|---|---|
| What host wrote | $100.00 | $100.00 |
| **Property price guest sees** | **$100.00** | **$113.64** = `100 / (1 − 0.12)` |
| Service fee (2%) | $2.00 | $2.27 |
| **Guest pays** | **$102.00** | **$115.91** |
| Commission Suknaa keeps | $12.00 | $13.64 |
| **Host receives** | **$88.00** | **$100.00** |

In **both** scenarios Suknaa earns its 12% commission + 2% service fee. The choice only changes who *appears* to pay it. Settings B yields a higher displayed price → property looks more expensive in search → market self-regulates and gently incentivizes Setting A.

The host can switch the toggle at any time *unless* there are active confirmed bookings on that property/hotel. Each booking snapshots `commission_passthrough` so existing bookings always honor the original choice (auditable forever).

---

## 3. Backend Module Map

The NestJS backend lives at `apps/api/src/`. Below is the canonical tree (from `ARCHITECTURE.md` §3.1) with one-line responsibilities.

```
apps/api/src/
├── modules/
│   ├── auth/                       # Login/signup, sessions, OTP, JWT, 2FA, login-intent (guest vs host)
│   ├── users/                      # User profiles + host_profiles (display name, bio, response metrics)
│   ├── kyc/                        # Identity submissions; documents differ per host_category/subtype
│   │
│   ├── real-estate/                # ============ REAL ESTATE DOMAIN ============
│   │   ├── properties/             # Property CRUD, lifecycle (draft → published)
│   │   ├── property-spaces/        # Per-room spaces (bedroom/bathroom/kitchen/...) + images + amenities
│   │   ├── property-availability/  # Availability blocks + seasonal pricing overrides for properties
│   │   └── real-estate.module.ts
│   │
│   ├── hospitality/                # ============ HOSPITALITY DOMAIN ============
│   │   ├── hotels/                 # Hotel CRUD, lifecycle, hotel-wide images + amenities
│   │   ├── room-types/             # Room-type templates (price, capacity, beds, total_units)
│   │   ├── room-units/             # Physical units (Room 305) + per-unit blocks + admin actions
│   │   ├── room-availability/      # Inventory engine: date-aware "X of Y available"
│   │   └── hospitality.module.ts
│   │
│   ├── search/                     # Unified search across both domains; supports kind=all|real_estate|hospitality
│   │
│   ├── bookings/                   # Polymorphic bookings (real_estate OR hospitality), lifecycle, cancellations
│   ├── payments/                   # Sham Cash + MTN Cash + manual transfer + international gateway + webhooks
│   ├── wallet/                     # Host wallets (pending vs available), wallet_transactions, withdrawal_requests
│   ├── pricing/                    # Pricing engine: 4-tier resolver + commission passthrough math + service fee
│   │
│   ├── reviews/                    # Dual reviews: separate ratings for property/hotel AND for the host
│   ├── chat/                       # Socket.io chat (post-booking only) + regex content moderation
│   ├── notifications/              # In-app + email + SMS + push (FCM)
│   │
│   ├── price-intelligence/         # NEW v2: market_demand_snapshots + pricing_suggestions generator
│   ├── anti-circumvention/         # NEW v2: availability_reduction_events + risk scoring + admin queue
│   ├── nearby-attractions/         # NEW v2: POIs around listings (manual + OpenStreetMap import)
│   ├── wishlists/                  # NEW v2: lists + share tokens + (Phase 5+) collaborators
│   ├── comparisons/                # NEW v2: compare up to 4 listings side-by-side
│   ├── price-alerts/               # NEW v2: notify guest when target conditions hit
│   │
│   ├── admin/                      # Admin endpoints (queues, approvals, configuration, reports)
│   └── webhooks/                   # External webhooks (payment providers, etc.)
│
├── shared/
│   ├── prisma/                     # Prisma client + extensions
│   ├── redis/                      # Redis client + cache helpers
│   ├── storage/                    # MinIO client (uploads, signed URLs)
│   ├── sms/                        # SMS providers abstraction
│   ├── email/                      # Email service
│   ├── audit/                      # Audit log writer (every admin/financial mutation)
│   ├── currency/                   # USD ↔ SYP conversion
│   ├── i18n/                       # Server-side translations
│   └── errors/                     # Typed error classes (mapped to standard error codes)
│
└── main.ts
```

### Why this structure
- **Domain isolation** — `real-estate/` and `hospitality/` are siblings, not parent/child. A bug or misuse in one cannot leak into the other.
- **Shared infrastructure (`auth`, `bookings`, `payments`, `chat`, `wallet`) doesn't know about the domain** — it just sees a polymorphic discriminator.
- **The `pricing/` module is shared** because the 4-tier + commission-passthrough math is identical regardless of whether the target is a property or a room_type. It lives in `apps/api/src/modules/pricing/` and reuses `packages/pricing` (the shared engine package).

---

## 4. Critical Data Flows

### 4.1 Creating a Real-Estate booking

```
Guest opens property page
   │
   ▼  GET /v1/properties/:id/quote?check_in=...&check_out=...&adults=2
NestJS  →  pricing engine:
   1. Pick tier (seasonal override > monthly ≥30n > weekly ≥7n > base)
   2. Apply weekend uplift on Fri/Sat nights
   3. If property.commission_passthrough = true → gross-up displayed price
   4. Compute service_fee = displayed × 2%
   5. Return { property_subtotal, service_fee, guest_total }    ← NO commission in response
   │
   ▼  Guest hits "Book"
POST /v1/bookings  (kind = real_estate, idempotency key)
   │
   ▼  Bookings service:
   - Take advisory DB lock on (property_id, date_range)
   - Re-check no overlap in property_availability_blocks
   - Snapshot commission_basis_points, commission_passthrough, service_fee_basis_points
   - Insert booking row (status = pending_payment, money_flow = escrow)
   - Insert availability_block(reason='booked', booking_id=...)
   - Release lock
   │
   ▼  Payment initiated (Sham Cash / MTN / manual / international)
   │
   ▼  Webhook arrives → status = confirmed
   - Wallet: host pending += host_payout_cents
   - Suknaa revenue: commission_cents + service_fee_cents
   - Notify host + open chat between guest and host
   │
   ▼  Check-in → 24h timer → completed
   - Wallet: host pending −= payout, available += payout
```

### 4.2 Creating a Hospitality booking

```
Guest opens hotel page
   │
   ▼  GET /v1/hotels/:id/availability?check_in=...&check_out=...&rooms=2&adults=4
NestJS hospitality service:
   - For each room_type under the hotel:
       - count active room_units
       - subtract those with overlapping room_unit_availability_blocks
       - if remaining ≥ rooms_count → include in response
   - Compute pricing for each candidate room type (same 4-tier engine + passthrough)
   - Compute scarcity_signal per room type (last_unit_at_this_price, etc.)
   - Return list of room_types_available
   │
   ▼  Guest selects "Standard Double" × 2, hits "Book"
POST /v1/bookings  (kind = hospitality, hotel_id, room_type_id, rooms_count = 2)
   │
   ▼  Bookings service:
   - Take advisory lock on (room_type_id, date_range)
   - Find rooms_count physical units (from room_units WHERE is_active AND no overlap)
   - If insufficient → return INSUFFICIENT_INVENTORY
   - Insert booking + booking_room_units rows for the chosen units
   - Insert room_unit_availability_blocks for each unit
   - money_flow = direct (B2B → host wallet AVAILABLE immediately on payment)
   │
   ▼  Payment → status = confirmed → host wallet credited immediately
```

### 4.3 Money flow (customer → host)

```
RE / Escrow:
    Guest pays $115.91 (passthrough example)
        ↓
    Suknaa keeps $13.64 commission + $2.27 service fee = $15.91
        ↓
    Host wallet: +$100.00 PENDING
    [check-in occurs] → 24h timer → booking completed
        ↓
    Host wallet: PENDING −$100, AVAILABLE +$100

Hospitality / Direct:
    Guest pays $115.91
        ↓
    Suknaa keeps $15.91
        ↓
    Host wallet: +$100.00 AVAILABLE (immediately on payment confirmation)

Withdrawals:
    Auto weekly (Thursdays) or monthly (last day) or manual.
    Min $10. Admin processes manually + uploads transfer proof.
```

In **both flows** the *commission* and *service fee* always stay with Suknaa. What differs is *when* the host's portion becomes withdrawable.

### 4.4 Anti-Circumvention

```
Host wants to take a room off-platform (rents 2 of 5 doubles offline, July 1–14)
   │
   ▼  POST /v1/me/hotels/:id/room-types/:rt/units/:unit/block
        body: { starts_on, ends_on, reason: 'rented_offline', reason_note }
   │
   ▼  anti-circumvention service:
   1. Insert availability_reduction_event with units_blocked, days_affected, reason
   2. event_score = reason_weight × log(1 + days_affected) × log(1 + units_blocked)
      (rented_offline reason_weight = 10 — heavily penalized)
   3. Update host_risk_signals.risk_score (rolling 90-day sum + cancellation rate + blocked_messages + low reviews; cap 100)
   4. Recompute risk_tier: low (0–25) / medium (26–50) / high (51–75) / critical (76–100)
   5. If event score breaches threshold OR statistical anomaly cron flags it
        → triggered_admin_review = true → admin notification
   │
   ▼  Inventory updates (the 2 units actually become unavailable for those dates)
   │
   ▼  Admin review:
        decision ∈ { cleared, warned, penalized, suspended }
        Logged in availability_reduction_events.admin_decision + audit_logs
        Consequence per tier (see PAYMENT_SYSTEM.md §8 / SECURITY.md §6)
```

**Light-touch principle**: never auto-ban; always require admin review. False positives damage trust more than missed positives. Tune scoring conservatively at first.

---

## 5. The 10 Most Important Database Tables

> Names are exact. Read `DATABASE_SCHEMA.md` for the full column list.

| # | Table | One-line purpose |
|---|---|---|
| 1 | `users` | Every person on the platform; flags `is_guest`, `is_host`, `is_admin` (a single user can be more than one). |
| 2 | `host_profiles` | Extended host info: `host_category` (real_estate / hospitality), `host_subtype` (individual / re_office / hotel_company), display name, response metrics, risk signals. |
| 3 | `properties` | Real-estate listings (Airbnb model): one row = one bookable house/villa/farm. Holds the 4 pricing tiers + commission passthrough flag. |
| 4 | `property_spaces` | Per-room descriptions inside a property (bedroom/bathroom/kitchen/garden/...). Each has its own images and amenities. |
| 5 | `hotels` | Hospitality listings (Booking model): one row = one establishment with stars, address, policies, hotel-wide amenities + commission passthrough flag. |
| 6 | `room_types` | Templates inside a hotel ("Standard Double", "Family Suite"). Holds total_units count, capacity, beds, 4 pricing tiers. |
| 7 | `room_units` | Each physical room in a hotel. Inventory = COUNT(active units WHERE no overlapping availability block). Critical for audit + anti-circumvention. |
| 8 | `bookings` | Polymorphic. `booking_kind` discriminates real_estate (uses `property_id`) vs hospitality (uses `hotel_id` + `room_type_id`). Snapshots commission_passthrough, basis points, money_flow, and the full price breakdown. |
| 9 | `wallets` + `wallet_transactions` | Host money: two buckets per host (`pending` vs `available`); every credit/debit is an immutable transaction row. |
| 10 | `availability_reduction_events` + `host_risk_signals` | Anti-circumvention engine: every time a host reduces inventory, a row is recorded with reason; aggregated into a per-host risk score and tier. |

(Honorable mentions: `commission_rates`, `service_fee_rates`, `kyc_submissions`, `reviews`, `audit_logs`, `nearby_attractions`, `pricing_suggestions`, `market_demand_snapshots`.)

---

## 6. Things I Could Get Wrong (Self-Audit — 10 risks)

These are the mistakes I am *most likely* to make as an AI assistant on this codebase. I will treat them as red lights.

1. **Mixing properties and hotels in the same code path.** I might reach for a single "listing" abstraction or write a generic CRUD that touches both `properties` and `hotels`. The architecture explicitly forbids this; they are sibling domains with separate modules and tables.
2. **Showing commission to the guest.** I might add a "commission" or "platform fee" line to the invoice, the quote response, the receipt email, or the receipt PDF. The rule is absolute: the guest only ever sees `property_subtotal + service_fee = guest_total`. The word "commission" must not appear anywhere a guest can see it.
3. **Forgetting category-level authorization.** I might let a real-estate host hit `/me/hotels` (or vice versa). The service layer must check `host_profile.host_category` and return `WRONG_HOST_CATEGORY` (422). The decorator/guard must be applied per route.
4. **Doing money math in floats or incorrect rounding.** All money is `BIGINT` cents. Gross-up math (`price / (1 − 0.12)`) needs careful integer rounding rules. I might introduce floating-point drift or round at the wrong step.
5. **Missing the snapshot on bookings.** I might update commission rates or passthrough on the property/hotel and *not* snapshot them on the booking, breaking auditability for active bookings. Every booking must record `commission_basis_points`, `commission_passthrough`, `service_fee_basis_points`, `money_flow`, `cancellation_policy` at creation time.
6. **Race conditions on hotel inventory.** Two simultaneous bookings for the last unit can both succeed if I forget the advisory DB lock around `(room_type_id, date_range)`. Similarly for properties: lock on `(property_id, date_range)`. Idempotency keys are required on POST /bookings.
7. **Not enforcing "force a reason" on availability reductions.** Skipping `reason` validation on `POST /me/properties/:id/availability/block` (or the hotel equivalent) defeats the entire anti-circumvention engine. Reason is required and must come from a closed enum.
8. **Auto-banning hosts on risk score.** The system must *never* auto-suspend. Even at `risk_tier = critical`, only the admin queue is triggered. Auto-bans destroy trust irreparably.
9. **Returning Arabic-Indic numerals (١٢٣) or pure black backgrounds.** Design system rule: numbers must always be Latin (1, 2, 3) regardless of language; never `#000` — use `#2C2826` charcoal.
10. **Treating Phase 8 features (price intelligence, anti-circumvention scoring, nearby attractions, wishlist sharing, comparisons, price alerts, smart upgrades) as Phase 1–3 work.** They depend on the core systems being live. Building them too early will block launch and starve the foundation.

Bonus risk (#11): **Forgetting that a single user account can be both guest and host.** UI assumes two login buttons but one account; backend must respect `is_guest` and `is_host` flags independently.

---

## 7. Open Questions — Status

All 12 questions raised in the first session have been **answered by Mohammad**. They are now archived in `ai_memory.md` §6 ("القرارات الجديدة") for future reference. Summary of resolutions:

| Topic | Resolution |
|---|---|
| Cursor rules file | Migrated to `.cursor/rules/suknaa.mdc` (modern Project Rules with `alwaysApply: true`); old file deleted. |
| Canonical docs folder | v2 moved to `/docs/` directly; v1 deleted; `docs/mnt/` removed. |
| International payment gateway | **Manual transfer only** at launch. Stripe/Paddle deferred to Phase 11. |
| Sham Cash / MTN Cash | Conversations not yet started — Mohammad's Phase 0 task. |
| Logo SVG | Deferred. PNG sufficient for now; designer to produce SVG later. |
| Domain DNS | `suknaa.com` registered; Cloudflare binding pending — Mohammad's task. |
| Hostinger VPS | KVM 2 (~$7/mo), Frankfurt, Ubuntu 24.04 — Mohammad will provision personally. |
| Mockups workflow | Skip Figma/v0; scaffold Next.js skeleton with placeholders directly (starts in Phase 1). |
| Default rates | **Final**: 12% RE houses/apartments/villas; 10% cabins/farms/chalets/studios/hotel-apartments; 8% hotels/resorts/hostels; 2% service fee global. |
| Beta hosts pipeline | Mohammad to begin outreach with 2–3 known contacts (homes/chalets). |
| Customer support channel | **WhatsApp Business + Email** at launch; in-app ticket system in Phase 7. |
| Admin panel i18n | **English-only initially** (public site stays bilingual). |

### Currently open items (none blocking AI work)

The following are tasks Mohammad is handling himself outside of code work; the AI does not need to act on them:
- Provision Hostinger VPS (KVM 2, Frankfurt).
- Bind `suknaa.com` to Cloudflare.
- Open merchant conversations with Sham Cash and MTN Cash.
- Reach out to 2–3 contacts as candidate beta hosts.

No coding-blocking questions remain. The next AI-driven step (after Mohammad's go-ahead) is to scaffold the Git repository and the Turborepo monorepo per `BUILD_PLAN.md` Phase 0.

---

## 8. Verification — What I Read

I deeply read every section of (paths reflect post-cleanup canonical locations):

- `docs/README.md` (v2 manifest)
- `docs/PROJECT.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_SPEC.md`
- `docs/PAYMENT_SYSTEM.md`
- `docs/SECURITY.md`
- `docs/BUILD_PLAN.md`
- `docs/DEPLOYMENT.md`
- The project rules file (now at `.cursor/rules/suknaa.mdc`, 441 lines + frontmatter), confirmed fully aligned with v2.

I also reviewed the original v1 versions of `README.md`, `PROJECT.md`, `ARCHITECTURE.md`, and `DESIGN_SYSTEM.md` (since deleted) for delta comparison — confirming v2 supersedes them in every respect (dual-system architecture, commission passthrough, 4-tier pricing, anti-circumvention, dual reviews, etc.).

---

## 9. Workspace Cleanup — Audit Trail (2026-04-30)

After the initial deep-read, the following structural changes were executed at Mohammad's instruction:

| Action | Before | After |
|---|---|---|
| Cursor rules | `cursorrules` at root (441 lines, undiscoverable by Cursor) | `.cursor/rules/suknaa.mdc` with frontmatter (`alwaysApply: true`) |
| Documentation | `docs/*.md` (v1, 10 files) + `docs/mnt/user-data/outputs/suknaa-docs-v2/*.md` (v2, 10 files) | `docs/*.md` (v2 only, 10 files) |
| Temporary path | `docs/mnt/` (3 levels deep, awkward) | Removed entirely |

The workspace is now clean and ready for Phase 0 scaffolding work.

---

**End of comprehension report.**
