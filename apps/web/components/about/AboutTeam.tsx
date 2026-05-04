import { Users2 } from "lucide-react";

export function AboutTeam() {
  return (
    <section className="bg-cream px-4 py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <Users2 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-3xl font-extrabold text-charcoal md:text-4xl">
          الفريق
        </h2>
        <p className="mt-4 text-base leading-8 text-charcoal/80 md:text-lg md:leading-9">
          فريق صغير مؤمن بالمشروع، يتكوَّن من مهندسين، مصمِّمين، ومتخصِّصين في
          الضيافة. كلنا سوريون، نعمل من سوريا، ونبني سُكنى لأهلنا.
        </p>
        <p className="mt-3 text-sm text-muted">
          (تفاصيل الفريق ستُعرض قريباً مع صور وأدوار رسمية.)
        </p>
      </div>
    </section>
  );
}
