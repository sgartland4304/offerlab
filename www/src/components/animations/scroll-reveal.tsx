"use client";

import { useCallback, type ReactNode } from "react";
import { useScrollTrigger } from "@/lib/gsap";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "span";
  /** Selector for children to stagger. If set, staggers matched children instead of animating container. */
  staggerChildren?: string;
  start?: string;
}

const directionOffset: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollReveal({
  children,
  direction = "up",
  distance,
  duration = 0.8,
  delay = 0,
  stagger = 0.1,
  className = "",
  as: Tag = "div",
  staggerChildren,
  start = "top 85%",
}: ScrollRevealProps) {
  const offset = directionOffset[direction];
  const dist = distance ?? Math.abs(offset.x || offset.y);

  const animate = useCallback(
    (el: HTMLDivElement, tl: gsap.core.Timeline) => {
      const targets = staggerChildren ? el.querySelectorAll(staggerChildren) : [el];
      const xVal = offset.x !== 0 ? (offset.x > 0 ? dist : -dist) : 0;
      const yVal = offset.y !== 0 ? (offset.y > 0 ? dist : -dist) : 0;

      tl.from(targets, {
        opacity: 0,
        x: xVal,
        y: yVal,
        duration,
        delay,
        stagger: staggerChildren ? stagger : 0,
        ease: "expo.out",
      });
    },
    [offset, dist, duration, delay, stagger, staggerChildren]
  );

  const ref = useScrollTrigger(animate, { start });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
