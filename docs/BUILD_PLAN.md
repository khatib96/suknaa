# 🗺️ BUILD_PLAN — Suknaa Phased Build Roadmap (v2)

> **v2 changes**: Phases reorganized to handle the dual-system (Real Estate + Hospitality) architecture. New features (price intelligence, anti-circumvention, sharing wishlists, comparisons, price alerts, smart upgrades, nearby attractions) distributed across phases.

---

## Methodology

**Vertical Slicing**: Build features end-to-end (UI → API → DB → back to UI) one at a time.

**No time pressure**: estimates assume focused part-time work with Cursor/Antigravity.

**Done means done**: a phase is complete only when deliverables work, tests are written for critical paths, documentation is updated, and a demo to yourself works end-to-end.

**Critical mindset for v2**: every backend feature must consciously support BOTH real-estate AND hospitality models. Resist the temptation to build only one and "add the other later" — they need to coexist from Phase 3 onward.

---

## 🟢 PHASE 0 — Foundation & Visual Direction
**Estimated:** 1–2 weeks

### Deliverables
- [ ] Hostinger VPS provisioned (KVM 2 or KVM 4, Ubuntu 24.04, Frankfurt or Amsterdam DC)
- [ ] DNS configured: `suknaa.com`, `api.suknaa.com`, `admin.suknaa.com`, `cdn.suknaa.com`
- [ ] Cloudflare set up (DNS proxied, WAF on, DDoS protection)
- [x] Git repository (private GitHub repo)
- [x] Monorepo scaffolded with Turborepo + pnpm
- [x] All v2 documentation in `/docs/` committed
- [x] `.cursorrules` file written and committed
- [x] Local dev environment working (Docker Compose: Postgres+PostGIS, Redis, MinIO)
- [ ] **5 visual mockups** (Figma or v0.dev): Homepage with tabs, Real Estate search results, Hotel detail page, Property detail page (with per-room sections), Host commission-passthrough toggle UI
- [ ] Logo files in SVG, PNG (multiple sizes), and favicon set

### Exit Criteria
You can show a friend the visual mockups and they understand both the Real Estate AND the Hotel experiences, and how the tabs separate them.

---

## 🟢 PHASE 1 — Public Website Skeleton (UI Only, Mock Data)
**Estimated:** 3–4 weeks (longer than v1 because of dual systems)

**Status 2026-05-05:** Complete for Phase 1 scope. Deferred items below are intentional non-blockers for Phase 2: i18n/English, service worker, real MapLibre integration, final imagery, and staging deploy.

### Deliverables
- [x] Next.js App Router + TypeScript + Tailwind + shadcn/ui (using Next.js 16 + Tailwind v4 instead of Next 14 / Tailwind v3)
- [ ] i18n with `next-intl`: full Arabic (RTL) + English (LTR)
- [x] Design system implemented (colors, fonts, spacing — incl. map color palette)
- [x] **Layout**:
  - Header with logo + **persistent tabs `[الكل] [عقارات] [فنادق]`** + **two login buttons** (language switcher deferred with i18n)
  - Footer
- [x] **Homepage**:
  - Hero with search bar (interactive: location + dates + guests → `/search` with query params, mobile uses bottom-sheet drawer)
  - Featured sections (FeaturedListings, SeasonalPicks)
  - Trust signals (WhySuknaaStrip)
  - MapExplorer placeholder (real MapLibre integration deferred to Phase 3+)
  - Note: a homepage-level FAQ block was not built; FAQs live on `/help` for now
- [x] **Search Results page** (works for all three tabs):
  - Filters sidebar adapts to tab selection (RE filters vs Hotel filters)
  - Property cards (RE) and Hotel cards (separate visual style)
  - Map view toggle with category color-coded markers (placeholder map)
- [x] **Property Detail page (Real Estate)**:
  - Hero gallery
  - Description
  - **Per-room sections** (bedrooms, bathrooms, kitchen — each with photos and amenities)
  - Property amenities
  - Map placeholder with mock nearby attractions
  - Reviews placeholder
  - Host profile snippet linking to `/host/[username]`
- [x] **Hotel Detail page (Hospitality)**:
  - Hero gallery
  - Star rating + score
  - Hotel description and amenities
  - **Room types list** (each as a card with: name, photos, beds, max occupancy, "X of Y available", price, [Book] button)
  - Map placeholder + nearby attractions
  - Reviews placeholder
  - Host (hotel company) profile snippet
- [x] **Host Profile page**: public page showing all listings of one host (5 mock hosts)
- [x] **Static pages**: About, How It Works (`?audience=guest|host`), Help, Contact, Terms, Privacy, Cookies
- [x] **Login UIs**: "Login as Guest" form, "Login as Host" form, Signup flow, host onboarding wizard
- [x] **PWA manifest** at `/manifest.webmanifest` (service worker deferred)
- [ ] Service worker for offline shell
- [ ] All text in both Arabic and English (deferred — Arabic only for now)
- [x] Responsive: mobile / tablet / desktop (Hero drawer on mobile, compact tablet bar, navbar height adapts to mobile tab strip)
- [ ] Deployed to staging (`staging.suknaa.com`)

### Exit Criteria
**Critical evaluation moment.** Mohammad walks through staging and decides:
- Does the dual-system feel intuitive (not confusing)?
- Does the host-side commission-passthrough UI make sense?
- Is the per-room property layout (Airbnb-style) clean?
- Is the hotel inventory display (Booking-style) clear?

> ⏸ **Pause and reflect.** Show 5 different people. Listen carefully.

---

## 🟢 PHASE 2 — Backend Foundation + Auth + KYC
**Estimated:** 2–3 weeks

### Deliverables
- [ ] NestJS app initialized
- [ ] PostgreSQL 16 + PostGIS via Docker Compose
- [ ] Prisma schema for: `users`, `host_profiles`, `kyc_submissions`, `auth_sessions`, `otp_codes`, `two_factor_secrets`, `audit_logs`
- [ ] First migration created and applied
- [ ] **Auth module**:
  - Email + password registration
  - Phone OTP (international)
  - JWT (access 15min) + refresh (7d httpOnly cookie)
  - Password reset
  - Email verification
- [ ] **Login intent endpoint** (NEW v2): records guest vs host intent post-login
- [ ] **2FA module**: TOTP + SMS, mandatory for hosts/admins
- [ ] **Roles**: `is_guest`, `is_host`, `is_admin`, `is_super_admin` (a user can be multiple)
- [ ] **KYC submission**:
  - Different document requirements per `intended_host_category` (real_estate vs hospitality) and `intended_host_subtype`
  - Upload to MinIO (encrypted)
- [ ] **Become Host flow**:
  - User chooses category (RE or Hospitality) and subtype (individual / RE office / hotel company)
  - KYC requirements differ
- [ ] Admin endpoints: review and approve/reject KYC
- [ ] Frontend: working login (with intent), signup, profile, KYC upload pages
- [ ] Frontend: language preference persists in user profile
- [ ] Swagger docs auto-generated at `api.suknaa.com/api/docs`
- [ ] Audit log writes for all admin actions

### Exit Criteria
A guest can sign up + verify phone + login. A user can choose to become a real-estate host OR a hotel-company host with the right KYC documents. An admin can approve their KYC.

---

## 🟢 PHASE 3 — Real Estate System (End-to-End)
**Estimated:** 4–5 weeks

### Deliverables
- [ ] Prisma schema: `properties`, `property_spaces`, `property_space_images`, `property_images`, `amenities`, `property_amenities`, `space_amenities`, `property_availability_blocks`, `property_pricing_overrides`
- [ ] Seed data: amenities (with `applies_to_*` flags), property types
- [ ] **Property creation wizard** (host side, multi-step):
  1. Type (house / apartment / villa / farm / cabin / chalet / studio)
  2. Location (map picker with PostGIS storage)
  3. Basic info (name, description, capacity)
  4. **Per-room/space breakdown** (Airbnb-style):
     - For each bedroom: bed config, photos, room amenities
     - For each bathroom: type, photos
     - Kitchen, living rooms, outdoor spaces
  5. **Property-wide amenities**
  6. **Photo gallery** (property-wide)
  7. **Pricing** (4 tiers: base + weekly + monthly + weekend uplift)
  8. **Commission passthrough** toggle (with clear UX showing both modes)
  9. House rules + cancellation policy
  10. Review and submit (status: `pending_review`)
- [ ] **Admin review queue** for properties
- [ ] **Search API for real estate** with PostGIS:
  - Geographic + text search
  - Filters: bedrooms, bathrooms, type, capacity, amenities, dates, price range
  - Sort options
  - Pagination (cursor)
- [ ] **Search results page** (frontend) with filters
- [ ] **Property detail page** (frontend) with all real data
- [ ] **Map display** with category color coding
- [ ] **Availability calendar** on detail page
- [ ] **Image optimization**: WebP/AVIF, multiple sizes via sharp on upload
- [ ] **Search results cached in Redis** (60s TTL)

### Exit Criteria
A real RE host can list a real property with full per-room details. A guest can find it via search and see a complete page. The map works.

---

## 🟢 PHASE 4 — Hospitality System (End-to-End)
**Estimated:** 4–5 weeks

### Deliverables
- [ ] Prisma schema: `hotels`, `hotel_images`, `hotel_amenities`, `room_types`, `room_type_images`, `room_type_amenities`, `room_units`, `room_unit_availability_blocks`, `room_type_pricing_overrides`
- [ ] Seed data: hotel-specific amenities (24h reception, breakfast, gym, spa, etc.)
- [ ] **Hotel creation wizard** (host side, multi-step):
  1. Hotel type (hotel / hotel-apartment / resort / hostel)
  2. Identity (name, description, star rating, year built/renovated)
  3. Location
  4. Times (check-in/out windows)
  5. Policies (children, pets, smoking, payment-at-property)
  6. **Hotel-wide amenities** (with paid/free + fee notes)
  7. **Photo gallery** (categorized: lobby, restaurant, exterior, etc.)
  8. Commission passthrough + default cancellation policy
  9. Review and submit (status: `pending_review`)
- [ ] **Room type creation flow** (under each hotel):
  1. Name + code
  2. Inventory (`total_units`)
  3. Capacity (max occupancy, adults, children)
  4. Beds config
  5. Pricing (4 tiers + breakfast)
  6. Photos
  7. Amenities
  8. Cancellation override (or inherit hotel default)
- [ ] On creation: backend auto-generates `total_units` rows in `room_units`
- [ ] **Per-unit management** UI: rename units (Room 305), block specific units, mark inactive for maintenance
- [ ] **Admin review queue** for hotels
- [ ] **Search API for hotels** with PostGIS:
  - Filters: star rating, hotel type, breakfast included, amenities, dates, price range, city
- [ ] **Hotel search results page** (different visual from RE)
- [ ] **Hotel detail page**:
  - Room types listed with **date-aware availability** (X of Y available)
  - Each room type bookable separately
- [ ] **Per-room-type availability calendar**
- [ ] **Inventory engine**:
  - When booking is requested, find an available `room_unit` and lock it
  - Race-condition safe (DB advisory locks)
  - Atomic across multiple-room bookings (e.g., guest books 2 of 5 rooms)

### Exit Criteria
A real hotel host can list a hotel with multiple room types. A guest can browse and see "3 of 5 doubles available", select one, and book. Inventory updates correctly with no double-booking.

---

## 🟢 PHASE 5 — Bookings & Payments (Both Systems)
**Estimated:** 4–5 weeks

### Deliverables
- [ ] Prisma schema: `bookings` (polymorphic — RE or hospitality), `booking_room_units`, `payments`, `wallets`, `wallet_transactions`, `withdrawal_requests`, `commission_rates`, `service_fee_rates`, `currency_rates`
- [ ] **Booking creation flow**:
  - Polymorphic: handles both `kind=real_estate` and `kind=hospitality`
  - Date conflict detection (uses appropriate availability table)
  - **Pricing tier resolver** (4 tiers + weekend uplift + seasonal)
  - **Commission engine** with passthrough math (gross-up formula)
  - **Service fee engine**
  - Booking total calculator producing the exact invoice the guest sees
  - Status: `pending_payment` → `confirmed` → `checked_in` → `completed`
- [ ] **Payment Method 1: Sham Cash** (sandbox + production)
- [ ] **Payment Method 2: MTN Cash**
- [ ] **Payment Method 3: Manual bank transfer**:
  - Display Suknaa bank details + unique reference
  - Receipt upload
  - Admin manual approval queue
- [ ] **Payment Method 4: International gateway** (provider TBD)
- [ ] **Escrow logic for RE**: money held until 24h post check-in
- [ ] **Direct flow for Hospitality**: money credited immediately
- [ ] **Variable commission**: per-property-type, overridable per host/property/hotel
- [ ] **Service fee**: separately configurable from admin
- [ ] **Currency conversion**: USD storage, USD+SYP display
- [ ] **Host wallet UI**: balance breakdown, transaction history
- [ ] **Withdrawal system**: auto weekly/monthly + manual; $10 min; admin processing
- [ ] **Cancellation handling**: 3 policies + service fee logic
- [ ] **Email + SMS receipts**
- [ ] All financial actions → audit log

### Exit Criteria
End-to-end booking + payment + withdrawal works for both real-estate AND hospitality, in both commission modes (absorb + passthrough).

---

## 🟢 PHASE 6 — Host Dashboard, Reviews, Chat
**Estimated:** 3–4 weeks

### Deliverables
- [ ] **Host dashboard** with **two tabs at top: "Real Estate" and "Hospitality"** (only shown for the categories the host is registered in):
  - Overview (upcoming check-ins, recent bookings, this month's earnings)
  - Properties / Hotels (list, edit, pause, delete)
  - Bookings (calendar + list views)
  - Wallet
  - Reviews
  - Settings
- [ ] **Reviews system**:
  - Available 24h after check-out
  - **Dual reviews**: separate ratings for property/hotel AND host
  - Both sides submit; published when both complete (or after 14 days)
  - Host can publicly respond
  - Average ratings displayed on listing AND on host profile
- [ ] **Chat system** (Socket.io):
  - Opens after booking confirmed
  - Real-time messages with read receipts
  - Image attachments (MinIO)
  - Push notifications
  - **Regex blocks** for: phone numbers, emails, social handles, payment app names
  - Admin can read for dispute resolution (with audit log)
- [ ] **Notification system**:
  - In-app, email, SMS, push
  - User preferences: opt-in for marketing, transactional always on

### Exit Criteria
A host can run their entire business from the dashboard. Guests and hosts chat post-booking. Dual reviews appear on listings + host profiles.

---

## 🟢 PHASE 7 — Admin Panel
**Estimated:** 3 weeks

### Deliverables
- [ ] Separate Next.js app at `admin.suknaa.com`:
  - IP allowlist
  - Mandatory 2FA
  - Denser visual theme
- [ ] **Dashboard**: KPIs (active properties, hotels, bookings today, revenue, pending reviews)
- [ ] **Users management**
- [ ] **Properties management** (review queue + edit + force-unpublish + performance)
- [ ] **Hotels management** (NEW v2 — separate queue from properties)
- [ ] **Bookings management**
- [ ] **Payments management** (with manual transfer review queue)
- [ ] **Withdrawals management**
- [ ] **Disputes management**
- [ ] **KYC review queue**
- [ ] **Commission rates configuration** (per type/host/property/hotel)
- [ ] **Service fee rates configuration** (NEW v2)
- [ ] **Currency rates** (view + manual override)
- [ ] **Content management** (FAQ, terms, static pages)
- [ ] **Admin user management** (SuperAdmin only)
- [ ] **Audit log viewer**
- [ ] **Reports** (bookings, revenue, top hosts, top properties — CSV export)

### Exit Criteria
The Suknaa team (Mohammad initially) can do every operational task without touching the database.

---

## 🟢 PHASE 8 — Smart Features Layer (NEW v2)
**Estimated:** 3–4 weeks

This phase adds the Suknaa "magic" — features that differentiate it from generic platforms.

### Deliverables
- [ ] **Price Intelligence**:
  - `market_demand_snapshots` cron job (daily aggregation per city/category)
  - `pricing_suggestions` generator (per property/room_type)
  - Host dashboard banner showing suggestions ("raise price 15%")
  - Suggestion accept/dismiss tracking
- [ ] **Anti-Circumvention**:
  - Force reason on availability reductions
  - `availability_reduction_events` recording
  - Risk scoring algorithm
  - Admin queue for high-risk events
- [ ] **Scarcity Nudges**:
  - Real-time computation of signals: "1 unit left", "3 booked in 24h", "best price"
  - Display rules (max 2 visible, only true signals)
- [ ] **Smart Upgrade**:
  - Detect available higher-tier room types
  - Show upgrade card on booking page
  - Track acceptance
- [ ] **Nearby Attractions**:
  - `nearby_attractions` table seeded with manual data + OSM import script
  - Display 30 nearest within 2km on each listing detail page
  - Distance computation + filter chips by category
- [ ] **Wishlist Sharing**:
  - Generate share token
  - Public read-only wishlist page
- [ ] **Comparison**:
  - Add-to-compare from listing cards
  - Compare table view (up to 4 items)
  - Difference highlighting
- [ ] **Price Alerts**:
  - User can set alerts on listings
  - Cron job checks daily; sends notification on trigger

### Exit Criteria
The platform feels intelligent. Hosts get useful insights. Guests get useful nudges. Off-platform circumvention is detectable.

---

## 🟢 PHASE 9 — Beta Launch (Web Only)
**Estimated:** 2–3 weeks

### Deliverables
- [ ] **Security audit**: review all endpoints for auth, all queries for SQL injection
- [ ] **Performance pass**: Lighthouse on key pages (target 90+)
- [ ] **Backup strategy verified**: full restore drill on staging
- [ ] **Monitoring set up**: Uptime Kuma, Grafana dashboards, alerting
- [ ] **Onboarding 30–50 beta users**:
  - 5–8 RE hosts (mix individuals + 2 RE offices)
  - 3–5 hotel companies (small/mid hotels)
  - 20–30 guests (friends, family, Syrian diaspora)
- [ ] **Beta feedback channel**: form + WhatsApp group
- [ ] **Iterative fixes** for 2-3 weeks based on real usage
- [ ] **Public launch announcement**: social media, Syrian tech communities

### Exit Criteria
Beta users complete at least 15 real bookings end-to-end (mix of RE + hotels) without critical issues.

---

## 🟢 PHASE 10 — Mobile Apps (Flutter)
**Estimated:** 8–12 weeks (two apps in parallel via shared codebase)

### Deliverables
- [ ] Flutter project with monorepo structure
- [ ] Shared `packages/api_client` (Dio with auth)
- [ ] Shared `packages/ui_kit` (matching DESIGN_SYSTEM.md)
- [ ] Shared `packages/i18n`
- [ ] **Guest App**:
  - All web features (browse, search, book, chat, reviews)
  - Native maps + nearby attractions
  - Push notifications (FCM)
  - Biometric login
  - Wishlist with sharing
  - Comparisons
  - Price alerts
- [ ] **Host App**:
  - Property/hotel management
  - Booking calendar
  - Wallet
  - Push notifications
  - Quick chat replies
  - Pricing suggestions inline
- [ ] App Store + Google Play submissions (separate listings)

### Exit Criteria
Both apps are live in stores, used by beta users, with feature parity to web.

---

## 🟢 PHASE 11 — Public Launch & Growth
**Estimated:** Ongoing

### Deliverables
- [ ] PR / marketing campaign in Syria
- [ ] Hotel chain partnerships
- [ ] Referral program for hosts
- [ ] SEO content strategy (blog at `suknaa.com/blog`)
- [ ] Performance optimization based on real load
- [ ] Capacity planning per `ARCHITECTURE.md` Section 9

---

## Cross-Cutting Workstreams

### Documentation
Update `/docs` whenever a major decision changes.

### Testing
- **Unit tests** for business logic (pricing tier resolver, commission calculation, gross-up math, refund calculation, availability conflicts) — start in Phase 2.
- **Integration tests** for critical API flows — start in Phase 5.
- **E2E tests** with Playwright for critical user flows — start in Phase 6.
- ~70% coverage on backend business logic.

### Security
- Dependency audit weekly (`pnpm audit`)
- Penetration test before public launch (Phase 9)
- Quarterly security review thereafter

### Backups
- Daily encrypted DB backup → Backblaze B2 (off-site) + Hostinger Snapshots (weekly)
- Weekly full backup
- Monthly restore drill on staging

---

## Decision Points

| After Phase | Decision to make |
|---|---|
| Phase 1 | Does the dual-system feel intuitive? Show 5 people. |
| Phase 3 | Are real RE hosts willing to upload? Test with 3 friends. |
| Phase 4 | Are real hotels willing to integrate? Talk to 2 small hotels. |
| Phase 5 | Is the payment integration with Sham/MTN actually viable? |
| Phase 8 | Are smart features actually being used by hosts/guests? |
| Phase 9 | Is there enough demand to justify mobile app investment? |

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Sham Cash / MTN Cash API access denied | Start integration conversations in Phase 0; manual transfer as fallback |
| International payment gateway unavailable for Syrian entities | Tourist segment uses manual transfer too; not blocking for launch |
| KYC fraud (fake IDs) | Manual review + reputation system + dispute fund from commission |
| Hosts list off-platform after first booking | Anti-circumvention system + risk scoring + on-platform-only reviews |
| Burnout from solo build | Phased plan with no time pressure; celebrate every phase completion |
| Sanctions / hosting issues | Hostinger is EU/global; Hetzner researched as backup provider |
| Low initial supply (no properties/hotels) | Manually onboard first 30 hosts; offer 0% commission for first 3-6 months |
| Low initial demand | Beta with friends + Syrian diaspora communities first |
| Scope creep from "smart features" delaying launch | Smart features = Phase 8, AFTER core works (Phases 1-7); never let them block launch |
| Anti-circumvention false positives angering legit hosts | Tune risk scoring conservatively at first; admin manual review for all flags |
| Hotels don't want our inventory model | Talk to 2 hotels EARLY (Phase 0); if all 2 reject, redesign before Phase 4 |
