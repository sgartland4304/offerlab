"use client";

import { useEffect, useState } from "react";
import { IconArrowRight, IconLinkChain } from "@/components/ui/icons";

const TYPING_PLACEHOLDERS = [
  "Enter your website to start collabing",
  "Paste your store URL",
  "Drop any product page",
  "Try yourbrand.com",
];

export function HeroSearchBox() {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [focused, setFocused] = useState(false);

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

  const isActive = focused || !!value;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative w-full rounded-[32px] bg-white/95 p-2 shadow-[0_4px_24px_rgba(0,0,0,0.12),0_0_0_4.5px_rgba(0,0,0,0.04)] outline outline-4 outline-white/20 backdrop-blur-md"
    >
      <div className="relative flex h-12 items-center">
        {/* Left icon — desktop only */}
        <div className="pointer-events-none absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center md:flex">
          <IconLinkChain className="h-5 w-5 text-content-secondary" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=""
          aria-label="Enter your website URL"
          className={`h-full w-full bg-transparent pr-12 pl-5 text-base text-content-primary outline-none md:pl-[52px] ${isActive ? "text-left" : "text-center md:text-left"}`}
        />

        {/* Animated typing placeholder */}
        {!value && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-base text-content-secondary transition-opacity duration-300 left-1/2 -translate-x-1/2 md:left-[52px] md:translate-x-0 ${focused ? "opacity-0" : "opacity-100"}`}
          >
            {typed}
            <span className="ml-0.5 inline-block h-[1.1em] w-[1.5px] -translate-y-[-2px] animate-pulse bg-content-secondary align-middle" />
          </span>
        )}

        {/* Submit button */}
        <button
          type="submit"
          aria-label="Start co-selling"
          className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-shine text-content-primary shadow-[0_4px_24px_rgba(255,237,132,0.8)] transition-transform hover:scale-105 active:scale-95"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
