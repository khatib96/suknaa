import { HOST_STATS } from "@/data/host-stats";

export function LiveNumbersStrip() {
  if (HOST_STATS.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-[#F5EFE6] bg-cream px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {HOST_STATS.map((stat) => (
            <li key={stat.id} className="text-center">
              <p className="font-numeric text-4xl font-extrabold text-primary md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted md:text-base">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
