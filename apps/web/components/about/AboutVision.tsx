import { Compass } from "lucide-react";

export function AboutVision() {
  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold text-charcoal md:text-4xl">
              لماذا أُنشئت سُكنى؟
            </h2>
            <p className="mt-2 text-base text-muted">
              المشكلة التي أردنا حلَّها كانت واضحة منذ اليوم الأول.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5 text-base leading-8 text-charcoal/85 md:text-lg md:leading-9">
          <p>
            في سوريا، لا يوجد منصة موحَّدة وموثوقة لحجز السكن. السائحون
            القادمون، أبناء البلد المغتربون، والمسافرون داخلياً يجدون أنفسهم
            بين خيارات مبعثرة على مجموعات Facebook، سماسرة عبر WhatsApp،
            ومواقع فنادق متفرِّقة لا توفِّر تجربة موحَّدة.
          </p>
          <p>
            المنصات الدولية مثل Airbnb و Booking لا تعمل في سوريا. النتيجة:
            تجربة مشوَّشة للضيف، وقناة احترافية مفقودة للمضيف.
          </p>
          <p className="text-charcoal">
            <span className="font-bold text-primary">سُكنى</span> هي الجواب—
            منصة سورية بأيدي سورية، تجمع بين بساطة Airbnb في تأجير البيوت ودقَّة
            Booking في إدارة الفنادق، مع احترام كامل لخصوصية المستخدم وثقافة
            البلد.
          </p>
        </div>
      </div>
    </section>
  );
}
