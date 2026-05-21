import { HeroFloatingCards } from "./hero-floating-cards";
import { HeroSearchBox } from "./hero-search-box";

/**
 * Homepage hero section.
 *
 * Layout:
 *  - Full-width, centered column for headline + subhead + search input
 *  - Absolutely positioned floating product cards behind & around the copy
 *  - Cards drift right-to-left with gentle floating motion (shop.app-style)
 */
export function Hero() {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-background-base">
      {/* Background floating cards — render first so they sit behind text */}
      <HeroFloatingCards />

      {/* Foreground content — centered both axes within the full-height hero */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1680px] flex-col items-center justify-center px-8 text-center">
        <h1 className="mx-auto max-w-[1100px] text-balance font-display text-[clamp(3rem,7vw,112px)] font-bold leading-[0.95] tracking-[var(--tracking-tight)] text-content-primary">
          Your next customer is already
          <br />
          <span className="italic">someone else&rsquo;s</span>
        </h1>

        <p className="mx-auto mt-8 max-w-[480px] text-balance text-base leading-relaxed text-content-secondary">
          Bundle your products with other brands, unlock more from every
          creator, and earn on things you never had to stock or ship.
        </p>

        <div className="mt-10 w-full max-w-[600px]">
          <HeroSearchBox />
        </div>
      </div>
    </section>
  );
}
