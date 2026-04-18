"use client";

import { useEffect, useState, type ReactNode } from "react";

const TYPING_PLACEHOLDERS = [
  "Enter your website to start collabing",
  "Paste your store URL",
  "Drop any product page",
  "Try yourbrand.com",
];

interface HeroSearchBoxProps {
  /** Rendered icon element shown inside the input on the left (server-inlined SVG). */
  leftIcon: ReactNode;
  /** Rendered icon element shown inside the submit button (server-inlined SVG). */
  submitIcon: ReactNode;
}

/**
 * Hero "omni-AI box" URL input with animated typing placeholder.
 *
 * Icons come in as pre-rendered ReactNodes from a server parent so we
 * keep the SVG-from-file system working without importing fs in a
 * client component.
 */
export function HeroSearchBox({ leftIcon, submitIcon }: HeroSearchBoxProps) {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (value) return;

    const current = TYPING_PLACEHOLDERS[placeholderIndex];
    const targetLength = isDeleting ? 0 : current.length;
    const delta = isDeleting ? 30 : 60;

    if (typed.length === targetLength) {
      const pause = isDeleting ? 300 : 2200;
      const t = setTimeout(() => {
        if (isDeleting) {
          setIsDeleting(false);
          setPlaceholderIndex((i) => (i + 1) % TYPING_PLACEHOLDERS.length);
        } else {
          setIsDeleting(true);
        }
      }, pause);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setTyped(
        isDeleting
          ? current.slice(0, typed.length - 1)
          : current.slice(0, typed.length + 1)
      );
    }, delta);
    return () => clearTimeout(t);
  }, [typed, isDeleting, placeholderIndex, value]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative h-14 w-full rounded-full bg-background-elevated shadow-[var(--shadow-card)] ring-1 ring-border-neutral focus-within:ring-2 focus-within:ring-content-primary/20 sm:h-16"
    >
      <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center sm:left-5">
        {leftIcon}
      </div>

      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=""
        aria-label="Enter your website URL"
        className="absolute inset-0 h-full w-full rounded-full bg-transparent pl-12 pr-14 text-base text-content-primary outline-none placeholder:text-content-tertiary sm:pl-14 sm:pr-[72px]"
      />

      {!value && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 truncate pr-14 text-sm text-content-tertiary sm:left-14 sm:text-base"
        >
          {typed}
          <span className="ml-0.5 inline-block h-[1.1em] w-[1.5px] -translate-y-[-2px] animate-pulse bg-content-tertiary align-middle" />
        </span>
      )}

      <button
        type="submit"
        aria-label="Start co-selling"
        className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-shine text-content-primary transition-colors hover:bg-brand-shine-hover sm:right-3 sm:size-12"
      >
        {submitIcon}
      </button>
    </form>
  );
}
