import { Ban, Cigarette, Clock, PartyPopper, PawPrint } from "lucide-react";

const rules = [
  { icon: <Clock className="h-4 w-4" />, label: "تسجيل الوصول بعد الساعة 14:00" },
  { icon: <Clock className="h-4 w-4" />, label: "المغادرة قبل الساعة 12:00" },
  { icon: <Cigarette className="h-4 w-4" />, label: "ممنوع التدخين داخل العقار" },
  { icon: <PartyPopper className="h-4 w-4" />, label: "ممنوع إقامة حفلات أو فعاليات" },
  { icon: <PawPrint className="h-4 w-4" />, label: "الحيوانات الأليفة بحسب توافر الإذن" },
  { icon: <Ban className="h-4 w-4" />, label: "ممنوع تجاوز عدد الضيوف المسجّل" },
];

export function PropertyHouseRules() {
  return (
    <section aria-labelledby="property-rules-heading">
      <h2 id="property-rules-heading" className="text-xl font-bold text-charcoal">
        قواعد الإقامة
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className="inline-flex items-center gap-3 rounded-xl border border-[#F5EFE6] bg-white p-3 text-sm text-charcoal shadow-warm-sm"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cream text-primary">
              {rule.icon}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-[#F5EFE6] bg-cream p-4 text-sm leading-7 text-charcoal/85">
        <p className="font-bold text-charcoal">سياسة الإلغاء</p>
        <p className="mt-1">
          إلغاء مجاني خلال 48 ساعة من الحجز. بعد ذلك تطبَّق سياسة الإلغاء
          المرنة: استرداد 50% إذا تم الإلغاء قبل أكثر من 7 أيام من الوصول.
        </p>
      </div>
    </section>
  );
}
