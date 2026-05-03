# 🧠 AI Memory — Suknaa Project

> **ملف الذاكرة المشتركة بين جميع أدوات الـ AI**
> هذا الملف يجب أن يُقرأ في بداية كل جلسة جديدة.
> أي AI (Antigravity / Cursor / غيرهم) يجب أن يحدث هذا الملف بعد كل جلسة.

---

## 📌 القاعدة الذهبية
قبل أي تعديل أو كتابة كود:
1. اقرأ هذا الملف بالكامل
2. اقرأ الملفات في `/docs/` المتعلقة بالمهمة (المرجع الوحيد المعتمد — v2 محدّث ومنقول إلى الجذر)
3. اقرأ ملف القواعد في `.cursor/rules/suknaa.mdc` (يُقرأ تلقائياً من Cursor عبر `alwaysApply: true`)
4. ابدأ العمل

---

## 1. حالة المشروع الحالية

- **اسم المشروع**: Suknaa (سُكنى) — suknaa.com
- **المرحلة الحالية**: Phase 1 — Public Website Skeleton (قيد التنفيذ — Homepage مبنية كاملة، جاهزة لتطوير صفحات أخرى)
- **آخر مرحلة مكتملة**: Phase 0 + Layout + Homepage sections كاملة + معمارية بيانات + Adaptive Logo + Cache fix workflow
- **آخر تحديث للذاكرة**: 2026-05-03 — Monorepo: نقل Next.js إلى `apps/web/` + pnpm workspaces + إصلاح `.gitignore`
- **آخر AI عمل على المشروع**: Cursor (Claude)
- **مرجع الوثائق المعتمد**: `/docs/*.md` فقط (v2 الكاملة، 10 ملفات). لا توجد نسخة v1 بعد الآن — تم حذفها بشكل نهائي.
- **مرجع قواعد الكود**: `.cursor/rules/suknaa.mdc` (يُقرأ تلقائياً)

---

## 2. القرارات الحرجة (لا تخرق هذه القرارات أبداً)

### 2.1 المعمارية
- **نظامان منفصلان كلياً**: Real Estate (P2P، شبيه بـ Airbnb) + Hospitality (B2B، شبيه بـ Booking.com)
- جداول DB منفصلة لكل نظام (`properties`/`property_spaces`/`property_availability_blocks` ضد `hotels`/`room_types`/`room_units`/`room_unit_availability_blocks`)
- modules منفصلة في الباك‌اند: `apps/api/src/modules/real-estate/` و `apps/api/src/modules/hospitality/`
- `bookings` polymorphic بـ discriminator (`booking_kind` enum) و CHECK constraint
- Modular monolith، **ليس** microservices
- **Stack**: Next.js 14 (App Router) + NestJS 10 + PostgreSQL 16 + PostGIS + Redis 7 + MinIO + Flutter (Phase 10)
- Monorepo: **pnpm workspaces** (`apps/web`، `packages/*`)؛ **Turborepo** لاحقاً عند الحاجة لتنسيق build عبر عدة apps
- Hosting: **Hostinger VPS** (KVM 2 → KVM 4 → KVM 8) + Cloudflare. **ليس** Hetzner.
- OS: Ubuntu 24.04 LTS، Datacenter: Frankfurt أو Amsterdam

### 2.2 المالية
- **العمولة تُختار من المؤجر** لكل عقار/فندق:
  - "العمولة عليّ" (افتراضي): يكتب $50 → يستلم $44 → الزبون يشوف $50
  - "تمرير على الزبون": يكتب $50 صافي → النظام يحسب $56.82 → الزبون يشوف $56.82 → المؤجر يستلم $50
- **الفاتورة لا تذكر العمولة أبداً للزبون** — في كل الأحوال
- **رسوم الخدمة 2%** منفصلة عن العمولة وتظهر للزبون دائماً كبند صريح
- **العملة**: USD مخزّنة كـ `BIGINT cents`؛ USD + SYP معروضة
- **4 طبقات تسعير**: Base (إلزامي) + Weekly (≥7 ليالي، اختياري) + Monthly (≥30 ليلة، اختياري) + Seasonal Override (تواريخ محددة)
- **Weekend uplift** اختياري (+X% على Fri/Sat)
- **Money flow**: Escrow للـ Real Estate (الفلوس بتُحجز 24 ساعة بعد check-in)؛ Direct للـ Hospitality (فوري)
- **Withdrawal**: weekly (الخميس) أو monthly (آخر يوم) أو manual، الحد الأدنى $10
- العمولات الافتراضية: 12% بيوت/شقق/فيلات، 10% مزارع/كبائن/شاليهات/استوديوهات، 8% فنادق/منتجعات/hostels، 10% hotel-apartments
- على كل booking لازم نخزّن snapshot للـ `commission_basis_points`، `commission_passthrough`، `service_fee_basis_points`، `money_flow`، `cancellation_policy` وقت الإنشاء — لا تعتمد أبداً على القيم الحالية على العقار/الفندق

### 2.3 الواجهة
- **شريط tabs دائم على كل صفحة عامة**: `[الكل] [عقارات] [فنادق]`
- "الكل" هو الافتراضي
- **زرّان منفصلان لتسجيل الدخول**: "دخول كزبون" + "دخول كمؤجر"
- نفس الحساب يقدر يكون الاثنين (`is_guest` و `is_host` flags مستقلة)
- **ألوان الخريطة**:
  - 🟧 برتقالي `#C85A3D` → بيوت/شقق/فيلات
  - 🟢 أخضر `#3D8A6B` → مزارع/كبائن/شاليهات
  - 🟡 ذهبي `#D4A24C` → فنادق/منتجعات
  - 🔵 فيروزي `#3D8A95` → شقق فندقية
- **أرقام دائماً Latin** (1, 2, 3) حتى في الواجهة العربية — لا تستخدم Arabic-Indic (١٢٣)
- **لا تستخدم أسود نقي** `#000` — الـ body text هو charcoal `#2C2826`
- خطوط: Tajawal للعربي، Inter + Plus Jakarta Sans للإنجليزي
- RTL أولاً (logical CSS properties: `ms-`, `me-`, `ps-`, `pe-`)
- **Scarcity nudges فقط على بيانات حقيقية** — لا تنبيهات وهمية

### 2.4 الأمان
- **2FA إلزامي للمؤجرين والإدمن** (TOTP مفضّل)
- **KYC مختلف لكل host_subtype**:
  - فرد real_estate: ID + سيلفي + إثبات ملكية أو تفويض
  - مكتب عقاري: ID رئيس المكتب + سجل تجاري + tax id + كتاب تفويض
  - شركة فنادق: كل اللي فوق + رخصة فندق
- **Anti-circumvention** مع risk scoring (0-100):
  - Tiers: low (0-25) / medium (26-50) / high (51-75) / critical (76-100)
  - عند تخفيض المتاح، **مطلوب اختيار سبب** من enum
  - `rented_offline` reason وزنه عالي (10×)
  - **لا حظر تلقائي أبداً** — مراجعة إدمن دائماً
- المؤجر يشوف tier فقط، **لا يشوف الـ score** بالضبط (تجنب gaming)
- **No off-platform deals**: chat ما يفتح إلا بعد تأكيد الحجز
- regex blocking لأرقام التليفون والإيميلات والـ social handles
- جميع المعاملات المالية في `audit_logs` (append-only، حتى super-admin ما يقدر يحذف)
- المفاتيح: `JWT access` 15min + `refresh` 7d (httpOnly + Secure + SameSite=Strict cookie)
- Passwords: argon2id (memory 64MB، iterations 3، parallelism 4)

### 2.5 قواعد عامة لا تُكسر
- **أبداً لا تخلط `properties` و `hotels` في نفس الكود/endpoint**
- **أبداً لا تعرض كلمة "commission" للزبون** في أي مكان (UI، email، PDF، JSON response)
- **أبداً لا تعمل auto-ban** بناءً على risk score
- **أبداً لا تخزّن المال كـ float** — دائماً `BIGINT cents`
- **أبداً لا تنسى الـ snapshot** على booking لقيم العمولة/passthrough/service fee
- **أبداً لا تدمج migrations تلقائياً على production** — يدوي بعد backup
- **أبداً لا تكسر تسلسل المراحل** — لا تبدأ مرحلة قبل ما تخلص اللي قبلها

---

## 3. ما تم إنجازه (Progress Log)

### Phase 0 — Foundation
- [x] **قراءة عميقة لكل وثائق v2** ✓ 2026-04-30
- [x] **إنشاء COMPREHENSION_REPORT.md** ✓ 2026-04-30
- [x] **إنشاء ai_memory.md** ✓ 2026-04-30
- [x] **ملف قواعد Cursor جاهز**: نُقل المحتوى من `cursorrules` إلى `.cursor/rules/suknaa.mdc` (modern Project Rules مع `alwaysApply: true`) ✓ 2026-04-30
- [x] **ترتيب الـ docs**: نُقلت v2 الكاملة إلى `/docs/` مباشرة (10 ملفات)؛ حُذفت v1 ومجلد `mnt/` المؤقت ✓ 2026-04-30
- [ ] **حجز VPS من Hostinger** — قرار محمد: KVM 2 (~$7/شهر)، Frankfurt، Ubuntu 24.04 LTS — **محمد سيحجزه بنفسه**
- [ ] **تجهيز DNS وCloudflare**: الدومين `suknaa.com` مسجّل، لكن لم يُربط بـ Cloudflare بعد — مهمة محمد
- [ ] **بدء محادثات Sham Cash + MTN Cash**: لم تبدأ بعد — مهمة محمد في Phase 0
- [ ] **بدء التواصل مع 2-3 معارف لـ beta hosts** (بيوت/شاليهات) — مهمة محمد
- [x] إنشاء Git repo (private GitHub) ✓ 2026-05-03 — repo: https://github.com/khatib96/suknaa (private, main branch, 72 files, 10.51 MiB)
- [x] Monorepo scaffold (pnpm workspaces + `apps/web` + `packages/types` + `packages/ui` + `infrastructure/`) ✓ 2026-05-03 — **Turborepo** لم يُضف بعد (`turbo.json` لاحقاً)
- [ ] تثبيت Local Dev Environment (Docker Compose: Postgres+PostGIS، Redis، MinIO)
- [ ] **Mockups**: تأجيل Figma — قرار محمد: نسكافولد Next.js skeleton مع شاشات placeholder (نبني ونرى مباشرة) — يبدأ في Phase 1
- [ ] إصدار logo بصيغة SVG — مؤجَّل (PNG كافٍ الآن، سيُطلب من مصمم لاحقاً)

### Phase 1 — Public Website Skeleton (UI Only, Mock Data)
- [x] **Setup**: Next.js 16 + TS + Tailwind v4 + shadcn/ui + lucide ✓ 2026-04-30
- [x] **Global Layout**: Navbar (glass + scroll-aware) + Footer (3-layer) + RTL + design tokens ✓ 2026-04-30
- [x] **Homepage Hero** مع cinematic slider (4 صور + Ken Burns motion + glass search pill) ✓ 2026-04-30
- [x] **MapExplorer** (placeholder + pins ملوّنة + toolbar + container جاهز لـ Mapbox) ✓ 2026-04-30
- [x] **Destinations carousel** (data-driven, scroll أفقي) ✓ 2026-04-30
- [x] **FeaturedListings** + PropertyCard + HotelCard (reusable) ✓ 2026-04-30
- [x] **معمارية بيانات مرنة** (`data/hero-slides.ts` + `data/destinations.ts`) ✓ 2026-04-30
- [ ] إضافة الصور الفعلية (محمد يضيفها لـ `apps/web/public/images/hero/` و `apps/web/public/images/destinations/`)
- [ ] دمج Mapbox GL JS فعلياً على `#map-container`
- [ ] صفحة Search Results
- [ ] صفحة Property Detail (RE)
- [ ] صفحة Hotel Detail (Hospitality)
- [ ] صفحة Host Landing (`/host`)
- [ ] صفحات Login/Signup/About/How-it-Works/Help/Terms/Privacy/Cookies
- [ ] صفحات أخطاء 404/500
- [ ] PWA manifest + service worker
- [ ] next-intl (AR + EN) — مؤجَّل
- [ ] Deploy إلى staging

### Phase 2 — Backend Foundation + Auth + KYC
- لم يبدأ بعد

### Phase 3 — Real Estate System (End-to-End)
- لم يبدأ بعد

### Phase 4 — Hospitality System (End-to-End)
- لم يبدأ بعد

### Phase 5 — Bookings & Payments (Both Systems)
- لم يبدأ بعد

### Phase 6 — Host Dashboard, Reviews, Chat
- لم يبدأ بعد

### Phase 7 — Admin Panel
- لم يبدأ بعد

### Phase 8 — Smart Features (Price Intelligence, Anti-Circumvention, Nearby Attractions, Wishlist Sharing, Comparisons, Price Alerts, Smart Upgrades)
- لم يبدأ بعد

### Phase 9 — Beta Launch (Web Only)
- لم يبدأ بعد

### Phase 10 — Mobile Apps (Flutter Guest + Host)
- لم يبدأ بعد

### Phase 11 — Public Launch & Growth
- لم يبدأ بعد

---

## 4. آخر جلسة عمل

**التاريخ**: 2026-05-03 (جلسة 7 — Adaptive Logo + Cache fix workflow)
**الـ AI المستخدم**: Cursor (Claude Opus 4.7)

**السياق**: محمد بدّل صورة `hero-1.jpg` فعلياً (وضع صورة الجامع الأموي) واستبدل اللوجو بنسخة بيضاء، لكن:
- صورة الـ Hero ما تظهرت رغم استبدال الملف.
- اللوجو الأبيض اختفى بصرياً فوق الـ navbar الـ glass الأبيض = "abyad ala abyad" (white-on-white).

**ما تم إنجازه في هذه الجلسة (7)**:

### 7.1 — حل مشكلة cache فعلياً (مش بس توثيق)
- اكتُشف أن dev server كان شغّال بـ PID 29512 (مع 4 child processes).
- نُفِّذ الحل الكامل **فعلياً**:
  1. `taskkill /F /PID 29512 /T` (إيقاف 5 processes).
  2. `Remove-Item -Recurse -Force .next/cache/images` (حذف image optimization cache).
  3. `npm run dev` — server جديد على PID 16572، Ready in 3.1s.
- **النتيجة**: الصور الجديدة بدأت تظهر بعد Hard Refresh.

### 7.2 — Adaptive Logo (الحل الاحترافي لمشكلة الأبيض على الأبيض)
- المشكلة الجذرية: اختيار محمد كان لوجو **أبيض** (`suknaaWHITE_AR.png`)، والـ navbar شفّاف فوق الهيرو ثم أبيض عند scroll = اللوجو الأبيض اختفى تماماً عند scroll.
- **القرار**: تطبيق pattern احترافي — اللوجو يتبدّل تلقائياً حسب حالة الـ navbar.

**التنفيذ**:
- إعادة تنظيم ملفات اللوجو في `public/logo/`:
  - `suknaa-logo-white.png` (88 KB، النسخة البيضاء — تظهر فوق الهيرو)
  - `suknaa-logo-color.png` (52 KB، النسخة الملوّنة من `logo/suknaa2_ar.png` — تظهر بعد scroll)
- **`components/layout/Navbar.tsx`** صار يضع كلا اللوجو فوق بعضهما (`absolute fill`) ويبدّل الـ opacity حسب `isScrolled` بـ `transition-opacity duration-500` لـ fade ناعم.
- استخدام `<Image fill sizes="150px" />` بدلاً من `width/height` لحل تحذير Next.js عن aspect ratio.

### 7.3 — تحديد قضية أداء: hero-2.jpg كبيرة جداً
- في فحص أحجام الصور: `hero-2.jpg = 1.5 MB` (الباقي 305-381 KB).
- توصية لمحمد بضغطها لأقل من 400 KB عبر [tinypng.com](https://tinypng.com) أو [squoosh.app](https://squoosh.app) قبل النشر.
- **لم يُضغط بعد** — مهمة محمد متى ما لقى وقت.

### 7.4 — توثيق Cache Workflow عملي
بعد الجلسة (6) كان الحل في README. الآن في جلسة (7) أُكِّد عملياً، وصارت الخطوات الواضحة:
```powershell
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .next\cache\images
npm run dev
# ثم Ctrl+Shift+R في المتصفح
```

### 7.5 — ملاحظات
- محمد أضاف صورة جديدة `daraa.jpg` في `data/destinations.ts` لكن الملف بعدها مش موجود في `public/images/destinations/` (الـ logs تشير إلى 404).
- باقي صور الوجهات (`damascus.jpg`, `latakia.jpg`, `tartus.jpg`, `zabadani.jpg`, `saidnaya.jpg`, `aleppo.jpg`) أيضاً 404 — محمد يضيفهم تدريجياً.
- المعمارية تتحمّل هذا (الصور تظهر broken لو ما وُجدت، لكن الـ cards نفسها تبقى تعمل).

**ما تم إنجازه في الجلسة (6)**:
- **اكتشاف مشكلة cache**: محمد بدّل صورة hero-1.jpg ولم تظهر — مشكلة Next.js Image Optimization cache (محفوظة في `.next/cache/images/`) + browser cache.
- **إنشاء معمارية بيانات مركزية في مجلد `data/`**:
  - `data/hero-slides.ts` — تحكم كامل بشرائح Hero (src + alt + Ken Burns motion) من ملف واحد، مع TypeScript types واضحة (`HeroSlide`, `KenBurnsMotion`).
  - `data/destinations.ts` — تحكم كامل بقائمة الوجهات (id + city + count + image) — يدعم أي عدد ديناميكياً.
- **تحديث Components لتقرأ من البيانات المركزية**:
  - `components/home/Hero.tsx` — يستورد من `@/data/hero-slides` (شال الـ hardcoded array).
  - `components/home/Destinations.tsx` — يستورد من `@/data/destinations` + استبدال `<div bgImage>` بـ `<Image>` للأداء + استبدال Unsplash URLs بصور محلية.
- **إنشاء مجلد `public/images/destinations/`** مع README مفصّل (أسماء الصور المتوقعة، المواصفات، شرح كيفية الإضافة/الحذف، شرح كامل لمشكلة الـ cache مع الحلول).
- **تحديث `public/images/hero/README.md`** بنفس التفاصيل (cache busting، إضافة شرائح جديدة، 3 طرق لتغيير الصور).
- **توثيق حلول الـ cache بالخطوات** في كلا README:
  1. Hard Refresh (Ctrl+Shift+R)
  2. Restart dev server
  3. حذف `.next/cache/images/` يدوياً
- **اختبار**: `npm run lint` + `npm run build` ✅.

**ما تم إنجازه في الجلسة (5) — Homepage Sections**:
- بناء صفحة الهومبيج كاملة كـ sections قابلة لإعادة الاستخدام:
  - `components/home/Hero.tsx` — slider 4 صور + Ken Burns motion + glass search pill + slide indicators.
  - `components/home/MapExplorer.tsx` — حاوية خريطة مع `id="map-container"` جاهزة لـ Mapbox + pins (primary للعقارات، gold للفنادق) + toolbar (filters + layers).
  - `components/home/Destinations.tsx` — كروت أفقية scrollable مع hover effects.
  - `components/home/FeaturedListings.tsx` — Grid + tab filter (الكل/عقارات/فنادق).
  - `components/home/cards/PropertyCard.tsx` — بطاقة عقار (orange badge + heart + price + rating).
  - `components/home/cards/HotelCard.tsx` — بطاقة فندق (gold badge + stars + score/10).
- **تحسينات Cinematic بناءً على ملاحظات محمد**:
  - **Ken Burns animations**: 4 keyframes (zoom-in/out/pan-right/pan-left) في `globals.css`.
  - **Glass Navbar**: شفّاف دائماً (`bg-white/20 backdrop-blur-md`) فوق الهيرو، يتحول إلى `bg-white/85 backdrop-blur-xl` عند الـ scroll مع `backdrop-saturate-150`.
  - **Floating Map**: الخريطة `-mt-32 md:-mt-40` تطفو فوق الهيرو (مثل المرجع) داخل frame زجاجي `bg-white/80 rounded-[28px] shadow-warm-2xl`.
- **ملف `public/images/hero/`** + README بمواصفات الصور المطلوبة.

**ما تم إنجازه في الجلسات (4 و 4.5) — Setup فني + Global Layout**:
- **هيكلة المشروع**: Next.js 16 App Router + TypeScript + Tailwind v4 (turbopack) + ESLint + shadcn/ui + lucide-react + clsx + tailwind-merge + cva.
- **خط Tajawal + Inter** عبر `next/font/google`.
- **Design tokens** في `globals.css`: primary #C85A3D، gold #D4A24C، charcoal #2C2826، cream #FBF7F2 + warm shadows + radius scale.
- **`<html lang="ar" dir="rtl">`** + body fonts.
- **`components/layout/Navbar.tsx`** — fixed header، 72px desktop، logo PNG + tabs pill (الكل/عقارات/فنادق) + dropdown تسجيل الدخول (دخول كضيف / دخول كمضيف / إنشاء حساب) + mobile scrollable tabs.
- **`components/layout/Footer.tsx`** — 3 طبقات (Newsletter Strip + 5 أعمدة + Bottom Bar) كاملة.
- **اللوجو**: نُسخ من `logo/suknaa2_ar.png` إلى `public/logo/suknaa-logo-ar.png`.
- **اختيار محمد على هيكل المشروع**: Standalone Next.js (مش Turborepo) + AR-only الآن (next-intl لاحقاً) + shadcn/ui + Lucide.

**ما تم إنجازه في جلسات التصميم (3 و 4) — UX Vision**:
- **مراجعة تصميم UI الذي صمّمه محمد** (mockup للصفحة الرئيسية بشكل كامل) واعتماد الاتجاه العام مع تحسينات.
- **إزالة "Host CTA Banner" من الصفحة الرئيسية** نهائياً (قرار محمد): الصفحة العامة للضيوف فقط، الاستضافة لها مسار مخصص.
- **استبدال البانر بـ "Why Suknaa Strip"** (4 ميزات: حجز موثوق، دفع آمن، تقييمات حقيقية، دعم بالعربي) + قسم "Seasonal Picks" ديناميكي.
- **إنشاء صفحة `/host` (Host Landing) المستقلة** كاملة: Hero + Live Numbers Strip + 3-Column Benefits + How It Works (4 خطوات) + Earnings Calculator (إبداعي) + Testimonials + Host FAQ + CTA النهائي.
- **إعادة تصميم الفوتر** بـ 3 طبقات (Newsletter Strip + 5 أعمدة + Bottom Bar) مع عمود مخصص "للمضيفين" كمدخل وحيد بارز للاستضافة.
- **إعادة تصميم Host Dashboard** بفلسفة "Empty State ذكي" — أول دخول للمضيف يلقى illustration + CTA "أضف عقارك الأول" + 3 نصائح quick tips.
- **إضافة Smart Host Entry**: 3 مداخل خفية للاستضافة (Navbar dropdown + Footer column + صفحة /host المخصصة) — لا banner ضاغط.
- **إنشاء خريطة الصفحات الكاملة**: 62 صفحة موزّعة على 8 مجموعات (A-H)، كل مجموعة مرتبطة بـ Phase. Phase 1 يحتوي 16 صفحة فقط.
- **إنشاء قائمة "اللمسات الإبداعية"** (30+ تفصيلة): Cinematic Slider، Smart Search Pill، Hover Mini-Card، Multi-image Hover، Sticky Booking Widget، Celebration Moments، Sparklines، Dark Mode للوحات، Tab Switch Magic، Keyboard Shortcuts، PWA Prompt، مكتبة Empty States كاملة، لمسات سورية ثقافية (رمضان Mode، شعار "صُنع في سوريا"، اللهجة الشامية، siluettes للمعالم).

**ما تم إنجازه في الجلسة السابقة (3)**:
- نقل ملف القواعد من `cursorrules` (legacy، بدون نقطة) إلى `.cursor/rules/suknaa.mdc` مع `frontmatter` صحيح (`description` + `alwaysApply: true`).
- نقل وثائق v2 الكاملة (10 ملفات) من `docs/mnt/user-data/outputs/suknaa-docs-v2/` إلى `/docs/` مباشرة.
- حذف ملفات v1 العشرة وحذف مجلد `docs/mnt/` بالكامل.
- تحديث `ai_memory.md` و `COMPREHENSION_REPORT.md`.
- إنشاء `docs/UI_UX_VISION.md` (الإصدار الأول — الخيار 3 Light).

**ما تم إنجازه في الجلسة السابقة (1)**:
- قراءة عميقة لكل وثائق v2 (10 ملفات).
- إنشاء `COMPREHENSION_REPORT.md` و `ai_memory.md`.
- اكتشاف ملف `cursorrules` (بدون نقطة) — أُبلغ محمد، واتُّخذ القرار في الجلسة الحالية.

**التالي (ينتظر محمد)**:
- محمد يقوم بنفسه بـ:
  1. حجز Hostinger VPS (KVM 2، Frankfurt، Ubuntu 24.04)
  2. ربط `suknaa.com` بـ Cloudflare
  3. بدء محادثات Sham Cash + MTN Cash
  4. بدء التواصل مع 2-3 معارف لـ beta hosts
- بعد عودة محمد: نبدأ Phase 0 المتبقية (**Docker Compose** للـ local dev). Turborepo اختياري لاحقاً.
- **لا أكتب أي كود حتى يطلب محمد صراحةً**.

**ملاحظات للـ AI القادم**:
- المرجع الوحيد للوثائق هو `/docs/*.md` (10 ملفات). أي إشارة قديمة لـ `docs/mnt/...` يجب تجاهلها — المسار حُذف.
- ملف القواعد في `.cursor/rules/suknaa.mdc` يُحمَّل تلقائياً عبر `alwaysApply: true`. لا تطلب من محمد قراءته يدوياً.
- محمد يفضّل الإجابات بالعربي. الكود والـ docstrings والـ commits بالإنجليزي.
- Admin panel يبقى **بالإنجليزية فقط** (قرار محمد، لتسريع الإطلاق). الموقع العام bilingual.

**ملاحظات للـ AI القادم**:
- المرجع المعتمد للوثائق هو `docs/mnt/user-data/outputs/suknaa-docs-v2/` وليس `/docs/*.md` المباشرة. إذا تعارضا، v2 هو الصح.
- محمد لم يبدأ كتابة كود بعد. هذه أول جلسة فهم. لا تبدأ كود حتى يطلب صراحة.
- لا تستعجل الانتقال من Phase 0. كل الـ exit criteria لازم تتحقق.

---

## 5. الملفات المعدّلة آخر مرة

| الملف | التعديل | السبب |
|---|---|---|
| `.cursor/rules/suknaa.mdc` | **إنشاء** (نُقل المحتوى من `cursorrules`) | اعتماد Cursor Project Rules الحديث؛ يُحمَّل تلقائياً |
| `cursorrules` | **حذف** | استُبدل بـ `.cursor/rules/suknaa.mdc` |
| `docs/*.md` (10 ملفات) | **استبدال** (حذف v1، نقل v2 من المسار العميق) | اعتماد v2 كمرجع وحيد؛ لا التباس |
| `docs/mnt/` | **حذف** | مجلد مؤقت، لم يعد ضرورياً بعد نقل v2 |
| `ai_memory.md` | تحديث (هذا الملف) | عكس قرارات محمد + المسارات الجديدة |
| `COMPREHENSION_REPORT.md` | تحديث | إزالة الأسئلة المُجابة + تنظيف |
| `docs/UI_UX_VISION.md` | **إنشاء** (جلسة 3) | دليل التصميم الشامل — الخيار 3 Light (النسخة أ) |
| `docs/UI_UX_VISION.md` | **تحديث رئيسي** (جلسة 4) | إزالة Host CTA Banner؛ صفحة /host مستقلة؛ فوتر جديد؛ Empty State للمضيف؛ خريطة 62 صفحة؛ 30+ لمسة إبداعية |
| `package.json` + `node_modules/` | **إنشاء** (جلسة 4) | Next.js 16 + TS + Tailwind v4 + shadcn/ui + lucide |
| `app/layout.tsx`, `app/globals.css`, `app/page.tsx` | **إنشاء/تحديث** (جلسات 4-6) | RTL + tokens + page composition |
| `components/layout/{Navbar,Footer}.tsx` | **إنشاء** (جلسة 4) | Global Layout |
| `components/home/{Hero,MapExplorer,Destinations,FeaturedListings}.tsx` | **إنشاء** (جلسة 5) | Homepage sections |
| `components/home/cards/{PropertyCard,HotelCard}.tsx` | **إنشاء** (جلسة 5) | Reusable listing cards |
| `data/hero-slides.ts`, `data/destinations.ts` | **إنشاء** (جلسة 6) | معمارية بيانات مرنة |
| `public/images/hero/`, `public/images/destinations/` (+ READMEs) | **إنشاء** (جلسات 5-6) | مجلدات الصور + توثيق cache |
| `public/logo/suknaa-logo-{white,color}.png` | **إنشاء** (جلسة 7) | نسختين لـ Adaptive Logo |
| `components/layout/Navbar.tsx` | **تحديث** (جلسة 7) | Adaptive logo swap عبر `Image fill` + `opacity transition` |
| `ai_memory.md` | تحديث متكرر | تسجيل تقدم كل جلسة |

---

## 6. القرارات الجديدة (التي طُرأت أثناء التطوير)

> أي قرار يُتخذ مع محمد أثناء العمل ولم يكن في `/docs/` يُسجَّل هنا.

### 2026-04-30 — اعتماد v2 كمرجع وحيد
- **المشكلة**: المستودع يحتوي على نسختين من الوثائق: v1 في `/docs/` و v2 في `docs/mnt/user-data/outputs/suknaa-docs-v2/`. v2 أكمل وأحدث ويغطي قرارات حرجة (النظامين المنفصلين، commission passthrough، 4-tier pricing).
- **القرار**: اعتماد v2 كمرجع وحيد للتطوير. الـ v1 يُعتبر مهجور.
- **السبب**: تجنب الالتباس وضمان أن أي AI يقرأ أحدث القرارات.
- **التأثير**: أول مهمة في Phase 0 يجب أن تكون نقل v2 إلى `/docs/` (مع حذف أو وسم v1 كـ deprecated). ينتظر تأكيد محمد قبل تنفيذ النقل.

### 2026-04-30 — اعتماد Cursor Project Rules الحديث (`.cursor/rules/`)
- **المشكلة**: ملف القواعد كان باسم `cursorrules` (بدون نقطة) — Cursor لا يكتشفه تلقائياً.
- **القرار**: نُقل المحتوى إلى `.cursor/rules/suknaa.mdc` مع `frontmatter` يحوي `description` و `alwaysApply: true`. حُذف الملف القديم.
- **السبب**: الـ Project Rules الحديث (`.cursor/rules/*.mdc`) أقوى من `.cursorrules` legacy: يدعم metadata، قابل للتقسيم لاحقاً (e.g., `frontend.mdc`، `payment.mdc`)، ومدعوم رسمياً من Cursor.
- **التأثير**: كل جلسة جديدة على Cursor ستُحمِّل القواعد تلقائياً بدون تذكير من محمد.

### 2026-04-30 — حذف v1 ونقل v2 إلى `/docs/` مباشرة
- **المشكلة**: نسختان من الوثائق (v1 سطحية في `/docs/`، v2 الكاملة في مسار عميق `docs/mnt/user-data/outputs/suknaa-docs-v2/`) كانت مصدر التباس.
- **القرار**: حُذفت v1 نهائياً (10 ملفات)، نُقلت v2 (10 ملفات) إلى `/docs/` مباشرة، حُذف مجلد `mnt/` بالكامل.
- **السبب**: محمد طلب صراحةً "ما بدي أي التباس مستقبلاً". مرجع وحيد = قرار وحيد.
- **التأثير**: من الآن، أي AI أو developer يقرأ `/docs/*.md` يحصل على المرجع المعتمد فوراً. الـ paths في `.cursor/rules/suknaa.mdc` تُشير إلى `/docs/` المباشرة — متوافقة.

### 2026-04-30 — قرارات محمد على الأسئلة المفتوحة من جلسة 1
| القرار | التفصيل |
|---|---|
| **بوابة الدفع الدولية** | Manual transfer للسياح فقط في الإطلاق الإولي. Stripe/Paddle مؤجَّل لـ Phase 11. |
| **العمولات الافتراضية** | نهائية: 12% (بيوت/شقق/فيلات) — 10% (مزارع/كبائن/شاليهات/استوديوهات/hotel-apartments) — 8% (فنادق/منتجعات/hostels) — 2% رسوم خدمة. |
| **Mockups** | لا Figma/v0. نسكافولد Next.js skeleton مباشرة مع شاشات placeholder (يبدأ Phase 1). |
| **Logo SVG** | مؤجَّل (PNG كافٍ). يُطلب من مصمم لاحقاً. |
| **Admin panel i18n** | إنجليزية فقط في البداية (الموقع العام يبقى bilingual). |
| **قناة دعم العملاء** | WhatsApp Business + Email في البداية. نظام تذاكر داخلي في Phase 7. |
| **VPS** | KVM 2 (~$7/شهر)، Frankfurt — **محمد يحجزه بنفسه**. |
| **DNS** | Cloudflare لاحقاً — **محمد يربطه بنفسه**. |
| **Sham/MTN Cash** | محادثات لم تبدأ — **مهمة محمد في Phase 0**. |
| **Beta hosts** | محمد يبدأ التواصل مع 2-3 معارف. |

### 2026-04-30 — تحديثات على تصميم الواجهة (UI/UX) — جلسة 3
- **المشكلة**: التصميم التخيلي الأول كان يحتوي على زرين منفصلين لتسجيل الدخول في الهيدر، شريط بحث تقليدي، خريطة مدمجة بصورة بشكل مزعج، ومربع تقليدي لدعوة المضيفين.
- **القرار**:
  - اعتماد **زر تسجيل دخول واحد** في الأعلى (لأن 90% من الزوار هم مستأجرين/ضيوف).
  - فصل الخريطة لتكون قسماً مستقلاً بعرض الشاشة **تحت** شريط البحث.
  - استخدام **صور خلفية متحركة (Cinematic Slider)** في القسم الأول.
  - ترقية شريط البحث إلى **Glassmorphism Floating Pill**.
  - تحويل قسم "أعلن عن بيتك" إلى Horizontal Banner.
- **التأثير**: تم إنشاء `docs/UI_UX_VISION.md` كخريطة طريق.

### 2026-05-03 — Adaptive Logo Pattern (جلسة 7)
- **المشكلة**: navbar في حالتين بصريتين (transparent glass فوق الهيرو، أبيض مصمت بعد scroll). لوجو واحد ما يخدم الحالتين — أبيض يختفي على أبيض، وملوّن قد يكون أقل وضوحاً على صورة داكنة.
- **القرار**: اعتماد **Adaptive Logo** — نسختين من اللوجو (`white` + `color`) متراكبتين بـ `position: absolute`، يتبدّل الـ opacity حسب حالة الـ scroll بـ transition ناعم (500ms).
- **التنفيذ**: `Image fill sizes="150px"` (مش width/height) لتجنب تحذيرات aspect ratio.
- **التأثير**:
  - الزائر يحس professionalism سينمائي (مثل Airbnb, Booking).
  - حُل تماماً لمشكلة "لوجو غير مرئي".
  - Pattern قابل للنسخ على عناصر أخرى (مثلاً social icons) لو احتجنا.
- **القاعدة العامة المستفادة**: في أي مكان فيه navbar بتغيّر background، استخدم نفس الـ pattern لأي asset رئيسي (logo، icons، etc.).

### 2026-05-03 — Cache Fix Workflow (موثَّق + مُختبر)
- **المشكلة**: Next.js Image Optimization يحفظ نسخ في `.next/cache/images/` بناءً على hash المسار. استبدال ملف بنفس الاسم لا يبطل الـ cache. + browser cache.
- **الحل العملي المُعتمد**:
  ```powershell
  taskkill /F /IM node.exe
  Remove-Item -Recurse -Force apps\web\.next\cache\images
  pnpm dev
  # ثم Ctrl+Shift+R في المتصفح
  ```
- مُوثَّق بالكامل في `apps/web/public/images/hero/README.md` + `apps/web/public/images/destinations/README.md`.
- **القاعدة**: لما محمد يستبدل أي صورة بنفس الاسم في dev، ينفّذ هذا الـ workflow.

### 2026-05-03 — Git + GitHub Setup (جلسة 8)
- git init + ربط remote + أول commit (72 ملف) + push ناجح
- Repo: https://github.com/khatib96/suknaa (private)
- Branch الرئيسي: main
- git config: user.name=khatib96, user.email=m.khatib.1996@gmail.com
- core.autocrlf=true (Windows)
- استُخدم --force push لأن GitHub أنشأ initial commit تلقائياً
- آخر AI عمل: Claude (Antigravity) — جلسة 8

### 2026-05-03 — Monorepo (pnpm workspaces + apps/web)
- إصلاح `.gitignore` (حذف علامات تعارض الدمج) + قواعد تجاهل مناسبة لـ monorepo (`**/.next`، `node_modules/`، إلخ).
- نقل تطبيق Next.js إلى [`apps/web/`](apps/web/): `app/`، `components/`، `data/`، `lib/`، `public/`، configs (`next.config.ts`، `tsconfig.json`، `eslint.config.mjs`، `postcss.config.mjs`، `components.json`، `next-env.d.ts`).
- جذر المستودع: [`package.json`](package.json) (scripts: `pnpm --filter web …`)، [`pnpm-workspace.yaml`](pnpm-workspace.yaml)، حزم placeholder `@suknaa/types` و `@suknaa/ui`، مجلد `infrastructure/` (`.gitkeep`).
- حزمة الويب: `"name": "web"` في [`apps/web/package.json`](apps/web/package.json)؛ الانتقال من `package-lock.json` إلى **`pnpm-lock.yaml`**.
- التحقق: `pnpm run build` و `pnpm run lint` من الجذر ناجحان.
- **Turborepo** لم يُضف؛ يُضاف لاحقاً عند تعدد الـ pipelines إن لزم.
- مسارات الملفات التاريخية في سجل الجلسات أدناه قد تظهر بدون `apps/web/` — المرجع الفعلي للكود الواجهة هو **`apps/web/`**.

### 2026-04-30 — Phase 1 Frontend Build (جلسات 4 → 6)
- **القرار (محدّث 2026-05-03)**: كان البداية Standalone Next في الجذر؛ أصبح التطبيق تحت **`apps/web/`** ضمن **pnpm workspaces**. Turborepo اختياري لاحقاً.
- **Stack الفعلي**: Next.js 16.2.4 (Turbopack) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui + lucide-react + clsx + cva + tailwind-merge.
- **i18n**: مؤجَّل (AR-only الآن). next-intl سيُضاف عندما نبدأ بناء الإنجليزية (Phase 2 أو لاحقاً).
- **معمارية البيانات**: قرار اعتماد مجلد `data/*.ts` داخل **`apps/web/`** كنمط موحَّد لكل بيانات الواجهة (hero-slides، destinations، وفي المستقبل featured-listings، testimonials، etc.) قبل ما يصير عندنا backend. هذا يفصل البيانات عن الـ components ويسهل التعديل لمحمد.
- **حل مشكلة cache الصور**: Next.js Image Optimization يحفظ نسخ في `.next/cache/images/` بناءً على hash المسار. استبدال ملف بنفس الاسم لا يبطل الـ cache. الحل الموثَّق:
  1. Hard Refresh (Ctrl+Shift+R)
  2. Restart dev server
  3. حذف `apps/web/.next/cache/images/` يدوياً (أو من الجذر إن وُجد symlink)
  ملف `apps/web/public/images/hero/README.md` و `apps/web/public/images/destinations/README.md` يحوي الخطوات بالتفصيل.

### 2026-04-30 — تحسينات تصميم جلسة 4 (بناءً على mockup محمد)
- **السياق**: محمد صمّم mockup كامل للصفحة الرئيسية (logo + hero + map + destinations + listings + host banner + footer) وطلب مراجعة وتحسين.
- **التعليقات الرئيسية من محمد**:
  1. الفوتر يحتاج تحسين.
  2. **شريط "أعلن عن بيتك" في الصفحة الرئيسية مرفوض** — لا يريده "نافذة" عامة. يريد أن تكون صفحة المضيف الخاصة هي مكان عرض/إضافة العقارات.
  3. التصميم العام عجبه، لكن يبقى يطلب لمسة إبداعية.
  4. سأل عن عدد الصفحات الإجمالي.
- **القرارات**:
  - **إزالة Host CTA Banner من الصفحة الرئيسية نهائياً.** بديل: "Why Suknaa Strip" (4 ميزات مثل: حجز موثوق، دفع آمن، تقييمات حقيقية، دعم بالعربي) + "Seasonal Picks" ديناميكي (يتغير حسب الموسم).
  - **إنشاء صفحة `/host` (Host Landing) مستقلة** كاملة الإقناع: Hero + Live Numbers + 3-Column Benefits + How It Works (4 steps) + Earnings Calculator (تفاعلي يقدّر دخل المضيف الشهري) + Testimonials + Host FAQ + CTA.
  - **Smart Host Entry**: 3 مداخل خفية للاستضافة فقط: (أ) Navbar dropdown، (ب) Footer column، (ج) صفحة `/host`. لا banner عام ضاغط.
  - **إعادة تصميم الفوتر** بـ 3 طبقات: Newsletter Strip (أعلى) + 5 أعمدة (وسط) + Bottom Bar (أسفل). الأعمدة: سُكنى، اكتشف، الدعم، **للمضيفين**، التطبيق.
  - **Host Dashboard Empty State**: أول دخول للمضيف يلقى illustration دافئ + رسالة ترحيب + CTA كبير "أضف عقارك الأول" + 3 quick tips. هذا هو "البديل" الذي طلبه محمد بدل البانر العام.
  - **خريطة الصفحات الكاملة**: 62 صفحة موزّعة على 8 مجموعات (A-H)، Phase 1 يبني المجموعة A فقط (16 صفحة).
  - **30+ لمسة إبداعية** موثقة في القسم 16 من UI_UX_VISION.md (Cinematic Slider، Smart Search، Hover Mini-Card، Earnings Calculator، Empty States Library، رمضان Mode، إلخ).
- **التأثير**:
  - `docs/UI_UX_VISION.md` تحدّث جذرياً (387 → ~770 سطر تقريباً) مع 17 قسماً.
  - الفلسفة الجديدة: "Public site for guests, dedicated paths for hosts" — حدود واضحة بين تجربة الباحث وتجربة المؤجر.
  - Phase 1 محدّد بـ 16 صفحة فقط (بدلاً من قائمة مفتوحة)، وهذا يعطي محمد scope واضح للتصميم والبرمجة.

---

## 7. أخطاء وقعت سابقاً (Don't Repeat)

> أي خطأ أو سوء فهم وقع سابقاً، يُسجَّل هنا حتى لا يتكرر.

- (لا يوجد بعد — هذا أول log)

---

## 8. الأسئلة المفتوحة (تحتاج رأي محمد)

> كل أسئلة جلسة 1 تمت الإجابة عليها (انظر القسم 6 أعلاه).
> الأسئلة الجديدة تنشأ مع التقدم في المراحل وتُسجَّل هنا.

- (لا أسئلة معلّقة حالياً — في انتظار محمد ليُكمل مهام Phase 0 الخارجية: VPS، DNS، Sham/MTN، beta hosts)

---

## 9. تذكيرات مهمة

- محمد مبتدئ في البرمجة — اشرح القرارات التقنية باختصار وبدون مصطلحات غامضة
- محمد يفضل الإجابات المباشرة بدون لف ودوران
- محمد يكره العمل بدون توثيق — وثّق كل شيء (وحدّث هذا الملف بعد كل جلسة)
- محمد يستخدم Cursor و Antigravity بالتبادل — هذا الملف هو الجسر بينهما
- لا تبدأ مرحلة جديدة قبل إكمال السابقة بالكامل (Exit Criteria كاملة)
- اسأل قبل ما تنفذ شي مش متأكد منه — **خاصة** أي قرار مالي أو معماري
- استخدم العربية في الردود مع محمد، والإنجليزية في الكود والـ docstrings والـ commit messages
- أي تعديل في `/docs/` يجب أن يُذكر هنا في القسم 5

---

## 10. خريطة سريعة للوثائق المعتمدة (v2 — المسار: `/docs/`)

| الملف | المسار الكامل | الموضوع |
|---|---|---|
| README | `docs/README.md` | Index + Quick Decisions Reference |
| PROJECT | `docs/PROJECT.md` | الرؤية، الهوية، النظامين، الجمهور، الألوان |
| ARCHITECTURE | `docs/ARCHITECTURE.md` | Stack + Modules tree + Data flows + Decisions log |
| DESIGN_SYSTEM | `docs/DESIGN_SYSTEM.md` | الألوان، الخطوط، Tabs، Map markers، Components |
| DATABASE_SCHEMA | `docs/DATABASE_SCHEMA.md` | كل الجداول/الـ enums/الـ indexes (~50 جدول) |
| API_SPEC | `docs/API_SPEC.md` | كل الـ REST endpoints منظمة بالأقسام |
| PAYMENT_SYSTEM | `docs/PAYMENT_SYSTEM.md` | منطق العمولة + passthrough + service fee + cancellations |
| SECURITY | `docs/SECURITY.md` | Auth + KYC + Anti-circumvention + RBAC |
| BUILD_PLAN | `docs/BUILD_PLAN.md` | 11 مرحلة مع Exit Criteria + Risk Register |
| DEPLOYMENT | `docs/DEPLOYMENT.md` | Hostinger + Nginx + Docker Compose + Backups + DR |

**ملف القواعد**: `.cursor/rules/suknaa.mdc` (يُحمَّل تلقائياً من Cursor)

---

**نهاية الملف. آخر تحديث: 2026-05-03 — Monorepo (`apps/web`) + Cursor (Claude).**
