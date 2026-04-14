"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Floating product card data.
 *
 * Positions are expressed as % of the hero container so the layout
 * scales with viewport width. Cards drift gently up/down continuously,
 * with a slow right-to-left drift applied to the whole track.
 *
 * Inspired by the shop.app hero treatment.
 */
type FloatingCard = {
  id: string;
  size: "sm" | "lg";
  /** Percent from left (relative to hero container) */
  xPct: number;
  /** Offset from top in pixels */
  y: number;
  /** Rotation in degrees */
  rotate: number;
  /** Background placeholder color while images are not wired up */
  tone: string;
  title?: string;
  brands?: string;
};

const CARDS: FloatingCard[] = [
  {
    id: "c1",
    size: "lg",
    xPct: 4,
    y: 60,
    rotate: -4,
    tone: "#f4e6d1",
    title: "The Morning Routine Kit",
    brands: "Brand One × Brand Two × Brand Three",
  },
  {
    id: "c2",
    size: "sm",
    xPct: 12,
    y: 380,
    rotate: 5,
    tone: "#e6d4e4",
  },
  {
    id: "c3",
    size: "lg",
    xPct: 6,
    y: 620,
    rotate: 3,
    tone: "#d4e4d6",
    title: "The Move-In Starter Kit",
    brands: "Brand One × Brand Two × Brand Three",
  },
  {
    id: "c4",
    size: "sm",
    xPct: 20,
    y: 820,
    rotate: -6,
    tone: "#f0dbc9",
  },
  {
    id: "c5",
    size: "lg",
    xPct: 82,
    y: 40,
    rotate: 4,
    tone: "#e8dfd0",
    title: "The New Parent Bundle",
    brands: "Brand One × Brand Two × Brand Three",
  },
  {
    id: "c6",
    size: "sm",
    xPct: 92,
    y: 340,
    rotate: -3,
    tone: "#d5dfe8",
  },
  {
    id: "c7",
    size: "lg",
    xPct: 84,
    y: 580,
    rotate: -5,
    tone: "#f5e7da",
    title: "The Sunday Reset Bundle",
    brands: "Brand One × Brand Two × Brand Three",
  },
  {
    id: "c8",
    size: "sm",
    xPct: 76,
    y: 820,
    rotate: 4,
    tone: "#e2d8e6",
  },
];

export function HeroFloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>("[data-card]");

    // Intro: cards fade + scale + rise in, with a gentle stagger from outside → in.
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.92 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: "expo.out",
      stagger: {
        each: 0.08,
        from: "random",
      },
      delay: 0.2,
    });

    // Continuous gentle floating loop — each card has its own phase.
    const floatTweens = Array.from(cards).map((card, i) => {
      const amp = 10 + (i % 3) * 4; // 10-18px
      const dur = 5 + (i % 4) * 0.8; // 5-7.4s
      return gsap.to(card, {
        y: `+=${amp}`,
        duration: dur,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.15,
      });
    });

    // Slow right-to-left drift for the whole formation.
    const driftTween = gsap.to(cards, {
      x: "-=30",
      duration: 12,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.3,
        from: "start",
      },
    });

    return () => {
      floatTweens.forEach((t) => t.kill());
      driftTween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="relative mx-auto h-full max-w-[1680px]">
        {CARDS.map((card) => (
          <FloatingCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function FloatingCard({ card }: { card: FloatingCard }) {
  const isLarge = card.size === "lg";
  const width = isLarge ? 205 : 140;
  const height = isLarge ? 245 : 140;

  return (
    <div
      data-card
      className="absolute origin-center"
      style={{
        left: `${card.xPct}%`,
        top: `${card.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${card.rotate}deg)`,
      }}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-2xl)] bg-white p-3 shadow-[var(--shadow-card)]">
        {/* Product image placeholder — swap for real <Image> when assets arrive */}
        <div
          className="relative flex-1 rounded-[var(--radius-lg)]"
          style={{ background: card.tone }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-content-primary"
            >
              <path d="M20 7 12 3 4 7v10l8 4 8-4V7Z" />
              <path d="m4 7 8 4 8-4" />
              <path d="M12 21V11" />
            </svg>
          </div>
        </div>

        {/* Caption (large cards only) */}
        {isLarge && card.title && (
          <div className="mt-3 px-1 pb-1">
            <p className="truncate text-xs font-semibold text-content-primary">
              {card.title}
            </p>
            <p className="truncate text-xs text-content-secondary">
              {card.brands}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
