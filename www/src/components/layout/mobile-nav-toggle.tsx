"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MobileNavToggleProps {
  links: { label: string; href: string }[];
  signInHref: string;
}

/**
 * Mobile hamburger toggle + slide-down menu panel.
 * Opens a fullscreen overlay on tap. Closes on link click or Escape.
 */
export function MobileNavToggle({ links, signInHref }: MobileNavToggleProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 items-center justify-center rounded-full hover:bg-background-overlay"
      >
        <span className="relative block h-4 w-5">
          <span
            className={`absolute left-0 top-0 block h-0.5 w-full bg-content-primary transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] block h-0.5 w-full bg-content-primary transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute bottom-0 left-0 block h-0.5 w-full bg-content-primary transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-x-0 top-[var(--nav-height)] z-40 border-t border-border-neutral bg-background-elevated md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <nav
            aria-label="Mobile"
            className="flex flex-col gap-1 px-[var(--section-padding-x)] py-6"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-xl font-medium text-content-link hover:bg-background-overlay"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-border-neutral pt-4">
              <Link
                href={signInHref}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-3 text-xl font-medium text-content-primary hover:bg-background-overlay"
              >
                Sign in
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
