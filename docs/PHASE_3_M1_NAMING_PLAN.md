# Phase 3 M1 — Domain Naming and Contracts

> **Status:** Adopted — M1 complete (documentation, 2026-05-13)
> **Date:** 2026-05-13
> **Scope:** Canonical naming and API/DB contracts for **Vacation Rentals / Holiday Homes (بيوت العطلات)**. No schema migrations or code changes are implied by this document alone — implementation follows in M2 / M2b.

**Canonical detailed plan:** this file. High-level Phase 3 roadmap: [PHASE_3_VACATION_RENTALS_PLAN.md](./PHASE_3_VACATION_RENTALS_PLAN.md).

---

## 1. Product decision (approved)

Suknaa is **not** a broad real-estate marketplace. The first guest-facing vertical is **short-stay rental supply**: homes, apartments, villas, farms, chalets, cabins, and studios that guests book as stays.

**Mohammad approval:** adopt a **deliberate full rename / migration path**. Identifiers such as `real_estate`, “Real Estate”, “RE”, and **عقارات** as a *product tab name* are **not** accepted long-term. They may still exist **temporarily** in the repo or database until M2b migration — listed only as **pre-migration inventory** (Section 6), never as normative future naming.

---

## 2. Glossary (agents and copy)

| Context | Arabic (user-facing) | English (user-facing) |
|--------|------------------------|------------------------|
| Product area | بيوت العطلات | Vacation rentals / Holiday homes |
| One listing | بيت عطلات | Vacation rental / Holiday home |
| Host | مضيف بيوت عطلات | Vacation rental host |
| Guest action | حجز إقامة | Book a stay |
| Vacation rental operator host (subtype) | مشغّل بيوت عطلات | Vacation rental operator |

**Avoid for product/domain labeling:** عقارات, “Real Estate” (as category), “RE” as shorthand for this vertical.

**English note:** the word “property” may still appear in **generic** phrases (e.g. damage to the property, house rules). It must **not** label the vertical, routes, or public APIs — prefer **listing** / **vacation rental**.

---

## 3. Approved vacation rental types (reference enum)

Canonical **seven** values for `vacation_rental_type` (or equivalent) in DB, API, and seeds:

| Key | Arabic |
|-----|--------|
| `apartment` | شقة |
| `house` | بيت |
| `villa` | فيلا |
| `farm` | مزرعة |
| `chalet` | شاليه |
| `cabin` | كوخ |
| `studio` | استوديو |

Do **not** use `re_property_type` as the long-term enum name in new documentation or new migrations.

---

## 4. Target technical naming matrix

| Layer | Convention | Example |
|-------|------------|---------|
| NestJS module folder | kebab-case | `apps/api/src/modules/vacation-rentals/` |
| Nest module class | PascalCase | `VacationRentalsModule` |
| REST paths (host) | plural resource | `/v1/me/vacation-rentals`, `/v1/me/vacation-rentals/:id/spaces` |
| URL search tab | snake_case query | `?tab=vacation_rentals` (with `all`, `hospitality`) |
| Search / polymorphic `kind` | snake_case | `vacation_rentals` |
| Prisma model | PascalCase | `VacationRental` |
| DB tables / columns | snake_case | `vacation_rentals`, `vacation_rental_spaces` |
| TypeScript domain / DTOs | PascalCase / camelCase | `VacationRental`, `createVacationRentalDto` |
| `host_category` (target) | enum value | `vacation_rentals` (replaces `real_estate`) |
| `host_subtype` (target, vacation side) | enum value | **`vacation_rental_operator`** only (replaces legacy `real_estate_office`; Arabic UX: **مشغّل بيوت عطلات**) |
| Host listing counter column (target) | snake_case | e.g. `vacation_rental_total_listings` (replaces `re_total_listings`) |

**Frontend (target):** public detail route `/vacation-rentals/[id]`; redirect policy from legacy `/property/[id]` when UI milestone runs.

---

## 5. Policy: full rename path

1. **End state:** No public contract, new table family, or normative doc describes this vertical as “real estate” or uses `real_estate` / `/me/properties` as canonical.
2. **`host_category`:** PostgreSQL + Prisma + JSON wire → **`vacation_rentals`**.
3. **`real_estate_office`:** Migrates to **`vacation_rental_operator`** (single normative subtype for non-individual vacation-rental hosts). Arabic UX label: **مشغّل بيوت عطلات**.
4. **New listing persistence:** tables prefixed `vacation_rental_*` / `vacation_rentals` — not `properties` / `re_*` as the canonical family name for new work.
5. **Error codes:** Keep stable machine codes (e.g. `WRONG_HOST_CATEGORY`); update human-readable descriptions to “vacation rental host” vs “hospitality host”.

**Phasing**

- **M1:** Documentation + contracts only (this file + updated core docs).
- **M2:** Vacation rental listing schema, `vacation_rental_type` enum, Nest `vacation-rentals` module, seeds — **target names only**.
- **M2b:** Migrate Phase 2 enums/columns (`host_profiles`, `kyc_submissions`), auth/Zod/web/scripts/tests so **`real_estate` is eliminated** from wire and DB.

---

## 6. Pre-migration inventory only (current codebase — not target)

| Surface | Current (examples) | Migrate in |
|---------|-------------------|------------|
| PostgreSQL `host_category` | `real_estate` | **M2b** → `vacation_rentals` |
| PostgreSQL `host_subtype` | `real_estate_office` | **M2b** → **`vacation_rental_operator`** |
| Column `re_total_listings` | `host_profiles` | **M2b** → e.g. `vacation_rental_total_listings` |
| Zod / packages | `real_estate` in enums | **M2b** |
| Web host apply / onboarding | `real_estate`, `re_office` | **M2b** |
| Search tab | `?tab=real_estate` | **M2b** + redirects for old URLs |
| Amenities mock | `appliesTo: "real_estate"` | **M2b** → `vacation_rentals` |
| Routes / components | `/property/*`, `Property*` | UI milestone (e.g. M10) + redirects |

Forward-looking **docs** for bookings/listings must already say **`vacation_rentals`** so M2 does not reintroduce `kind=real_estate` or `/me/properties` as canonical.

---

## 7. M2 vs M2b — implementation checklist (for engineers)

### M2 (listing domain)

- [ ] Prisma: `vacation_rentals` (+ spaces, images, amenities joins, availability, pricing per Phase 3 plan).
- [ ] Enum `vacation_rental_type` with the seven keys in Section 3.
- [ ] Nest `vacation-rentals` module aligned with [API_SPEC.md](./API_SPEC.md).
- [ ] Seeds: types + amenity applicability flags use `vacation_rentals`, not `real_estate`.

### M2b (Phase 2 identity / KYC — required to fully remove `real_estate`)

- [ ] PostgreSQL: migrate `host_category` value `real_estate` → `vacation_rentals` (safe enum migration pattern for your PG version).
- [ ] PostgreSQL: migrate `host_subtype` `real_estate_office` → **`vacation_rental_operator`**.
- [ ] Backfill `host_profiles`, `kyc_submissions` intended fields.
- [ ] Rename `re_total_listings` → agreed column name.
- [ ] Prisma regenerate; update `auth.service`, admin KYC, `packages/types`, web flows, manual scripts, `apps/api/tests/auth-flows.test.ts`.
- [ ] Frontend: `search-utils`, `tab.ts`, deep links, amenities discriminator.

---

## 8. Open decisions (before M2b migration)

1. **Deploy shape:** M2 and M2b in one release vs two steps (listings first, enum second).
2. **Route cutover:** same change train as tab query vs deferred to guest-detail milestone.

*(Host subtype is finalized: **`vacation_rental_operator`** only — see §4 and §5.)*

---

## 9. M1 acceptance criteria (documentation)

- [x] This file exists with glossary, seven types, target matrix, pre-migration inventory, M2/M2b lists, and remaining open decisions (§8).
- [x] Core docs (`PROJECT.md`, `ARCHITECTURE.md`, `API_SPEC.md`, `DATABASE_SCHEMA.md`, `SECURITY.md`) use **`vacation_rentals`** and **بيوت العطلات** for normative product/API description (with explicit notes where legacy DB symbols remain until M2b).
- [x] [PHASE_3_VACATION_RENTALS_PLAN.md](./PHASE_3_VACATION_RENTALS_PLAN.md) M1 points here; [BUILD_PLAN.md](./BUILD_PLAN.md) cites M1 as gate before M2.
- [x] [ai_memory.md](../ai_memory.md) normative tab line uses **بيوت العطلات** and references this file.
- [x] Explicit line in §1 / §6: **`real_estate` / عقارات / RE are not accepted future naming** — only pre-migration inventory until M2b.
- [x] No code, migrations, or UI refactors are **required** to close M1 — only documentation updates.

---

## 10. Recommended next step (post-M1)

1. Implement **M2** with target naming only.
2. Schedule **M2b** immediately after (or same train) to complete enum/column migration so nothing public keeps `real_estate`.
