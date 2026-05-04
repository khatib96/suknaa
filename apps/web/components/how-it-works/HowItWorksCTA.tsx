import Link from "next/link";

export function HowItWorksCTA() {
  return (
    <section className="bg-cream px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-[#F5EFE6] bg-white p-8 shadow-warm-sm md:p-10">
          <h3 className="text-2xl font-extrabold text-charcoal">جاهز كزبون؟</h3>
          <p className="mt-2 text-sm leading-7 text-charcoal/75">
            ابدأ بتصفُّح آلاف العقارات والفنادق، واحجز ما يناسبك بثقة.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95"
          >
            ابدأ كزبون
          </Link>
        </article>

        <article className="rounded-3xl border border-[#F5EFE6] bg-white p-8 shadow-warm-sm md:p-10">
          <h3 className="text-2xl font-extrabold text-charcoal">جاهز كمضيف؟</h3>
          <p className="mt-2 text-sm leading-7 text-charcoal/75">
            حوِّل عقارك أو فندقك إلى مصدر دخل ثابت مع منصة موثوقة.
          </p>
          <Link
            href="/become-a-host"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#b88a3f] hover:shadow-warm-lg active:scale-95"
          >
            ابدأ كمضيف
          </Link>
        </article>
      </div>
    </section>
  );
}
