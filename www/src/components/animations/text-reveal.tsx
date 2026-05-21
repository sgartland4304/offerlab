"use client";

import { useCallback, type ReactNode } from "react";
import { useScrollTrigger } from "@/lib/gsap";

interface TextRevealProps {
  children: ReactNode;
  /** "lines" splits by <br> or block children, "words" wraps each word, "chars" wraps each character */
  splitBy?: "lines" | "words" | "chars";
  duration?: number;
  stagger?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

/**
 * Scroll-triggered text reveal animation.
 * Wraps children in a clip container and animates them up with stagger.
 *
 * For "words" and "chars" modes, pass plain text as children.
 * For "lines" mode, pass any block content.
 */
export function TextReveal({
  children,
  splitBy = "lines",
  duration = 0.7,
  stagger = 0.05,
  className = "",
  as: Tag = "div",
}: TextRevealProps) {
  const animate = useCallback(
    (el: HTMLDivElement, tl: gsap.core.Timeline) => {
      const items = el.querySelectorAll("[data-reveal-item]");
      if (items.length === 0) return;

      tl.from(items, {
        yPercent: 110,
        opacity: 0,
        duration,
        stagger,
        ease: "expo.out",
      });
    },
    [duration, stagger]
  );

  const ref = useScrollTrigger(animate);

  const renderContent = () => {
    if (typeof children !== "string") {
      // For non-string children in "lines" mode, just wrap each child
      return children;
    }

    if (splitBy === "words") {
      return children.split(/\s+/).map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span data-reveal-item className="inline-block">
            {word}
          </span>
          {" "}
        </span>
      ));
    }

    if (splitBy === "chars") {
      return children.split("").map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span data-reveal-item className="inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ));
    }

    // lines mode for string
    return (
      <span className="overflow-hidden block">
        <span data-reveal-item className="block">
          {children}
        </span>
      </span>
    );
  };

  return (
    <Tag ref={ref} className={className}>
      {renderContent()}
    </Tag>
  );
}
