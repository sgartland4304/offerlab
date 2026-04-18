import { Icon } from "@/components/ui/icon";
import { HeroFloatingCards } from "./hero-floating-cards";
import { HeroSearchBox } from "./hero-search-box";

/**
 * Homepage hero.
 *
 * Always fills the full viewport (min-h-dvh) so the next section starts
 * below the fold on every device. Uses the "background base" (cream)
 * surface as a visual accent against the white elevated body default.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background-base">
      {/* Floating product cards — background layer */}
      <HeroFloatingCards />

      {/* Foreground content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[var(--container-max)] flex-col items-center px-[var(--section-padding-x)] text-center">
        <h1 className="text-display-hero text-content-primary text-[clamp(2.75rem,7vw,112px)]">
          Your next customer is
          <br className="hidden sm:inline" />
          <span className="sm:hidden"> </span>
          already <span className="italic">someone else&rsquo;s</span>
        </h1>

        <p className="mt-6 max-w-[480px] text-balance text-base leading-relaxed text-content-secondary sm:mt-8 sm:text-md">
          Bundle your products with other brands, unlock more from every
          creator, and earn on things you never had to stock or ship.
        </p>

        <div className="mt-8 w-full max-w-[600px] sm:mt-10">
          <HeroSearchBox
            leftIcon={<Icon name="chain-link-4" className="size-5 text-content-secondary" />}
            submitIcon={<Icon name="arrow-right" className="size-5 text-content-primary" />}
          />
        </div>
      </div>
    </section>
  );
}
