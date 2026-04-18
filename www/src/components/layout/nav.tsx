import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

export function Nav() {
  return (
    <nav className="relative flex h-[100px] w-full items-end justify-between px-4 pb-4">
      {/* Logo */}
      <Link href="/" aria-label="OfferLab" className="flex items-center">
        <OfferLabLogo />
      </Link>

      {/* Center links — absolutely centered so they're independent of logo/button widths */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center">
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
    </nav>
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
      <rect width="32" height="32" rx="8" fill="#342e26" />
      <path
        d="M10 10h5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm2 3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1Zm8-3h2v9h3v3h-5V10Z"
        fill="#ffed84"
      />
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
