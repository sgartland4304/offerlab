"use client";

import { type ReactNode } from "react";
import { useParallax } from "@/lib/gsap";

interface ScrollParallaxProps {
  children: ReactNode;
  distance?: number;
  speed?: number;
  className?: string;
}

export function ScrollParallax({
  children,
  distance = 100,
  speed = 1,
  className = "",
}: ScrollParallaxProps) {
  const ref = useParallax<HTMLDivElement>(distance, speed);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
