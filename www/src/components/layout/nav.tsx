import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { MobileNavToggle } from "./mobile-nav-toggle";

const NAV_LINKS = [
  { label: "Brands", href: "/brands" },
  { label: "Creators", href: "/creators" },
];

/**
 * Primary site navigation.
 *
 * Sticky flush at the top of the viewport. White bg with a subtle bottom
 * border. Mobile: logo left + hamburger right. Desktop: logo left,
 * center links, CTAs right.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-neutral bg-background-elevated/90 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-[var(--container-max)] items-center justify-between px-[var(--section-padding-x)]">
        {/* Logo */}
        <Link
          href="/"
          aria-label="OfferLab home"
          className="flex items-center"
        >
          <Image
            src="/brand/logo/offerlab-lockup-wrapped.svg"
            alt="OfferLab"
            width={129}
            height={48}
            priority
            className="h-8 w-auto md:h-10"
          />
        </Link>

        {/* Center links — desktop only */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link, i) => (
            <span key={link.href} className="flex items-center">
              <Link
                href={link.href}
                className="rounded-md px-3 py-1 text-base font-medium text-content-link transition-colors hover:bg-background-overlay"
              >
                {link.label}
              </Link>
              {i < NAV_LINKS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-1 h-1 w-1 rounded-full bg-content-link/40"
                />
              )}
            </span>
          ))}
        </nav>

        {/* CTA buttons — desktop only */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="https://app.offerlab.com/login"
            className="flex h-11 items-center rounded-full px-4 text-sm font-semibold text-content-primary transition-colors hover:bg-background-overlay"
          >
            Sign in
          </Link>
          <Link
            href="https://app.offerlab.com/signup"
            className="flex h-11 items-center gap-2 rounded-full bg-brand-shine px-4 text-sm font-semibold text-content-primary transition-colors hover:bg-brand-shine-hover"
          >
            Start co-selling
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>

        {/* Mobile — hamburger + primary CTA */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="https://app.offerlab.com/signup"
            className="flex h-10 items-center gap-1.5 rounded-full bg-brand-shine px-3.5 text-sm font-semibold text-content-primary"
          >
            Start
            <Icon name="arrow-right" className="size-4" />
          </Link>
          <MobileNavToggle
            links={NAV_LINKS}
            signInHref="https://app.offerlab.com/login"
          />
        </div>
      </div>
    </header>
  );
}
