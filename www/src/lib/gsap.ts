"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook that creates a GSAP ScrollTrigger on a ref element.
 * Returns a ref to attach to the animated container.
 */
export function useScrollTrigger<T extends HTMLElement = HTMLDivElement>(
  animation: (el: T, tl: gsap.core.Timeline) => void,
  triggerOptions?: ScrollTrigger.Vars
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none none",
        ...triggerOptions,
      },
    });

    animation(el, tl);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [animation, triggerOptions]);

  return ref;
}

/**
 * Hook for parallax scroll effects.
 * Moves the element by `distance` pixels as it scrolls through the viewport.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  distance: number = 100,
  speed: number = 1
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.to(el, {
      y: distance * speed,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [distance, speed]);

  return ref;
}

/**
 * Hook for pinned scroll sections (horizontal scroll, step reveals, etc.)
 */
export function usePinnedScroll<T extends HTMLElement = HTMLDivElement>(
  animation: (el: T, tl: gsap.core.Timeline) => void,
  options?: { scrub?: boolean | number; end?: string }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: options?.end ?? "+=200%",
        pin: true,
        scrub: options?.scrub ?? 1,
        anticipatePin: 1,
      },
    });

    animation(el, tl);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [animation, options]);

  return ref;
}

/**
 * Batch refresh ScrollTrigger — call after layout changes or dynamic content loads.
 */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

/**
 * Re-export gsap and ScrollTrigger for direct use when hooks aren't enough.
 */
export { gsap, ScrollTrigger };
