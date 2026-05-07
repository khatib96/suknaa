# 🎨 DESIGN_SYSTEM — Suknaa Visual Language (v2)

> Every color, every spacing value, every component pattern. Single source of truth for design.
> **v2 changes**: Three-tab navigation, dual login buttons, map color legend, hotel-specific UI patterns, scarcity badges.

---

## 1. Brand Foundation

The Suknaa brand is built on three pillars:

1. **Warm Hospitality** — Syrian houses are famous for their warmth. Our colors reflect that: burnt orange (sunset on stone), warm gold (lamplight), cream (limestone walls).
2. **Trustworthy Clarity** — Generous whitespace, clear hierarchy, no design tricks that obscure information.
3. **Bilingual Equality** — Arabic is not "an addition." RTL layouts are first-class.

---

## 2. Color System

### 2.1. Primary Palette

```css
--color-primary-50:  #FAEEE9;
--color-primary-100: #F4D8CC;
--color-primary-200: #E8B19A;
--color-primary-300: #DB8A68;
--color-primary-400: #D26F4E;
--color-primary-500: #C85A3D;  /* ← Brand Primary (from logo) */
--color-primary-600: #A84A33;
--color-primary-700: #883A28;
--color-primary-800: #682D1E;
--color-primary-900: #481F15;
```

### 2.2. Accent Palette (Gold)

```css
--color-accent-50:  #FBF5E8;
--color-accent-100: #F6E8C5;
--color-accent-200: #ECD08F;
--color-accent-300: #E2B95C;
--color-accent-400: #DAAA42;
--color-accent-500: #D4A24C;  /* ← Brand Accent (from logo) */
--color-accent-600: #B0863F;
--color-accent-700: #8C6B32;
--color-accent-800: #685026;
--color-accent-900: #44351A;
```

### 2.3. Map Category Colors (NEW v2)

These are dedicated colors for map markers and category badges:

```css
--color-map-houses:        #C85A3D;   /* Burnt orange — houses, apartments, villas */
--color-map-hotels:        #D4A24C;   /* Gold — hotels, resorts */
--color-map-farms:         #3D8A6B;   /* Forest green — farms, cabins, chalets */
--color-map-hotel-apt:     #3D8A95;   /* Teal — hotel-apartments */
--color-map-mixed:         #6B5D4F;   /* Warm brown — when "All" tab is active */
```

### 2.4. Neutrals
```css
--color-neutral-0:   #FFFFFF;
--color-neutral-50:  #FBF7F2;       /* Cream — section backgrounds */
--color-neutral-100: #F5EFE6;
--color-neutral-200: #E8E0D3;
--color-neutral-300: #C9C1B5;
--color-neutral-400: #9D9690;
--color-neutral-500: #7A7570;
--color-neutral-600: #5A554F;
--color-neutral-700: #3D3935;
--color-neutral-800: #2C2826;       /* Body text */
--color-neutral-900: #1A1715;
```

### 2.5. Semantic Colors
```css
--color-success-50:  #E8F3EE;
--color-success-500: #3D8A6B;
--color-success-700: #2C6850;

--color-warning-50:  #FBF1DE;
--color-warning-500: #E0A23A;
--color-warning-700: #B07F2A;

--color-error-50:    #F5E0E0;
--color-error-500:   #B83A3A;
--color-error-700:   #8A2A2A;

--color-info-50:     #E0EAF0;
--color-info-500:    #4A7A95;
--color-info-700:    #345A70;
```

### 2.6. Color Usage Rules
- **Primary (Burnt Orange)**: Main CTAs, header brand text, key links, real estate map markers
- **Accent (Gold)**: Verified badges, premium markers, hotel map markers, star ratings
- **Map colors**: ONLY on map markers and category badges — never as text or backgrounds
- **Charcoal**: All body text (never pure black)

---

## 3. Typography

### 3.1. Fonts
| Use | Arabic | English |
|---|---|---|
| Headings | **Tajawal** Bold/ExtraBold | **Plus Jakarta Sans** Bold/ExtraBold |
| Body | **Tajawal** Regular/Medium | **Inter** Regular/Medium |
| Numbers / Prices | **Inter** Tabular | **Inter** Tabular |

### 3.2. Type Scale
```css
--font-size-xs:   0.75rem;
--font-size-sm:   0.875rem;
--font-size-base: 1rem;
--font-size-lg:   1.125rem;
--font-size-xl:   1.25rem;
--font-size-2xl:  1.5rem;
--font-size-3xl:  1.875rem;
--font-size-4xl:  2.25rem;
--font-size-5xl:  3rem;
--font-size-6xl:  3.75rem;
```

### 3.3. Line Heights
```css
--line-height-tight:   1.2;
--line-height-snug:    1.4;
--line-height-normal:  1.6;
--line-height-relaxed: 1.75;
```
> Arabic line-heights are ~10% higher than English equivalents.

### 3.4. Numbers
- Always Latin digits (1, 2, 3) — never Arabic-Indic (١, ٢, ٣)
- Tabular figures for prices and dates

---

## 4. Spacing & Layout
```css
--spacing-1:  0.25rem;  /* 4px */
--spacing-2:  0.5rem;
--spacing-3:  0.75rem;
--spacing-4:  1rem;     /* base */
--spacing-5:  1.25rem;
--spacing-6:  1.5rem;
--spacing-8:  2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
--spacing-20: 5rem;
--spacing-24: 6rem;
--spacing-32: 8rem;
```

### Container Widths
```css
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
```

### Breakpoints (mobile-first)
```css
--breakpoint-sm:  640px;
--breakpoint-md:  768px;
--breakpoint-lg:  1024px;
--breakpoint-xl:  1280px;
--breakpoint-2xl: 1536px;
```

---

## 5. Border Radius & Shadows

### 5.1. Radius
```css
--radius-sm:   0.25rem;  /* inputs, small */
--radius-md:   0.5rem;   /* buttons, badges */
--radius-lg:   0.75rem;  /* cards */
--radius-xl:   1rem;     /* modals */
--radius-2xl:  1.5rem;   /* featured */
--radius-full: 9999px;   /* pills, avatars */
```

### 5.2. Shadows (warm-toned)
```css
--shadow-sm:   0 1px 2px rgba(44, 40, 38, 0.05);
--shadow-md:   0 4px 6px -1px rgba(44, 40, 38, 0.08);
--shadow-lg:   0 10px 15px -3px rgba(44, 40, 38, 0.08);
--shadow-xl:   0 20px 25px -5px rgba(44, 40, 38, 0.10);
--shadow-2xl:  0 25px 50px -12px rgba(44, 40, 38, 0.15);
```

---

## 6. Top Navigation (Critical NEW v2 Pattern)

### 6.1. Header Structure (Public Pages)

**Desktop layout (LTR for clarity; flips for RTL):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]   [الكل] [عقارات] [فنادق]                        [تسجيل الدخول]   [AR/EN] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Component breakdown:**
1. **Logo** — left/start. Click → home.
2. **Tabs** — center. Persistent on every public page. Active tab has filled background and color matching the category (orange for "Real Estate", gold for "Hotels", neutral for "All"). Default: "All".
3. **Login button** — right/end. A single prominent button:
   - **"تسجيل الدخول"** (Login) — primary outline or solid style.
   - Host login will be accessible via the dropdown menu upon clicking this button, or from the footer, to avoid distracting the majority of users (guests).
4. **Language switcher** — far end.

**Mobile layout:**
- Logo + hamburger
- Tabs become a horizontal scrollable strip below header
- Login buttons inside hamburger menu

### 6.2. Tab Behavior

When the user switches tabs on a search results page:
- The category filter is updated (`?kind=real_estate` or `?kind=hospitality`)
- Side filters update (different filters per category)
- Map markers update (re-colored)
- Search query persists (city, dates, guests)
- Sort default changes:
  - "All": relevance
  - "Real Estate": price ↑
  - "Hotels": star rating ↓

### 6.3. The Tabs as Discovery Tool
On the **homepage**, the tabs are at the top, but the page also features:
- Featured Real Estate (carousel of top houses)
- Featured Hotels (carousel of top hotels)
- A clear "Explore All" CTA

This way, even users who land on "All" tab discover both categories naturally.

---

## 7. Components

### 7.1. Buttons

| Variant | Use | Style |
|---|---|---|
| **Primary** | "Book Now", "Submit" | bg primary-500, text white |
| **Secondary** | Secondary actions | border primary-500, text primary-500 |
| **Accent (Gold)** | Premium/host actions | bg accent-500, text white |
| **Ghost** | Tertiary | text neutral-700 |
| **Danger** | Destructive | bg error-500 |

**Sizes:** `sm` (px-3 py-1.5), `md` (px-4 py-2), `lg` (px-6 py-3).

**States:** default, hover (slight lift, darker bg), active, focus (ring), disabled (50%).

### 7.2. Input Field
- Border 1px neutral-200, bg white, padding 12px/10px, radius md
- Focus: border primary-500, ring primary-100
- Error: border error-500, helper in error-700

### 7.3. Property Card (Real Estate)
```
┌─────────────────────────────┐
│                             │
│    [Property Cover Image]   │  ← 16:10 aspect
│                  ❤️         │
│  ✨ Verified  🟧 House      │  ← Category color tag
├─────────────────────────────┤
│ بيت جميل في وسط دمشق   ⭐4.8│
│ دمشق، باب توما               │
│                             │
│ $45 / ليلة          [احجز →]│
└─────────────────────────────┘
```

### 7.4. Hotel Card (Hospitality) — NEW
```
┌─────────────────────────────┐
│                             │
│    [Hotel Cover Image]      │  ← 16:9 aspect (hotels typically wider)
│                  ❤️         │
│  ⭐⭐⭐⭐ 4-star  🟡 Hotel    │  ← Stars + category color
├─────────────────────────────┤
│ فندق الشام الكبير      8.7  │  ← Score from 10 (Booking-style)
│ دمشق، شارع بغداد             │
│ 4 أنواع غرف متاحة             │  ← Hotels show "X room types"
│                             │
│ من $40 / ليلة       [اطلع →]│  ← "From" because price varies by room type
└─────────────────────────────┘
```

### 7.5. Room Type Card (inside Hotel detail page) — NEW
```
┌──────────────────────────────────────────────┐
│  [Room Image]       غرفة دبل ستاندرد              │
│                     20m² · سرير دبل · 2 ضيوف     │
│                     ✓ تكييف  ✓ واي فاي  ✓ شاشة    │
│                                              │
│  متبقي 3 من 5      $60 / ليلة      [احجز →]    │
└──────────────────────────────────────────────┘
```

### 7.6. Bedroom/Space Card (inside Property detail page) — NEW
```
┌─────────────────────────────────────┐
│ [Room Image Carousel]               │
│                                     │
│ غرفة النوم الرئيسية                     │
│ سرير كينج · حمام داخلي · 16m²            │
│                                     │
│ ✓ تكييف  ✓ خزانة  ✓ شرفة              │
└─────────────────────────────────────┘
```

### 7.7. Badges

| Badge | Color | When |
|---|---|---|
| ✨ موثّق (Verified) | accent-100 bg, accent-700 text | Verified host |
| ⚡ حجز فوري (Instant) | success-100 bg, success-700 text | `booking_mode = instant` |
| 🆕 جديد (New) | cream bg, neutral-700 text | Listed < 30 days |
| 🔥 مميز (Featured) | gold gradient | Editorially featured |
| 🟧 عقار (Real Estate) | category color, white text | On mixed search results |
| 🟡 فندق (Hotel) | category color, white text | On mixed search results |
| ⭐⭐⭐ stars | accent-500 icons | Hotel star rating |

### 7.8. Scarcity Nudges (NEW v2)
Discreet, never alarming. Shown above the booking button:
```
┌──────────────────────────────────────┐
│ ⚠ متبقي غرفة وحدة بهذا السعر          │
│ ◷ تم حجز 3 غرف بآخر 24 ساعة          │
│ ✓ أفضل سعر بهذه المنطقة                │
└──────────────────────────────────────┘
```
Rules:
- Max 2 visible at a time (don't overwhelm)
- Truthful only — pulled from real data
- Color: warning-50 bg, warning-700 text (urgent), or success-50/success-700 (positive)

### 7.9. Pricing Tier Card (Host Side) — NEW
For hosts entering pricing:
```
┌─────────────────────────────────────┐
│ سعر الليلة                            │
│                                     │
│  أساسي           [   $50.00   ]      │
│  أسبوعي ≥7 ليالي  [   $42.00   ] (opt)│
│  شهري ≥30 ليلة    [   $35.00   ] (opt)│
│                                     │
│  زيادة عطلة نهاية الأسبوع (Fri/Sat) [+20%] │
│                                     │
│  + إضافة سعر موسمي                    │
└─────────────────────────────────────┘
```

### 7.10. Commission Choice Toggle (Host Side) — NEW v2
Critical UX. Shown when host creates/edits property pricing:
```
┌──────────────────────────────────────────────┐
│ كيف تريد التعامل مع عمولة المنصة؟                │
│                                              │
│  ⚪ أنا أتحملها (الافتراضي)                       │
│     • السعر اللي بتحطه = اللي يشوفه الزبون        │
│     • أنت تستلم: السعر − العمولة المحددة بحسابك  │
│     • مثال: تكتب $50 → الزبون يشوف $50 → تستلم $44 │
│                                              │
│  ⚪ أمررها على الزبون                            │
│     • السعر اللي بتحطه = اللي تستلمه صافي         │
│     • النظام يحسب السعر الظاهر تلقائياً             │
│     • مثال: تكتب $50 → الزبون يشوف $56.82 → تستلم $50 │
│                                              │
│ ℹ️ في كل الحالات: الزبون لا يرى أي ذكر للعمولة     │
│ ℹ️ رسوم الخدمة/الضرائب تظهر للزبون كبنود منفصلة عند تطبيقها │
└──────────────────────────────────────────────┘
```

### 7.11. Modal & Lightbox
- Overlay: `rgba(44, 40, 38, 0.6)`
- Container: white, radius xl, shadow-2xl
- Max width: 600/800/1000 px
- Close button at top-end
- ESC closes, click-outside closes

---

## 8. The Map (NEW v2 detailed spec)

### 8.1. Marker System
Each marker is a colored pin shaped like a tear-drop. Color = category. Inside the pin: an icon + price.

```
   🟧
  /  \
 |$50 |    ← House
  \  /
   \/
```

Hovering reveals a mini-card with image + name + rating + price.

### 8.2. Marker Cluster
At zoom-out levels, nearby markers cluster into a circle showing the count and the most prominent category color.

### 8.3. Nearby Attractions Layer (NEW v2)
On a property/hotel detail page, the embedded map shows:
- The property/hotel marker (large, central)
- Nearby attractions (smaller icons within 2km radius)

Icon legend:
- 🍽 Restaurants
- ☕ Cafes
- 🏬 Markets/Malls
- 💊 Pharmacies
- 🏥 Hospitals
- 🕌 Mosques
- ⛪ Churches
- 🏛 Historical sites
- 🌳 Parks
- 🚌 Public transport

User can toggle categories on/off via filter chips.

### 8.4. Distance Display
Below the map, a list:
```
المعالم القريبة:
🍽 مطعم النابلسي           150 م مشي
🏬 سوق الحميدية              500 م مشي
🏛 الجامع الأموي              700 م مشي
🏥 مستشفى المواساة         1.2 كم سيارة
```

---

## 9. Property Detail Page Structure (Real Estate)

```
┌─────────────────────────────────────────┐
│ [Image Gallery — Hero, 50% viewport]    │
├─────────────────────────────────────────┤
│                                         │
│ Title                          [♥ Save] │
│ Location · Type · Reviews              │
│                                         │
│ Quick stats: Guests · Bedrooms · Beds · Baths│
│                                         │
│ Description                             │
│                                         │
│ ───── Per-Room Section ─────            │
│ • [Bedroom 1 Card]                      │
│ • [Bedroom 2 Card]                      │
│ • [Bathroom Card]                       │
│ • [Kitchen Card]                        │
│ • [Garden Card]                         │
│                                         │
│ ───── Amenities Section ─────           │
│ Property-wide amenities (icons + labels)│
│                                         │
│ ───── Map + Attractions ─────           │
│                                         │
│ ───── Reviews Section ─────             │
│ Property rating + Host rating (separate)│
│                                         │
│ ───── Host Profile Section ─────        │
│ Name · Avatar · Bio · "View All Listings"│
│                                         │
└─────────────────────────────────────────┘

[Sticky booking widget on the right (desktop)]
```

---

## 10. Hotel Detail Page Structure (Hospitality)

```
┌─────────────────────────────────────────┐
│ [Hotel Image Gallery — Hero]            │
├─────────────────────────────────────────┤
│                                         │
│ Hotel Name + ⭐⭐⭐⭐    Score 8.7  [♥]    │
│ Location                               │
│                                         │
│ Quick stats: Total rooms · Check-in/out │
│                                         │
│ Description                             │
│                                         │
│ ───── Hotel Amenities ─────             │
│ (24h reception, breakfast, spa, gym...) │
│                                         │
│ ───── Available Rooms (Date-aware) ───  │
│ For each room type matching dates:      │
│ • [Room Type Card: name, photos, beds,  │
│    amenities, "X of Y available", price]│
│                                         │
│ ───── Map + Attractions ─────           │
│                                         │
│ ───── Reviews Section ─────             │
│                                         │
│ ───── Host (Hotel Company) Profile ─── │
│                                         │
└─────────────────────────────────────────┘

[Sticky date/guests selector at top on scroll]
```

---

## 11. Host Profile Page (NEW v2)

Public page showing all properties/hotels by one host:
```
┌──────────────────────────────────────┐
│ [Avatar]  محمد أحمد                  │
│ مضيف منذ 2024                         │
│ ⭐ 4.8 (124 تقييم) · ✓ موثّق               │
│ يستجيب خلال 30 دقيقة                   │
│                                      │
│ نبذة:                                  │
│ ...                                  │
│                                      │
│ ───── عقاراته (8) ─────                │
│ [Grid of property/hotel cards]       │
└──────────────────────────────────────┘
```

---

## 12. Wishlist with Sharing (NEW v2)

```
┌──────────────────────────────────────┐
│ [Wishlist Name] (5 عقارات)             │
│ [مشاركة] [تعديل] [حذف]                  │
│                                      │
│ [Grid of property cards]             │
└──────────────────────────────────────┘
```

When "Share" is clicked: a modal with a copy-able link, plus options to share via WhatsApp, Telegram, copy link.

---

## 13. Comparison Table (NEW v2)

When user adds 2-4 properties to comparison:
```
┌────────────┬─────────┬─────────┬─────────┐
│ Feature    │ A       │ B       │ C       │
├────────────┼─────────┼─────────┼─────────┤
│ صورة         │  [img]  │  [img]  │  [img]  │
│ السعر         │  $50    │  $65    │  $45    │
│ التقييم      │  4.8    │  4.5    │  4.9    │
│ غرف نوم      │  3      │  4      │  2      │
│ مسبح         │  ✓      │  ✗      │  ✓      │
│ موقف         │  ✓      │  ✓      │  ✗      │
│ ...        │  ...    │  ...    │  ...    │
└────────────┴─────────┴─────────┴─────────┘
```

Differences highlighted in accent color.

---

## 14. Pricing Suggestion Banner (Host Side, NEW v2)

When the system has a suggestion for a host:
```
┌────────────────────────────────────────────────┐
│ 💡 اقتراح تسعير                                  │
│ بناءً على الطلب المرتفع في دمشق هذا الأسبوع،      │
│ يمكنك رفع سعر "بيت باب توما" بنسبة 15%.            │
│ السعر الحالي: $50  →  السعر المقترح: $57.50         │
│                                                │
│ [قبول الاقتراح]  [تعديل يدوي]  [تجاهل]            │
└────────────────────────────────────────────────┘
```

Shown in host dashboard, not pushy. Dismissible. Logged as `pricing_suggestions.actioned_at` or `dismissed_at`.

---

## 15. RTL & LTR Considerations
*(Same as v1 — use logical properties `ms-4`, `me-4`, `ps-4`, `pe-4`. Numbers always Latin.)*

---

## 16. Iconography
- **Library**: Lucide Icons (consistent, comprehensive, MIT)
- **Custom icons** to commission:
  - Property type icons (house, hotel, farm, cabin, chalet, hotel-apartment, resort)
  - Bedroom bed-types (single, double, queen, king, sofa, bunk)
  - Bathroom types (full, half, shower)
  - Map attraction categories (mosque, church, monument, etc.)

---

## 17. Imagery Guidelines
- **Property photos**: minimum 1200×800; WebP/AVIF with JPEG fallback
- **Hotel photos**: ideally 1920×1080 (hotels show wider images)
- **Per-room photos**: minimum 800×600
- **Hero images**: warm tones, real Syrian locations
- **Avatars**: square crop, displayed circular

---

## 18. Accessibility
- WCAG AA contrast minimum
- Keyboard reachable
- Focus rings visible
- Screen-reader labels on icon buttons
- Skip-link at top of every page
- `<html lang dir>` switches with i18n

---

## 19. Tailwind Config Sketch
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { 500: '#C85A3D', /* ... full scale */ },
        accent:  { 500: '#D4A24C', /* ... */ },
        cream:   '#FBF7F2',
        // Map category colors
        'map-houses':    '#C85A3D',
        'map-hotels':    '#D4A24C',
        'map-farms':     '#3D8A6B',
        'map-hotelapt':  '#3D8A95',
      },
      fontFamily: {
        sans:    ['var(--font-tajawal)', 'var(--font-inter)', 'system-ui'],
        display: ['var(--font-tajawal)', 'var(--font-jakarta)', 'system-ui'],
      },
    },
  },
} satisfies Config;
```

---

## 20. Don't List
- ❌ Pure black `#000` (too harsh)
- ❌ Arabic-Indic numerals (١٢٣)
- ❌ Large gradient backgrounds
- ❌ Hover-only interactions for critical info
- ❌ Misleading scarcity nudges
- ❌ Showing commission to guests (anywhere, ever)
- ❌ "Login as Host" without making "Login as Guest" equally prominent
- ❌ Putting hotels in real-estate-style cards (or vice versa)
