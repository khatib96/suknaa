import Link from "next/link";

export function AboutCTA() {
  return (
    <section className="bg-white px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-bl from-primary via-[#A84A33] to-[#8a3d2a] p-10 text-center text-white shadow-warm-lg md:p-16">
        <h2 className="text-3xl font-extrabold md:text-4xl">انضم لنا</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/90 md:text-lg">
          سواء كنت تبحث عن مكان لإقامتك القادمة أو لديك عقار تريد عرضه، سُكنى
          هي بيتك الرقمي.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-warm-md transition-all duration-200 hover:bg-cream active:scale-95"
          >
            ابدأ كزبون
          </Link>
          <Link
            href="/become-a-host"
            className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/15"
          >
            ابدأ كمضيف
          </Link>
        </div>
      </div>
    </section>
  );
}
