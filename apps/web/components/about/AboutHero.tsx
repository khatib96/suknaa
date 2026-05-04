export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-primary via-[#A84A33] to-[#8a3d2a] px-4 pt-32 pb-20 text-white md:px-6 lg:px-8 lg:pt-40 lg:pb-28">
      <div
        aria-hidden
        className="absolute -top-32 -end-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
          عن سُكنى
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
          قصة سُكنى — منصة سورية بأيدي سورية
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90 md:text-xl">
          بدأت سُكنى من إيمان بسيط: السوريون يستحقون منصة موثوقة لاكتشاف وحجز
          السكن في بلدهم، تحترم خصوصيتهم وتدعمهم بلغتهم الأم.
        </p>
      </div>
    </section>
  );
}
