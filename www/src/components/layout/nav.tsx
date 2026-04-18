import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

/**
 * Main site navigation.
 *
 * Floats at the top-center of the rounded body container with:
 *  - White pill-shaped bar with bottom-only rounded corners (24px)
 *  - Left/right SVG "cutout" corners where the nav meets the body container
 *  - Logo left, links center, buttons right
 */
export function Nav() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center">
      <nav className="pointer-events-auto relative">
        {/* Main nav bar */}
        <div className="relative flex h-[100px] w-[1000px] items-center justify-between rounded-b-[24px] bg-white px-4 shadow-[var(--shadow-nav)]">
          {/* Logo */}
          <Link
            href="/"
            aria-label="OfferLab"
            className="ml-4 flex items-center"
          >
            <OfferLabLogo />
          </Link>

          {/* Center links */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center">
            <NavLink href="/brands">Brands</NavLink>
            <span
              aria-hidden="true"
              className="mx-2 block h-1 w-1 rounded-full bg-content-primary"
            />
            <NavLink href="/creators">Creators</NavLink>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="https://app.offerlab.com/login"
              className="flex h-12 items-center rounded-full px-[18px] text-sm font-semibold text-content-primary transition-colors hover:bg-[var(--content-background-overlay)]"
            >
              Sign in
            </Link>
            <Link
              href="https://app.offerlab.com/signup"
              className="flex h-12 items-center gap-2 rounded-full bg-brand-shine px-[18px] text-sm font-semibold text-content-primary transition-colors hover:bg-brand-shine-hover"
            >
              Start co-selling
              <IconArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Cutout corners: inverse-rounded SVGs flank the nav,
            creating the illusion that the nav is punched into the body container */}
        <CutoutCorner className="absolute -left-[26px] top-0" />
        <CutoutCorner className="absolute -right-[26px] top-0 -scale-x-100" />
      </nav>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-12 items-center justify-center rounded-full px-3 py-2 text-base font-medium text-brand-accent transition-colors hover:bg-[var(--content-background-overlay)]"
    >
      {children}
    </Link>
  );
}

/**
 * Inverse rounded corner. Draws a 26x42 shape that fills the space
 * between the nav's straight bottom edge and the body container's rounded top.
 * Think of it as "negative space" around the nav bar.
 */
function CutoutCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      width="26"
      height="42"
      viewBox="0 0 26 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 0H26V42C26 30.402 16.598 21 5 21H0V0Z"
        fill="white"
      />
      <path
        d="M26 42C26 30.402 16.598 21 5 21H0"
        stroke="transparent"
      />
    </svg>
  );
}

function OfferLabLogo() {
  return (
    <svg
      width="144"
      height="32"
      viewBox="0 0 144 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Logomark — rounded square with "OL" monogram.
          Swap this for the real brand mark when assets land. */}
      <rect width="32" height="32" rx="8" fill="#342e26" />
      <path
        d="M10 10h5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm2 3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1Zm8-3h2v9h3v3h-5V10Z"
        fill="#ffed84"
      />
      {/* Wordmark */}
      <text
        x="41"
        y="22"
        fontFamily="inherit"
        fontSize="17"
        fontWeight="700"
        fill="#342e26"
        letterSpacing="-0.01em"
      >
        OfferLab
      </text>
    </svg>
  );
}
