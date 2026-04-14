"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Link2 } from "lucide-react";

const TYPING_PLACEHOLDERS = [
  "Enter your website to start collabing",
  "Paste your store URL",
  "Drop any product page",
  "Try yourbrand.com",
];

/**
 * Hero "omni-AI box" search input.
 * Rounded pill with link icon on left, animated typing placeholder
 * in the middle, and an arrow button on the right.
 *
 * Matches Figma node 2240:9352 (div.omni-ai-box-container).
 */
export function HeroSearchBox() {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Animated typing placeholder loop
  useEffect(() => {
    if (value) return; // Pause animation once user types

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
      className="relative h-16 w-full rounded-full bg-white shadow-[var(--shadow-card)] ring-1 ring-border-subtle focus-within:ring-2 focus-within:ring-brand-primary/20"
    >
      {/* Left icon */}
      <div className="pointer-events-none absolute left-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full">
        <Link2 className="h-5 w-5 text-content-secondary" strokeWidth={2} />
      </div>

      {/* Input */}
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=""
        aria-label="Enter your website URL"
        className="absolute inset-0 h-full w-full rounded-full bg-transparent pl-[60px] pr-[72px] text-base text-content-primary outline-none placeholder:text-content-tertiary"
      />

      {/* Animated placeholder (shown only when input is empty) */}
      {!value && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[60px] top-1/2 -translate-y-1/2 text-base text-content-tertiary"
        >
          {typed}
          <span className="ml-0.5 inline-block h-[1.1em] w-[1.5px] -translate-y-[-2px] animate-pulse bg-content-tertiary align-middle" />
        </span>
      )}

      {/* Submit button */}
      <button
        type="submit"
        aria-label="Start co-selling"
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-shine text-content-primary transition-colors hover:bg-brand-shine-hover"
      >
        <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </form>
  );
}
