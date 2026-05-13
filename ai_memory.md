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
- **المرحلة الحالية**: Phase 2 مغلقة؛ **Phase 2.5 مكتملة بالكامل** (M1–M6: خطوط محلية + Helmet/`CORS_ORIGINS` + Redis auth RL + اختبارات auth مركّزة + بوابة **`verify:phase2.5`** + إغلاق توثيق M6). **Phase 3** — نظام **بيوت العطلات / Vacation Rentals** end-to-end **هي المرحلة النشطة التالية** للتنفيذ؛ **M0 مكتمل** بعد نجاح `verify:phase2.5` بتاريخ 2026-05-13.
- **آخر مرحلة مكتملة (واجهة)**: Phase 1 + 1.5 — UI skeleton + mock. **Phase 2**: M1→M10 مكتملة.
- **آخر تحديث للذاكرة**: 2026-05-13 (جلسة — Phase 3 planning + Vacation Rentals naming)
- **آخر AI عمل على المشروع**: Cursor
- **مرجع الوثائق المعتمد**: `/docs/*.md` فقط (v2 الكاملة + backlog الملاحظات). لا توجد نسخة v1 بعد الآن — تم حذفها بشكل نهائي.
- **مرجع قواعد الكود**: `.cursor/rules/suknaa.mdc` (يُقرأ تلقائياً)

---

## 2. القرارات الحرجة (لا تخرق هذه القرارات أبداً)

### 2.1 المعمارية
- **نظامان منفصلان كلياً**: Vacation Rentals / بيوت العطلات (P2P، شبيه بـ Airbnb) + Hospitality (B2B، شبيه بـ Booking.com)
- جداول DB منفصلة لكل نظام (`properties`/`property_spaces`/`property_availability_blocks` ضد `hotels`/`room_types`/`room_units`/`room_unit_availability_blocks`)
- modules منفصلة في الباك‌اند: `apps/api/src/modules/vacation-rentals/` و `apps/api/src/modules/hospitality/` للمرحلة الجديدة؛ أي اسم legacy مثل `real_estate` يُراجع ضمن Phase 3 M1.
- `bookings` polymorphic بـ discriminator (`booking_kind` enum) و CHECK constraint
- Modular monolith، **ليس** microservices
- **Stack**: Next.js 16 (App Router) + NestJS 10 + PostgreSQL 16 + PostGIS + Redis 7 + MinIO + Flutter (Phase 10)
- **الهيكل الفعلي الآن**: apps/web/ (Next.js) + packages/ui + packages/types + infrastructure/
- **Package Manager**: pnpm@9.15.4 (pnpm-workspace.yaml في الجذر)
- **Turborepo**: مؤجَّل — pnpm workspaces كافٍ للمرحلة الحالية
- Hosting: **Hostinger VPS** (KVM 2 → KVM 4 → KVM 8) + Cloudflare. **ليس** Hetzner.
- OS: Ubuntu 24.04 LTS، Datacenter: Frankfurt أو Amsterdam

### 2.2 المالية
- **العمولة تُختار من المؤجر** لكل عقار/فندق:
  - "العمولة عليّ" (افتراضي): يكتب $50 → يستلم $44 → الزبون يشوف $50
  - "تمرير على الزبون": يكتب $50 صافي → النظام يحسب $56.82 → الزبون يشوف $56.82 → المؤجر يستلم $50
- **الفاتورة لا تذكر العمولة أبداً للزبون** — في كل الأحوال
- **لا توجد عمولات/رسوم خدمة/ضرائب ثابتة داخل الكود**. أي أرقام مثل 12% أو 2% هي seed/config كبداية فقط، وليست business constants.
- **رسوم الخدمة منفصلة عن العمولة** وتظهر للزبون كبند صريح عندما تُفرض. يمكن تخصيصها أو إعفاؤها حسب guest/promo/manual override.
- **الضرائب والرسوم المحلية**: الفندق/الشركة/المضيف يمكنه إدخالها، لكن سُكنى تملك صلاحية الاعتماد أو التعديل أو التعطيل قبل ظهورها في checkout.
- **Financial rules engine إلزامي قبل الحجوزات والمدفوعات**: commission + service fee + taxes + discounts/coupons + waivers + manual overrides.
- **العملة**: USD مخزّنة كـ `BIGINT cents`؛ USD + SYP معروضة
- **4 طبقات تسعير**: Base (إلزامي) + Weekly (≥7 ليالي، اختياري) + Monthly (≥30 ليلة، اختياري) + Seasonal Override (تواريخ محددة)
- **Weekend uplift** اختياري (+X% على Fri/Sat)
- **Money flow**: Escrow للـ Vacation Rentals / بيوت العطلات (الفلوس بتُحجز 24 ساعة بعد check-in)؛ Direct للـ Hospitality (فوري)
- **Withdrawal**: weekly (الخميس) أو monthly (آخر يوم) أو manual، الحد الأدنى $10
- Seed defaults المقترحة كبداية فقط: 12% بيوت/شقق/فيلات، 10% مزارع/كبائن/شاليهات/استوديوهات، 8% فنادق/منتجعات/hostels، 10% hotel-apartments، ورسوم خدمة أولية مثل 2%. كلها قابلة للتغيير حسب السوق والعقود.
- على كل booking لازم نخزّن snapshot للـ `commission_basis_points`، `commission_passthrough`، `service_fee_basis_points`، tax lines، discounts/coupons، rule IDs/sources، `money_flow`، `cancellation_policy` وقت الإنشاء — لا تعتمد أبداً على القيم الحالية على العقار/الفندق.
- ممكن نعمل عروض مثل 0% عمولة لأول 5 حجوزات، أو عمولة خاصة لفندق/شركة، أو خصم ضيف محدد، بشرط usage limits + audit logs.

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
- خطوط: Tajawal للعربي، Inter للاتينية والأرقام (`font-numeric`) — **مستضافة محلياً** عبر `next/font/local` وملفات `woff2` تحت `apps/web/assets/fonts/` (لا جلب Google Fonts أثناء `next build`). Plus Jakarta Sans غير مستخدم حالياً في الكود الرئيسي للـ layout.
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
- **Phase 2.5 M3 (2026-05-13)**: حدّ إضافي عبر Redis على `login` / `signup` / طلب وتأكيد إعادة كلمة المرور / إكمال MFA؛ لا يُخزَّن توكن إعادة التعيين خاماً في مفاتيح Redis؛ يُكمّل حدود OTP الهاتفي الحالية ولا يستبدلها.
- **الصلاحيات طويلة المدى granular** وليست roles جامدة فقط. flags الحالية (`is_guest/is_host/is_admin`) مقبولة كبداية Phase 2، لكن الداشبورد/الإدمن/الفنادق تحتاج capabilities لكل مستخدم + templates + overrides + audit.
- الفنادق والشركات والمكاتب العقارية تحتاج organization/team membership: المالك يضيف موظفين ويعطيهم صلاحيات محددة (حجوزات، رسائل، محاسبة، تسعير، وثائق، إلخ).
- صلاحيات مالية عالية الخطورة منفصلة: `commission.override`, `service_fee.override`, `tax_rules.approve`, `tax_rules.override`, `discount_codes.manage`, `wallet.adjust`, `refunds.process`.

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
- [x] Monorepo scaffold بـ pnpm workspaces ✓ 2026-05-03 — apps/web/ + packages/ui + packages/types + infrastructure/ — بدون Turborepo (يُضاف لاحقاً عند الحاجة)
- [x] تثبيت Local Dev Environment ✓ 2026-05-04 — Docker Compose في infrastructure/docker-compose.yml — PostgreSQL 16+PostGIS (5432) + Redis 7 (6379) + MinIO (9000/9001) — يشتغل بـ: docker compose -f infrastructure/docker-compose.yml up -d
- [ ] **Mockups**: تأجيل Figma — قرار محمد: نسكافولد Next.js skeleton مع شاشات placeholder (نبني ونرى مباشرة) — يبدأ في Phase 1
- [ ] إصدار logo بصيغة SVG — مؤجَّل (PNG كافٍ الآن، سيُطلب من مصمم لاحقاً)

### Phase 1 — Public Website Skeleton (UI Only, Mock Data)
- [x] **Setup**: Next.js 16 + TS + Tailwind v4 + shadcn/ui + lucide ✓ 2026-04-30
- [x] **Global Layout**: Navbar (glass + scroll-aware) + Footer (3-layer) + RTL + design tokens ✓ 2026-04-30
- [x] **Homepage Hero** مع cinematic slider (4 صور + Ken Burns motion + glass search pill) ✓ 2026-04-30
- [x] **Homepage Hero search bar** (تفاعلي: `destinations` + `input type=date` + ضيوف + `→ /search?location&checkin&checkout&guests` + validation) ✓ 2026-05-04
- [x] **MapExplorer** (placeholder + pins ملوّنة + toolbar + container جاهز لـ MapLibre) ✓ 2026-04-30
- [x] **Destinations carousel** (data-driven, scroll أفقي) ✓ 2026-04-30
- [x] **FeaturedListings** + PropertyCard + HotelCard (reusable) ✓ 2026-04-30
- [x] **معمارية بيانات مرنة** (`data/hero-slides.ts` + `data/destinations.ts`) ✓ 2026-04-30
- [x] **WhySuknaaStrip + SeasonalPicks** (قسمان جديدان على الـ Homepage) ✓ 2026-05-04
- [x] **URL tab state**: نُقل `activeTab` من state محلي إلى `?tab=all|real_estate|hospitality` (Navbar + FeaturedListings + SearchTabs) ✓ 2026-05-04
- [x] **`/become-a-host`** (8 أقسام: Hero + Numbers + Benefits + How + EarningsCalculator + Testimonials + FAQ + FinalCTA) ✓ 2026-05-04
- [x] **`/search`** (Filters tab-aware + Grid + SortBar + EmptyState + MapToggle + URL params + filterProperties/filterHotels مُنفصلتان) ✓ 2026-05-04
- [x] **`/property/[id]`** (Gallery + per-room PropertySpaces + Amenities + Map + Reviews + HostSnippet + sticky BookingWidget بدون commission) ✓ 2026-05-04
- [x] **`/hotel/[id]`** (Gallery + RoomTypesList مع scarcity حقيقي على availableUnits + sticky DatePicker + Reviews + Company snippet) ✓ 2026-05-04
- [x] **`/login` و `/signup`** (Zod + React Hook Form + intent guest/host + للمؤجِّر اختيار host_category و host_subtype مع validation متقاطع) ✓ 2026-05-04
- [x] **404 + 500** بطابع سُكنى الدافئ ✓ 2026-05-04
- [x] **PWA manifest** (`app/manifest.ts` → `/manifest.webmanifest`) ✓ 2026-05-04
- [ ] إضافة الصور الفعلية (محمد يضيفها لـ `apps/web/public/images/hero/` و `apps/web/public/images/destinations/`)
- [ ] دمج MapLibre GL JS فعلياً على `#map-container`
- [ ] Service Worker الفعلي (الـ manifest جاهز، الـ SW يحتاج إعدادات إضافية)
- [ ] next-intl (AR + EN) — مؤجَّل
- [ ] Deploy إلى staging

### Phase 1.5 — Static Pages + Public Host Profile (جلسة 11)
- [x] **`/about`** (7 أقسام: Hero + Vision + Features + Numbers + Values + Team placeholder + CTA) ✓ 2026-05-04
- [x] **`/how-it-works`** (Hero + Tabs Client بـ URL state `?audience=guest|host` مع 4 خطوات لكل + dual CTA) ✓ 2026-05-04
- [x] **`/help`** (Hero + شريط بحث UI placeholder + 6 categories + FAQ accordion من 15 سؤال + Empty CTA) ✓ 2026-05-04
- [x] **`/contact`** (Hero + ContactForm Client بـ Zod + Sidebar بـ WhatsApp/Email/أوقات الدوام/Help link) ✓ 2026-05-04
- [x] **`/terms`** (12 قسم placeholder + LegalPageShell + Disclaimer "محتوى مبدئي") ✓ 2026-05-04
- [x] **`/privacy`** (10 أقسام placeholder مستوحى من SECURITY.md §8) ✓ 2026-05-04
- [x] **`/cookies`** (4 أقسام + جدول essential/analytics/marketing) ✓ 2026-05-04
- [x] **`/host/[username]`** (Header + Bio + Listings Tabs Client + Reviews — generateStaticParams لـ 5 hosts) ✓ 2026-05-04
- [x] **Footer جديد**: كل الروابط حقيقية الآن، 5 أعمدة (سُكنى، اكتشف، الدعم، للمضيفين، القانوني) ✓ 2026-05-04
- [x] **Refactor FeaturedListings**: يقرأ من `data/listings.ts` ويستخدم Result Cards (مصدر بيانات موحَّد) ✓ 2026-05-04
- [x] **Host Links**: PropertyResultCard + HotelResultCard + PropertyHostSnippet + HotelCompanySnippet كلها تربط بـ `/host/[hostSlug]` ✓ 2026-05-04
- [x] **Mock data جديد**: `data/help-faq.ts` (6 categories + 15 سؤال) و `data/hosts.ts` (5 hosts + findHost + format helpers) ✓ 2026-05-04

### Phase 2 — Backend Foundation + Auth + KYC
- [x] **Milestone 1 (apps/api)**: NestJS + Prisma + Zod env + Pino + Swagger + `GET /v1/health` (Probes: DB/Redis/MinIO) — نموذج `M1Placeholder` مؤقت ✓ (يُستبدل بـ M2)
- [x] **Milestone 2 (DB فقط)**: إزالة `M1Placeholder` — جداول `users`, `host_profiles`, `kyc_submissions`, `auth_sessions`, `otp_codes`, `two_factor_secrets`, `audit_logs` + كل الـ enums المطلوبة لـ Phase 2؛ `@@map`/`@map` لـ snake_case؛ مفاتيح UUID؛ فهارس (بما فيها `LOWER(email)` و`phone` للمستخدمين غير المحذوفين) + تريجر append-only لـ `audit_logs` + `pgcrypto` + `postgis` في الترحيل `20250506120000_phase2_core_auth_tables` ✓ 2026-05-06
- [x] **Milestone 2 Cleanup**: `users.phone` صار اختيارياً ليتوافق مع guest signup الحالي؛ فهرس الهاتف unique جزئي فقط عند وجود phone؛ `audit_logs` أضيف لها `actor_role`, `request_id`, `before`, `after` + تحويل `actor_ip` إلى `INET`; تحديث `apps/api/README.md` من M1 إلى M2؛ الترحيل `20250506133000_m2_schema_cleanup` ✓ 2026-05-06
- [x] **أداة الترحيل**: `prisma:migrate` في `apps/api/package.json` أصبحت `prisma migrate deploy` (غير تفاعلي؛ مناسب لـ CI/السكربتات)
- [x] **Milestone 3 (Shared Infra فقط)**: `shared/messaging` provider-agnostic مع `MockMessageProvider` يكتب إلى `.dev-outbox` + `WhatsAppProvider` stub مع `NotImplementedException`؛ `shared/audit` (`AuditModule` + `AuditService.write()` مطابق لـ M2 cleanup schema)؛ `shared/errors/api-error.helpers.ts` + تمرير `details` في GlobalExceptionFilter؛ تحسينات منخفضة المخاطر فقط في `StorageService` (`ensureBucketExists` + `buildKycObjectKey`) و`RedisService` (`buildKey`, `setJson`, `getJson`) + env vars الجديدة (`MESSAGE_PROVIDER`, `DEV_OUTBOX_DIR`, `REDIS_KEY_PREFIX`) ✓ 2026-05-06
- [x] **Milestone 4 (Auth Core)**: shared auth schemas في `packages/types`; `PasswordService` (argon2id: 64MB/3/4) + mock `PasswordBreachChecker`; strict RS256 keys required (`JWT_PRIVATE_KEY_PATH`, `JWT_PUBLIC_KEY_PATH`) + `TokensService` (access 15m + opaque refresh 256-bit hashed); `AuthModule/AuthController/AuthService` endpoints (`signup`, `verify-email`, `login`, `refresh`, `logout`, `logout-all`, `sessions`, `revoke session`, `/v1/me`); email verification عبر `otp_codes` (`purpose=email_verification`, `channel=email`, `delivery_target=email`, `code_hash` long opaque token); refresh rotation مع revoke session القديم؛ audit events (`auth.signup`, `auth.email_verified`, `auth.login`, `auth.refresh`, `auth.logout`, `auth.logout_all`, `auth.session_revoked`) ✓ 2026-05-06
- [x] **Milestone 5 (OTP + Phone + 2FA)**: OTP phone verification + TOTP 2FA + backup codes + MFA login challenge + WhatsApp Cloud disabled prep; verified with Docker-backed `db:status` and `verify:m5` (`ok: true`). verified 2026-05-07
- [x] **Milestone 6 (Login Intent + Roles + Become Host)**: login intent + RolesGuard + become-host endpoint + host profile creation; verified with Docker-backed `verify:m6` (`ok: true`, `isHost: true`). verified 2026-05-07
- [x] **Milestone 7 (KYC Submission + MinIO)**: KYC shared schemas, API multipart upload, magic-byte MIME validation, private MinIO object keys, subtype-required document validation, pending `kyc_submissions`, safe latest/history responses, and `kyc.submitted` audit log; verified with Docker-backed `verify:m7` (`ok: true`, `status: pending`, `hostVerified: false`). verified 2026-05-07
- [x] **Milestone 8 (Admin KYC Review)**: `GET /v1/admin/kyc/queue` (cursor-paginated, document-presence booleans, no raw keys) + `POST /v1/admin/kyc/:id/approve` (sets approved + expiresAt +2y + host isVerified=true in transaction) + `POST /v1/admin/kyc/:id/reject` (reason required, host unchanged); audit events `admin.kyc.approved` / `admin.kyc.rejected`; double-review blocked with `KYC_ALREADY_REVIEWED`. ✓ 2026-05-07
- [x] **Milestone 9 (Frontend BFF Integration)**: BFF للويب + auth cookies/CSRF + ربط login/signup/host apply/KYC بالـ API الفعلي + smoke test يدوي من المتصفح (signup, email verify, login intent, phone OTP, become-host, KYC submit) ✓ 2026-05-07
- [x] **Milestone 10 (Tests + Docs Closure)**: password reset API+BFF، سكربت `verify:m10` عميق، توثيق قرارات SMS→WhatsApp وتأجيل language/dashboard/admin UI، وإغلاق Phase 2. ✓ 2026-05-07
- [ ] **ملاحظة تحقق محلي**: إن ظهر **P1002** (advisory lock) أو **EPERM** على `prisma generate` — أوقف عمليات `dev`/Nest التي تشغّل Prisma وأعد تشغيل PostgreSQL ثم أعد `db:migrate` و `prisma:generate`

### Phase 2.5 — Stabilization (قبل Phase 3) — **مكتملة 2026-05-13**
- مرجع الخطة: `docs/PHASE_2_5_STABILIZATION_PLAN.md` (**Status: Completed**).
- [x] **M1 — Reproducible web build (خطوط محلية)**: استبدال `next/font/google` بـ `next/font/local` في `apps/web/app/layout.tsx`؛ إضافة Tajawal (عربي 400/500/700/800) + Inter (latin variable woff2) تحت `apps/web/assets/fonts/` مع `README.md` (OFL + مصادر upstream / لقطة من حزم Fontsource). الحفاظ على `--font-tajawal` و `--font-inter`؛ بدون تغيير RTL أو `globals.css`. التحقق: `npx pnpm@9.15.4 --filter web lint` و `build` نجاح؛ لا `fonts.googleapis.com` في تطبيق الويب. ✓ 2026-05-09
- [x] **M2 — API Helmet + CORS**: `helmet` في `main.ts` (CSP معطّل مؤقتاً لتوافق Swagger؛ `crossOriginEmbedderPolicy: false`); `CORS_ORIGINS` في `env.schema` مع افتراضي محلي؛ `enableCors` بأصول صريحة + `credentials` بدون `*`؛ `allowedHeaders`: Authorization, Content-Type, X-CSRF-Token, X-Request-Id, Accept-Language (بدون `X-Internal-Api-Key` في CORS). تحديث `.env.example` و`PHASE_2_5_STABILIZATION_PLAN.md`. ✓ 2026-05-10
- [x] **M3 — Auth rate limiting (Redis)**: `AuthRateLimitService` + استدعاءات في `AuthService` (`login` بداية؛ `signup` بداية IP-only؛ `requestPasswordReset` مبكراً قبل early-return؛ `confirmPasswordReset` بداية مع بصمة توكن (هاش)؛ `completeMfaLogin` بعد JWT MFA صالح قبل TOTP). مفاتيح `auth:rl:*` + `incrementWithTtl`؛ رموز 429: `AUTH_LOGIN_RATE_LIMITED` / `AUTH_SIGNUP_RATE_LIMITED` / `AUTH_PASSWORD_RESET_RATE_LIMITED` / `AUTH_MFA_RATE_LIMITED`. متغيرات `AUTH_RL_*` في `env.schema` و`.env.example`. سكربت `verify:m3` + `manual-m3-verify.ts`. OTP الحالي وباقي السلوك كما هو. ✓ 2026-05-13
- [x] **M4 — Focused auth tests**: `tsconfig.tests.json` + `tests/auth-flows.test.ts` مع `node --test` بعد `tsc` إلى `.tmp-tests/`؛ `pnpm --filter api test` يشغّل الحزمة (11 سيناريو: signup، duplicate email، verify-email، login فاشل، refresh rotation، logout، password reset generic + confirm، login rate limit 429، become-host قبل الهاتف، KYC بدون ownership). عناوين IP تركيبية لكل scope لتفادي تصادم Redis عند التوازي. ESLint يشمل `tests/**`. سكربتات `verify:m*` لم تُغيَّر. ✓ 2026-05-13
- [x] **M5 — Verification Gate**: `scripts/verify-phase-2-5.mjs` يشغّل بالتسلسل: `web lint` → `web build` → `api lint` → `api build` → `api exec prisma validate` → `api test`؛ يتوقف عند أول فشل ويطبع اسم الخطوة. من الجذر: `npx pnpm@9.15.4 verify:phase2.5`. يتطلّب `api test` Docker (`suknaa_postgres`، `suknaa_redis`، `suknaa_minio`) + `apps/api/.env` صالحاً (انظر `docs/PHASE_2_5_STABILIZATION_PLAN.md` M5). ✓ 2026-05-13
- [x] **M6 — Documentation Closure**: تحديث `PHASE_2_5_STABILIZATION_PLAN.md` (حالة Completed + M6)، `PHASE_2_TRACKER.md` (حالة Phase 2.5 + بوابة)،`BUILD_PLAN.md` (ملاحظة Phase 2.5)،`ai_memory.md`،`.cursor/rules/suknaa.mdc`؛ إعادة تشغيل **`npx pnpm@9.15.4 verify:phase2.5`** وتسجيل النجاح. ✓ 2026-05-13

### Phase 3 — Vacation Rentals / Holiday Homes System (End-to-End)
- **نشطة تالياً للتنفيذ** — M0 مكتمل: `npx pnpm@9.15.4 verify:phase2.5` نجح بتاريخ 2026-05-13 (web lint/build، api lint/build، Prisma validate، api tests 11/11).
- المرجع التفصيلي: `docs/PHASE_3_VACATION_RENTALS_PLAN.md`. الاسم المنتج الصحيح: **بيوت العطلات / Vacation Rentals** وليس "عقارات" أو "Real Estate" كاسم واجهة أو نطاق جديد.

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

**التاريخ**: 2026-05-13 (Phase 2.5 M6 — Documentation Closure)
**الـ AI المستخدم**: Cursor

**ما تم تنفيذه**:
1. **`docs/PHASE_2_5_STABILIZATION_PLAN.md`**: الحالة **Completed**؛ M1–M6 موثّقة؛ قسم M6 — Completed؛ **Still deferred** يبقي Non-Goals صريحة؛ Phase 3 يمكن البدء بها.
2. **`docs/PHASE_2_TRACKER.md`**: الحالة — Phase 2 مغلقة، Phase 2.5 مكتملة، Phase 3 التالية؛ قسم Phase 2.5 + ترتيب أوامر التحقق مع **`verify:phase2.5`** أولاً.
3. **`docs/BUILD_PLAN.md`**: ملاحظة قصيرة بين Phase 2 و Phase 3 عن إكمال 2.5 والبوابة `verify:phase2.5`.
4. **`ai_memory.md`** (هذا الملف) + **`.cursor/rules/suknaa.mdc`**: Phase 2.5 مكتملة؛ Phase 3 نشطة تالياً؛ الإبقاء على أمر البوابة.

**التحقق** (جلسة M6، من جذر الريبو؛ Docker + `apps/api/.env` عند تشغيل `api test`):
- `npx pnpm@9.15.4 verify:phase2.5` → **نجاح** (الخطوات الست؛ `api test` **11/11**؛ ختام السكربت `[verify:phase2.5] All steps passed.`) — نتيجة التشغيل الفعلي لهذه الجلسة (انظر الطرفية).

**التالي**: **Phase 3** — نظام بيوت العطلات / Vacation Rentals end-to-end (`docs/BUILD_PLAN.md` + `docs/PHASE_3_VACATION_RENTALS_PLAN.md`).

---

**التاريخ السابق**: 2026-05-13 (Phase 2.5 M5 — Verification Gate)
**الـ AI المستخدم**: Cursor

**ملخص M5 (مرجعي)**:
- **`scripts/verify-phase-2-5.mjs`** + **`package.json`** جذر `verify:phase2.5`؛ توثيق M5 في `PHASE_2_5_STABILIZATION_PLAN.md`؛ تحديث أولي لـ `suknaa.mdc`.

**التحقق (M5، مسجّل سابقاً)**:
- `npx pnpm@9.15.4 verify:phase2.5` → **نجاح**: `web lint` → `web build` (Next 16.2.4، 57 route) → `api lint` → `api build` → `api prisma validate` → `api test` (**11/11**)؛ `[verify:phase2.5] All steps passed.`

---

**التاريخ السابق**: 2026-05-13 (Phase 2.5 M4 — Focused auth tests، `node:test`)
**الـ AI المستخدم**: Cursor

**ما تم تنفيذه (M4)**:
1. **`apps/api/tsconfig.tests.json`**: تجميع `src/**/*.ts` + `tests/**/*.ts` إلى `.tmp-tests/` (مُستثنى في `.gitignore`).
2. **`apps/api/tests/auth-flows.test.ts`**: 11 اختباراً عبر `NestFactory.createApplicationContext(AppModule)`؛ قراءة التوكن من `.dev-outbox`؛ عناوين IP تركيبية مستمدة من `SHA256(runId:scope)` لكل سيناريو لتفادي تصادم حدّ التسجيل عند التوازي؛ إغلاق السياق في `after`.
3. **`apps/api/package.json`**: `test` يشغّل `pnpm --filter @suknaa/types build` ثم `tsc -p tsconfig.tests.json` ثم `node --test .tmp-tests/tests/auth-flows.test.js`؛ الإبقاء على `verify:m3`…`verify:m10` كما هي.
4. **`eslint.config.mjs`** + **`lint`**: تضمين `tests/**/*.ts`.
5. تحديث **`docs/PHASE_2_5_STABILIZATION_PLAN.md`** (M4: Completed) وهذا الملف.

**التحقق (M4)** (Docker Compose شغّال + `.env`):
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `npx pnpm@9.15.4 --filter api test` → **11/11** نجاح (`Focused auth flows (Phase 2.5 M4)`).

---

**التاريخ السابق**: 2026-05-13 (Phase 2.5 M3 — Auth rate limiting عبر Redis)
**الـ AI المستخدم**: Cursor

**ما تم تنفيذه**:
1. **`AuthRateLimitService`** (`apps/api/src/modules/auth/services/auth-rate-limit.service.ts`): حدود عبر `RedisService.incrementWithTtl`، مفاتيح `auth:rl:…` مع لاحقة SHA256 لمادّة مستقرة (بدون تخزين توكن إعادة التعيين خام في Redis).
2. **`AuthService`**: استهلاك الحدود في المواضع المتفق عليها؛ الإبقاء على حدّ `otp_codes` لطلب إعادة التعيين وعلى منطق OTP الحالي دون تغيير.
3. **`env.schema.ts`** + **`apps/api/.env.example`**: متغيرات `AUTH_RL_LOGIN_*`, `AUTH_RL_SIGNUP_*`, `AUTH_RL_PASSWORD_RESET_*`, `AUTH_RL_MFA_*` بقيم افتراضية مطابقة لجدول M3.
4. **`verify:m3`** و **`scripts/manual-m3-verify.ts`**: سياق Nest كامل؛ يثبت أن المحاولة السادسة لفاشلة `login` ترجع 429 بالرمز `AUTH_LOGIN_RATE_LIMITED` و`message`/`message_en`.
5. تحديث **`docs/PHASE_2_5_STABILIZATION_PLAN.md`** (قسم M3: Completed) وهذا الملف.

**التحقق**:
- `npx pnpm@9.15.4 --filter api lint` → نجاح (في بيئة التنفيذ).
- `npx pnpm@9.15.4 --filter api build` → نجاح (في بيئة التنفيذ).
- `npx pnpm@9.15.4 --filter api verify:m3` → يتطلّب Postgres + Redis شغّالين (مثلاً Docker Compose من `infrastructure/docker-compose.yml`); في جلسة التنفيذ فشل الإقلاع بسبب عدم توفر Docker daemon (`Can't reach database server at localhost:5432`). بعد تشغيل Docker و`.env` الصحيح يُعاد تشغيل الأمر للتأكيد.

**الحدود الافتراضية (قابلة للضبط عبر `AUTH_RL_*` في `.env`)**:

| المسار / السلوك | الحدّ | النافذة | مفتاح Redis (مختصر) |
|---|---:|---|---|
| `POST …/auth/login` | 5 محاولات | 60 ثانية | IP + بريد مُطبَّع → `auth:rl:login:<hash>` |
| `POST …/auth/signup` | 3 محاولات | ساعة | IP فقط → `auth:rl:signup:<hash>` |
| `POST …/auth/password-reset/request` | 5 | ساعة | IP + بريد → `auth:rl:pw_reset_req:<hash>` |
| `POST …/auth/password-reset/confirm` | 5 | ساعة | IP + بريد + بصمة توكن (SHA256 داخلي) → `auth:rl:pw_reset_conf:<hash>` |
| `POST …/auth/login/2fa` | 5 | 10 دقائق | IP + `userId` بعد JWT MFA صالح → `auth:rl:mfa_login:<hash>` |

**ملفات مرجعية (M3)**:
- جديد: `apps/api/src/modules/auth/services/auth-rate-limit.service.ts`، `apps/api/scripts/manual-m3-verify.ts`
- تعديل: `apps/api/src/modules/auth/auth.service.ts`، `apps/api/src/modules/auth/auth.module.ts`، `apps/api/src/shared/config/env.schema.ts`، `apps/api/.env.example`، `apps/api/package.json` (`verify:m3`)، `docs/PHASE_2_5_STABILIZATION_PLAN.md` (قسم M3 — Completed)، `ai_memory.md`

**التالي (تاريخي بعد M3)**: أُنجز لاحقاً **M4–M6**؛ **Phase 2.5 مُغلقة توثيقياً 2026-05-13**؛ المرحلة النشطة التالية **Phase 3**.

---

**التاريخ السابق**: 2026-05-10 (Phase 2.5 M2 — Helmet + CORS للـ API)

**ما تم تنفيذه (M2)**:
1. تبعية **`helmet`** في `apps/api`؛ تطبيق في `main.ts` مع تعطيل CSP مؤقتاً (Swagger `/api/docs`) وتعطيل `crossOriginEmbedderPolicy`.
2. **`CORS_ORIGINS`** (Zod + `.env.example`): قائمة مفصولة بفواصل، افتراضي `http://localhost:3000,http://127.0.0.1:3000`؛ CORS للمتصفح فقط — طلبات بدون `Origin` مسموحة لـ curl/health؛ لا `X-Internal-Api-Key` في `allowedHeaders`.
3. تحديث **`docs/PHASE_2_5_STABILIZATION_PLAN.md`** (M2: `CORS_ORIGINS` بدل `WEB_ORIGIN` + ملاحظة CSP).

**التحقق (M2)**:
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `npx pnpm@9.15.4 --filter api exec prisma validate` → نجاح.

---

**التاريخ**: 2026-05-09 (Phase 2.5 M1 — خطوط محلية، بناء ويب قابل للتكرار)
**الـ AI المستخدم**: Cursor

**ما تم تنفيذه**:
1. إغلاق **Phase 2.5 Milestone 1** حسب `docs/PHASE_2_5_STABILIZATION_PLAN.md`: إزالة اعتماد `next/font/google` (كان يسبب فشل `web build` في بيئات بدون اتصال بـ Google Fonts).
2. **`apps/web/app/layout.tsx`**: `localFont` من `next/font/local` — Tajawal بأربعة ملفات `woff2`، Inter بملف variable واحد (`weight: "100 900"`).
3. **`apps/web/assets/fonts/`**: ملفات الخطوط المضافة للريبو + `README.md` يوثّق SIL OFL 1.1 والمصادر (Google Fonts / google/fonts، لقطة من `@fontsource/tajawal` و `@fontsource-variable/inter` عند إعداد الأصول).
4. لم يُمس `apps/api`، ولا M2/M3، ولا `globals.css` (المتغيرات CSS كما هي).

**التحقق**:
- `npx pnpm@9.15.4 --filter web lint` → نجاح.
- `npx pnpm@9.15.4 --filter web build` → نجاح (Next.js 16.2.4، 57 route).

---

**التاريخ**: 2026-05-08 (Pre-Phase-3 Mini UX Cleanup)
**الـ AI المستخدم**: Codex

**ما تم تنفيذه**:
1. إضافة placeholder pages لمنع 404 بعد login:
   - `/dashboard` للضيف، تعتمد على `/api/me` وتعرض حسابي/حجوزاتي/CTA للاستضافة.
   - `/host/dashboard` للمضيف، تعتمد على `isHost` من `/api/me` وتعرض بطاقات مبدئية للتحقق/بيوت العطلات/الحجوزات/الأرباح.
2. تحديث مسميات واجهة الاستضافة:
   - `individual` يظهر كـ "حساب شخصي".
   - `re_office` يظهر كـ "مكتب عقاري (تجاري)".
   - `hotel_company` يظهر كـ "شركة فندقية (تجاري)".
3. استبدال التصنيف العام الظاهر للمستخدم من "عقارات" إلى "بيوت عطلات" في واجهات `apps/web` فقط، مع إبقاء `real_estate` والـ routes والـ types كما هي.
4. إخفاء مسار الفنادق مؤقتاً في Step 1 من host onboarding ككرت disabled "قريباً"، بدون حذف `hospitality` أو تغيير schema/backend.
5. تنظيف واجهة KYC نصياً:
   - تسميات عربية أوضح للحقول.
   - شرح سبب طلب الوثائق.
   - إخفاء `hotel_license` من الواجهة لأن مسار الفنادق مؤجل.
   - لا يوجد تخصيص كامل حسب subtype لأن `/api/me` لا يرجع `hostProfile.hostSubtype` أو KYC status حالياً.
6. جعل الـ public Navbar يقرأ `/api/me` ويعرض رابط لوحة الحساب/لوحة المضيف بدل "تسجيل الدخول" عندما تكون الجلسة فعالة.
7. إزالة الإيموجي من نقاط onboarding والداشبورد واستبدالها بأيقونات Lucide بألوان سُكنى: primary لبيوت العطلات وgold للفنادق.
8. تحديث `docs/UX_BACKLOG.md` بوضع علامات على البنود المنجزة وتوثيق البند المفتوح الخاص بإظهار `hostSubtype` وKYC status من API لاحقاً.

**قرارات مهمة**:
- لا migration جديدة.
- لا تعديل على `apps/api`.
- لا تعديل على Prisma schema أو DB enums.
- لا تعديل على route names أو API endpoints.
- بقي كـ next-session candidate: إضافة API يعرض `hostProfile.hostSubtype` وKYC status عند بدء dashboard/KYC الديناميكي الحقيقي.

**التحقق**:
- `npx pnpm@9.15.4 --filter web lint` → نجاح.
- `npx pnpm@9.15.4 --filter web build` → نجاح. build ولّد `/dashboard` و`/host/dashboard` ضمن routes.

---

**التاريخ**: 2026-05-08 (Financial Rules + Permissions Decisions)
**الـ AI المستخدم**: Codex

**ما تم توثيقه**:
1. تثبيت قرار أن العمولة ورسوم الخدمة والضرائب والخصومات ليست أرقاماً ثابتة داخل الكود، بل قواعد مالية قابلة للتخصيص.
2. تحديث خطة Phase 5 لتشمل financial rules resolver قبل checkout:
   - commission
   - service fee
   - taxes/local fees
   - discounts/coupons/waivers
   - manual overrides
3. تثبيت أن الفندق/الشركة/المضيف يمكنه إدخال الضرائب المحلية، لكن سُكنى تملك الاعتماد أو التعديل أو التعطيل.
4. تثبيت أن كل booking يخزن snapshot للقواعد المالية المطبقة عليه حتى لا تتغير الفواتير القديمة.
5. تثبيت اتجاه الصلاحيات الطويل: granular permissions + organization/team membership بدلاً من الاعتماد على roles جامدة فقط.
6. تثبيت أن نظام التسعير الذكي يبقى Phase 8، ويعطي اقتراحات ولا يغير الأسعار تلقائياً إلا عند قبول host/admin.

**الملفات المحدثة**:
- `docs/PAYMENT_SYSTEM.md`
- `docs/BUILD_PLAN.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/README.md`
- `ai_memory.md`

**التحقق**:
- تغييرات توثيق فقط؛ لا توجد حاجة لاختبارات build/lint.

---

**التاريخ**: 2026-05-07 (Phase 2 Milestone 10 — Tests + Docs Closure)
**الـ AI المستخدم**: Codex

**ما تم تنفيذه**:
1. إضافة password reset في API:
   - `POST /v1/auth/password-reset/request`
   - `POST /v1/auth/password-reset/confirm`
   - الطلب يرجع success عام للبريد غير الموجود لتجنب account enumeration.
   - reset token طويل opaque ومحفوظ hash في `otp_codes` مع `purpose=password_reset`.
   - نجاح reset يلغي جلسات refresh المفتوحة للمستخدم.
2. إضافة BFF mirrors:
   - `POST /api/auth/password-reset/request`
   - `POST /api/auth/password-reset/confirm`
3. إضافة سكربت تحقق عميق:
   - `npx pnpm@9.15.4 --filter api verify:m10`
   - يغطي signup، email verify، login، password reset، إلغاء session، phone OTP، become-host، KYC missing-doc guard، KYC submit، safe latest/history بدون raw storage keys، admin approve، audit logs.
4. توثيق قرارات M10:
   - SMS استُبدل بواتساب/provider abstraction، والـ mock يبقى الافتراضي محلياً.
   - language/i18n UI مؤجلة حتى تستقر بنية الموقع كاملة.
   - dashboard/profile UI وadmin UI خارج Phase 2 foundation.
   - موافقة KYC حالياً API/service-level عبر `/v1/admin/kyc/*`.
   - mandatory 2FA enforcement للمضيفين/admins مؤجل كـ pre-production hardening.
5. تحديث `docs/PHASE_2_TRACKER.md`, `docs/BUILD_PLAN.md`, `docs/UX_BACKLOG.md`, و`apps/api/README.md`.

**التحقق**:
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- `npx pnpm@9.15.4 --filter web lint` → نجاح.
- `npx pnpm@9.15.4 --filter web build` → نجاح.
- `npx pnpm@9.15.4 --filter api verify:m8` → نجاح: `ok: true`.
- `npx pnpm@9.15.4 --filter api verify:m10` → نجاح: `ok: true`.

**الحالة**:
- Phase 2 مغلقة الآن حتى M10.
- Phase 3 هي التالية، ولا تبدأ قبل رفع/حفظ تغييرات Phase 2.

---

**التاريخ**: 2026-05-07 (Phase 2 Milestone 9 — Frontend BFF Integration)
**الـ AI المستخدم**: Codex

**ما تم تنفيذه**:
1. إنشاء طبقة BFF كاملة في `apps/web/app/api/*` لمسارات auth/me/otp/2fa/kyc المطلوبة في M9.
2. إضافة server-only helpers تحت `apps/web/lib/server/`:
   - `api-client.ts`: forwarding آمن + retry-on-401 (refresh مرة واحدة) للمسارات المحمية.
   - `auth-cookies.ts`: إدارة access/refresh في cookies `httpOnly + sameSite=strict + secure(production)`.
   - `csrf.ts`: Double-submit CSRF (`X-CSRF-Token` مقابل cookie).
   - `bff-response.ts` و`api-errors.ts`: توحيد إخراج success/error من BFF.
3. إضافة `GET /api/csrf` + helper عميل `apps/web/lib/csrf-client.ts` مع `ensureCsrfToken()` قبل أي mutation.
4. ربط النماذج الفعلية بدل mock:
   - `LoginForm` و`HostLoginForm`: login حقيقي + 2FA challenge + `login/intent` + redirect.
   - `SignupForm`: signup حقيقي مع رسالة تحقق البريد.
   - `HostApplyWizard`: flow فعلي (session check/signup fallback/become-host) + mapping `re_office -> real_estate_office` + state واضحة لـ `PHONE_VERIFICATION_REQUIRED` + OTP request/verify ثم retry.
5. إضافة واجهة KYC minimal ضمن نطاق M9:
   - صفحة `app/(host-auth)/become-a-host/kyc/page.tsx`
   - مكوّن `KycSubmissionForm` (upload + submit + history) عبر BFF فقط وبدون عرض raw storage keys.
6. تحديث `docs/PHASE_2_TRACKER.md` لإغلاق M9 بعد نجاح smoke test من المتصفح.
7. تحديث `docs/BUILD_PLAN.md` بوضع `[x]` على خطوات Phase 2 التي أُنجزت فعلياً، مع إبقاء العناصر غير المكتملة مثل password reset وprofile/dashboard بدون إغلاق.
8. إنشاء `docs/UX_BACKLOG.md` كمكان دائم لملاحظات UX/product المؤجلة (KYC حسب نوع المضيف، مسميات شخصي/تجاري، فصل الفنادق عن بيوت العطلات، وتغيير "عقارات" إلى "بيوت عطلات").
9. إصلاح تشغيل `api dev` محلياً بتنظيف `dist` و`tsconfig.build.tsbuildinfo` قبل watch لتجنب خطأ `Cannot find module apps/api/dist/main`.
10. إنشاء `apps/web/.env.local` محلياً بقيمة `SUKNAA_API_BASE_URL=http://localhost:3001/v1` لتشغيل BFF أثناء التطوير (الملف ignored ولا يُرفع).

**التحقق**:
- `npx pnpm@9.15.4 --filter web lint` → نجاح.
- `npx pnpm@9.15.4 --filter web build` → نجاح.
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `npx pnpm@9.15.4 --filter api verify:m8` → نجاح: `ok: true` مع Docker services شغالة وصحية.
- Smoke test يدوي من المتصفح → نجاح: signup، email verification عبر BFF/CSRF، login + login intent، host apply، phone OTP، become-host، وKYC submit.

**الثغرات/الملاحظات المتبقية**:
- M9 مغلق الآن. الملاحظات غير الأمنية الخاصة بتجربة المستخدم والمسميات محفوظة في `docs/UX_BACKLOG.md` وليست blocker على M9.
- تم الالتزام بعدم تخزين التوكنز في `localStorage/sessionStorage` وعدم طباعة passwords/tokens/otp/mfa_token/storage keys.

---

**التاريخ**: 2026-05-07 (Phase 2 Milestone 8 — Admin KYC Review)
**الـ AI المستخدم**: Claude

**ما تم تنفيذه**:
1. إضافة `adminKycRejectSchema` في `packages/types/src/schemas/admin-kyc.ts` وتصديره من `@suknaa/types`.
2. إنشاء `AdminModule` في `apps/api/src/modules/admin/` يحتوي على:
   - `AdminKycService`: `listQueue` (cursor pagination، document-presence بooleans، بدون raw storage keys) + `approveKyc` (transaction: kyc approved + host isVerified=true + expiresAt +730 يوم) + `rejectKyc` (reason required، host unchanged).
   - `AdminKycController`: `GET /v1/admin/kyc/queue` + `POST /v1/admin/kyc/:id/approve` + `POST /v1/admin/kyc/:id/reject` — محمية بـ `JwtAuthGuard + RolesGuard + @Roles("admin")`.
3. ربط `AdminModule` في `AppModule`.
4. إضافة `scripts/manual-m8-verify.ts` وسكربت `verify:m8`.

**التحقق**:
- `prisma:generate` → نجاح.
- `db:status` → clean.
- `build` → نجاح.
- `lint` → نجاح.
- `verify:m8` → نجاح: `ok: true`, `approvedSubmissionId`, `rejectedSubmissionId`.

---

**التاريخ**: 2026-05-07 (Phase 2 Milestone 7 — KYC Submission + MinIO)
**الـ AI المستخدم**: Codex

**ما تم تنفيذه**:
1. إضافة shared KYC schemas في `packages/types/src/schemas/kyc.ts` وتصديرها من `@suknaa/types`.
2. إضافة `KycModule/KycController/KycService` مع مسارات `POST /v1/me/kyc/upload`, `POST /v1/me/kyc`, `GET /v1/me/kyc`, `GET /v1/me/kyc/history`.
3. رفع KYC عبر API multipart فقط، تخزين خاص في MinIO تحت `kyc/<user_id>/<file_kind>-<uuid>.<ext>`، مع فحص الحجم وMIME وmagic bytes.
4. submit يتحقق من وجود host profile، متطلبات المستندات حسب `hostSubtype`، ملكية المفاتيح للمستخدم الحالي، تطابق نوع المفتاح مع الحقل، ووجود objects في MinIO قبل إنشاء submission.
5. safe read endpoints لا ترجع raw storage keys، بل `documentPresence` فقط. ClamAV وEXIF/image processing مؤجلان كمتطلبات pre-beta.

**التحقق**:
- `prisma:generate` → نجاح.
- `db:status` → clean.
- `build` → نجاح.
- `lint` → نجاح.
- `verify:m7` → نجاح: `ok: true`, `status: pending`, `hostVerified: false`.

---

**التاريخ**: 2026-05-07 (Phase 2 Milestone 6 — Login Intent + Roles + Become Host)
**الـ AI المستخدم**: Codex

**ما تم تنفيذه**:
1. إضافة schemas مشتركة لـ `loginIntentSchema` و`becomeHostSchema` في `@suknaa/types`.
2. إضافة `POST /v1/auth/login/intent` لتسجيل intent ضيف/مضيف مع redirect hints.
3. إضافة `RolesGuard` و`@Roles()` لاستخدامها في مسارات host/admin القادمة.
4. إضافة `POST /v1/me/become-host` مع شرط `phoneVerified=true`، إنشاء `host_profiles`، وتفعيل `users.is_host=true` مع بقاء `host_profiles.is_verified=false` حتى KYC.
5. إضافة `scripts/manual-m6-verify.ts` وسكربت `verify:m6`.

**التحقق**:
- `prisma:generate` → نجاح.
- `build` → نجاح.
- `lint` → نجاح.
- `verify:m6` → نجاح: `ok: true`, `isHost: true`, `hostCategory: real_estate`, `hostSubtype: individual`.

---

**التاريخ**: 2026-05-07 (Phase 2 Milestone 5 — OTP + Phone Verification + 2FA)
**الـ AI المستخدم**: Cursor Agent

**ما تم تنفيذه**:
1. توسيع `packages/types` بمخططات Zod لـ OTP الهاتف وتأكيد TOTP وتعطيله وتسجيل الدخول بخطوتين (بدون المساس بتدفق التحقق من الإيميل في M4).
2. متغيرات بيئة M5 في `env.schema.ts` + `.env.example` (بما فيها OTP TTL/attempts/rate، `JWT_MFA_TTL`، `TOTP_ENC_KEY`، حقول WhatsApp Cloud مع تحقق شرطي عند التفعيل).
3. `OtpService` لتوليد OTP مُهاشر، حد معدل Redis، ومسار تحقق يحدّث `users.phone` و`phoneVerified`.
4. `TwoFactorService` لتجهيز TOTP، تأكيده، تعطيله، وأكواد احتياط مُهاشرة؛ تشفير سر TOTP في `totp_secret_encrypted`.
5. تعديل `login`: مع تمكين TOTP لا تُصدَّر جلسة قبل `POST /v1/auth/login/2fa`؛ JWT عادي يرفض `tokenUse=mfa_challenge` في `JwtStrategy`.
6. مزوّد WhatsApp Cloud (Graph API) معطّل افتراضياً.
7. `scripts/manual-m5-verify.ts` + تحديث `manual-m4-verify.ts` لتضييق نوع ناتج `login`.
8. تحديث `docs/PHASE_2_TRACKER.md` و`apps/api/README.md` و`ai_memory.md`.

**التحقق**:
- `pnpm --filter api prisma:generate` ✓
- `pnpm db:status` — يحتاج Postgres يعمل؛ فشل محلي إذا Docker متوقف (`P1001`).
- `pnpm --filter api build` ✓
- `pnpm --filter api lint` ✓
- `verify:m5` → نجاح: `ok: true`, `phoneVerified: true`, `backupCodesReturned: 10`.

---

**التاريخ**: 2026-05-06 (جلسة 22 — Phase 2 M4 Cleanup)
**الـ AI المستخدم**: Codex

**السياق**: تنفيذ Cleanup لـ M4 فقط (بدون بدء M5) لإغلاق 3 ملاحظات مراجعة: alias runtime، build/start output، وتوحيد auth schemas مع `@suknaa/types`.

**ما تم تنفيذه**:
1. **Fix alias runtime**:
   - استبدال كل استيرادات `@/...` داخل `apps/api/src/modules/auth/**` إلى relative imports محافظة.
   - النتيجة: سكربت `manual-m4-verify.ts` يعمل بدون `Cannot find module '@/...'`.
2. **Fix build/start output**:
   - تحديث `apps/api/package.json`:
     - `prebuild` أصبح يحذف `dist` و `tsconfig.build.tsbuildinfo`.
   - التحقق أكد وجود `apps/api/dist/main.js` بعد `build`.
3. **Shared auth schemas source**:
   - جعل `apps/api/src/modules/auth/auth.schemas.ts` re-export فقط من `@suknaa/types`.
   - تحديث `packages/types/src/schemas/auth.ts` ليتطابق مع سلوك M4:
     - `fullName` optional في signup.
     - email normalization إلى lowercase.
     - بدون phone في signup.
   - جعل `@suknaa/types` قابلة للاستهلاك runtime عبر build outputs (`dist`) مع `tsconfig.json` وسكربت build.
4. **Workspace wiring**:
   - إضافة dependency `@suknaa/types` إلى `apps/api`.
   - تعديل `apps/api` build script ليبني `@suknaa/types` قبل `nest build`.
5. **Fix API route prefix**:
   - تصحيح `AuthController` من `@Controller("v1")` إلى `@Controller()` لأن `main.ts` يضع `app.setGlobalPrefix("v1")`.
   - النتيجة: `POST /v1/auth/signup` أصبح يصل إلى controller، و `POST /v1/v1/auth/signup` أصبح `404`.

**التحقق**:
- `npx pnpm@9.15.4 --filter api prisma:generate` → نجاح.
- `npx pnpm@9.15.4 db:status` → clean.
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `Test-Path apps/api/dist/main.js` → `True`.
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- `npx pnpm@9.15.4 --filter api exec ts-node scripts/manual-m4-verify.ts` (مع env keys) → نجاح.
- `npx pnpm@9.15.4 --filter api start` (مع env keys) → boot success confirmed ثم إيقاف العملية.
- Route smoke test: `/v1/health` => 200, `/v1/auth/signup` => 400 validation, `/v1/v1/auth/signup` => 404.

**قيود مُلتزم بها**:
- لا تعديل على `apps/web`.
- لا OTP/2FA/KYC/BFF.
- لا migration.
- لا بدء M5.

---

**التاريخ**: 2026-05-06 (جلسة 21 — Phase 2 Milestone 4: Auth Core)
**الـ AI المستخدم**: Codex

**السياق**: تنفيذ M4 فقط حسب خطة Mohammad: داخل `apps/api` و`packages/types` فقط، RS256 إجباري بدون fallback، email verification عبر `otp_codes` + mock outbox، وتسجيل audit للأحداث الحساسة.

**ما تم تنفيذه**:
1. **Shared schemas**:
   - إنشاء `packages/types/src/schemas/auth.ts` + `packages/types/src/index.ts`.
   - تحديث `packages/types/package.json` لإضافة `zod`.
2. **Security services**:
   - `PasswordService` (argon2id بالإعدادات المعتمدة).
   - `PasswordBreachChecker` interface + `MockPasswordBreachCheckerService`.
   - `TokensService` (RS256 access token claims minimal + opaque refresh token generation).
   - تحديث `env.schema.ts` لفرض وجود مفاتيح RSA.
   - تحديث `.env.example` مع تعليمات local key generation.
3. **Auth module/endpoints**:
   - إنشاء `modules/auth` (controller/service/module/guard/strategy/current-user decorator/schemas/types).
   - endpoints: `POST /v1/auth/signup`, `POST /v1/auth/verify-email`, `POST /v1/auth/login`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`, `POST /v1/auth/logout-all`, `GET /v1/auth/sessions`, `DELETE /v1/auth/sessions/:id`, `GET /v1/me`.
   - إضافة `AuthModule` إلى `AppModule`.
4. **Email verification + sessions + audit**:
   - email token طويل opaque، لا يُخزّن raw (hashed في `otp_codes.code_hash`).
   - mock message يُكتب إلى `.dev-outbox`.
   - `auth_sessions.refresh_token_hash` يُخزّن hash فقط.
   - refresh rotation تلغي session القديمة.
   - session listing لا تُظهر refresh hash.
   - audit actions تُكتب عبر `AuditService.write()`.
5. **Manual verification script**:
   - `apps/api/scripts/manual-m4-verify.ts` ينفّذ lifecycle كامل auth ويتحقق من hash/rotation/audit.

**التحقق**:
- `npx pnpm@9.15.4 --filter api prisma:generate` → نجاح.
- `npx pnpm@9.15.4 db:status` → clean.
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- `npx pnpm@9.15.4 --filter api exec ts-node -r tsconfig-paths/register scripts/manual-m4-verify.ts` → نجاح:
  - outbox verification message موجود.
  - `refresh_token_hash` ليس raw token.
  - old session revoked بعد refresh.
  - auth audit events موجودة (count=5 في فحص السكربت).

**القيود المُلتزم بها**:
- لم يتم تعديل `apps/web`.
- لا OTP/2FA/KYC endpoints.
- لا WhatsApp/HIBP حقيقي.
- لا migration جديدة.

---

**التاريخ**: 2026-05-06 (جلسة 20 — Phase 2 Tracker)
**الـ AI المستخدم**: Codex

**السياق**: محمد طلب ملفاً واضحاً يوضح مراحل Phase 2 حتى يعرف أين وصل المشروع قبل الانتقال إلى M4.

**ما تم**:
- إنشاء `docs/PHASE_2_TRACKER.md`.
- الملف يوضح حالة Phase 2: M1, M2, M2 cleanup, M3 مكتملة؛ M4 هو التالي.
- يضم جدول milestones من M1 إلى M10، أوامر التحقق القياسية، نطاق M4، وشروط إغلاق M4.

**النتيجة**: صار لدى محمد مرجع واحد سريع لمتابعة Phase 2 قبل كل جلسة Cursor/Codex.

---

**التاريخ**: 2026-05-06 (جلسة 19 — Phase 2 Milestone 3: Shared Backend Infrastructure)
**الـ AI المستخدم**: Codex

**السياق**: تنفيذ M3 فقط حسب القيود: بدون أي تعديل على `apps/web`، بدون Auth/KYC endpoints، بدون BFF routes، وبدون SMS/WhatsApp فعلي.

**ما تم تنفيذه**:
1. **Messaging abstraction** تحت `apps/api/src/shared/messaging/`:
   - `message-provider.interface.ts`: واجهة عامة قنواتها `email` و`phone` (بدون hard-code SMS naming).
   - `mock-message.provider.ts`: يكتب الرسائل إلى `apps/api/.dev-outbox/*.json`.
   - `whatsapp.provider.ts`: stub مع `NotImplementedException` (`WHATSAPP_PROVIDER_DISABLED`).
   - `messaging.module.ts` + `messaging.service.ts` + token provider؛ الاختيار عبر `MESSAGE_PROVIDER` (افتراضي `mock`).
2. **Audit module** تحت `apps/api/src/shared/audit/`:
   - `AuditModule`, `AuditService`, `AuditWriteInput`.
   - `AuditService.write()` يدعم الحقول المطلوبة كلها: `actorUserId`, `actorRole`, `actorIp`, `userAgent`, `requestId`, `action`, `entityType`, `entityId`, `before`, `after`, `metadata`.
   - الربط مطابق لأسماء Prisma بعد M2 cleanup (`beforeJson`/`afterJson`).
3. **Error helpers**:
   - إضافة `apps/api/src/shared/errors/api-error.helpers.ts` (typed, lightweight).
   - تحديث `GlobalExceptionFilter` لتمرير `details` عند وجودها مع نفس الشكل القياسي.
4. **Storage/Redis (minimal only)**:
   - `StorageService`: `ensureBucketExists()` + `buildKycObjectKey()`.
   - `RedisService`: `buildKey()`, `setJson()`, `getJson()` مع prefix من env.
5. **Wiring + Docs**:
   - `app.module.ts`: إضافة `MessagingModule` و`AuditModule`.
   - تحديث `.env.example` بالقيم الجديدة.
   - تحديث `apps/api/README.md` إلى Milestone 3 + أوامر تحقق يدوية.

**التحقق**:
- `npx pnpm@9.15.4 --filter api prisma:generate` → نجاح.
- `npx pnpm@9.15.4 --filter api build` → نجاح.
- `npx pnpm@9.15.4 --filter api lint` → نجاح.
- تحقق mock provider فعلياً:
  - تشغيل `MockMessageProvider.send(...)` عبر `ts-node` نجح.
  - تم إنشاء ملف: `apps/api/.dev-outbox/2026-05-06T09-41-16.778Z-bde38c27-aac1-4894-9b78-dd07eadca39d.json`.
- `npx pnpm@9.15.4 db:status` → فشل بيئي (`P1001`): PostgreSQL local غير متاح لأن Docker daemon غير شغال (`dockerDesktopLinuxEngine` pipe not found).
- تحقق `AuditService.write()` على DB مؤجَّل لنفس السبب البيئي (عدم توفر PostgreSQL حالياً)، وأمر التحقق موثّق في README.

**قيود مُلتزم بها**:
- لم يتم تعديل `apps/web`.
- لم يتم تنفيذ Auth/KYC endpoints أو BFF routes.
- لا يوجد logging للـ OTP codes/secrets في أي كود جديد؛ mock outbox فقط يحفظ body محلياً في ملفات dev.

**النتيجة**: M3 مكتمل على مستوى الكود والبناء/lint، مع blocker بيئي واحد محلي (Docker/Postgres) يمنع `db:status` والتحقق الفعلي لكتابة `audit_logs` حتى تشغيل Docker.

---

**التاريخ**: 2026-05-06 (جلسة 18 — Phase 2 Milestone 2 Cleanup)
**الـ AI المستخدم**: Codex

**السياق**: مراجعة شغل Cursor بعد انتقاله إلى Composer 2 بسبب limit. Codex راجع M2 كـ code review، اكتشف 3 مشاكل، ثم أصلحها مباشرة.

**الإصلاحات**:
1. `users.phone` صار nullable لأن guest signup الحالي لا يجمع رقم هاتف. فهرس الهاتف صار partial unique فقط عندما `phone IS NOT NULL AND deleted_at IS NULL`.
2. `audit_logs` تقوّت لتطابق SECURITY.md §9.3: أضيفت `actor_role`, `request_id`, `before`, `after`، وتحول `actor_ip` إلى `INET`.
3. `apps/api/README.md` حُدّث من حالة M1 القديمة إلى حالة M2 الحالية.
4. تعليقات super-admin bootstrap في `.env.example` و `env.schema.ts` صارت تشير إلى M4 بدلاً من M2.

**الترحيل الجديد**:
- `apps/api/prisma/migrations/20250506133000_m2_schema_cleanup/migration.sql`

**التحقق**:
- `npx pnpm@9.15.4 --filter api exec prisma validate` → نجاح
- `npx pnpm@9.15.4 db:migrate` → نجاح، طُبّق ترحيل cleanup
- `npx pnpm@9.15.4 db:status` → قاعدة البيانات up to date، ترحيلان مطبقان
- `npx pnpm@9.15.4 --filter api build` → نجاح
- `npx pnpm@9.15.4 --filter api lint` → نجاح
- `prisma.user.count()` → نجاح، `count 0`
- فحص PostgreSQL أكد: `users.phone` nullable، فهرس الهاتف partial، و`audit_logs` تحتوي أعمدة before/after/request_id/actor_role وتريجر append-only.

**ملاحظة باقية**:
- `npx pnpm@9.15.4 --filter api prisma:generate` ما زال يفشل محلياً بـ `EPERM` على `query_engine-windows.dll.node`. هذا قفل Windows/Prisma DLL، وليس خطأ schema: `prisma validate`, migrations, build, lint, و`user.count()` تعمل. جرّبه بعد إغلاق Cursor/إيقاف Next dev أو إعادة تشغيل الجهاز.

**النتيجة**: مشاكل review الثلاثة مغلقة. يمكن الانتقال إلى M3 بعد حل قفل `prisma:generate` محلياً أو قبول أنه عطل بيئي مؤقت.

---

**التاريخ**: 2026-05-06 (جلسة 17 — Phase 2 Milestone 2: مخطط قاعدة البيانات + أول migration)
**الـ AI المستخدم**: Cursor (Agent)

**السياق**: تنفيذ نطاق **Milestone 2 فقط**: مخطط Prisma الكامل لجدول المستخدمين والمصادقة الأساسي و KYC وسجل التدقيق، مع أول ملف ترحيل؛ **بدون** Auth services/controllers أو KYC أو BFF أو واجهة إدمن. بذور super-admin مؤجّلة لـ Milestone 4.

**ما تم**:
1. `apps/api/prisma/schema.prisma`: نماذج PascalCase + enums (`user_status`, `user_experience`, `host_category`, `host_subtype`, `withdrawal_schedule`, `kyc_doc_type`, `kyc_status`, `otp_purpose`, `otp_channel`)؛ عمود `login_intent` في `auth_sessions` يستخدم `user_experience` (لم يُضف enum منفصل).
2. `apps/api/prisma/migrations/20250506120000_phase2_core_auth_tables/migration.sql`: امتدادات `pgcrypto` و `postgis`؛ فهارس جزئية وفريدة للبريد/الهاتف؛ فهرس جلسات نشطة؛ فهارس OTP/KYC/Audit؛ تريجر منع UPDATE/DELETE على `audit_logs`؛ `REVOKE` تجريبي على `PUBLIC`.
3. `apps/api/package.json`: `"prisma:migrate": "prisma migrate deploy"`.

**التحقق**: يُفترض تشغيل `db:migrate`, `db:status`, `prisma:generate`, `build`, `lint`، و`prisma.user.count()` بعد إصلاح قفل PostgreSQL/Prisma محلياً إن وُجد.

---

**التاريخ**: 2026-05-05 (جلسة 16 — Phase 1 Closure / MapLibre Decision)
**الـ AI المستخدم**: Codex

**السياق**: محمد اعتمد MapLibre بدل Mapbox، وطلب التأكد أن Phase 1 انتهت فعلياً قبل الانتقال إلى Phase 2.

**القرارات والتحديثات**:
1. اعتماد MapLibre GL JS كخيار الخرائط الرسمي للمشروع، مع OSM-based tiles أو مزود tiles لاحقاً.
2. توحيد كل مراجع Mapbox القديمة إلى MapLibre في: `ai_memory.md`, `docs/BUILD_PLAN.md`, `docs/UI_UX_VISION.md`, `apps/web/components/home/MapExplorer.tsx`.
3. تحديث حالة المشروع إلى Phase 2 في `ai_memory.md` و `.cursor/rules/suknaa.mdc`.
4. توثيق أن البنود المؤجلة من Phase 1 ليست blockers: i18n/English، service worker، MapLibre الحقيقي، الصور النهائية، staging deploy.

**التحقق النهائي قبل Phase 2**:
- `npx pnpm@9.15.4 --filter web lint` → نجاح
- `npx pnpm@9.15.4 --filter web build` → نجاح (33 route)
- `npx pnpm@9.15.4 audit` → لا ثغرات معروفة

**النتيجة**: Phase 1 + 1.5 مغلقتان كـ UI skeleton ببيانات mock. المشروع جاهز لبدء Phase 2: Backend Foundation + Auth + KYC.

---

**التاريخ**: 2026-05-05 (جلسة 15 — Codex Audit Fixes / Phase 1 Polish)
**الـ AI المستخدم**: Cursor (Claude)

**السياق**: تنفيذ Quick Wins من تقرير مراجعة Codex قبل أي عرض للمستخدمين.

**المشاكل المُكتشفة**:
1. تسجيل `password` ضمن `console.info` في نماذج Auth (mock) — تسريب محتمل في DevTools.
2. توثيق الـ Stack في `docs/ARCHITECTURE.md` و `.cursor/rules/suknaa.mdc` ما زال Next 14 + Tailwind 3 رغم الترقية الفعلية.
3. `postcss@8.4.31` عبر `next` (transitive) — ثغرة معروفة؛ الحل override إلى `^8.5.10`.
4. زر القلب داخل `<Link>` في بطاقات نتائج البحث — HTML غير صالح + تعارض النقر.
5. فلتر البحث يتجاهل `guests`؛ `checkIn`/`checkOut` غير موثّقة كـ Phase 1 mock.
6. `RoomTypesList` ينص على «السعر يشمل رسوم الخدمة» — يخالف قاعدة «رسوم الخدمة منفصلة وظاهرة للزبون».

**الإصلاحات المطبقة**:
1. استبدال تسجيل الـ mock بحقول غير حساسة + `hasPassword` في: `LoginForm`, `SignupForm`, `HostLoginForm`, `HostApplyWizard`.
2. تحديث `ARCHITECTURE.md` §2.1 و `suknaa.mdc` §3 إلى Next.js 16 + Tailwind 4 + ملاحظة تاريخ الترقية.
3. `pnpm.overrides.postcss: ^8.5.10` في `package.json` الجذر + `pnpm install` (lockfile يثبت `postcss@8.5.13` لـ `next`).
4. `PropertyResultCard` + `HotelResultCard`: `article` بـ `relative`، زر القلب خارج الـ Link الأول مع `z-20` و `stopPropagation` + `'use client'`.
5. `search-utils.ts`: فلتر `guests` لـ `filterProperties`؛ تعليق JSDoc يوضح أن فلترة التوفر الحقيقية في Phase 5.
6. `RoomTypesList`: نص علوي محدّث + breakdown ليلة واحدة عبر `computeGuestBreakdown` (مطابق `BookingWidget`).

**التحقق**:
- `pnpm --filter web build` → نجاح (33 route)
- `pnpm audit` → لا ثغرات معروفة

**ما لم يُلمس** (مؤجَّل):
- صور `public/images/` (مهمة محمد)
- Vitest / Playwright / تغطية اختبارات آلية
- Security headers (CSP, HSTS, إلخ) — قبل Beta / Phase 9
- فلترة توفر حقيقية بـ `checkIn`/`checkOut` — Phase 5 (DB + API)
- قائمة مفضلة حقيقية — Phase 8

**الملفات المُعدَّلة**:
- `apps/web/components/auth/{LoginForm,SignupForm}.tsx`
- `apps/web/components/auth/host/{HostLoginForm,HostApplyWizard}.tsx`
- `docs/ARCHITECTURE.md`, `.cursor/rules/suknaa.mdc`
- `package.json`, `pnpm-lock.yaml`
- `apps/web/components/search/{PropertyResultCard,HotelResultCard}.tsx`
- `apps/web/lib/search-utils.ts`
- `apps/web/components/hotel-detail/RoomTypesList.tsx`

---

**التاريخ**: 2026-05-04 (جلسة 14 — مراجعة Phase 1 شاملة + إصلاح Navbar/SearchHeader overlap على الموبايل)
**الـ AI المستخدم**: Cursor (Claude Opus 4.7)

**السياق**: مراجعة استلام Phase 1 شاملة قبل الانتقال لـ Phase 2.

**ما تم التحقق منه**:
- `npx pnpm@9.15.4 --filter web lint` → 0 errors
- `npx pnpm@9.15.4 --filter web build` → 33 routes تُبنى بنجاح
- فحص يدوي للصفحات الـ 17 (`/`, `/search`, `/property/[id]`, `/hotel/[id]`, `/host/[username]`, `/about`, `/how-it-works`, `/help`, `/contact`, `/terms`, `/privacy`, `/cookies`, `/login`, `/signup`, `/host/login`, `/become-a-host`, `/become-a-host/apply`)

**المشاكل المُكتشفة والمُصلحة**:
1. **Navbar mobile overlap**: `<header>` كان يحمل `h-[72px]` ثابت لكن داخله شريط تابات الموبايل (`md:hidden`) يضيف ~48px → الشريط الموبايل كان يخرج خارج صندوق الـ header ويغطي بداية المحتوى.
   - **الإصلاح**: نقل `h-[72px]` من الـ `<header>` إلى الـ flex container الداخلي، وإضافة `md:h-[72px]` على الـ `<header>` فقط. على الموبايل يأخذ ارتفاعه الذاتي (~120px).
2. **Suspense fallback** في `app/(public)/layout.tsx`: كان `h-[72px]` ثابت → fallback أقصر من الـ navbar الفعلي على الموبايل.
   - **الإصلاح**: `h-[120px] md:h-[72px]`.
3. **SearchHeader sticky**: كان `top-[72px]` → يتداخل مع شريط التابات الموبايل في الـ navbar.
   - **الإصلاح**: `top-[120px] md:top-[72px]`.
4. **Hero pt على الموبايل**: كان `pt-safe` (~28px) فقط → الـ navbar الموبايل (~120px) يغطّي بداية الـ Hero (العنوان والشعار).
   - **الإصلاح**: `pt-32 md:pt-28` على الـ Hero section.

**الملفات المُعدَّلة (4 ملفات)**:
- `apps/web/components/layout/Navbar.tsx`
- `apps/web/app/(public)/layout.tsx`
- `apps/web/components/search/SearchHeader.tsx`
- `apps/web/components/home/Hero.tsx`

**ما لم يُلمس** (مؤجَّل عمداً حسب AGENTS.md):
- `next-intl` / English translations
- MapLibre الحقيقي (الـ MapExplorer placeholder يعمل بصرياً)
- Service Worker (الـ manifest وحده كافٍ لـ Phase 1)
- Backend (Phase 2)
- Deploy staging (لاحقاً)

**تحديث `docs/BUILD_PLAN.md`**: علّمت في Phase 1 البنود المنتهية فعلاً فقط (Layout، Homepage، Search، Property/Hotel/Host detail، Static pages، Login UIs، PWA manifest، Responsive). بقيت غير مُعلَّمة: i18n، service worker، English text، deploy staging.

---

### جلسة 13 (أرشيف) — Hero responsive: Drawer موبايل + شريط مدمج تابلت

**السياق**: تحسين الـ Mobile/Tablet لـ Hero: أقل من `md` — زر CTA **ابحث عن سكنك** يفتح `Drawer` من `@base-ui/react/drawer` (bottom sheet + حقول كاملة + `pb-safe`). بين `md` و`lg` — شريط بحث compact في صف واحد (حقول أصغر، أيقونات 3.5، زر بحث 44px). من `lg` فما فوق — نفس شريط الـ Desktop السابق دون تغيير سلوكي. **`Hero.tsx`**: `min-h-dvh` على الموبايل، `pt-safe` (تم تغييره لـ `pt-32` في الجلسة 14)، عنوان أصغر مع `max-w-[20ch]`، وتدرج `lg:text-6xl` كالسابق. **`globals.css`**: `.pt-safe` / `.pb-safe` لـ env(safe-area-inset). **`HeroPresentation`**: مؤشرات شرائح `mt-6 md:mt-8` + `@container` للاستعداد لـ container queries.

---

### جلسة سابقة (مرجعية)

**التاريخ**: 2026-05-04 (جلسة 12 — Home Hero search + URL sync لصفحة البحث)

**السياق**: إصلاح شريط البحث في الـ Hero (كان UI فقط). أصبح تفاعلياً: اقتراحات من `data/destinations.ts`، تواريخ بـ `<input type="date">` (LTR + `font-numeric`)، عداد ضيوف، تحقق عبر `lib/hero-search-validation.ts`، والانتقال إلى `/search?location=&checkin=&checkout=&guests=`. في `lib/search-utils.ts` أصبح `city` يُستمد من `city` أو `location`، مع حقول `checkIn` / `checkOut` / `guests` في `ParsedSearchParams` لعرضها في `SearchHeader`. `SearchFilters` يزامن `initialCity` عند تغيّر الـ URL ويحذف `location` عند تطبيق/إعادة تعيين الفلاتر لتفادي التكرار. أضيف `daraa` إلى `CityId` و`CITY_LABELS` لمواءمة `destinations.ts`. `Hero.tsx` Server Component: `HeroPresentation` (client) يستقبل العنوان كأطفال من السيرفر + `footer={<HeroSearchBar />}` للحدّ من `'use client'` مع الحفاظ على slider واحد للمصدر الوحيد للـ slide index.

### جلسة 11 (أرشيف) — Phase 1.5 Static Pages + Public Host Profile
**السياق**: بعد إنجاز Phase 1 Core (الصفحات الـ 7 الحرجة) وإعادة هيكلة الـ Auth في الجلسة 10، طلب محمد إكمال Phase 1.5 — الصفحات الثابتة (About/How-it-Works/Help/Contact/Terms/Privacy/Cookies) + صفحة المضيف العامة `/host/[username]`. القرار: محتوى placeholder للصفحات القانونية مع disclaimer واضح بأنه "محتوى مبدئي سيُحدَّث قانونياً قبل الإطلاق".

### 11.1 — مصادر البيانات الجديدة
- **`data/help-faq.ts`**: 6 categories (booking/payment/cancellation/safety/account/communication) + 15 سؤال (3 لكل category تقريباً). Iconography enum-based (`iconName`) يُحلّ لـ `LucideIcon` في component الـ HelpCategories لتجنُّب جلب الأيقونات في data layer.
- **`data/hosts.ts`**: 5 hosts (3 individual/re_office + 2 hotel_company) — slugs مطابقة لـ `hostSlug` في `data/listings.ts` (`abu-omar`, `rana`, `office-cham`, `blue-coast-hospitality`, `golden-beach-group`). تشمل: `bio`, `languages`, `responseTimeMinutes`, `responseRatePercent`, `memberSince` (ISO month "YYYY-MM"), `rating`, `reviewsCount`, `verified`, `superHost`, `reviews[]` (3-4). Helper functions: `findHost(slug)`, `getAllHostSlugs()`, `formatResponseTime()`, `formatMemberSince()`.

### 11.2 — الصفحات القانونية + LegalPageShell
- **`components/legal/LegalPageShell.tsx`**: wrapper مشترك يستقبل `{ title, subtitle?, lastUpdatedISO, children }`. يعرض hero بسيط + disclaimer "محتوى مبدئي" بصراحة كاملة + container بـ `prose`-style. يصدّر أيضاً `LegalSection` لكل قسم (`{ index, title, children }`) مع رقم تسلسلي بالـ `font-numeric` بلون primary.
- **`/cookies`**: 4 أقسام + جدول HTML بـ Tailwind (Essential / Analytics / Marketing) — لا dependency جديدة.
- **`/privacy`**: 10 أقسام (مستوحاة من SECURITY.md §8: Encryption، PII Handling، Data Subject Rights). تذكر تشفير TLS 1.3 و LUKS و pgcrypto بشكل عام دون تفاصيل تنفيذية.
- **`/terms`**: 12 قسم تشمل القبول، التعريفات، مسؤوليات الزبائن، مسؤوليات المضيفين، الإلغاء (3 سياسات)، السلوكيات المحظورة، حدود المسؤولية، القانون الحاكم (سوريا، محاكم دمشق).

### 11.3 — صفحات المحتوى
- **`/about`**: 7 components تحت `components/about/`:
  - `AboutHero` — gradient primary→#A84A33→#8a3d2a + blur orbs + central title
  - `AboutVision` — Compass icon + 3 paragraphs مستوحاة من PROJECT.md §1-2
  - `AboutFeatures` — 6 features (Building2/Wallet/ShieldCheck/Eye/HeartHandshake/Sparkles) في grid 2-3 columns
  - `AboutNumbers` — bg-charcoal بلون gold للأرقام: +500/+50/+1,000/+200 + ملاحظة "أهداف السنة الأولى"
  - `AboutValues` — 3 قِيَم (الشفافية/الأمان/الدعم المحلي)
  - `AboutTeam` — placeholder بسيط مع Users2 icon
  - `AboutCTA` — gradient banner مع dual CTA (/signup + /become-a-host)
- **`/how-it-works`**: 3 components — `HowItWorksHero`, `HowItWorksTabs` (Client بـ URL state `?audience=guest|host`، افتراضي guest)، `HowItWorksCTA`. `HowItWorksTabs` مُلَفّ بـ `<Suspense>` على الصفحة لأنه يستخدم `useSearchParams`. أيقونات الخطوات: للضيوف (Search/Calendar/CreditCard/Smile)، للمضيفين (UserPlus/ShieldCheck/Home/Inbox).
- **`/help`**: 4 components — `HelpHero` (شريط بحث `disabled` بـ placeholder "ابحث عن سؤال... (قريباً)")، `HelpCategories` (6 cards مع hash anchors `#category-X`)، `HelpFAQAccordion` (يجمع الأسئلة بحسب category مع `<details>`)، `HelpEmptyCTA` (CTA لـ /contact).
- **`/contact`**: 3 components — `ContactHero`, `ContactForm` (Client + Zod + RHF + reset+success state)، `ContactSidebar` (4 cards: WhatsApp `wa.me/963000000000`، email `mailto:support@suknaa.com`، أوقات الدوام، رابط /help). `lib/contact-schema.ts` جديد (name/email/subject/message).

### 11.4 — Host Profile (`/host/[username]`)
- 5 components تحت `components/host-profile/`:
  - `HostProfileHeader`: avatar متكيِّف (initial في دائرة primary للأفراد، Building2 في مربع gold للشركات) + verified badge + Super Host badge (إذا rating ≥ 4.8) + member since + rating + listings count
  - `HostProfileBio`: نبذة + 3 BioStats (اللغات/وقت الاستجابة/معدَّل الاستجابة) — في layout 2-columns على lg
  - `HostListingsTabs`: Client + URL state `?tab=all|real_estate|hospitality` + يستخدم `PropertyResultCard` و `HotelResultCard`. **Edge case معالج**: tab disabled إذا الـ array فارغ (شركة فنادق لن يكون لها properties). رسالة فارغة إذا كل الـ tabs فارغة.
  - `HostReviewsPlaceholder`: 3-4 reviews mock من `host.reviews[]` + متوسط rating في badge cream.
- `params: Promise<{ username: string }>` (Next.js 16 async). `generateStaticParams()` يولّد 5 host slugs. `findHost()` يرجع undefined → `notFound()`.

### 11.5 — Footer + Host Links
- **Footer**: استبدال كامل لكل `href="#"` بروابط حقيقية. الأعمدة الجديدة:
  - **سُكنى** (نص + 4 social icons placeholder)
  - **اكتشف**: / + /search + /how-it-works
  - **الدعم**: /help + /contact + /about
  - **للمضيفين**: /become-a-host + /become-a-host/apply + /host/login
  - **القانوني**: /terms + /privacy + /cookies
  - Bottom Bar: AR/EN buttons + الكوكيز/الخصوصية/الشروط
  - `FooterColumn` يقبل الآن `links: { label: string; href: string }[]` بدلاً من `string[]`.
  - عمود "التطبيق" (Google Play/App Store) أُزيل لأنه placeholder غير فعَّال — سيُعاد لاحقاً عند توفر الروابط الفعلية.
- **Host Links في 4 أماكن**:
  - `PropertyResultCard` — سطر "بواسطة [host]" بين title و stats
  - `HotelResultCard` — سطر مماثل بعد الـ stars
  - `PropertyHostSnippet` — اسم المضيف صار Link + الزر "عرض كل عقارات هذا المضيف" صار Link حقيقي مع ArrowLeft icon
  - `HotelCompanySnippet` — نفس التحديث + "عرض كل فنادق هذه الشركة"
- **Refactor `FeaturedListings`**: حُذف الـ mock data المضمَّن (`PropertyCardData`/`HotelCardData`) واستُبدل بقراءة من `PROPERTIES` و `HOTELS` في `data/listings.ts` + استخدام `PropertyResultCard` و `HotelResultCard` (مصدر بيانات موحَّد). الـ home cards `PropertyCard.tsx` و `HotelCard.tsx` احتُفظ بهما في `components/home/cards/` كاحتياط (لم تُحذف، يمكن أن تُحذف في تنظيف لاحق).

### 11.6 — إصلاح صغير في HostApplyWizard
- ESLint اكتشف خطأ كان مخفياً سابقاً: `<a href="/host/login">` في `HostApplyWizard.tsx` (سطر 193). الـ rule `@next/next/no-html-link-for-pages` اكتشفها لأن `/host/login` صار يُعتبر صفحة موجودة الآن (ربما بعد إضافة `/host/[username]`). الإصلاح: استبدال `<a>` بـ `<Link>` من `next/link` + إضافة الـ import.

### 11.7 — التحقق
- `pnpm --filter web build`: 0 errors، 0 warnings، **33 صفحة** (كانت 21).
  - Static (○): 18 (الرئيسية + about + become-a-host + become-a-host/apply + contact + cookies + help + host/login + how-it-works + manifest + privacy + terms + 404)
  - SSG (●): 15 (5 hosts + 6 properties + 4 hotels)
  - Dynamic (ƒ): 3 (login، search، signup — لأنها تستخدم `searchParams`)
- `pnpm --filter web lint`: نظيف بعد إصلاح HostApplyWizard.
- `ReadLints` على كل الملفات الجديدة والمعدّلة: 0 errors.

### 11.8 — قرارات تقنية
- **مصدر بيانات الـ host**: قرار محمد كان "refactor FeaturedListings" بدلاً من تمديد الـ types المبسطة — لذا `data/listings.ts` صار المصدر الموحَّد لكل cards الموقع العام.
- **avatar للـ host**: "mixed" — initials في دائرة primary للأفراد، Building2 icon في مربع gold للشركات (متَّسق مع `PropertyHostSnippet` و `HotelCompanySnippet` الموجودين).
- **Counters في `/about`**: أرقام ثابتة بدون animation معقَّد. ملاحظة "أهداف السنة الأولى" تحتها لتجنب الادعاء الكاذب بأنها أرقام حالية.
- **`/help` search bar**: `disabled` بـ placeholder صريح "(قريباً)" — مفضَّل على إضافة منطق بحث وهمي.
- **WhatsApp link**: `wa.me/963000000000` placeholder + ملاحظة "(الرقم الرسمي قريباً)" تحت الزر.
- **عمود "التطبيق" في Footer**: حُذف (كان placeholder Google Play/App Store غير فعَّال). سيُعاد عند توفر روابط حقيقية.

---

**جلسة 10 (سابقة) — Auth Restructure: Guest vs Host**

**السياق**: محمد راجع التصميم الحالي للـ Auth وقال: "التسجيل كمضيف لازم يكون منفصل تماماً عن التسجيل كضيف. المضيف شي خاص لهم، صفحاتهم وهدفهم مختلفة." اعتُمدت فلسفة **"Guest is Default (Fast), Host is Premium (Curated Onboarding)"**.

### 10.1 — قرار معماري: Next.js Route Groups
- **المشكلة**: مسارات المضيف تحتاج header مختلف (بدون tabs `[الكل][عقارات][فنادق]` ولا الـ navbar الكاملة) لكن الـ root layout يفرض الـ Navbar+Footer على كل صفحة.
- **القرار**: إعادة هيكلة `app/` بـ Route Groups:
  - `app/layout.tsx` يُبسَّط ليحوي html/body/fonts فقط.
  - `app/(public)/layout.tsx` يضيف Navbar+Footer لكل الصفحات العامة.
  - `app/(host-auth)/layout.tsx` يضيف `HostAuthShell` (header مخصّص للمضيفين: logo ملوّن + "لوحة المضيفين" + رابط "الصفحة العامة").
- **النقل**: 7 صفحات حالية (`page.tsx`, `login/`, `signup/`, `become-a-host/`, `search/`, `property/`, `hotel/`) نُقلت إلى `(public)/`. الصفحات الجذرية الأخرى (layout, globals.css, manifest.ts, not-found.tsx, error.tsx, favicon.ico) بقيت في `app/`.
- **ملاحظة Windows مهمّة**: `Move-Item` أعطى "Access denied" على `property/` و `hotel/` لأن dev server شغّال يقفل الملفات. الحل: `Get-Process -Name node | Stop-Process -Force` قبل النقل، ثم حذف `.next/` بعد النقل لتجنُّب stale type cache (`validator.ts` يشير لمسار قديم).

### 10.2 — المسارات الأربعة النهائية
| المسار | المجموعة | الوصف |
|---|---|---|
| `/login` | `(public)` | Guest only — بسيط، دافئ، لا tabs |
| `/host/login` | `(host-auth)` | Host only — gold accent، header بزنس |
| `/signup` | `(public)` | Guest only — 30 ثانية: email + password + اسم اختياري |
| `/become-a-host/apply` | `(host-auth)` | Host wizard من 5 خطوات + URL state (`?step=N`) |

**Backward-compat**: `/login?intent=host` → `redirect('/host/login')`، `/signup?intent=host` → `redirect('/become-a-host/apply')` (الـ bookmarks القديمة لا تنكسر).

### 10.3 — Schemas (`apps/web/lib/auth-schemas.ts`) — إعادة كتابة كاملة
- حُذف حقل `intent` من الـ schemas — لكل صفحة schema منفصل (لا حاجة للـ flag).
- 4 schemas: `guestLoginSchema`, `hostLoginSchema`, `guestSignupSchema`, `hostApplySchema`.
- `hostApplySchema` فيه كل الـ 9 حقول مسطّحة + `superRefine` يفرض قاعدة `WRONG_HOST_CATEGORY` (real_estate ↔ individual/re_office، hospitality ↔ hotel_company).
- `HOST_APPLY_STEP_FIELDS` يصف لكل خطوة الحقول المطلوب التحقق منها — يستخدمه الـ wizard بـ `form.trigger([...stepFields])` لـ per-step validation.
- `categorySubtypeMismatch()` و `parseHostApplyStep()` و `isHostApplyStep()` كـ pure helpers مُصدَّرة.

### 10.4 — Wizard Pattern (`HostApplyWizard.tsx`)
- **single useForm** مع `FormProvider` يُشارَك بين الـ 5 خطوات عبر `useFormContext()` — لا prop drilling.
- **URL-driven state**: الخطوة الحالية في `?step=N` فقط؛ form values في React state (refresh يعيد البداية، مقبول لـ Phase 1 mock).
- `validateStep(N)` يستخدم `form.trigger([...HOST_APPLY_STEP_FIELDS[N]])` ولا يتقدّم إلا عند النجاح.
- زر "تخطي" يعمل **فقط** على Step 4 (الأسئلة النوعية الاختيارية).
- بعد submit: `Step5Review` يبدّل لـ `SuccessPanel` يعرض الخطوات التالية (تأكيد البريد، KYC، إضافة عقار) + CTAs لـ `/host/login` و `/`.

### 10.5 — التوزيع البصري (Design System)
- **Guest** (primary `#C85A3D`): `LoginForm`، `SignupForm`، الـ wizard كله، CTAs الصفحات العامة.
- **Host** (gold `#D4A24C`): `HostLoginForm` (زر دخول gold + badge "منطقة المضيفين")، الـ checkmarks الإيجابية في `WizardProgressBar` (مكتمل = gold، حالي = primary، قادم = muted).
- لا أسود نقي، logical CSS (`ms-`, `me-`, `pe-`)، Latin digits دائماً (`الخطوة 1 من 5` بـ `font-numeric`).

### 10.6 — Navbar Dropdown (4 عناصر بدلاً من 3)
- **دخول** → `/login`
- **دخول كمؤجِّر** → `/host/login`
- (فاصل بصري `<div className="my-1 h-px bg-[#F1ECE2]"/>`)
- **إنشاء حساب** → `/signup`
- **كن مضيفاً** → `/become-a-host` (gold-text، آخر عنصر — يميِّزه عن الـ guest options)

### 10.7 — تحديثات على الـ CTAs الموجودة
3 ملفات في `components/become-host/` كانت تشير لـ `/signup?intent=host`، حُدِّثت كلها لـ `/become-a-host/apply`:
- `HostHero.tsx` (الزر الرئيسي في الـ hero)
- `HostFinalCTA.tsx` (البانر الأخير قبل الفوتر)
- `EarningsCalculator.tsx` (CTA "ابدأ بهذا السعر" بعد حساب الأرباح)

### 10.8 — البنية النهائية للملفات
**جديدة (15 ملف)**:
```
apps/web/
├── app/(public)/layout.tsx                 (Navbar+Footer)
├── app/(host-auth)/layout.tsx              (HostAuthShell)
├── app/(host-auth)/host/login/page.tsx
├── app/(host-auth)/become-a-host/apply/page.tsx
├── components/auth/form-primitives.tsx
├── components/auth/host/HostAuthShell.tsx
├── components/auth/host/HostLoginForm.tsx
├── components/auth/host/HostApplyWizard.tsx
├── components/auth/host/WizardProgressBar.tsx
├── components/auth/host/wizard-steps/Step1Category.tsx
├── components/auth/host/wizard-steps/Step2Subtype.tsx
├── components/auth/host/wizard-steps/Step3BasicInfo.tsx
├── components/auth/host/wizard-steps/Step4QuickContext.tsx
├── components/auth/host/wizard-steps/Step5Review.tsx
├── data/syrian-governorates.ts             (14 محافظة)
└── data/host-onboarding-options.ts         (enums + labels + subtypesForCategory helper)
```

**معدّلة (7 ملفات)**:
- `app/layout.tsx` — استخراج Navbar/Footer (انتقلوا لـ `(public)/layout.tsx`)
- `lib/auth-schemas.ts` — إعادة كتابة شاملة
- `components/auth/LoginForm.tsx` — guest-only، شال tabs
- `components/auth/SignupForm.tsx` — guest-only، شال host fields
- `app/(public)/login/page.tsx` — redirect لـ `?intent=host`
- `app/(public)/signup/page.tsx` — redirect لـ `?intent=host`
- `components/layout/Navbar.tsx` — dropdown 4 عناصر
- `components/become-host/{HostHero,HostFinalCTA,EarningsCalculator}.tsx` — تحديث CTAs

**منقولة (7 مجلدات)**: `app/{page.tsx, login, signup, become-a-host, search, property, hotel}` → `app/(public)/...`

### 10.9 — التحقق
- `pnpm --filter web build` نظيف: 0 errors، 0 warnings، **21 صفحة** (كانت 19) — جديد: `/host/login` و `/become-a-host/apply`.
- `pnpm --filter web lint` نظيف.
- اختبار يدوي عبر `Invoke-WebRequest`: 12 رابط (الـ 4 الرئيسية + 5 خطوات الـ wizard + 2 redirect + الرئيسية) كلها 200 (أو 307 للـ redirects ثم 200).
- Dev server logs نظيفة — لا runtime errors.



### إصلاح سريع — `/search` 500 بسبب `next/image` (2026-05-04)
- **المشكلة**: صفحة `/search` كانت ترجع خطأ 500 عند الفتح. في الـ console: `Invalid src prop (https://images.unsplash.com/...) on next/image` لأن الـ hostname غير مسموح في إعداد الصور.
- **الملف المعدّل**: `apps/web/next.config.ts`
- **الحل**: إضافة `images.remotePatterns` (النمط الحديث، بدون `domains`) لـ `https` فقط على `images.unsplash.com` و `plus.unsplash.com` مع `pathname: '/**'`. تعليق TODO في أعلى الملف يذكّر بإزالة أنماط Unsplash عند الاعتماد على `/public/images/` لاحقاً (أو الإبقاء إذا المؤجرون يستخدمون روابط خارجية).

**السياق**: محمد طلب البدء بتنفيذ Phase 1 وفق `docs/BUILD_PLAN.md` و `docs/UI_UX_VISION.md`. اتُّخذ قراران رئيسيان:
- **النطاق**: 7 صفحات حرجة الأولى (الخيار B) — Homepage polish + Search + Property + Hotel + Become a Host + Login + Signup. الصفحات الثابتة تُؤجَّل لـ Phase 1.5.
- **اللغة**: AR فقط — `next-intl` يُضاف لاحقاً عند بدء النسخة الإنجليزية.

### 9.1 — إكمال الـ Homepage
- إضافة `WhySuknaaStrip` (4 ميزات بأيقونات Lucide) و `SeasonalPicks` (يُخفى إذا الـ data فارغة — قاعدة "لا nudges وهمية").
- نقل tab state من local state إلى URL (`?tab=all|real_estate|hospitality`):
  - `lib/tab.ts` يحوي `parseTab`, `TAB_VALUES`, `TAB_LABELS`, `DEFAULT_TAB` (مرجع موحَّد).
  - `Navbar`, `FeaturedListings`, `SearchTabs` كلهم يقرؤون/يكتبون من URL.
  - الـ Navbar مُلَفّ بـ `<Suspense>` في الـ layout (Next.js 16 يتطلب ذلك مع `useSearchParams`).
- `FeaturedListings` يفلتر حسب الـ tab: `all` يعرض الكل، `real_estate` يخفي الفنادق، `hospitality` يخفي بيوت العطلات. ملاحظة Phase 3 M1: قيمة `real_estate` legacy وقد تُعاد تسميتها.

### 9.2 — صفحة `/become-a-host`
- 8 أقسام كاملة وفق UI_UX_VISION §4: HostHero (90vh + gradient + CTAs) → LiveNumbersStrip (يُخفى إذا فاضي) → HostBenefits (3 columns) → HowItWorks (4 steps + خط نقطي بين الكروت) → **EarningsCalculator** (تفاعلي، يحسب: سعر/ليلة مقترح × occupancy × (1 − commission)) → HostTestimonials (carousel) → HostFAQ (`<details>` بدلاً من مكتبة accordion — أبسط وأخف) → HostFinalCTA (gradient banner).
- Mock data في `data/host-stats.ts` (فاضي الآن)، `data/host-testimonials.ts`، `data/host-faq.ts`، `data/earnings-rates.ts` (مدن + أنواع عقارات + commission bps).

### 9.3 — صفحة `/search` (Server Component)
- `lib/search-utils.ts`: pure functions `parseSearchParams`, `filterProperties`, `filterHotels`, `sortProperties`, `sortHotels`, `runSearch`. **مفصول كلياً** بين الـ RE والـ Hospitality — لا abstraction موحَّدة.
- مكونات: `SearchHeader` (sticky search bar + tabs) + `SearchFilters` (Client، tab-aware: يخفي filters غير المناسبة) + `SearchSortBar` + `SearchEmptyState` + `PropertyResultCard` + `HotelResultCard` + `SearchMap` (placeholder بـ pins ملوّنة) + `MapToggleButton` (sticky في الأسفل).
- جميع الفلاتر تُخزَّن في URL params (city, min_price, max_price, bedrooms, stars, breakfast, property_type[], hotel_type[], amenity[], sort).

### 9.4 — صفحة `/property/[id]` (Airbnb-style)
- Next.js 16: `params: Promise<{ id: string }>`؛ نستخدم `await params` ثم `findProperty(id)` ونعمل `notFound()` لو غير موجود. `generateStaticParams` يولّد كل الـ IDs الـ mock.
- مكونات تحت `components/property-detail/`:
  - `PropertyGallery` (Client — صورة كبيرة + 4 جانبية + lightbox modal بـ thumbnail strip).
  - `PropertyHeader`, `PropertyStatsStrip`, `PropertyDescription` (Client مع "عرض المزيد").
  - **`PropertySpaces` المحوري**: per-room cards من `data/property-spaces.ts` — كل غرفة بصور + bedConfig + amenities. هذا التمييز الجوهري عن الفنادق.
  - `PropertyAmenities`, `PropertyMapAndNearby` (placeholder + قائمة معالم), `PropertyHouseRules`, `PropertyReviewsPlaceholder`, `PropertyHostSnippet`.
  - **`BookingWidget`** (Client، sticky جانبي): تواريخ + ضيوف → يحسب `subtotal + service_fee = total` فقط. **لا كلمة commission إطلاقاً.** `lib/pricing-display.ts` يحوي `computeGuestBreakdown` و `diffNights` كـ pure functions.

### 9.5 — صفحة `/hotel/[id]` (Booking-style)
- نفس نمط async params + generateStaticParams.
- مكونات تحت `components/hotel-detail/` (مفصولة كلياً عن property-detail):
  - `HotelGallery` (نسبة 16:9 — مختلفة عن العقار 4:3).
  - `HotelHeader` (نجوم + score من 10 + رقم في badge ذهبي).
  - `HotelDescription`, `HotelAmenities` (Lucide icons).
  - **`RoomTypesList` المحوري**: لكل room type كارت بصور + bedConfig + maxOccupancy + إفطار + scarcity ("متبقّي N فقط" إذا ≤2، "نفدت" إذا 0، "N من M متاحة" غير ذلك). الـ scarcity مبني على `availableUnits` فعلي من `data/room-types.ts` — **لا nudges وهمية**.
  - `HotelMapAndNearby`, `HotelReviewsPlaceholder` (score breakdown بدلاً من ⭐ rating), `HotelCompanySnippet` (مع badge "شركة موثَّقة").
  - **`HotelDatePickerSticky`** (Client) sticky في الأعلى عند scroll بدلاً من widget جانبي — هذا الفرق التصميمي عن العقار.

### 9.6 — صفحات `/login` و `/signup`
- ثُبِّتت `react-hook-form@^7.75.0`, `@hookform/resolvers@^5.2.2`, `zod@^4.4.2`.
- `lib/auth-schemas.ts`: schemas مشتركة (`loginSchema`, `signupSchema`) + types مُصدَّرة. سيُنقل لـ `packages/types` في Phase 2 ليُشاركه الباك‌اند.
- **`signupSchema`** فيه `superRefine` للـ cross-field validation: لو `intent === "host"`، يجب اختيار `hostCategory` ثم `hostSubtype` متوافق (re_office لا يُسمح في hospitality، hotel_company لا يُسمح في real_estate). هذا يطابق قاعدة `WRONG_HOST_CATEGORY` الحرجة في الباك‌اند.
- `LoginForm`: tab toggle بصري بين guest/host، intent يقرأ من `?intent=`، password show/hide، loading state، success state.
- `SignupForm`: wizard خفيف بدون step navigation — كل الحقول في صفحة واحدة، الحقول الإضافية تظهر شرطياً عند `intent === "host"`. استخدام `useWatch` بدلاً من `watch()` لتجنب React Compiler warning.
- الـ submit في الحالتين mock — يطبع للـ console ويعرض toast نجاح.

### 9.7 — Polish & Glue
- `app/not-found.tsx` (404 سُكنى-style مع badge "404" + CTAs للرئيسية والبحث).
- `app/error.tsx` (Client Component إلزامي — يستقبل `error` و `reset`، يطبع للـ console، CTA "حاول مجدداً").
- `app/manifest.ts` يولّد `/manifest.webmanifest` (theme #C85A3D، lang ar، dir rtl، start_url /).
- `Suspense` على `FeaturedListings` في app/page.tsx (مطلوب للـ static prerendering في Next 16 لأن `useSearchParams` يتطلبه).
- البناء: `pnpm run build` نجح بالكامل — 19 صفحة (homepage + become-a-host + 4 hotels SSG + 6 properties SSG + login + signup + search + 404 + manifest).
- الـ Lint: 0 أخطاء، 0 تحذيرات.

### 9.8 — قرارات تقنية مهمة
- **Next.js 16 async params/searchParams**: كل dynamic page و كل page تستخدم `searchParams` تكتب `params: Promise<...>` و `await params`. Client components تستمر باستخدام `useSearchParams` hook.
- **`useSearchParams` يحتاج Suspense**: أي client component يستخدمه في صفحة prerendered static يجب لفّه. حُلّت في layout (للـ Navbar) وفي page (للـ FeaturedListings).
- **`useWatch` بدلاً من `watch()`**: في React Compiler v19، استدعاء `watch("field")` داخل JSX render يُنتج تحذير "incompatible library". الحل: `useWatch({ control, name })` خارج الـ map.

**السياق**: محمد بدّل صورة `hero-1.jpg` فعلياً (وضع صورة الجامع الأموي) واستبدل اللوجو بنسخة بيضاء، لكن:
- صورة الـ Hero ما تظهرت رغم استبدال الملف.
- اللوجو الأبيض اختفى بصرياً فوق الـ navbar الـ glass الأبيض = "abyad ala abyad" (white-on-white).

**ما تم إنجازه في الجلسة (7)** (لم تتغير):

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
  - `components/home/MapExplorer.tsx` — حاوية خريطة مع `id="map-container"` جاهزة لـ MapLibre + pins (primary للعقارات، gold للفنادق) + toolbar (filters + layers).
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
- **خط Tajawal + Inter**: أصلاً عبر `next/font/google`؛ **محدّث 2026-05-09** إلى `next/font/local` + `apps/web/assets/fonts/` (Phase 2.5 M1).
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

**التالي (بعد جلسة 9)**:
- **مراجعة محمد للصفحات الـ 7 المنجَزة** على staging أو محلياً (`pnpm dev` في `apps/web`):
  - `/` (Homepage الكاملة)
  - `/become-a-host`
  - `/search` و `/search?tab=real_estate&city=damascus` للتحقق من الفلاتر
  - `/property/prop-1` (و prop-2 إلى prop-6)
  - `/hotel/hotel-1` (إلى hotel-4)
  - `/login?intent=guest` و `/login?intent=host`
  - `/signup`
- **Phase 1.5** (إذا وافق محمد): الصفحات الثابتة (About, How-it-Works, Help, Contact, Terms, Privacy, Cookies) + Host Profile العامة (`/host/[username]`) + Service Worker.
- **مهام محمد الخارجية**: VPS، DNS، Sham/MTN، beta hosts (لا تزال متبقية من Phase 0).

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
| `apps/api/tsconfig.tests.json` | **إنشاء** (2026-05-13) | Phase 2.5 M4: تجميع الاختبارات إلى `.tmp-tests/` |
| `apps/api/tests/auth-flows.test.ts` | **إنشاء** (2026-05-13) | M4: 11 سيناريو auth/KYC عبر `node:test` + Nest context |
| `apps/api/package.json` | **تحديث** (2026-05-13) | M3: `verify:m3`؛ M4: سكربت `test` (`tsc` + `node --test`) |
| `apps/api/eslint.config.mjs` | **تحديث** (2026-05-13) | M4: lint لـ `tests/**/*.ts` |
| `apps/api/.gitignore` | **تحديث** (2026-05-13) | تجاهل `.tmp-tests/` |
| `docs/PHASE_2_5_STABILIZATION_PLAN.md` | **تحديث** (2026-05-13) | أقسام M3 + M4 (Completed) |
| `apps/api/src/modules/auth/services/auth-rate-limit.service.ts` | **إنشاء** (2026-05-13) | Phase 2.5 M3: Redis `incrementWithTtl` + مفاتيح `auth:rl:*` + `rateLimitedError` |
| `apps/api/src/modules/auth/auth.service.ts` | **تحديث** (2026-05-13) | M3: استدعاءات الحدّ في `login` / `signup` / password reset / `completeMfaLogin` |
| `apps/api/src/modules/auth/auth.module.ts` | **تحديث** (2026-05-13) | M3: تسجيل `AuthRateLimitService` في `providers` |
| `apps/api/src/shared/config/env.schema.ts` | **تحديث** (2026-05-13) | M3: متغيرات `AUTH_RL_*` بقيم افتراضية |
| `apps/api/.env.example` | **تحديث** (2026-05-13) | M3: توثيق `AUTH_RL_*` |
| `apps/api/package.json` | **تحديث** (2026-05-13) | M3: سكربت `verify:m3` |
| `apps/api/scripts/manual-m3-verify.ts` | **إنشاء** (2026-05-13) | M3: تحقق يدوي — 6 محاولات `login` فاشلة → 429 `AUTH_LOGIN_RATE_LIMITED` |
| `apps/api/src/main.ts` | **تحديث** (2026-05-10) | Phase 2.5 M2: Helmet + `enableCors` من `CORS_ORIGINS` |
| `apps/api/src/shared/config/env.schema.ts` | **تحديث** (2026-05-10) | `CORS_ORIGINS` + افتراضي محلي |
| `apps/api/package.json` + `pnpm-lock.yaml` | **تحديث** (2026-05-10) | تبعية `helmet` |
| `apps/api/.env.example` | **تحديث** (2026-05-10) | قسم `CORS_ORIGINS` |
| `docs/PHASE_2_5_STABILIZATION_PLAN.md` | **تحديث** (2026-05-10) | M2: `CORS_ORIGINS` + ملاحظة CSP مؤقت |
| `apps/web/app/layout.tsx` | **تحديث** (2026-05-09) | Phase 2.5 M1: `next/font/local` بدل Google Fonts؛ نفس `--font-tajawal` / `--font-inter` |
| `apps/web/assets/fonts/**` (+ `README.md`) | **إنشاء** (2026-05-09) | خطوط Tajawal + Inter `woff2` مضافة للمستودع + ملاحظات ترخيص OFL |
| `.cursor/rules/suknaa.mdc` | **إنشاء** (نُقل المحتوى من `cursorrules`) | اعتماد Cursor Project Rules الحديث؛ يُحمَّل تلقائياً |
| `cursorrules` | **حذف** | استُبدل بـ `.cursor/rules/suknaa.mdc` |
| `docs/*.md` (10 ملفات) | **استبدال** (حذف v1، نقل v2 من المسار العميق) | اعتماد v2 كمرجع وحيد؛ لا التباس |
| `docs/mnt/` | **حذف** | مجلد مؤقت، لم يعد ضرورياً بعد نقل v2 |
| `ai_memory.md` | **تحديث** (2026-05-09 + سابقاً) | Phase 2.5 M1 + تسجيل الجلسات والقرارات |
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
| `data/help-faq.ts`, `data/hosts.ts` | **إنشاء** (جلسة 11) | Mock data للـ Help Center و Host Profiles |
| `components/legal/LegalPageShell.tsx` | **إنشاء** (جلسة 11) | Wrapper مشترك للصفحات القانونية |
| `app/(public)/{about,how-it-works,help,contact,terms,privacy,cookies}/page.tsx` | **إنشاء** (جلسة 11) | 7 صفحات Phase 1.5 |
| `app/(public)/host/[username]/page.tsx` | **إنشاء** (جلسة 11) | Host Profile العامة + generateStaticParams |
| `components/{about,how-it-works,help,contact,host-profile}/*.tsx` | **إنشاء** (جلسة 11) | 22 component جديد |
| `lib/contact-schema.ts` | **إنشاء** (جلسة 11) | Zod schema لنموذج التواصل |
| `components/layout/Footer.tsx` | **تحديث جذري** (جلسة 11) | روابط حقيقية + 5 أعمدة جديدة |
| `components/home/FeaturedListings.tsx` | **Refactor** (جلسة 11) | يقرأ من `data/listings.ts` ويستخدم Result Cards |
| `components/search/{Property,Hotel}ResultCard.tsx` | **تحديث** (جلسة 11) | إضافة Host link |
| `components/property-detail/PropertyHostSnippet.tsx`, `components/hotel-detail/HotelCompanySnippet.tsx` | **تحديث** (جلسة 11) | الزر صار Link حقيقي لـ `/host/[slug]` |
| `components/auth/host/HostApplyWizard.tsx` | **إصلاح** (جلسة 11) | استبدال `<a>` بـ `<Link>` لـ `/host/login` |
| `ai_memory.md` | تحديث متكرر | تسجيل تقدم كل جلسة |
| `apps/web/components/auth/{LoginForm,SignupForm,host/HostLoginForm,host/HostApplyWizard}.tsx` | **تحديث** (جلسة 15) | إزالة تسجيل كلمة المرور من console mock |
| `docs/ARCHITECTURE.md`, `.cursor/rules/suknaa.mdc` | **تحديث** (جلسة 15) | Next.js 16 + Tailwind 4 + ملاحظة ترقية |
| `package.json` (جذر), `pnpm-lock.yaml` | **تحديث** (جلسة 15) | `pnpm.overrides.postcss` لإغلاق ثغرة transitive |
| `scripts/verify-phase-2-5.mjs` | **إنشاء** (2026-05-13) | Phase 2.5 M5: بوابة تحقق جذرية متسلسلة |
| `package.json` (جذر) | **تحديث** (2026-05-13) | Phase 2.5 M5: `verify:phase2.5` |
| `apps/web/components/search/{PropertyResultCard,HotelResultCard}.tsx` | **تحديث** (جلسة 15) | زر القلب خارج Link + `'use client'` |
| `apps/web/lib/search-utils.ts` | **تحديث** (جلسة 15) | فلتر ضيوف + توثيق توفر Phase 5 |
| `.cursor/rules/suknaa.mdc` | **تحديث** (2026-05-13) | Phase 2.5 M6: Phase 3 next + بوابة `verify:phase2.5` |
| `docs/PHASE_2_5_STABILIZATION_PLAN.md` | **تحديث** (2026-05-13) | M6: Completed + Still deferred؛ إغلاق Phase 2.5 |
| `docs/PHASE_2_TRACKER.md` | **تحديث** (2026-05-13) | Phase 2.5 قسم + `verify:phase2.5` في Standard Verification |
| `docs/BUILD_PLAN.md` | **تحديث** (2026-05-13) | ملاحظة Phase 2.5 بين Phase 2 و 3 |
| `apps/web/components/hotel-detail/RoomTypesList.tsx` | **تحديث** (جلسة 15) | breakdown رسوم خدمة منفصلة |

---

## 6. القرارات الجديدة (التي طُرأت أثناء التطوير)

> أي قرار يُتخذ مع محمد أثناء العمل ولم يكن في `/docs/` يُسجَّل هنا.

### 2026-05-13 — Phase 2.5 M6: Documentation Closure

- **القرار**: إغلاق Phase 2.5 في الوثائق والذاكرة وقواعد Cursor؛ **Phase 3** أصبحت المرحلة التالية للتنفيذ؛ الإبقاء على **`npx pnpm@9.15.4 verify:phase2.5`** كفحص صحّة دوري قبل عمل كبير.
- **المرجع**: `docs/PHASE_2_5_STABILIZATION_PLAN.md` (Status: Completed، M6)؛ `docs/PHASE_2_TRACKER.md`؛ `docs/BUILD_PLAN.md`؛ `ai_memory.md`؛ `.cursor/rules/suknaa.mdc`.

### 2026-05-13 — Phase 2.5 M5: Verification Gate

- **القرار**: سكربت جذر `scripts/verify-phase-2-5.mjs` يشغّل أوامر `npx pnpm@9.15.4 --filter …` بالتسلسل مع `stdio: 'inherit'` وإيقاف عند أول فشل؛ بدون تبعية npm جديدة.
- **الأمر من الجذر**: `npx pnpm@9.15.4 verify:phase2.5` بعد `docker compose -f infrastructure/docker-compose.yml up -d` (Postgres/Redis/MinIO) و`apps/api/.env` صالح.
- **المرجع**: `docs/PHASE_2_5_STABILIZATION_PLAN.md` — M5 (Completed). أُغلقت Phase 2.5 لاحقاً بـ **M6** في نفس اليوم.

### 2026-05-13 — Phase 2.5 M4: Focused auth tests (`node:test`)

- **القرار**: عدم إضافة Jest/Vitest؛ استخدام **`node --test`** + تجميع TypeScript إلى `.tmp-tests/` ثم تشغيل ملف الاختبار المُجمَّع.
- **الأمر**: `npx pnpm@9.15.4 --filter api test` من جذر الريبو (يُشغّل أيضاً بناء `@suknaa/types`). سكربتات `verify:m*` تبقى للتحقق اليدوي العميق.
- **البيئة**: Postgres + Redis + MinIO (Docker Compose) و`MESSAGE_PROVIDER=mock` و`.dev-outbox` للتوكنات.
- **المرجع**: `docs/PHASE_2_5_STABILIZATION_PLAN.md` — M4 (Completed).

### 2026-05-13 — Phase 2.5 M3: Auth rate limiting (Redis)
- **القرار**: طبقة حدّ إضافية على مسارات المصادقة الحسّاسة عبر `RedisService.incrementWithTtl`؛ مفاتيح `auth:rl:<flow>:<hash>` بدون تخزين توكن إعادة التعيين خام في Redis (بصمة التوكن عبر SHA256 داخل مادّة المفتاح فقط).
- **الاستجابة**: HTTP 429 عبر `rateLimitedError()` مع رموز `AUTH_LOGIN_RATE_LIMITED`، `AUTH_SIGNUP_RATE_LIMITED`، `AUTH_PASSWORD_RESET_RATE_LIMITED`، `AUTH_MFA_RATE_LIMITED` ورسائل عربية/إنجليزية.
- **ما لم يُغيَّر**: حدّ OTP الهاتفي الحالي؛ حدّ طلب إعادة التعيين القائم على عدّ `otp_codes` في الساعة؛ سلوك التعداد الآمن لطلب إعادة التعيين (429 إضافي فقط عند الإفراط على Redis).
- **المرجع**: `docs/PHASE_2_5_STABILIZATION_PLAN.md` — M3 (Completed).

### 2026-05-10 — Phase 2.5 M2: Helmet + CORS (`CORS_ORIGINS`)
- **القرار**: رؤوس أمان عبر `helmet`؛ CORS صريح من `CORS_ORIGINS` (بدون `*` مع credentials). CSP معطّل مؤقتاً لأن Swagger UI يحتاج سياسة مخصصة — التشديد لاحقاً أو مع فصل Swagger.
- **ليس بديل auth**: CORS يقيّد سلوك المتصفح فقط.

### 2026-05-09 — Phase 2.5 M1: خطوط الويب محلية (بدون Google Fonts أثناء البناء)
- **السياق**: `next/font/google` كان يجلب الخطوط أثناء `pnpm --filter web build` ويفشل في بيئات مقيّدة الشبكة.
- **القرار**: اعتماد `next/font/local` + ملفات `woff2` مضمّنة في `apps/web/assets/fonts/` مع توثيق OFL في `README.md` داخل المجلد؛ الإبقاء على `--font-tajawal` و `--font-inter`.
- **المرجع**: `docs/PHASE_2_5_STABILIZATION_PLAN.md` — M1؛ **M3 مكتمل 2026-05-13** (انظر قسم M3 أعلاه).

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
| **العمولات/الرسوم** | كانت أرقام seed أولية، وليست نهائية كثوابت. القرار الأحدث 2026-05-08: كل العمولة/رسوم الخدمة/الضرائب/الخصومات عبر financial rules قابلة للتخصيص + snapshots. |
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

### 2026-05-03 — Monorepo Restructure (جلسة 8)
- نُقل كود Next.js من الجذر إلى apps/web/
- أُنشئ packages/ui و packages/types بـ @suknaa/ui و @suknaa/types
- أُنشئ infrastructure/ بـ .gitkeep
- pnpm-workspace.yaml في الجذر
- package.json الجذر: name=suknaa، packageManager=pnpm@9.15.4
- حُذف package-lock.json، أُنشئ pnpm-lock.yaml
- Build + Lint ناجحان
- corepack EPERM على هذا الجهاز — الحل: npx pnpm@9.15.4 أو pnpm مثبَّت globally
- آخر AI عمل: Cursor (Claude) + Antigravity — جلسة 8

### 2026-05-04 — Docker Compose Local Dev (جلسة 8)
- infrastructure/docker-compose.yml يشغّل 3 خدمات: postgis/postgis:16-3.4 + redis:7-alpine + minio/minio:latest
- Volumes محفوظة: infrastructure_postgres_data + infrastructure_redis_data + infrastructure_minio_data
- DB: suknaa_dev / user: suknaa / password: suknaa_dev_password
- MinIO: user: suknaa_minio / password: suknaa_minio_password
- WSL كان قديماً — حُدّث بـ wsl --update قبل تشغيل Docker
- للتشغيل: docker compose -f infrastructure/docker-compose.yml up -d
- للإيقاف: docker compose -f infrastructure/docker-compose.yml down
- آخر AI عمل: Claude (Antigravity) — جلسة 8

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

### 2026-05-04 — Phase 1.5 Static Pages + Public Host Profile (جلسة 11)
- **القرار 1 (مصدر بيانات الـ home cards)**: refactor `FeaturedListings` ليقرأ من `data/listings.ts` (PROPERTIES + HOTELS) ويستخدم `PropertyResultCard` + `HotelResultCard`. حُذف الـ mock data المضمَّن. النتيجة: مصدر بيانات موحَّد + ربط Host name متاح تلقائياً.
- **القرار 2 (avatar للـ host)**: "mixed" — initials في دائرة primary للأفراد (`individual` و `re_office`)، أيقونة Building2 في مربع gold للشركات (`hotel_company`). متَّسق مع snippets الموجودة في صفحات الـ detail.
- **القرار 3 (المحتوى القانوني)**: placeholder عربي صريح مع disclaimer واضح "محتوى مبدئي سيُحدَّث قانونياً قبل الإطلاق". `LegalPageShell` يطبِّق الـ disclaimer تلقائياً على /terms و /privacy و /cookies.
- **القرار 4 (Counters في /about)**: أرقام ثابتة بدون animation معقَّد (هدف السنة الأولى — مستوحاة من PROJECT.md §12). Animation متحرك مؤجَّل لاحقاً.
- **القرار 5 (شريط بحث /help)**: `disabled` UI placeholder بـ "(قريباً)". مفضَّل على بحث وهمي مزيف (لا nudges/UI كاذب — قاعدة سُكنى).
- **القرار 6 (تخطيط Footer)**: 5 أعمدة (سُكنى + اكتشف + الدعم + للمضيفين + القانوني). عمود "التطبيق" حُذف لأنه placeholder غير فعَّال؛ يُعاد عند توفر روابط Google Play/App Store الفعلية.
- **القرار 7 (Host Profile data)**: 5 hosts فقط — تطابق `hostSlug` في `data/listings.ts`. شركة `hotel_company` لا تملك vacation rental listings → tab "بيوت العطلات" disabled تلقائياً. Edge case معالج في `HostListingsTabs`.
- **التأثير**: 33 صفحة (كانت 21)، lint نظيف، build نظيف، Footer كامل بكل الروابط حقيقية، ربط Host في 4 أماكن (2 result cards + 2 detail snippets).

### 2026-05-04 — Phase 1 Core Pages (جلسة 9)
- **القرار 1 (النطاق)**: تنفيذ 7 صفحات حرجة فقط (الخيار B) قبل الصفحات الثابتة. السبب: الحصول على tour قابل للعرض على beta hosts/guests بأسرع وقت.
- **القرار 2 (اللغة)**: AR فقط في Phase 1. `next-intl` + ترجمات EN يُضافان عند بدء الإنجليزية (Phase 2 أو لاحقاً).
- **القرار 3 (الخريطة)**: placeholder سيستمر خلال Phase 1. MapLibre GL JS الفعلي يُدمج في Phase 3 عند توفر إحداثيات حقيقية لبيوت العطلات.
- **القرار 4 (الفصل المعماري)**: لا component مشترك بين Property و Hotel detail. مجلدات `property-detail/` و `hotel-detail/` مفصولة. الـ data layer مفصول (`PROPERTIES` array مستقل عن `HOTELS`). الـ search utils تفلتر/تفرز كلاًّ بدالة منفصلة. هذا يعكس قاعدة "أبداً لا تخلط properties و hotels في نفس الكود".
- **القرار 5 (الـ pricing display)**: `lib/pricing-display.ts` يحوي `computeGuestBreakdown` يُرجع `{ propertySubtotal, serviceFee, total }` فقط. **لا حقل ولا متغير ولا تعليق يذكر "commission"** في أي مكان يصل الزبون. الـ commission engine الحقيقي سيكون في `packages/pricing/` server-side.
- **القرار 6 (Auth schemas مشتركة)**: `lib/auth-schemas.ts` (Zod) يبقى في `apps/web/` مؤقتاً. عند بدء Phase 2 (Backend Auth) سيُنقل لـ `packages/types/` ويستخدمه الباك‌اند كـ DTOs (مع class-validator wrapper).
- **التأثير**: 19 صفحة مولّدة، lint نظيف، build ناجح، جاهز للعرض على staging.
- **السياق**: محمد صمّم mockup كامل للصفحة الرئيسية (logo + hero + map + destinations + listings + host banner + footer) وطلب مراجعة وتحسين.
- **التعليقات الرئيسية من محمد**:
  1. الفوتر يحتاج تحسين.
  2. **شريط "أعلن عن بيتك" في الصفحة الرئيسية مرفوض** — لا يريده "نافذة" عامة. يريد أن تكون صفحة المضيف الخاصة هي مكان عرض/إضافة بيوت العطلات.
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

### 2026-05-04 — مراجعة الخطة + Docker + Hero Floating Map (جلسة Codex)
- **طلب محمد**: مراجعة المجلد ومعرفة أين وصل المشروع بناءً على `docs/BUILD_PLAN.md`، مع عدم تعديل ملف الخطة إلا لتعليم البنود المنتهية فقط.
- **حالة المشروع حسب الخطة**:
  - المشروع حالياً في Phase 1: Public Website Skeleton ببيانات mock.
  - Phase 0 مؤكد محلياً من ناحية Docker Compose بعد تشغيل Docker: `suknaa_postgres` و`suknaa_redis` و`suknaa_minio` كلها `healthy`.
  - لا يوجد backend بعد: لا `apps/api`، لا NestJS، لا Prisma، لا Auth/KYC APIs.
  - i18n/English مؤجل بقرار محمد، لذلك يبقى غير مؤشّر في الخطة.
- **قاعدة مهمة أعاد محمد تأكيدها**: الالتزام بتعليمات `AGENTS.md`، خصوصاً قراءة docs المحلية لـ Next قبل تعديل كود Next. في هذه الجلسة تمت قراءة:
  - `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
  - `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- **مشكلة التصميم**: الخريطة كانت مطلوبة كطبقة عائمة فوق صورة الـ hero، لكن dropdowns/خيارات البحث كانت تظهر خلف الخريطة أو تم نقل الخريطة خلف الصور عند محاولات الإصلاح.
- **القرار التصميمي**: جعل الخريطة جزءاً من طبقات الـ hero نفسه بدل section مستقل بـ negative margin. ترتيب الطبقات المقصود: صورة الـ hero، ثم overlay، ثم `FloatingMapPreview`، ثم headline + `HeroSearchBar`، ثم dropdowns/popovers فوق الجميع.
- **التنفيذ**:
  - `apps/web/components/home/Hero.tsx`: إضافة `FloatingMapPreview` كطبقة عائمة داخل الـ hero، مع إبقاء البحث فوقها.
  - `apps/web/components/home/MapExplorer.tsx`: استخراج `FloatingMapPreview` من جسم الخريطة، تقليل ارتفاع preview، والإبقاء على `MapExplorer` كقسم مستقل قابل للاستخدام لاحقاً إن لزم.
  - `apps/web/app/(public)/page.tsx`: إزالة استدعاء `MapExplorer` كقسم مستقل بعد الـ hero، وإضافة padding قبل `Destinations` حتى لا تتداخل مع الخريطة العائمة.
  - `apps/web/components/search/SearchFilters.tsx`: إصلاح خطأ lint القديم بإزالة `setState` داخل `useEffect`.
  - `apps/web/app/(public)/search/page.tsx`: إضافة `filterStateKey` لإعادة تهيئة فلاتر البحث عند تغيّر قيم الرابط بدلاً من مزامنة state داخل effect، مع دعم `location` القادم من hero search.
- **التحقق**:
  - `npx pnpm@9.15.4 --filter web lint` نجح.
  - `npx pnpm@9.15.4 --filter web build` نجح.
  - `http://localhost:3000` رجع status `200`.
- **ملاحظة أدوات**: محاولة المعاينة الآلية عبر `node_repl` فشلت لأن أداة REPL الداخلية تحتاج Node `>=22.22.0` بينما جهاز محمد يستخدم Node `v20.20.1`. هذا لا يؤثر على المشروع؛ Next build/lint يعملان على Node الحالي.
- **ملاحظة Git**: توجد تغييرات أخرى غير هذه الجلسة في working tree من جلسات سابقة/عمل محمد، لذلك عند commit يجب مراجعة `git status` واختيار الملفات المقصودة فقط.

---

### 2026-05-04 — Data-driven Governorates/Search/Destinations (جلسة Codex)
- **طلب محمد**: إزالة القيم اليدوية من وجهات الصفحة الرئيسية والبحث، وتوحيد المدن/المحافظات قبل بدء Phase 2 backend. ملاحظة محمد: مناطق مثل الزبداني/تدمر ليست محافظات ويجب التعامل معها لاحقاً كأماكن/مناطق ضمن محافظة، لا كمحافظة مستقلة.
- **الالتزام بالقواعد**: قبل تعديل كود Next تمت قراءة docs المحلية من `apps/web/node_modules/next/dist/docs/` الخاصة بـ Server/Client Components وLinking/Navigating وCSS. لم تتم إضافة backend أو i18n، ولم يتم تعديل `docs/BUILD_PLAN.md`.
- **مصدر البيانات الموحد**: تم جعل `apps/web/data/syrian-governorates.ts` المصدر المركزي للمحافظات السورية الـ 14: دمشق، ريف دمشق، حلب، حمص، حماة، اللاذقية، طرطوس، إدلب، درعا، السويداء، القنيطرة، دير الزور، الرقة، الحسكة. الملف يصدّر `GovernorateId` و`GOVERNORATE_LABELS` و`isGovernorateId`.
- **تعديل listings**: `apps/web/data/listings.ts` أصبح يستخدم `GovernorateId` كـ `CityId`، و`CITY_LABELS` صار alias من `GOVERNORATE_LABELS`. عقار الزبداني صار `cityId: "rif_dimashq"` مع بقاء الزبداني في `neighbourhood`/العنوان.
- **وجهات الصفحة الرئيسية**: `apps/web/data/destinations.ts` لم يعد يحتوي أرقاماً يدوية. أضيف `SEARCH_DESTINATIONS` لكل المحافظات، و`getFeaturedDestinations()` يحسب عدد الإقامات من `PROPERTIES + HOTELS` ويعرض فقط المحافظات التي لديها mock inventory وصورة محلية.
- **الربط في الواجهة**:
  - `HeroSearchBar` يقرأ اقتراحات الموقع من `SEARCH_DESTINATIONS` بدل `DESTINATIONS` اليدوية.
  - `SearchFilters` يقرأ قائمة المدن من `SYRIAN_GOVERNORATES` بدل `CITY_LABELS` المحلي.
  - `Destinations` يستخدم `getFeaturedDestinations()` ويعرض `countLabel` المحسوب.
  - `search-utils` أضيف له normalization بسيط للروابط القديمة: `zabadani` و`rural-damascus` → `rif_dimashq`، و`hamah` → `hama`، و`sweida` → `suwayda`.
- **ما لم يتم عمله الآن**: لم تتم إضافة تصنيفات عقارات تحت المدن، ولم تتم إضافة نظام أماكن سياحية مثل تدمر/الزبداني ككيان مستقل. القرار: هذا مناسب لاحقاً كطبقة `places/areas` أو `destination groups` بعد تثبيت البحث الأساسي وربطه بالباك اند.
- **التحقق**:
  - `npx pnpm@9.15.4 --filter web lint` نجح.
  - `npx pnpm@9.15.4 --filter web build` نجح وولّد 33 route.

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
- cache الصور الآن في apps/web/.next/cache/images/ (وليس .next/ في الجذر)
- أمر حذف الـ cache المحدَّث: `Remove-Item -Recurse -Force apps/web/.next\cache\images`

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
| SECURITY | `docs/SECURITY.md` | Auth + KYC + Anti-circumvention + permissions/capabilities |
| BUILD_PLAN | `docs/BUILD_PLAN.md` | 11 مرحلة مع Exit Criteria + Risk Register |
| DEPLOYMENT | `docs/DEPLOYMENT.md` | Hostinger + Nginx + Docker Compose + Backups + DR |

**ملف القواعد**: `.cursor/rules/suknaa.mdc` (يُحمَّل تلقائياً من Cursor)

---

**نهاية الملف. آخر تحديث: 2026-05-13 (Phase 3 planning + Vacation Rentals naming؛ M0 مكتمل).**
