/**
 * Hero slider configuration.
 *
 * كيف تغيّر صور السلايدر:
 * 1) ضع صورك في: public/images/hero/
 * 2) عدّل الـ src والـ alt هنا فقط
 * 3) إذا غيّرت ملف بنفس الاسم — اعمل restart للـ dev server (Ctrl+C ثم npm run dev)
 *    لأن Next.js يـ cache الصور المحسّنة في .next/cache/images
 *
 * الحركات المتاحة:
 *  - "animate-kenburns-1" → zoom-in بطيء
 *  - "animate-kenburns-2" → zoom-out بطيء
 *  - "animate-kenburns-3" → panning يميناً
 *  - "animate-kenburns-4" → panning يساراً
 */
export type KenBurnsMotion =
  | "animate-kenburns-1"
  | "animate-kenburns-2"
  | "animate-kenburns-3"
  | "animate-kenburns-4";

export type HeroSlide = {
  src: string;
  alt: string;
  motion: KenBurnsMotion;
};

export const SLIDE_INTERVAL_MS = 8000;

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/hero/hero-1.jpg",
    alt: "الجامع الأموي في دمشق",
    motion: "animate-kenburns-1",
  },
  {
    src: "/images/hero/hero-2.jpg",
    alt: "ساحل اللاذقية",
    motion: "animate-kenburns-3",
  },
  {
    src: "/images/hero/hero-3.jpg",
    alt: "قلعة الحصن",
    motion: "animate-kenburns-2",
  },
  {
    src: "/images/hero/hero-4.jpg",
    alt: "جبال الزبداني",
    motion: "animate-kenburns-4",
  },
];
