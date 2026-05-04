import type { Metadata } from "next";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "سياسة ملفات الكوكيز",
  description:
    "تعرَّف على ملفات الكوكيز التي تستخدمها سُكنى وكيف يمكنك التحكُّم بها.",
};

const COOKIE_TABLE: Array<{
  type: string;
  purpose: string;
  duration: string;
}> = [
  {
    type: "Essential",
    purpose: "تشغيل أساسي للموقع، تذكُّر تسجيل الدخول، وحماية الجلسة.",
    duration: "حتى نهاية الجلسة أو 7 أيام",
  },
  {
    type: "Analytics",
    purpose: "قياس أداء الموقع وفهم كيفية استخدام الزوار للصفحات.",
    duration: "حتى 13 شهر",
  },
  {
    type: "Marketing",
    purpose: "تقديم محتوى وعروض ذات صلة بناءً على اهتماماتك.",
    duration: "حتى 13 شهر",
  },
];

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="سياسة ملفات الكوكيز"
      subtitle="نشرح هنا كيف نستخدم ملفات الكوكيز ومعلومات التتبُّع البسيطة على سُكنى."
      lastUpdatedISO="2026-05-04"
    >
      <LegalSection index={1} title="ما هي ملفات الكوكيز؟">
        <p>
          ملفات الكوكيز هي ملفات نصية صغيرة يحفظها متصفِّحك على جهازك عند زيارة
          المواقع الإلكترونية. تُساعد هذه الملفات على تذكُّر تفضيلاتك وتحسين
          تجربتك في كل زيارة قادمة.
        </p>
        <p>
          تستخدم سُكنى ملفات الكوكيز لتشغيل الموقع بشكل صحيح، تذكُّر جلستك،
          وقياس الأداء العام دون جمع معلومات حسَّاسة.
        </p>
      </LegalSection>

      <LegalSection index={2} title="أنواع الكوكيز التي نستخدمها">
        <p>نقسِّم الكوكيز التي نستخدمها إلى ثلاث فئات رئيسية:</p>
        <div className="overflow-x-auto rounded-2xl border border-[#F5EFE6]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-charcoal">
                <th className="px-4 py-3 text-start font-bold">النوع</th>
                <th className="px-4 py-3 text-start font-bold">الغرض</th>
                <th className="px-4 py-3 text-start font-bold">المدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFE6]">
              {COOKIE_TABLE.map((row) => (
                <tr key={row.type} className="bg-white">
                  <td className="px-4 py-3 font-bold text-primary">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 leading-7 text-charcoal/80">
                    {row.purpose}
                  </td>
                  <td className="font-numeric px-4 py-3 text-charcoal/80">
                    {row.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection index={3} title="كيف تتحكَّم بملفات الكوكيز">
        <p>
          يمكنك في أي وقت إدارة أو حذف ملفات الكوكيز من إعدادات متصفِّحك. معظم
          المتصفِّحات تتيح لك تعطيل الكوكيز كلياً أو لمواقع محددة، لكن هذا قد
          يؤثِّر على بعض ميزات سُكنى مثل تسجيل الدخول وحفظ التفضيلات.
        </p>
        <p>
          سنضيف قريباً مركز تفضيلات داخل الموقع يتيح لك قبول أو رفض الكوكيز غير
          الأساسية بنقرة واحدة (مع الحفاظ على الكوكيز الأساسية الضرورية لتشغيل
          الموقع).
        </p>
      </LegalSection>

      <LegalSection index={4} title="التواصل والاستفسارات">
        <p>
          إذا كان لديك أي سؤال حول استخدامنا لملفات الكوكيز، تواصل معنا عبر صفحة
          التواصل أو على البريد <span dir="ltr">support@suknaa.com</span>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
