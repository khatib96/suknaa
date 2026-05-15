# 🏠 سُكنى (Suknaa) — Project Overview

> **Domain:** suknaa.com
> **Tagline (AR):** سكنك في كل مكان بسوريا
> **Tagline (EN):** Your home, anywhere in Syria
> **Status:** Phase 0 — Foundation
> **Last Updated:** 2026-05-13 (v2 + Phase 3 M1 naming)

---

## 1. Vision

Suknaa is a **comprehensive Syrian rental platform** that operates as **two integrated but distinct systems**:

1. **Vacation Rentals / Holiday Homes (بيوت العطلات)** — for individuals and vacation-rental operators listing houses, apartments, villas, farms, cabins, chalets, and studios for short stays. Modeled after Airbnb's approach (per-listing unit with detailed room-by-room information). **Canonical naming:** [PHASE_3_M1_NAMING_PLAN.md](./PHASE_3_M1_NAMING_PLAN.md).

2. **Hospitality System (نظام الفنادق)** — for hotel and resort companies listing rooms-by-type. Modeled after Booking.com's approach (one establishment with multiple room types and inventory tracking).

This dual-system approach is **the defining architectural choice of Suknaa**. Houses and hotels work fundamentally differently; pretending otherwise creates user confusion and operational mess.

## 2. The Problem

- Syria has no unified, trustworthy rental booking platform.
- Existing options are fragmented (Facebook groups, WhatsApp brokers, individual hotel websites).
- International platforms (Airbnb, Booking) do not operate in Syria.
- Tourists, returning expatriates, and internal travelers struggle to find/book accommodations confidently.
- Hosts (individuals + businesses) have no professional channel to reach customers.

## 3. The Solution: Two Systems, One Platform

### 3.1. Vacation Rentals / Holiday Homes (P2P)
- Single vacation rental = single listing
- Detailed per-space descriptions (each bedroom: bed type, size, photos, amenities)
- Per-space photo galleries (bedroom 1, bedroom 2, kitchen, bathroom 1, bathroom 2, garden, etc.)
- Listing-level amenities (pool, garden, parking, BBQ, etc.)
- One booking = the entire unit
- Hosts: Individuals + **`vacation_rental_operator`** hosts (Arabic: مشغّل بيوت عطلات; see [PHASE_3_M1_NAMING_PLAN.md](./PHASE_3_M1_NAMING_PLAN.md))

### 3.2. The Hospitality System (B2B)
- Single hotel = one establishment with **multiple room types**
- Each room type = "Single Room", "Double Room", "Family Suite", "Presidential Suite"
- Each room type has: a count (e.g., "5 single rooms"), a price, a photo gallery, amenities
- Booking flow: guest selects room type → system checks availability → reserves one unit
- Stars rating (1-5), official review score
- Hotel-level services (24h reception, breakfast, spa, gym, restaurant, etc.)
- Hosts: Companies only (legally registered hotels)

### 3.3. Why Both, Not Just One?
Syrian travelers want both: a family villa for the weekend AND a hotel suite for the business trip. Suknaa serves both — but doesn't pretend they're the same product.

---

## 4. The User-Facing Flow

### 4.1. The Three Tabs
Every user landing on `suknaa.com` sees a **persistent tab bar** at the top:

```
┌──────────────────────────────────────────────┐
│      [الكل]  [بيوت العطلات]  [فنادق]          │
└──────────────────────────────────────────────┘
```

- **الكل (All)** — Default. Mixed results. Best for users who don't know yet.
- **بيوت العطلات (Vacation rentals)** — Short-stay listings; map markers in orange/green by category; filters tailored (bedrooms, pool, garden, etc.). URL/query target: `?tab=vacation_rentals` (see [PHASE_3_M1_NAMING_PLAN.md](./PHASE_3_M1_NAMING_PLAN.md)).
- **فنادق (Hotels)** — Filters limited to hotels; map markers in gold; filters tailored (star rating, breakfast included, room type).

User can switch tabs anytime; their search context persists.

### 4.2. Two Login Buttons
On the public site header:
```
┌─────────────────────────────────────────────────┐
│  Suknaa  ...  [دخول كزبون] [دخول كمؤجر]  [AR/EN]│
└─────────────────────────────────────────────────┘
```

- **"دخول كزبون" (Login as Guest)** → guest dashboard / continues browsing
- **"دخول كمؤجر" (Login as Host)** → host dashboard for managing listings + bookings

> **Important**: One account can be **both** a guest and a host. The two buttons select the *experience to enter*, not separate accounts. If a user with no host profile clicks "Login as Host," they're guided through the "become a host" flow.

---

## 5. Target Users

### 5.1. Guests (المستأجرون)
- **Internal Syrian travelers**: families looking for vacation homes
- **Returning expatriates**: visiting Syria, need short-term housing
- **Tourists**: foreign visitors needing verified accommodation
- **Business travelers**: needing hotels and serviced apartments

### 5.2. Hosts — Vacation rentals (individuals & operators)
- **Individual hosts**: own or operate a house, farm, cabin, etc., for short stays
- **Vacation rental operators** (`host_subtype` = `vacation_rental_operator`; Arabic: مشغّل بيوت عطلات): manage multiple vacation rental listings on behalf of owners

### 5.3. Hosts — Hospitality (Companies)
- **Hotel companies**: small or large hotels with multiple room types
- **Resort operators**: integrated resorts with rooms + amenities
- **Hotel-apartment operators**: serviced apartment buildings

### 5.4. Admin (إدارة المنصة)
- **Suknaa team**: approves vacation rental and hotel listings, verifies KYC, processes withdrawals, handles disputes, monitors price intelligence

---

## 6. Geographic Scope

- **Phase 1 (Launch):** Syria only
- **Phase 2 (Future, 12+ months post-launch):** Possible expansion to Lebanon, Iraq, regional Arab countries

## 7. Languages

- **Arabic (ar)** — primary, with full RTL layout
- **English (en)** — secondary, LTR
- All user-facing text must be translatable (i18n from day one)
- Listing descriptions: stored in both languages where provided by host; auto-translation as fallback (Phase 2)

## 8. Brand Identity

### 8.1. Logo
- House outline in **burnt orange** containing a stylized **gold "S"**
- Two variants: with Arabic wordmark (سُكنى), with English wordmark (SUKNAA)

### 8.2. Color Palette (extracted from logo)

| Color | HEX | Usage |
|---|---|---|
| Burnt Orange (Primary) | `#C85A3D` | Headers, primary buttons, brand text, **Vacation rental map markers** (houses/apartments/villas) |
| Warm Gold (Accent) | `#D4A24C` | Highlights, badges (verified, premium), **Hospitality (Hotels) map markers** |
| Forest Green | `#3D8A6B` | Success, **Farms/Cabins/Chalets map markers** |
| Teal | `#3D8A95` | **Hotel-Apartments map markers** |
| White | `#FFFFFF` | Backgrounds |
| Warm Cream | `#FBF7F2` | Section backgrounds, cards |
| Charcoal | `#2C2826` | Body text |
| Muted Gray | `#7A7570` | Secondary text |
| Warning Amber | `#E0A23A` | Pending review, warnings |
| Error Red | `#B83A3A` | Errors, cancelled bookings |

### 8.3. Map Color Code (Critical for Visual Hierarchy)
The map is a primary navigation surface. Markers are color-coded by listing category:
- 🟧 **Burnt Orange**: Houses, Apartments, Villas
- 🟢 **Forest Green**: Farms, Cabins, Chalets
- 🟡 **Gold**: Hotels, Resorts
- 🔵 **Teal**: Hotel-Apartments

Users learn the code intuitively after browsing for a few minutes.

### 8.4. Brand Voice
- **Warm, hospitable, trustworthy** — reflects Syrian hospitality (الضيافة السورية)
- **Clear and direct** — avoids jargon, easy for non-tech users
- **Bilingual-first** — never reads like a translation

---

## 9. Core Principles (Non-Negotiable)

1. **Two systems, never confused**: Vacation rentals ≠ Hospitality at every layer (UI, API, DB, business logic)
2. **Security first**: every financial flow is auditable, every contact is mediated
3. **Trust through verification**: no listing goes live without admin approval
4. **No off-platform deals**: contact information is blocked until booking is confirmed
5. **Transparent pricing**: guest sees a single nightly/subtotal line for the stay + visible service fee; never sees the commission internals
6. **Mobile-conscious**: desktop is primary build target, but mobile UX is never an afterthought
7. **Bilingual parity**: Arabic is not "an addition" — it is co-equal with English
8. **Local payment respect**: Sham Cash and MTN Cash are first-class, not workarounds
9. **Smart, not noisy**: AI-powered features (price intelligence, scarcity nudges) help users without manipulating them

---

## 10. Key Differentiators

These are the features that make Suknaa more than "Airbnb+Booking for Syria":

| Feature | What It Does |
|---|---|
| **Dual-system tabs** | Users never confused about what they're booking |
| **Commission passthrough choice** | Hosts choose if they absorb the commission or pass it to guests (always invisible to guest) |
| **Per-space vacation rental listings** | Stays described room-by-room (like Airbnb), giving guests a true picture |
| **Hotel inventory engine** | Real-time per-room-type availability (like Booking.com), preventing overbooking |
| **Price intelligence** | Market signals to hosts ("demand up 30%, raise prices") + pricing assistant ("you're priced 40% above similar listings") |
| **Anti-circumvention safeguards** | Hosts who artificially lower availability are flagged; encourages on-platform bookings |
| **Scarcity nudges** | Honest urgency signals ("3 rooms booked in the last 24 hours") to help decisions |
| **Smart upgrades at checkout** | "$15 more for a balcony view" — increases revenue, improves guest experience |
| **Nearby attractions on map** | Restaurants, sites, mosques, hospitals shown around each listing with distances |
| **Discover Syria** | Destination guides, landmarks, restaurants, and local stories that make Suknaa a travel reference, not only a booking tool |
| **Trips and planning** | Guest trip dashboard plus future multi-city planning for travelers visiting more than one Syrian city |
| **AI search assistant** | Data-grounded assistant for finding stays, comparing prices, choosing dates, and planning trips from live Suknaa data |
| **Dual rating** | Both the listing AND the host get rated separately |
| **Host profile pages** | See all vacation rental and hotel listings from one host; build trust through reputation |

---

## 11. Out of Scope (for now)

- ❌ Long-term residential rentals (>30 days as primary use case — but supported via monthly pricing tier)
- ❌ Property sales (buying/selling real estate) as a marketplace vertical
- ❌ Roommate/shared housing matchmaking
- ❌ Cash payment on arrival
- ❌ Cryptocurrency payments
- ❌ Operations outside Syria (Phase 1)
- ❌ Tier/loyalty program for users (deferred — to be re-evaluated 6 months post-launch)
- ❌ Channel manager (publishing to Booking.com/Airbnb from Suknaa) — Phase 2+
- ❌ Auto-translation between AR/EN — Phase 2

---

## 12. Success Metrics (Year 1 Targets)

- 500+ verified listings (300 vacation rentals + 200 hotel rooms across 30 hotels)
- 50+ verified hosts (mix of individuals + vacation rental operators + small/mid hotels)
- 1,000+ registered guests
- 200+ completed bookings
- <5% dispute rate
- >4.0 average listing rating
- Sustainable commission revenue covering hosting + ops costs

---

## 13. Document Map

| Document | Purpose |
|---|---|
| `PROJECT.md` | This file — vision, identity, scope |
| `ARCHITECTURE.md` | Technical stack, system design |
| `BUILD_PLAN.md` | Phased build roadmap |
| `DESIGN_SYSTEM.md` | UI tokens, components, layout rules |
| `DATABASE_SCHEMA.md` | All tables, relationships, indexes |
| `API_SPEC.md` | All API endpoints |
| `PAYMENT_SYSTEM.md` | Money flow, escrow, withdrawals, commission passthrough |
| `SECURITY.md` | Auth, KYC, fraud prevention, anti-circumvention |
| `DEPLOYMENT.md` | VPS setup, CI/CD, backups |
| `PHASE_3_M1_NAMING_PLAN.md` | Phase 3 M1: vacation rentals naming, API/DB targets, M2/M2b migration inventory |
| `.cursor/rules/suknaa.mdc` | Rules for Cursor AI when generating code |
