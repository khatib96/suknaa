# Hero Slider Images

ضع هنا صور سينمائية لمواقع سورية. الأسماء والترتيب يُتحكّم بهم من:
**`data/hero-slides.ts`**

## المواصفات الموصى بها

| الخاصية | القيمة |
|---|---|
| الأبعاد | 1920×1080 (16:9) أو أكبر |
| الصيغة | JPG / WebP / AVIF |
| الحجم | ≤ 400KB لكل صورة (للأداء) |
| اللون | دافئ، إضاءة ذهبية |
| المحتوى | دمشق القديمة، قلعة الحصن، ساحل اللاذقية، الزبداني، طرطوس، صيدنايا |

الـ slider يبدّل تلقائياً كل 8 ثوانٍ مع fade transition + Ken Burns motion.

## كيف تغيّر الصور

### الطريقة الأسهل (نفس الأسماء)
استبدل `hero-1.jpg` ... `hero-4.jpg` بصور جديدة بنفس الأسماء.

### الطريقة الأكثر مرونة (أسماء جديدة)
1. ضع صورتك بأي اسم (مثل `damascus-night.jpg`).
2. افتح `data/hero-slides.ts` وعدّل الـ `src` و `alt`:
   ```ts
   { src: "/images/hero/damascus-night.jpg", alt: "دمشق ليلاً", motion: "animate-kenburns-1" },
   ```

### إضافة شريحة جديدة (5، 6، أو أكثر)
أضف عنصر جديد في `HERO_SLIDES` array. السلايدر يدعم أي عدد من الصور تلقائياً.

## ⚠️ مشكلة Cache بعد استبدال صورة بنفس الاسم

إذا استبدلت ملفاً بنفس الاسم ولم يظهر التحديث:

### الخطوة 1: Hard Refresh للمتصفح
- **Windows / Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### الخطوة 2: إعادة تشغيل dev server
```bash
# في الـ terminal:
# Ctrl + C  (لإيقاف الـ server)
npm run dev
```

### الخطوة 3 (نووي): حذف cache الصور المحسّنة
Next.js يحفظ نسخ محسّنة من الصور في `.next/cache/images/`. إذا كان الـ filename نفسه، الـ cache يبقى. الحل:

**PowerShell (Windows)**:
```powershell
Remove-Item -Recurse -Force .next/cache/images
npm run dev
```

**Bash (Mac/Linux/Git Bash)**:
```bash
rm -rf .next/cache/images
npm run dev
```

> 💡 **نصيحة احترافية**: لو تستبدل الصور كثيراً أثناء التطوير، خلّيهم بأسماء مختلفة مع ترقيم — وحدّث `data/hero-slides.ts` فقط. أسرع وأنظف.
