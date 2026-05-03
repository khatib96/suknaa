/**
 * Destinations carousel configuration.
 *
 * كيف تغيّر الوجهات:
 * 1) ضع الصور في: public/images/destinations/
 * 2) أضف/عدّل/احذف عناصر من المصفوفة أدناه
 * 3) العدد مرن — يمكن إضافة 4 أو 6 أو 10 وجهات (الـ scroll أفقي)
 *
 * إذا غيّرت ملف بنفس الاسم — Hard Refresh للمتصفح (Ctrl+Shift+R) أو
 * أعد تشغيل dev server (Ctrl+C ثم npm run dev) لإعادة بناء cache الصور.
 */
export type Destination = {
  /** معرّف فريد، يستخدم كـ key */
  id: string;
  /** اسم المدينة بالعربية */
  city: string;
  /** نص يصف عدد العقارات (مثل "120 عقار") */
  count: string;
  /** مسار الصورة (نسبي للـ public/) */
  image: string;
};

export const DESTINATIONS: Destination[] = [
  {
    id: "damascus",
    city: "دمشق",
    count: "120 عقار",
    image: "/images/destinations/damascus.jpg",
  },
  {
    id: "latakia",
    city: "اللاذقية",
    count: "86 عقار",
    image: "/images/destinations/latakia.jpg",
  },
  {
    id: "tartus",
    city: "طرطوس",
    count: "54 عقار",
    image: "/images/destinations/tartus.jpg",
  },
  {
    id: "hamah",
    city: "حماة",
    count: "38 عقار",
    image: "/images/destinations/hamah.jpg",
  },
  {
    id: "daraa",
    city: "درعا",
    count: "27 عقار",
    image: "/images/destinations/daraa.jpg",
  },
  {
    id: "aleppo",
    city: "حلب",
    count: "62 عقار",
    image: "/images/destinations/aleppo.jpg",
  },
];
