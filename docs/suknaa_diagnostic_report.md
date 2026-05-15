# 📋 تقرير التشخيص الشامل — مشروع سُكنى (Suknaa)

> **تاريخ التقرير:** 2026-05-09  
> **المراجع:** خبير برمجي — 10 سنوات خبرة في بناء المشاريع الرقمية  
> **نوع المراجعة:** تشخيص شامل (Architecture · Code Quality · Security · Performance · UX)

---

## 1. نظرة عامة على المشروع

**سُكنى** هي منصة سورية لاكتشاف وحجز السكن — تجمع بين نموذجين:
- **بيوت العطلات (Vacation rentals / P2P):** بيوت عطلات، شقق، فلل، شاليهات (نموذج Airbnb) — انظر `docs/PHASE_3_M1_NAMING_PLAN.md`
- **ضيافة (Hospitality):** فنادق، منتجعات، شقق فندقية (نموذج Booking.com)

### الحالة الراهنة

| المرحلة | الحالة | الملاحظات |
|---|---|---|
| Phase 1 — الواجهة الأمامية | ✅ مكتملة | صفحات ثابتة + بيانات تجريبية |
| Phase 2 — Auth + KYC | ✅ مكتملة (M1–M10) | تسجيل، تحقق، JWT، OTP، 2FA، KYC |
| Phase 3 — بيوت العطلات (Vacation rentals) | ❌ لم يبدأ | الخطوة التالية — تسمية المنتج والعقد: `PHASE_3_M1_NAMING_PLAN.md` |
| Phase 4–11 | ❌ لم يبدأ | حجوزات، دفع، لوحة تحكم، تطبيقات |

---

## 2. تقييم الفكرة

### 💡 التقييم: 8.5/10

| المعيار | التقييم | التعليق |
|---|---|---|
| **الحاجة السوقية** | ⭐⭐⭐⭐⭐ | سوريا تفتقر لمنصة حجز موحدة محلية — فرصة حقيقية |
| **النموذج المزدوج** | ⭐⭐⭐⭐ | الجمع بين Airbnb + Booking نقطة قوة وتعقيد في آن واحد |
| **الاستهداف** | ⭐⭐⭐⭐ | التركيز على السوق السوري + المغتربين ذكي |
| **قابلية التوسع** | ⭐⭐⭐⭐ | البنية جاهزة للتوسع لدول مجاورة |
| **التحديات** | ⭐⭐⭐ | بوابات الدفع + العقوبات + ضعف الثقة الرقمية |

> [!TIP]
> الفكرة ممتازة وتسد فجوة حقيقية. النموذج المزدوج (عقارات + فنادق) هو ميزة تنافسية كبيرة لكنه يضاعف التعقيد التقني. الخطة المرحلية الحالية تتعامل مع هذا بذكاء.

---

## 3. تقييم حزمة الأدوات (Tech Stack)

### Frontend — `apps/web`

| الأداة | الإصدار | التقييم |
|---|---|---|
| Next.js | 16.2.4 | ✅ أحدث إصدار — App Router |
| React | 19.2.4 | ✅ أحدث إصدار |
| TypeScript | ^5 | ✅ ممتاز |
| Tailwind CSS | v4 | ✅ أحدث إصدار |
| shadcn/ui + Base UI | v4.6 + 1.4 | ✅ مكونات عالية الجودة |
| Zod | v4 | ✅ ممتاز للتحقق |
| react-hook-form | v7 | ✅ خيار ممتاز للنماذج |
| lucide-react | v1.14 | ✅ أيقونات نظيفة |

### Backend — `apps/api`

| الأداة | الإصدار | التقييم |
|---|---|---|
| NestJS | 10.4.15 | ✅ إطار enterprise ناضج |
| Prisma | 5.22 | ✅ ORM قوي |
| PostgreSQL | 16 + PostGIS | ✅ ممتاز للبيانات الجغرافية |
| Redis | 7 | ✅ للتخزين المؤقت والجلسات |
| MinIO | latest | ✅ S3-compatible — ممتاز لـ KYC |
| argon2 | 0.44 | ✅ أفضل خوارزمية لتجزئة كلمات المرور |
| Pino | 9.5 | ✅ تسجيل عالي الأداء |
| Swagger | 7.4 | ✅ توثيق API تلقائي |

### البنية التحتية

| الأداة | التقييم |
|---|---|
| pnpm workspaces | ✅ Monorepo منظم |
| Docker Compose | ✅ بيئة تطوير محلية نظيفة |
| PostGIS | ✅ جاهز للبحث الجغرافي |

### التقييم العام: 9/10

> [!NOTE]
> حزمة الأدوات **احترافية جداً** وتتبع أفضل الممارسات لعام 2026. الخيارات متسقة ومتكاملة. لا توجد أدوات زائدة أو متعارضة.

---

## 4. تقييم هيكل المشروع (Architecture)

### بنية الـ Monorepo

```
suknaa/
├── apps/
│   ├── web/          → Next.js 16 (Frontend)
│   └── api/          → NestJS (Backend)
├── packages/
│   ├── types/        → أنواع مشتركة (Zod schemas)
│   └── ui/           → مكونات مشتركة (فارغ حالياً)
├── infrastructure/   → Docker Compose
├── docs/             → 14 ملف توثيق شامل
└── public/           → أصول عامة
```

### التقييم: 8/10

**نقاط القوة:**
- ✅ فصل واضح بين Frontend و Backend
- ✅ حزمة `@suknaa/types` مشتركة — تضمن تناسق API contracts
- ✅ Docker Compose لجميع الخدمات الخارجية
- ✅ مجلد `docs/` شامل جداً (14 ملف، 300+ KB من التوثيق)

**نقاط التحسين:**
- ⚠️ حزمة `packages/ui` فارغة — يجب نقل المكونات المشتركة إليها
- ⚠️ لا يوجد Turborepo أو أداة بناء موازية رغم ذكرها في README
- ⚠️ مجلد `public/` في الجذر فارغ (الأصول في `apps/web/public/`)

---

## 5. مراجعة الكود — Frontend

### إحصائيات
- **87 ملف** مكون في `apps/web/components/`
- **15 صفحة/مجموعة مسارات** في App Router
- **16 ملف بيانات** تجريبية في `data/`
- **9 ملفات مساعدة** في `lib/`

### نقاط القوة

1. **RTL أصلي:** المشروع مبني من الأساس بـ `dir="rtl"` و `lang="ar"` — ممتاز
2. **خطوط عربية:** استخدام Tajawal للعربية + Inter للأرقام — احترافي
3. **نظام تصميم متسق:** CSS variables + Tailwind theme منظم
4. **تجاوب الشاشات:** ثلاث طبقات (Mobile drawer + Tablet compact + Desktop full)
5. **SEO:** Metadata + manifest + structured titles
6. **Error Boundaries:** صفحة خطأ 500 + صفحة 404 مخصصة بالعربية
7. **BFF Pattern:** API routes في Next.js كـ proxy آمن للـ backend
8. **CSRF Protection:** Double-submit cookie pattern
9. **Ken Burns animations:** تأثيرات سينمائية في Hero section

### مشاكل وملاحظات

> [!WARNING]
> **HeroSearchBar.tsx — 811 سطر:** هذا الملف ضخم جداً ويحتوي على 3 تنفيذات مختلفة (Mobile + Tablet + Desktop) مع تكرار كبير في الكود. يجب تقسيمه.

- ⚠️ **بيانات ثابتة (Static Data):** كل البيانات في `data/` هي mock data — طبيعي للمرحلة الحالية لكن يجب التخطيط لاستبدالها
- ⚠️ **Navbar يجلب `/api/me` عند كل تحميل:** قد يسبب طلبات فاشلة غير ضرورية للمستخدم غير المسجل
- ⚠️ **لا يوجد state management:** لا React Context أو Zustand — سيصبح ضرورياً في Phase 3+
- ⚠️ **`packages/ui` فارغ:** المكونات في `components/ui/` (button, dropdown-menu) يجب نقلها

---

## 6. مراجعة الكود — Backend

### إحصائيات
- **48 ملف** في `apps/api/src/`
- **4 وحدات** (modules): auth, kyc, admin, health
- **7 خدمات مشتركة** (shared): config, prisma, redis, storage, messaging, audit, errors

### نقاط القوة

1. **Auth Service شامل (1032 سطر):** يغطي signup, login, MFA, refresh, logout, sessions, become-host
2. **KYC Service محكم:** تحقق من نوع الملفات بـ magic bytes — أمان ممتاز
3. **Audit Trail كامل:** كل عملية حساسة تُسجَّل في `audit_logs`
4. **Password Breach Checker:** واجهة قابلة للتبديل (mock الآن، HIBP لاحقاً)
5. **TOTP + Backup Codes:** تشفير at-rest لأسرار 2FA
6. **Global Exception Filter:** توحيد شكل الأخطاء وفق API spec
7. **Environment Validation:** Zod schema صارم مع conditional validation
8. **Log Redaction:** 25+ حقل حساس محمي من التسجيل

### مشاكل وملاحظات

> [!IMPORTANT]
> **auth.service.ts — 1032 سطر:** هذا الملف كبير جداً ويحمل مسؤوليات متعددة. يجب تقسيمه إلى: `SignupService`, `LoginService`, `SessionService`, `HostOnboardingService`.

- ⚠️ **لا توجد اختبارات:** صفر unit tests أو integration tests — خطر كبير مع تعقيد Auth logic
- ⚠️ **لا يوجد rate limiting:** لا حماية من brute force على login/signup endpoints
- ⚠️ **Refresh token splitting بـ `.`:** استخدام `sessionId.refreshToken` بسيط لكنه يكشف session ID
- ⚠️ **Email templates بسيطة:** رسائل التحقق نص عادي بدون HTML templates

---

## 7. مراجعة قاعدة البيانات

### Schema Prisma — 294 سطر، 8 نماذج

| النموذج | الوظيفة | التقييم |
|---|---|---|
| `User` | المستخدمون + أدوار متعددة | ✅ شامل |
| `HostProfile` | ملف المضيف | ✅ يدعم vacation rentals + hospitality *(تقرير مايو 2026؛ الكود قد يعرض legacy حتى M2b)* |
| `KycSubmission` | طلبات التحقق | ✅ مرن لأنواع المستندات |
| `AuthSession` | جلسات المصادقة | ✅ مع refresh rotation |
| `OtpCode` | رموز التحقق | ✅ مع rate limiting indexes |
| `TwoFactorSecret` | أسرار 2FA | ✅ مشفرة |
| `AuditLog` | سجل المراجعة | ✅ شامل مع JSON metadata |

### نقاط القوة
- ✅ UUID primary keys — أفضل للأمان
- ✅ Soft delete pattern (`deletedAt`)
- ✅ Snake_case mapping — اتساق مع PostgreSQL
- ✅ Timestamptz — مناطق زمنية صحيحة
- ✅ Indexes محسّنة (6 composite indexes)
- ✅ `gen_random_uuid()` — server-side generation

### ملاحظات
- ⚠️ **لا يوجد unique constraint على `users.email`** — فقط `findFirst` في الكود
- ⚠️ **`HostProfile.bankDetailsEncrypted`** حقل String عادي — يحتاج encryption strategy واضحة
- ⚠️ **لا يوجد `properties` أو `bookings`** — طبيعي، Phase 3 لم يبدأ

---

## 8. الأمان (Security)

### التقييم: 7.5/10

**ممتاز:**
- ✅ RS256 JWT (asymmetric keys) — أفضل من HS256
- ✅ Argon2id لتجزئة كلمات المرور
- ✅ CSRF double-submit cookies
- ✅ Refresh token rotation — يمنع token replay
- ✅ Log redaction لـ 25+ حقل حساس
- ✅ KYC file validation بـ magic bytes — يمنع file type spoofing
- ✅ Trust proxy configured — مهم خلف reverse proxy
- ✅ Global prefix `/v1` — API versioning

**يحتاج تحسين:**

> [!CAUTION]
> **مشاكل أمنية يجب معالجتها قبل الإنتاج:**

| المشكلة | الأولوية | التفاصيل |
|---|---|---|
| **لا rate limiting** | 🔴 عالية | لا حماية على login, signup, OTP, password reset |
| **لا CORS configuration** | 🔴 عالية | `app.enableCors()` غير موجود |
| **لا helmet** | 🟡 متوسطة | HTTP security headers مفقودة |
| **`.env` في git** | 🔴 عالية | `apps/api/.env` موجود وليس في `.gitignore` الفرعي |
| **لا اختبارات أمنية** | 🟡 متوسطة | صفر tests على auth flows |
| **2FA غير إلزامي** | 🟡 متوسطة | للمضيفين والمديرين — مؤجل لكن مهم |

---

## 9. الأداء (Performance)

### التقييم: 7/10

**إيجابي:**
- ✅ `will-change: transform` على animations — GPU acceleration
- ✅ `{ passive: true }` على scroll listeners
- ✅ `next/font` مع `display: swap` — لا blocking للخطوط
- ✅ Image optimization عبر `next/image`
- ✅ Pino logger — أسرع من Winston بـ 5x
- ✅ Suspense boundaries على المكونات الثقيلة

**يحتاج تحسين:**
- ⚠️ **HeroSearchBar 35KB:** ملف واحد ضخم يُحمَّل client-side
- ⚠️ **لا code splitting يدوي:** الاعتماد الكامل على Next.js automatic splitting
- ⚠️ **لا caching strategy:** لا Redis caching في الـ frontend BFF routes
- ⚠️ **لا connection pooling ظاهر:** Prisma يحتاج PgBouncer في production
- ⚠️ **لا CDN configured:** الصور من Unsplash مباشرة

---

## 10. التوثيق (Documentation)

### التقييم: 9.5/10 — ممتاز

هذا من أفضل جوانب المشروع. **14 ملف توثيق** بإجمالي **300+ KB:**

| الملف | الحجم | المحتوى |
|---|---|---|
| `UI_UX_VISION.md` | 46 KB | رؤية التصميم الشاملة |
| `DATABASE_SCHEMA.md` | 55 KB | مخطط قاعدة البيانات الكامل |
| `DEPLOYMENT.md` | 26 KB | خطة النشر التفصيلية |
| `DESIGN_SYSTEM.md` | 25 KB | نظام التصميم |
| `BUILD_PLAN.md` | 24 KB | خارطة الطريق (11 مرحلة) |
| `ARCHITECTURE.md` | 23 KB | البنية التقنية |
| `API_SPEC.md` | 22 KB | مواصفات API |
| `SECURITY.md` | 20 KB | سياسات الأمان |
| `PAYMENT_SYSTEM.md` | 17 KB | نظام الدفع |
| `PROJECT.md` | 11 KB | نظرة عامة |
| `PHASE_2_TRACKER.md` | 9 KB | متابعة المرحلة الثانية |
| `PRODUCT_IDEAS.md` | 5 KB | أفكار مستقبلية |

> [!TIP]
> التوثيق على مستوى enterprise. هذا نادر جداً في المشاريع الناشئة وهو استثمار ذكي سيوفر الكثير من الوقت لاحقاً.

---

## 11. التقييم النهائي

### الدرجات

| المعيار | الدرجة | التعليق |
|---|:---:|---|
| **الفكرة والرؤية** | 8.5/10 | فرصة حقيقية في سوق غير مخدوم |
| **حزمة الأدوات** | 9/10 | احترافية، حديثة، متسقة |
| **هيكل المشروع** | 8/10 | Monorepo نظيف مع مساحة للتحسين |
| **جودة الكود** | 7.5/10 | جيد مع بعض الملفات الضخمة |
| **قاعدة البيانات** | 8/10 | مصممة بعناية |
| **الأمان** | 7.5/10 | أساس قوي لكن rate limiting مفقود |
| **الأداء** | 7/10 | جيد لمرحلة التطوير |
| **التوثيق** | 9.5/10 | استثنائي |
| **التقييم العام** | **8.1/10** | مشروع **احترافي** وواعد |

---

## 12. اقتراحات التطوير ذات الأولوية

### 🔴 أولوية عالية (قبل Phase 3)

#### 1. إضافة Rate Limiting
```
استخدام @nestjs/throttler أو حل Redis-based مخصص لحماية:
- POST /v1/auth/login — 5 محاولات/دقيقة
- POST /v1/auth/signup — 3/ساعة
- POST /v1/auth/otp/* — 3/ساعة (موجود في الكود لكن بدون enforcement)
- POST /v1/auth/password-reset/* — 5/ساعة
```

#### 2. إضافة CORS + Helmet
```typescript
// في main.ts
app.enableCors({ origin: ['https://suknaa.com'], credentials: true });
// + @nestjs/helmet للـ security headers
```

#### 3. إضافة Unique Index على `users.email`
```prisma
@@unique([email], map: "idx_users_email_unique")
// أو partial unique: WHERE deleted_at IS NULL
```

#### 4. تقسيم AuthService
```
auth.service.ts (1032 سطر) →
├── signup.service.ts
├── login.service.ts  
├── session.service.ts
├── password-reset.service.ts
└── host-onboarding.service.ts
```

#### 5. تقسيم HeroSearchBar
```
HeroSearchBar.tsx (811 سطر) →
├── HeroSearchBar.tsx (orchestrator)
├── MobileSearchDrawer.tsx
├── TabletSearchBar.tsx
├── DesktopSearchBar.tsx
└── shared/SearchFieldButton.tsx
```

### 🟡 أولوية متوسطة (أثناء Phase 3)

#### 6. إضافة Testing Framework
```
- vitest أو jest للـ backend
- ابدأ بـ auth.service tests — أهم منطق في المشروع
- هدف: 70% coverage على business logic
```

#### 7. State Management للـ Frontend
```
- Zustand أو React Context لإدارة:
  - حالة المستخدم الحالي
  - حالة Auth (login/logout)
  - تفضيلات البحث
```

#### 8. إضافة i18n (English)
```
- next-intl كما هو مخطط في BUILD_PLAN
- السوق يستهدف المغتربين أيضاً — الإنجليزية مهمة
```

#### 9. إعداد CI/CD Pipeline
```
GitHub Actions:
- lint + type-check على كل PR
- build check
- test suite (بعد إضافته)
- auto-deploy لـ staging
```

#### 10. Error Monitoring
```
- Sentry للـ frontend + backend
- أو بديل self-hosted مثل GlitchTip
```

### 🟢 أولوية منخفضة (Phase 4+)

#### 11. PWA Service Worker
مؤجل حالياً — يُضاف عند اكتمال تجربة البحث الحقيقية.

#### 12. Image Optimization Pipeline
```
Sharp على الـ backend لتحويل صور العقارات/الفنادق إلى WebP/AVIF بأحجام متعددة.
```

#### 13. Connection Pooling
```
PgBouncer أمام PostgreSQL في production — ضروري مع تزايد المستخدمين.
```

#### 14. Search Performance
```
- Redis caching للبحث (60s TTL كما في BUILD_PLAN)
- PostGIS spatial indexes
- Full-text search بالعربية (tsvector)
```

#### 15. تطبيقات Flutter
المخطط في Phase 10 — يمكن البدء بـ API client مشترك مبكراً.

---

## 13. ملاحظات ختامية

> [!IMPORTANT]
> **هذا مشروع على مستوى احترافي عالٍ.** البنية التحتية، واختيار الأدوات، وجودة التوثيق تفوق ما نراه في كثير من startups ممولة. النقاط التي تحتاج تحسين (rate limiting، testing، ملفات كبيرة) هي طبيعية تماماً في هذه المرحلة المبكرة.

**التوصية الرئيسية:** لا تتسرع في إضافة ميزات Phase 3 قبل تأمين الأساسات:
1. Rate limiting أولاً
2. Email unique constraint
3. CORS + security headers
4. على الأقل 10-15 unit tests على auth logic

بعد هذه الخطوات الأربع، المشروع سيكون جاهزاً لبناء Phase 3 (نظام العقارات) على أساس صلب وآمن.

---

*تم إعداد هذا التقرير بعد مراجعة شاملة لـ 135+ ملف مصدري، 14 ملف توثيق، ومخطط قاعدة البيانات الكامل.*
