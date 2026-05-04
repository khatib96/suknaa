/**
 * Mock data for `/help` (Help Center).
 *
 * Two exports:
 *  - HELP_CATEGORIES: 6 high-level topics (booking, payment, cancellation,
 *    safety, account, communication). Used to render the categories grid.
 *  - HELP_FAQ: 15 frequently asked questions, each tagged with a category id.
 *
 * In Phase 8+ this is replaced by a real CMS-backed knowledge base.
 */

export type HelpCategoryId =
  | "booking"
  | "payment"
  | "cancellation"
  | "safety"
  | "account"
  | "communication";

export type HelpCategory = {
  id: HelpCategoryId;
  /** Lucide icon component name (resolved by the help page at render). */
  iconName:
    | "CalendarCheck"
    | "Wallet"
    | "XCircle"
    | "ShieldCheck"
    | "UserCircle"
    | "MessagesSquare";
  label: string;
  description: string;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "booking",
    iconName: "CalendarCheck",
    label: "الحجز",
    description: "كيف تبحث، تختار العقار المناسب، وتؤكِّد الحجز.",
  },
  {
    id: "payment",
    iconName: "Wallet",
    label: "الدفع",
    description: "طرق الدفع المتاحة، الأمان، والإيصالات.",
  },
  {
    id: "cancellation",
    iconName: "XCircle",
    label: "الإلغاء والاسترجاع",
    description: "سياسات الإلغاء وآلية استرجاع المبالغ.",
  },
  {
    id: "safety",
    iconName: "ShieldCheck",
    label: "الأمان",
    description: "كيف نحمي بياناتك ومعاملاتك من الاحتيال.",
  },
  {
    id: "account",
    iconName: "UserCircle",
    label: "الحساب",
    description: "إنشاء الحساب، التحقق، وإعدادات الخصوصية.",
  },
  {
    id: "communication",
    iconName: "MessagesSquare",
    label: "التواصل",
    description: "الرسائل مع المضيف ومركز دعم سُكنى.",
  },
];

export type HelpFaqItem = {
  id: string;
  categoryId: HelpCategoryId;
  question: string;
  answer: string;
};

export const HELP_FAQ: HelpFaqItem[] = [
  // -------- Booking --------
  {
    id: "how-to-book",
    categoryId: "booking",
    question: "كيف أحجز عقاراً أو فندقاً عبر سُكنى؟",
    answer:
      "ابحث عن المدينة أو نوع العقار، اختر تواريخ الإقامة وعدد الضيوف، ثم اضغط على البطاقة لمراجعة التفاصيل. اضغط زر الحجز، أكمل بياناتك، وادفع بإحدى الطرق المتاحة. ستصلك رسالة تأكيد فوراً.",
  },
  {
    id: "advance-booking",
    categoryId: "booking",
    question: "هل يمكنني الحجز قبل تاريخ السفر بفترة طويلة؟",
    answer:
      "نعم، يمكنك الحجز قبل تاريخ الوصول حتى 12 شهراً. بعض المضيفين يحدِّدون قواعد خاصة لفترات الإقامات الطويلة (أكثر من 30 ليلة) وستظهر هذه القواعد على صفحة العقار.",
  },
  {
    id: "guests-count",
    categoryId: "booking",
    question: "ماذا يحدث إذا أضفت ضيوفاً أكثر من العدد المسموح؟",
    answer:
      "كل عقار له حدّ أقصى للضيوف. إذا تجاوزت هذا الحد، النظام لن يسمح بإكمال الحجز. لإضافة ضيوف إضافيين تواصل مع المضيف عبر الرسائل بعد تأكيد الحجز.",
  },
  // -------- Payment --------
  {
    id: "payment-methods",
    categoryId: "payment",
    question: "ما طرق الدفع المتاحة على سُكنى؟",
    answer:
      "في المرحلة الأولى نقبل: شام كاش، MTN كاش، والتحويل البنكي للسياح القادمين من الخارج. سيُضاف الدفع ببطاقات الائتمان لاحقاً.",
  },
  {
    id: "service-fee",
    categoryId: "payment",
    question: "ما هي رسوم الخدمة؟",
    answer:
      "رسوم الخدمة 2% فقط من قيمة الحجز، تظهر بشكل صريح كبند منفصل في فاتورتك. تذهب هذه الرسوم لتشغيل المنصة وتحسين الأمان والدعم.",
  },
  {
    id: "currency",
    categoryId: "payment",
    question: "بأي عملة تظهر الأسعار؟",
    answer:
      "الأسعار مخزَّنة بالدولار الأمريكي (USD) وتُعرض بالدولار وكذلك بالليرة السورية (SYP) لتسهيل المقارنة. الدفع الفعلي يكون بالعملة التي تختارها.",
  },
  // -------- Cancellation --------
  {
    id: "cancellation-policies",
    categoryId: "cancellation",
    question: "ما هي سياسات الإلغاء؟",
    answer:
      "هناك 3 سياسات يختارها المضيف: مرنة (إلغاء مجاني قبل 24 ساعة)، متوسطة (قبل 5 أيام)، صارمة (لا استرداد بعد التأكيد). السياسة المحددة تظهر بوضوح على صفحة العقار قبل الحجز.",
  },
  {
    id: "refund-time",
    categoryId: "cancellation",
    question: "متى يصلني المبلغ المسترد؟",
    answer:
      "يُعالَج الاسترداد فوراً بعد تأكيد الإلغاء عبر النظام. وصول المبلغ لمحفظتك يستغرق عادةً 1-3 أيام عمل بحسب طريقة الدفع المستخدمة.",
  },
  // -------- Safety --------
  {
    id: "verified-listings",
    categoryId: "safety",
    question: "كيف تتأكَّدون من أن العقارات حقيقية؟",
    answer:
      "كل مضيف يمر بعملية تحقُّق (KYC) قبل عرض عقاراته. نطلب هوية شخصية، إثبات ملكية أو تفويض، وللشركات: سجلاً تجارياً ورخصة. الإعلانات تُراجَع يدوياً قبل النشر.",
  },
  {
    id: "data-privacy",
    categoryId: "safety",
    question: "كيف تحمون بياناتي الشخصية؟",
    answer:
      "بياناتك مشفَّرة أثناء النقل (TLS) وعند التخزين. أرقام الهواتف الكاملة لا تظهر للمستخدمين الآخرين. عناوين العقارات الدقيقة تظهر فقط بعد تأكيد الحجز.",
  },
  {
    id: "fraud-prevention",
    categoryId: "safety",
    question: "ماذا أفعل إذا شككت بمحاولة احتيال؟",
    answer:
      "أبلغنا فوراً عبر زر \"الإبلاغ\" في صفحة العقار أو من خلال صفحة /contact. لا تدفع أبداً خارج المنصة—كل المعاملات لا تكون محمية إلا داخل سُكنى.",
  },
  // -------- Account --------
  {
    id: "create-account",
    categoryId: "account",
    question: "كيف أنشئ حساباً جديداً؟",
    answer:
      "اضغط \"إنشاء حساب\" من القائمة العلوية، أدخل بريدك الإلكتروني وكلمة مرور قوية، ووافق على الشروط. ستصلك رسالة تأكيد على بريدك لتفعيل الحساب.",
  },
  {
    id: "guest-vs-host",
    categoryId: "account",
    question: "هل أحتاج حسابين منفصلين كضيف ومضيف؟",
    answer:
      "لا، حساب واحد يكفي. يمكنك أن تكون ضيفاً ومضيفاً في نفس الوقت. أزرار \"دخول كزبون\" و\"دخول كمؤجِّر\" تختار التجربة فقط، لا الحساب.",
  },
  // -------- Communication --------
  {
    id: "contact-host",
    categoryId: "communication",
    question: "كيف أتواصل مع المضيف؟",
    answer:
      "بعد تأكيد الحجز يفتح لك صندوق رسائل مباشر مع المضيف. قبل تأكيد الحجز لا يمكن إرسال رسائل لأسباب أمنية—جميع الأسئلة العامة تجيب عنها صفحة العقار.",
  },
  {
    id: "support-response",
    categoryId: "communication",
    question: "كم تستغرق استجابة فريق الدعم؟",
    answer:
      "خلال فترة البيتا، الدعم متاح 24/7 عبر WhatsApp والبريد الإلكتروني. متوسط زمن الاستجابة أقل من 30 دقيقة في ساعات الذروة، وأقل من ساعتين ليلاً.",
  },
];

export function findHelpFaqByCategory(categoryId: HelpCategoryId): HelpFaqItem[] {
  return HELP_FAQ.filter((item) => item.categoryId === categoryId);
}
