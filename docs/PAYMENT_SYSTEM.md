# 💰 PAYMENT_SYSTEM — Suknaa Money Flow (v2)

> Every dinar that touches Suknaa flows through this document.
> **v2 changes**: Commission can be absorbed by host OR passed through to guest. Service fee separated and always shown to guest. Invoice never shows commission.
> **2026-05-08 decision**: commission, service fees, taxes, discounts, and promotional waivers are never hard-coded business constants. They are resolved through configurable financial rules, permissioned overrides, and booking-time snapshots.

---

## 1. The Core Pricing Model (CRITICAL)

Suknaa's pricing model is the heart of the financial system. Get this wrong and everything else breaks. **Read this section twice.**

### 1.1. The Two Building Blocks

| Component | Who Pays | Configurable By | Visible to Guest? |
|---|---|---|---|
| **Commission** | Always the host (financially) — but pricing display can shift the apparent burden | Financial rules engine + permissioned admin/contract overrides | **NEVER** (always invisible) |
| **Service Fee** | Usually the guest (financially), unless waived/discounted by rules | Financial rules engine + guest/promo overrides | **ALWAYS** when charged (transparent line item) |
| **Taxes / Local Fees** | Depends on law/contract and listing type | Host/hotel can propose; Suknaa admin can approve/override | **ALWAYS** when charged as legal line items |

### 1.1.1. No Fixed Financial Rates In Code

Suknaa may seed suggested defaults such as 12% commission or 2% service fee, but these are **starting configuration only**. They must never be compiled into booking logic as permanent constants.

All financial amounts are resolved by a rules engine before quote/booking creation:
1. Manual booking-level override, if a privileged user applies one
2. Discount/promotion/trial rules, including cases like "0% commission for first N bookings"
3. Guest-specific service-fee or coupon rules
4. Host/property/hotel/room-type overrides
5. Host organization or hotel-company contract rules
6. Listing category/type default rules
7. Global fallback rules

Every booking stores a snapshot of the resolved rule IDs/sources, basis points, fixed amounts, passthrough mode, taxes, discounts, and final totals. Later edits to rules must not alter historical bookings.

### 1.2. The Host's Choice: Commission Passthrough

Each host, **per property** (or per hotel), chooses one of two settings:

#### Setting A — "Commission on Me" (Default)
- Host writes the price they want guests to see: e.g., **$50**
- Host receives: $50 − 12% commission = **$44**
- Guest sees: **$50** (property price) + $1.00 (service fee 2%) = **$51.00 total**

#### Setting B — "Pass Commission to Guest"
- Host writes the **net amount** they want to receive: e.g., **$50**
- System computes the gross-up: $50 ÷ (1 − 0.12) = **$56.82**
- Host receives: $56.82 − 12% commission = **$50.00** (exactly the net they wanted)
- Guest sees: **$56.82** (property price) + $1.14 (service fee 2%) = **$57.96 total**

### 1.3. The Critical UX Rule: Invoice Never Mentions Commission

The guest's invoice **always** shows exactly two line items (plus subtotals):

```
نوع الإقامة (3 ليالي × $50)              $150.00
رسوم خدمة سُكنى                            $3.00
ضرائب/رسوم محلية، إن وجدت                 $0.00
─────────────────────────────────────────────────
الإجمالي                                   $153.00
```

Whether the host chose "absorb" or "passthrough" is **invisible to the guest**. They simply see the property's listed price.

> **Why?** Commercial competitiveness. If we labeled "passthrough" as "the host's commission you're paying," guests would view those properties as worse deals — even though the *total they pay* is what matters to them. By treating the property price as one number (whatever it is), every property competes on its displayed price.

### 1.4. Search Result Implications

Two near-identical houses might display differently:
- **Property A** — host absorbs commission. Lists $50. Search shows **$50**.
- **Property B** — host passes commission. Lists $50 (net). Search shows **$56.82**.

Property A appears cheaper. The market self-regulates: hosts who pass through must offer better value to compete. This is by design — it gently incentivizes hosts to absorb commission.

### 1.5. When Can the Host Change This Setting?

- **Default**: "Absorb" (most beginner-friendly)
- **Can switch anytime**: yes
- **Exception**: cannot switch while there's an active confirmed booking for that property/hotel — must wait until current bookings are completed (snapshot of setting is recorded on each booking, so existing bookings honor the original choice)

### 1.6. The Math (Reference)

```
Let P    = price the host wrote
Let c    = resolved commission basis points / 10000
Let s    = resolved service fee basis points / 10000
Let pt   = passthrough flag (0 or 1)

If pt == 0 (absorb):
    property_price_shown_to_guest = P
    commission_amount             = P × c
    host_receives                 = P × (1 − c)

If pt == 1 (passthrough):
    property_price_shown_to_guest = P / (1 − c)        // gross-up
    commission_amount             = property_price_shown_to_guest × c
    host_receives                 = P                  // exactly P, by design

In both cases:
    service_fee = property_price_shown_to_guest × s
    taxes       = resolved tax rules over the configured taxable basis
    discounts   = resolved discounts/promos
    guest_total = property_price_shown_to_guest + service_fee + taxes − discounts
```

### 1.7. Worked Example

**Setup:** Host writes $100. Example resolved rules: commission 12%, service fee 2%, no tax, no discount.

| | Absorb (default) | Passthrough |
|---|---|---|
| Host wrote | $100 | $100 |
| Property price (guest sees) | $100.00 | $113.64 |
| Service fee (2%) | $2.00 | $2.27 |
| **Guest pays total** | **$102.00** | **$115.91** |
| Commission (Suknaa keeps) | $12.00 | $13.64 |
| **Host receives** | **$88.00** | **$100.00** |

> Notice: in both cases, Suknaa earns the resolved commission + resolved service fee. The choice only affects who *appears* to pay the commission.

---

## 2. Pricing Tiers (Host Side)

Hosts enter up to **4 prices per property** (or per room type, for hotels):

| Tier | Applies When | Required? |
|---|---|---|
| **Base nightly** | Any stay | ✅ Yes |
| **Weekly nightly** | Stay ≥ 7 nights | Optional (defaults to base if not set) |
| **Monthly nightly** | Stay ≥ 30 nights | Optional (defaults to weekly if not set, then base) |
| **Seasonal overrides** | Host-defined date ranges (summer, Eid, Ramadan, custom) | Optional, can have many |

Plus an optional **weekend uplift** (e.g., +20% on Fri/Sat).

### Selection Algorithm
For each night of the stay:
1. Is there a seasonal override active? → use that night's tier rates
2. Else: is the total stay ≥ 30 nights AND `monthly_price_cents` set? → use monthly
3. Else: is the total stay ≥ 7 nights AND `weekly_price_cents` set? → use weekly
4. Else: use base
5. If the night is Friday or Saturday → apply weekend uplift to the chosen rate
6. Sum all nights → `nights_subtotal_cents`

> **Implementation note**: Cache the per-night rates in the booking record (`bookings.nightly_rate_cents` is the average; the per-night breakdown is also stored as JSONB in `bookings.price_breakdown` for the receipt).

---

## 3. Money Flow Models (Same as v1)

### 3.1. Escrow (Real Estate / P2P)
```
Guest Pays → Suknaa Escrow → Host Wallet (pending)
     ↓ 24h after check-in
   Host Wallet (available) → Withdrawal
```

### 3.2. Direct (Hospitality / B2B)
```
Guest Pays → Suknaa (commission) → Host Wallet (available immediately)
                                          ↓
                                    Withdrawal
```

In both flows: the **service fee** stays with Suknaa always. The **commission** stays with Suknaa always. What differs is *when* the host's portion becomes available for withdrawal.

---

## 4. Payment Methods (Same as v1)

| Method | Target | Speed |
|---|---|---|
| Sham Cash | Local | ~Instant |
| MTN Cash | Local | ~Instant |
| Manual Bank Transfer | Anyone | 1–24h (admin approval) |
| International Card | Tourists | ~Instant (provider TBD) |

---

## 5. Financial Rules Configuration

Commission, service fees, taxes, discounts, and special contracts are configurable via the admin panel. Host/hotel-entered tax data can be accepted as input, but Suknaa must be able to approve, edit, override, or disable it before it affects guest checkout.

### 5.1. Seed Defaults, Not Fixed Rates

These rates are examples for initial seeding and market testing only. They can change per partner, per listing, per campaign, or after real-market feedback.

| Category / Type | Seed Default | Money Flow |
|---|---|---|
| Houses, Apartments, Villas | 12% | Escrow |
| Farms, Cabins, Chalets, Studios | 10% | Escrow |
| Hotels, Resorts | 8% | Direct |
| Hotel-Apartments | 10% | Direct |
| Hostels | 8% | Direct |

### 5.2. Commission Rule Examples

Supported patterns:
- Global fallback commission for a category
- Host/company contract commission
- Property/hotel/room-type special rate
- Time-limited promo such as 0% commission for the first 5 bookings
- Risk/manual adjustment from authorized operations staff
- One-off booking-level override for exceptions

### 5.3. Commission Override Hierarchy
First match wins:
1. **Manual booking override** with audited reason
2. **Promotion/discount rule** with usage limits
3. **Per-room-type / per-property / per-hotel** rule
4. **Per-host / per-organization contract** rule
5. **Per-property-type / per-hotel-type** seed rule
6. **Global fallback**

### 5.4. Service Fee
- **Seed default**: 2% global, configurable
- **Can be set per booking_kind** (e.g., 1% for hospitality, 2.5% for real estate)
- **Can be set per guest** (e.g., promo: 0% service fee for new users)
- **Can be waived by coupon or manual override**
- **Always shown to guest** as a clear line item

### 5.5. Taxes & Local Fees

Taxes are not assumed to be one global number. Hotels, companies, or hosts may enter applicable tax/local-fee requirements for their listings, but Suknaa must retain final control through approval and override tools.

Each tax rule should capture:
- Tax/fee name shown to guest
- Calculation type: percentage or fixed amount
- Taxable basis: property subtotal, service fee, per-night, per-guest, or custom
- Source: host-entered, hotel-entered, admin-entered, system/default
- Approval status and effective period
- Jurisdiction/notes when applicable

Each booking must snapshot the tax rule source, rate/amount, basis, displayed label, and final tax amount. This keeps receipts and audits stable even if a hotel changes tax settings later.

### 5.6. Discounts, Coupons, And Waivers

Discount logic must be first-class, not patched into checkout:
- Guest coupon codes
- Host acquisition campaigns
- First-N-bookings commission waiver
- Service-fee waiver for specific users
- Manual goodwill discounts
- Partner contract discounts

Discounts must have limits, audit logs, and booking snapshots.

### 5.7. Why Separate?
Treating commission and service fee as separate lets us:
- Run "0% commission" promotions for hosts without sacrificing all revenue (service fee still charged)
- Charge guests a small fee that funds support/infrastructure even when commission is waived
- Gradually shift the revenue mix as the platform matures

---

## 6. Cancellation & Refunds (Updated for v2)

### 6.1. Three Policies (Same as v1)

| Policy | ≥7 days | <7d, ≥48h | <48h |
|---|---|---|---|
| Flexible | 100% | 50% | 0% |
| Medium | 100% | 0% | 0% |
| Strict | 50% | 0% | 0% |

### 6.2. What Gets Refunded?
- **Property price portion**: refunded per the policy
- **Service fee**: refunded if refund ≥ 50%, retained otherwise
- **Commission**: refunded to Suknaa-revenue if refund = 100%, otherwise pro-rated

### 6.3. Refund Examples

**Booking total: $115.91 (passthrough), Flexible policy, cancelled 10 days before check-in:**

```
Property price portion refunded: $113.64 (100% of $113.64)
Service fee refunded: $2.27 (refund ≥ 50%, so service fee returned)
Total refunded to guest: $115.91
Commission impact: $13.64 reversed from Suknaa revenue
Host wallet impact: $100.00 reversed (was pending, never released anyway)
```

**Same booking, cancelled 3 days before check-in:**

```
Property price portion refunded: $0
Service fee refunded: $0 (since refund < 50%)
Total refunded to guest: $0
```

---

## 7. Wallet System (Updated for v2)

### 7.1. Two Buckets per Host

| Bucket | Description |
|---|---|
| **Pending** | Confirmed bookings, money held (Real Estate escrow) |
| **Available** | Withdrawable |

### 7.2. State Transitions

```
[Real Estate / Escrow]
  Guest pays $115.91
    → Suknaa keeps $13.64 commission + $2.27 service fee = $15.91
    → Host wallet: +$100.00 PENDING
  Check-in happens
    → 24h timer
  Booking marked 'completed'
    → Host wallet: -$100.00 PENDING, +$100.00 AVAILABLE

[Hospitality / Direct]
  Guest pays $115.91
    → Suknaa keeps $15.91
    → Host wallet: +$100.00 AVAILABLE (immediately)
```

### 7.3. Withdrawal Schedule (Same as v1)
- **Weekly** (Thursdays) or **Monthly** (last day) or **Manual**
- Minimum: $10
- Admin processes manually, uploads transfer proof

---

## 8. Anti-Circumvention & Off-Platform Defense (NEW v2)

This protects revenue and trust. Detailed in `SECURITY.md`. Payment-relevant excerpt:

### 8.1. Inventory Reduction Tracking
When a host reduces availability (e.g., "I rented 2 of my 5 rooms offline for May"):
- Forced to provide a **reason** (maintenance / personal use / rented offline / long-term rental / renovation / other)
- Logged in `availability_reduction_events`
- If pattern is suspicious → **risk score** increases → admin review queue

### 8.2. Risk Tiers and Consequences

| Tier | Score | Consequence |
|---|---|---|
| Low | 0–25 | Normal operations |
| Medium | 26–50 | Financial-rule review on next renewal cycle; possible commission change by authorized staff |
| High | 51–75 | Mandatory admin chat before next listing approval; financial-rule changes require senior approval |
| Critical | 76–100 | Account review; suspension possible |

### 8.3. Honest Use Is Fine
The system isn't punishing legitimate maintenance or personal use — it's tracking *patterns* (frequency, suspicious timing right after high-engagement listings, etc.).

---

## 9. Smart Upgrade at Checkout (NEW v2)

When a guest selects a room type, the booking page may show:

> **خيار ترقية**: بدفع $15 إضافية، احصل على غرفة دبل بإطلالة على الحديقة بدلاً من الغرفة المفردة.

### Logic
- Triggered when:
  1. Guest selected a room type
  2. There exists a higher-tier room type in the same hotel with availability for the same dates
  3. Price difference is < 30% of the original
- Records `bookings.upgraded_from_room_type_id` and `bookings.upgrade_accepted_at` for analytics
- Suknaa earns commission on the upgraded amount (more revenue)
- Host earns more (higher base price)
- Guest gets better experience

> Phase 5+ feature. Not in initial Phase 4.

---

## 10. Scarcity Nudges (NEW v2)

Honest urgency signals shown on listing pages:

| Signal | When Shown |
|---|---|
| "متبقي غرفة وحدة بهذا السعر!" | When `available_units_for_dates ≤ 1` |
| "تم حجز X غرف بآخر 24 ساعة" | When recent bookings ≥ 3 in last 24h for this listing |
| "أفضل سعر في هذه المنطقة" | When `price < 25th percentile` for similar listings in the city |
| "حجز سريع" badge | When `booking_mode = 'instant'` AND availability exists |

Rules:
- **Only true signals.** No fake scarcity. Ever.
- Updated in real-time (or within 60 seconds) based on actual data.
- Logged for analytics; if a signal is shown but the user doesn't book within 24h, the signal is suppressed for that user.

---

## 11. Security & Auditing
*(Same as v1. The financial change: `bookings` must record `commission_passthrough`, commission/service/tax/discount snapshots, rule IDs/sources, and final totals so any future audit can recompute exactly what the guest was shown.)*

---

## 12. Phase 4 Implementation Checklist

- [ ] **Financial rules engine** covering commission, service fee, taxes, discounts, promos, and manual overrides
- [ ] **Commission engine** with passthrough math (gross-up formula tested)
- [ ] **Service fee engine** (separately configurable)
- [ ] **Tax rules engine**: host/hotel-entered taxes with Suknaa approval/override
- [ ] **Discount/coupon engine** with usage limits and audited waivers
- [ ] **Pricing tier resolver** (4 tiers + weekend uplift + seasonal overrides)
- [ ] **Booking total calculator** that produces the exact invoice the guest will see
- [ ] **Sham Cash + MTN Cash + Manual + International** payment integrations
- [ ] **Refund engine** per policy with service fee handling
- [ ] **Wallet service**: pending ↔ available state machine
- [ ] **Withdrawal cron jobs** (weekly + monthly)
- [ ] **Idempotency middleware** on all payment endpoints
- [ ] **DB advisory locks** on booking creation
- [ ] **Audit log writes** on every financial mutation
- [ ] **Admin UI**: payment review, withdrawal queue, refund queue, financial rules manager, tax approval/override, discount/coupon manager, passthrough toggle (per host/property)
- [ ] **Tests**: full booking + payment + cancellation lifecycle for both `absorb` and `passthrough` modes
- [ ] **Edge cases**: refund > available wallet balance, simultaneous booking attempts (race), webhook duplication
