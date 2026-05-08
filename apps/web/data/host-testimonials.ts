/**
 * Host testimonials shown on /become-a-host.
 *
 * Mock placeholders for Phase 1 — replace with real testimonials in beta.
 */

export type HostTestimonial = {
  id: string;
  name: string;
  city: string;
  /** Direct quote from the host */
  quote: string;
  /** One striking metric, e.g. "$2,400 شهرياً" */
  highlight: string;
  /** Optional avatar image (relative to /public or full URL) */
  avatar?: string;
};

export const HOST_TESTIMONIALS: HostTestimonial[] = [
  {
    id: "abu-yamen",
    name: "أبو يامن",
    city: "اللاذقية",
    quote:
      "بعد ما نزّلت شاليه على سُكنى، صار عندي حجوزات منتظمة كل صيف. التطبيق سهل والدفعات بتوصلني بدون تأخير.",
    highlight: "$1,800 شهرياً",
  },
  {
    id: "rana",
    name: "رنا",
    city: "دمشق",
    quote:
      "كنت خايفة من الموضوع بالأول، بس فريق سُكنى ساعدني بالـ KYC وكل شي. هلأ بيتي القديم بدمشق صار مصدر دخل ثابت.",
    highlight: "تقييم 4.9⭐",
  },
  {
    id: "office-cham",
    name: "مكتب الشام العقاري",
    city: "ريف دمشق",
    quote:
      "كمكتب عقاري، لقينا في سُكنى أداة محترفة لإدارة عشرات بيوت العطلات بمكان واحد. التقارير ممتازة والعمولة عادلة.",
    highlight: "12 بيت عطلات نشط",
  },
];
