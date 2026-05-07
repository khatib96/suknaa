# 🏗️ ARCHITECTURE — Suknaa Technical Architecture (v2)

> Complete technical blueprint for building Suknaa.
> **v2 changes**: Module structure reorganized to reflect dual-system architecture (Real Estate + Hospitality). New modules for Price Intelligence, Anti-Circumvention, Nearby Attractions.

---

## 1. Architectural Overview

Suknaa is a **modular monolith** (not microservices) for Phase 1, deployed across multiple Next.js + NestJS services that share a single PostgreSQL database.

The codebase is organized into **two parallel domain modules** plus shared infrastructure:
- **Real Estate domain** (P2P houses)
- **Hospitality domain** (B2B hotels)
- **Shared infrastructure** (auth, payments, chat, etc.)

```
┌──────────────────────────────────────────────────────────────────┐
│                         End Users                                │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│   │  Guest   │   │  Host    │   │  Admin   │   │ Tourist  │    │
│   │  (Web)   │   │ (Web)    │   │  (Web)   │   │  (Web)   │    │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘    │
│        │              │              │              │           │
│   ┌────▼──────────────▼──────────────┴──────────────▼─────┐    │
│   │       Mobile Apps (Flutter — Phase 10)                 │    │
│   │   ┌──────────────┐         ┌──────────────┐            │    │
│   │   │ Guest App    │         │ Host App     │            │    │
│   │   └──────────────┘         └──────────────┘            │    │
│   └────────────────────────────┬───────────────────────────┘    │
└────────────────────────────────│────────────────────────────────┘
                                 │ HTTPS / WSS
┌────────────────────────────────▼────────────────────────────────┐
│                    Cloudflare (CDN + WAF + DDoS)                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│              Nginx (Reverse Proxy + Rate Limiting)              │
└────┬─────────────────┬─────────────────┬─────────────────┬──────┘
     │                 │                 │                 │
┌────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐   ┌─────▼─────┐
│ Next.js   │   │  NestJS     │   │ Next.js     │   │  MinIO    │
│ Public    │   │  Backend    │   │ Admin Panel │   │  Storage  │
│ (Web)     │   │  (API)      │   │             │   │           │
└───────────┘   └──┬──────────┘   └─────────────┘   └───────────┘
                   │
       ┌───────────┼───────────┬───────────────┐
       │           │           │               │
   ┌───▼───┐  ┌────▼────┐  ┌───▼────┐    ┌─────▼──────┐
   │Postgres│  │  Redis  │  │Socket  │    │  External  │
   │+PostGIS│  │ (Cache  │  │.io     │    │  Services  │
   │        │  │ +Queue) │  │        │    │  (SMS,     │
   │        │  │         │  │        │    │  Payments) │
   └────────┘  └─────────┘  └────────┘    └────────────┘
```

---

## 2. Technology Stack

### 2.1. Frontend — Web (Public)

> _Updated 2026-05-04: Project upgraded to Next.js 16 + Tailwind 4 + React 19 during Phase 1 build._

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.x (App Router) | Public website (suknaa.com), SSR, SEO, PWA |
| **TypeScript** | 5.x | Type safety end-to-end |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **shadcn/ui** | Latest | Accessible component library |
| **next-intl** | Latest | i18n (Arabic + English with RTL) |
| **React Hook Form** | Latest | Form management |
| **Zod** | Latest | Schema validation (shared with backend) |
| **TanStack Query** | v5 | Server state management |
| **Zustand** | Latest | Client state (lightweight) |
| **MapLibre GL JS** | Latest | Maps (no Google dependency) |
| **date-fns** | Latest | Date handling (with Arabic locale) |
| **next-pwa** | Latest | PWA support |

### 2.2. Frontend — Admin Panel
Same stack as public site, separate deployment at `admin.suknaa.com` for security isolation.

### 2.3. Backend — API

| Technology | Version | Purpose |
|---|---|---|
| **NestJS** | 10.x | Modular backend framework |
| **TypeScript** | 5.x | Same language across stack |
| **Prisma** | Latest | Type-safe ORM with migrations |
| **PostgreSQL** | 16.x | Primary database |
| **PostGIS** | 3.x | Geospatial queries |
| **Redis** | 7.x | Cache, sessions, BullMQ queue |
| **BullMQ** | Latest | Background jobs (SMS, emails, payouts, **price intelligence cron, anti-circumvention scoring**) |
| **Socket.io** | Latest | Realtime chat |
| **Passport.js + JWT** | Latest | Authentication |
| **bcrypt + argon2** | Latest | Password hashing |
| **class-validator + class-transformer** | Latest | DTO validation |
| **Swagger** | Latest | Auto-generated API docs |

### 2.4. Mobile (Phase 10)

| Technology | Purpose |
|---|---|
| **Flutter 3** | Cross-platform (iOS + Android) |
| **Dart 3** | Language |
| **Riverpod** | State management |
| **Dio** | HTTP client |
| **flutter_localizations** | i18n + RTL |
| **flutter_map** | OpenStreetMap-based maps |
| **firebase_messaging** | Push notifications (FCM) |
| **flutter_secure_storage** | Token storage |

Two separate apps with shared codebase: **Suknaa Guest** and **Suknaa Host**.

### 2.5. Infrastructure

| Component | Choice | Reason |
|---|---|---|
| **VPS Provider** | Hostinger VPS (KVM 2 → KVM 4 → KVM 8) | Familiar to Mohammad (existing account), Arabic support, competitive pricing |
| **OS** | Ubuntu 24.04 LTS | Mohammad's experience |
| **Reverse Proxy** | Nginx | Battle-tested, easy SSL |
| **SSL** | Let's Encrypt (Certbot) | Free, auto-renewing |
| **CDN + WAF** | Cloudflare (free → Pro) | DDoS protection, image optimization |
| **Process Manager** | PM2 | Logs + process management |
| **Containerization** | Docker + Docker Compose | Reproducibility |
| **Object Storage** | MinIO | Self-hosted, S3-compatible |
| **Monitoring** | Uptime Kuma + Grafana + Prometheus | Self-hosted, free |
| **Logs** | Loki + Grafana | Centralized |
| **Backups** | Restic → Backblaze B2 + Hostinger Snapshots | Encrypted incremental + free weekly snapshots |

### 2.6. External Services

| Service | Purpose | Notes |
|---|---|---|
| **SMS Gateway** | Phone OTP for Syrian numbers | Regional provider with Syrian routing |
| **International SMS** | OTP for non-Syrian numbers | Twilio or Vonage |
| **Email** | Transactional emails | Brevo or self-hosted Postal |
| **Sham Cash API** | Local payment | Direct merchant integration |
| **MTN Cash API** | Local payment | Direct merchant integration |
| **International Payment Gateway** | For tourists | TBD — see PAYMENT_SYSTEM.md |
| **Exchange Rate API** | USD ↔ SYP conversion | Self-hosted scraper (sp-today.com) |
| **Map Tiles** | Map rendering | OpenStreetMap (free) |
| **Push Notifications** | Mobile push | Firebase Cloud Messaging (FCM) |
| **OpenStreetMap Overpass API** | **NEW v2**: Bulk import nearby attractions | Free, used in admin tool |

---

## 3. Repository Structure (Monorepo)

```
suknaa/
├── apps/
│   ├── web/                    # Next.js public site (suknaa.com)
│   ├── admin/                  # Next.js admin panel (admin.suknaa.com)
│   ├── api/                    # NestJS backend (api.suknaa.com)
│   ├── mobile-guest/           # Flutter guest app (Phase 10)
│   └── mobile-host/            # Flutter host app (Phase 10)
│
├── packages/
│   ├── ui/                     # Shared React components (shadcn-based)
│   ├── types/                  # Shared TypeScript types + Zod schemas
│   ├── config/                 # Shared configs (Tailwind, ESLint, TS)
│   ├── i18n/                   # Shared translation strings
│   ├── utils/                  # Shared utility functions
│   └── pricing/                # NEW v2: shared pricing engine (tiers + commission + service fee)
│
├── docs/                       # All project documentation (v2)
│   ├── PROJECT.md
│   ├── ARCHITECTURE.md
│   ├── BUILD_PLAN.md
│   ├── DESIGN_SYSTEM.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   ├── PAYMENT_SYSTEM.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
│
├── infrastructure/
│   ├── docker-compose.yml      # Local development
│   ├── docker-compose.prod.yml # Production
│   ├── nginx/                  # Nginx configs
│   └── scripts/                # Deployment scripts
│
├── .cursorrules                # Cursor AI rules
├── .github/                    # CI/CD workflows
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

### 3.1. NestJS Module Structure (`apps/api/src/`) — Updated for v2

```
apps/api/src/
├── modules/
│   ├── auth/                       # Auth, sessions, OTP, 2FA
│   ├── users/                      # User profiles, host profiles
│   ├── kyc/                        # KYC submissions + review
│   │
│   ├── real-estate/                # ===== REAL ESTATE DOMAIN =====
│   │   ├── properties/             # Properties CRUD
│   │   ├── property-spaces/        # Per-room spaces (bedrooms, bathrooms)
│   │   ├── property-availability/  # Availability blocks + pricing overrides
│   │   └── real-estate.module.ts
│   │
│   ├── hospitality/                # ===== HOSPITALITY DOMAIN =====
│   │   ├── hotels/                 # Hotels CRUD
│   │   ├── room-types/             # Room types under hotels
│   │   ├── room-units/             # Physical units + per-unit blocks
│   │   ├── room-availability/      # Inventory engine (date-aware)
│   │   └── hospitality.module.ts
│   │
│   ├── search/                     # Unified search across both domains
│   │
│   ├── bookings/                   # Polymorphic bookings
│   ├── payments/                   # Payment providers + webhooks
│   ├── wallet/                     # Wallets + transactions + withdrawals
│   ├── pricing/                    # Pricing engine (uses packages/pricing)
│   │
│   ├── reviews/                    # Dual reviews (property/hotel + host)
│   ├── chat/                       # Socket.io chat + message moderation
│   ├── notifications/              # In-app + email + SMS + push
│   │
│   ├── price-intelligence/         # NEW v2: market snapshots + suggestions
│   ├── anti-circumvention/         # NEW v2: reduction events + risk scoring
│   ├── nearby-attractions/         # NEW v2: POIs + OSM integration
│   ├── wishlists/                  # NEW v2: with sharing
│   ├── comparisons/                # NEW v2
│   ├── price-alerts/               # NEW v2
│   │
│   ├── admin/                      # Admin endpoints
│   └── webhooks/                   # External webhooks (payment providers)
│
├── shared/
│   ├── prisma/                     # Prisma client + extensions
│   ├── redis/                      # Redis client + helpers
│   ├── storage/                    # MinIO client
│   ├── sms/                        # SMS providers
│   ├── email/                      # Email service
│   ├── audit/                      # Audit log helper
│   ├── currency/                   # USD/SYP conversion
│   ├── i18n/                       # Server-side translations
│   └── errors/                     # Typed error classes
│
└── main.ts
```

### 3.2. Why This Structure?
- **Domain isolation**: real-estate and hospitality are sibling domains. Bugs in one cannot leak into the other.
- **Polymorphism handled at module boundaries**: `bookings` module knows about both, but each domain module knows only itself.
- **Shared modules are infrastructure** (auth, payments, chat) — they don't care about the domain.

---

## 4. Subdomain Strategy

| Subdomain | Purpose | Tech |
|---|---|---|
| `suknaa.com` | Main public site | Next.js |
| `api.suknaa.com` | Backend API | NestJS |
| `admin.suknaa.com` | Admin panel (IP-restricted + 2FA) | Next.js |
| `cdn.suknaa.com` | MinIO public bucket | MinIO + Nginx |
| `chat.suknaa.com` | WebSocket server (separate for scaling) | Socket.io on NestJS |
| `status.suknaa.com` | Public status page | Uptime Kuma |

All subdomains served via single Nginx instance, all SSL via Let's Encrypt wildcard cert.

---

## 5. Environment Strategy

| Environment | Purpose | Where |
|---|---|---|
| **Local** | Development | Mohammad's machine, Docker Compose |
| **Staging** | QA before production | Hostinger KVM 1 (~$5/month) at staging.suknaa.com |
| **Production** | Live system | Main Hostinger VPS (KVM 2 → KVM 4) |

Database migrations: never auto-apply on production. Always run manually after backup.

---

## 6. Data Flow Examples

### 6.1. Guest searches "Damascus" with "Hotels" tab
```
Guest Browser → Next.js (SSR) → fetches from api.suknaa.com/v1/search?kind=hospitality&city=Damascus
                                  ↓
                                NestJS Search Module
                                  → Hospitality Search Service (separate from RE search)
                                  ↓
                                PostgreSQL + PostGIS (only hotels table)
                                  ↓
                                Redis cache hit? → return cached
                                  ↓ (miss)
                                Query DB, cache for 60s, return
                                  ↓
                                Compute scarcity signals per hotel
                                  ↓
                                Return enriched results
```

### 6.2. Hotel host adds a new room type
```
Host Browser → Next.js → POST /me/hotels/:hotel_id/room-types
                          ↓
                        NestJS validates DTO (Zod)
                          ↓
                        room-types service creates room_type row
                          ↓
                        Auto-creates `total_units` rows in room_units
                          ↓
                        Returns room_type with all unit IDs
                          ↓
                        Host can rename units via separate endpoint
```

### 6.3. Booking flow with commission passthrough (NEW v2)
```
Guest views property listed at $100 (passthrough enabled)
   ↓
Frontend displays: $113.64/night
   ↓
Guest selects 3 nights → POST /properties/:id/quote
   ↓
Backend calls pricing engine:
   - Tier resolver picks rate
   - Financial rules resolver loads commission/service-fee/tax/discount rules
   - Commission engine applies passthrough (gross-up)
   - Service fee, tax lines, and discounts are resolved
   - Returns: {nights_subtotal, service_fee, taxes, discounts, total}
   ↓
Guest confirms → POST /bookings
   ↓
Bookings service creates booking with:
   - property_subtotal_cents = 34092
   - commission_cents = 4091 (12% of 34092)
   - service_fee_cents = 682
   - tax_cents = 0 in this example
   - fee_rule_snapshot = {...resolved rule IDs/sources...}
   - guest_total_cents = 34774
   - host_payout_cents = 30001 (essentially $300, exactly what host wanted)
   - commission_passthrough = true (snapshot)
   ↓
Payment initiated → confirmed → wallet entries created
   ↓
Host wallet pending: +$300.01
Guest receives invoice with: property $340.92 + service fee $6.82 + taxes if applicable = total
NO mention of commission anywhere on guest's invoice.
```

### 6.4. Anti-circumvention flow (NEW v2)
```
Hotel host marks 2 of 5 doubles as "rented_offline" for next 14 days
   ↓
POST /me/hotels/:id/room-types/:rt_id/units/:unit_id/block
  body: { starts_on, ends_on, reason: 'rented_offline', reason_note }
   ↓
anti-circumvention service:
   - Records availability_reduction_event
   - Computes event_score
   - Updates host_risk_signals
   - If risk_score > threshold → triggered_admin_review = true
   - If true → creates admin notification
   ↓
Inventory updated (the 2 units are blocked)
   ↓
Admin sees in queue → reviews → decides (clear/warn/penalize/suspend)
   ↓
Decision logged in audit_logs + availability_reduction_events
```

---

## 7. Security Layers (Summary — full details in SECURITY.md)

1. **Cloudflare WAF**: blocks common attacks
2. **Nginx rate limiting**
3. **JWT with short expiry + refresh tokens**
4. **Refresh tokens in httpOnly cookies**, access tokens in memory
5. **Permissions**: current simple roles are bootstrapping only; long-term authorization uses granular capabilities and templates with per-user overrides
6. **All DB queries via Prisma** (parameterized)
7. **Input validation at every layer** (Zod schemas shared)
8. **CSRF protection** on state-changing endpoints
9. **Audit log** for all admin actions and financial transactions
10. **Encrypted backups** (Restic with strong passphrase)
11. **Anti-circumvention engine** (NEW v2)

---

## 8. Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5s on 3G |
| Time to Interactive (TTI) | < 3s on 3G |
| API p95 response time | < 300ms |
| Search query response | < 500ms (with cache: < 100ms) |
| Hotel availability check (date-aware) | < 200ms (NEW v2 — critical path) |
| Image loading | Lazy + WebP/AVIF + CDN |
| Mobile bundle size | < 200KB initial JS |

---

## 9. Scalability Path (When We Grow)

**Phase 1 (0–1k users):** Single VPS, all services on one box.

**Phase 2 (1k–10k users):**
- Move PostgreSQL to dedicated VPS
- Move MinIO to dedicated VPS
- Add Redis replica
- Add second app server behind load balancer

**Phase 3 (10k–100k users):**
- PostgreSQL primary + read replicas
- Extract chat into separate service
- Extract payments into separate service
- **Possibly extract real-estate and hospitality search into separate services** (they have different query patterns)
- Consider managed PostgreSQL

**Phase 4 (100k+ users):** Re-evaluate.

---

## 10. What We're NOT Using (and why)

| Not Using | Why |
|---|---|
| WordPress | Too rigid, security overhead |
| Firebase (as primary backend) | Vendor lock-in, weak for complex queries |
| MongoDB | Bookings + payments are inherently relational |
| GraphQL (initially) | REST is simpler |
| Microservices | Premature complexity |
| Kubernetes | Massive overkill for one VPS |
| AWS/GCP/Azure | Expensive, sanctions complications, Hostinger VPS sufficient |
| React Native | Flutter has better RTL + UI consistency |
| **NEW v2**: Single `properties` table for both houses and hotels | Different query patterns, different lifecycle, different inventory model |
| **NEW v2**: External price intelligence service | Can build with our own data; one less dependency |

---

## 11. Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-04-29 | Next.js + NestJS + PostgreSQL stack | Type safety end-to-end, AI tools handle it well |
| 2026-04-29 | Modular monolith over microservices | Simplicity for Phase 1 |
| 2026-04-29 | Web first, then mobile | Faster validation cycle |
| 2026-04-29 | Hostinger VPS over AWS/Hetzner | User has existing Hostinger account; Arabic support; cost; simplicity |
| 2026-04-29 | MapLibre + OSM over Google Maps | Free, no Google dependency, works in Syria |
| 2026-04-29 | MinIO for storage | Self-hosted, S3-compatible |
| 2026-04-29 | Flutter for mobile | One codebase, RTL support, performance |
| 2026-04-29 (v2) | Separate hotels table from properties | Different inventory model (per-room-type vs per-property), different query patterns |
| 2026-04-29 (v2) | Polymorphic bookings table | One booking lifecycle, two domain targets |
| 2026-04-29 (v2) | Commission passthrough as host setting | Better UX for hosts, transparent revenue model, market-driven competitiveness |
| 2026-04-29 (v2) | Service fee separate from commission | Allows promo flexibility while protecting baseline revenue |
| 2026-04-29 (v2) | Force-reason on availability reduction | Detection of off-platform circumvention |
| 2026-04-29 (v2) | Per-unit room tracking (not just count) | Audit + future per-room features |
| 2026-05-08 | Financial rules engine before bookings/payment | Commission, service fee, taxes, discounts, and waivers must be configurable, permissioned, and snapshotted; no fixed rates in code |
| 2026-05-08 | Hotel/host-entered taxes with Suknaa override | Hotels may know local fees, but Suknaa needs approval/override control for legal and checkout consistency |
| 2026-05-08 | Granular permissions over rigid roles | Suknaa staff, hotels, and companies need per-user capabilities, permission templates, invitations, and audited overrides |
