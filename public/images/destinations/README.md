# Destinations Images

ضع هنا صور الوجهات المميزة بأسماء مطابقة لما هو في `data/destinations.ts`:

| الملف | الوجهة |
|---|---|
| `damascus.jpg` | دمشق |
| `latakia.jpg` | اللاذقية |
| `tartus.jpg` | طرطوس |
| `zabadani.jpg` | الزبداني |
| `daraa.jpg` | درعا|
| `aleppo.jpg` | حلب |

## المواصفات

| الخاصية | القيمة |
|---|---|
| الأبعاد | 800×1000 على الأقل (نسبة 4:5 أو 16:10) |
| الصيغة | JPG / WebP / AVIF |
| الحجم | ≤ 200KB لكل صورة |
| المحتوى | معالم سورية معروفة، إضاءة دافئة |

## كيف تضيف وجهة جديدة

1. ضع الصورة هنا (مثلاً `homs.jpg`).
2. افتح `data/destinations.ts` وأضف عنصر جديد للمصفوفة:

```ts
{
  id: "homs",
  city: "حمص",
  count: "45 عقار",
  image: "/images/destinations/homs.jpg",
},
```

3. احفظ — Next.js يلتقط التغيير تلقائياً.

## كيف تحذف أو تعدّل وجهة

افتح `data/destinations.ts` وعدّل المصفوفة فقط — لا تحتاج لمس أي component.

## ⚠️ مشكلة Cache بعد استبدال صورة بنفس الاسم

إذا استبدلت ملفاً بنفس الاسم ولم يظهر التحديث:

1. **Hard Refresh** للمتصفح: `Ctrl + Shift + R` (Windows) أو `Cmd + Shift + R` (Mac).
2. إذا لم تنفع — أعد تشغيل dev server:
   ```bash
   # في الـ terminal:
   # Ctrl + C ثم
   npm run dev
   ```
3. إذا استمرت المشكلة — احذف cache الصور المحسّنة:
   ```bash
   # في الـ terminal:
   rm -rf .next/cache/images
   npm run dev
   ```
