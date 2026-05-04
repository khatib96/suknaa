import { HeroPresentation } from "@/components/home/HeroPresentation";
import { HeroSearchBar } from "@/components/home/HeroSearchBar";
import { FloatingMapPreview } from "@/components/home/MapExplorer";

export function Hero() {
  return (
    <section className="relative z-20 flex min-h-dvh items-center justify-center px-4 pb-44 pt-safe md:min-h-[88vh] md:px-6 md:pb-56 md:pt-28 lg:px-8">
      <HeroPresentation footer={<HeroSearchBar />}>
        <h1 className="max-w-[20ch] text-3xl font-extrabold leading-tight text-white sm:max-w-none sm:text-4xl md:text-5xl lg:text-6xl">
          سكنك في كل مكان بسوريا
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/90 sm:mt-4 md:text-lg lg:mt-4 lg:text-2xl">
          واكتشف أفضل الأماكن للإقامة بأسعار تناسبك
        </p>
      </HeroPresentation>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden translate-y-1/2 px-4 md:block md:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FloatingMapPreview className="pointer-events-auto" />
        </div>
      </div>
    </section>
  );
}
