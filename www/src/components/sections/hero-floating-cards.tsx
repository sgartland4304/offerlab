"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type CardGroup = {
  id: string;
  large: {
    leftPct: number;
    topPct: number;
    title: string;
    brands: string;
    tone: string;
  };
  small: {
    leftPct: number;
    topPct: number;
    tone: string;
  };
};

const CARD_GROUPS: CardGroup[] = [
  {
    id: "top-left",
    large: {
      leftPct: 1.5,
      topPct: 16.5,
      title: "The Move-In Kitchen Kit",
      brands: "Mise × Cupboard × Foyer",
      tone: "#e8dfd0",
    },
    small: {
      leftPct: 11.7,
      topPct: 9.9,
      tone: "#d4e8d6",
    },
  },
  {
    id: "top-right",
    large: {
      leftPct: 72,
      topPct: 5.6,
      title: "The New Parent Bundle",
      brands: "Latch × Tenderly × Hush",
      tone: "#f0dbc9",
    },
    small: {
      leftPct: 80,
      topPct: 27.2,
      tone: "#f5e0e8",
    },
  },
  {
    id: "bottom-left",
    large: {
      leftPct: 8.3,
      topPct: 71.1,
      title: "The Dog Walk Set",
      brands: "Fetch × Trail × Paws",
      tone: "#e6d4e4",
    },
    small: {
      leftPct: 4.5,
      topPct: 57.9,
      tone: "#f5dbc5",
    },
  },
  {
    id: "bottom-right",
    large: {
      leftPct: 78,
      topPct: 59.7,
      title: "The Sunday Reset Bundle",
      brands: "Marisol × Reverie × Bask",
      tone: "#f5e7da",
    },
    small: {
      leftPct: 68,
      topPct: 75.9,
      tone: "#d5dfe8",
    },
  },
];

export function HeroFloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>("[data-card]");

    gsap.set(cards, {
      rotateY: -90,
      opacity: 0,
      transformPerspective: 800,
      transformOrigin: "center center",
    });

    gsap.to(cards, {
      rotateY: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power2.out",
      stagger: {
        each: 0.08,
        from: "random",
      },
      delay: 0.3,
    });

    const floatTweens = Array.from(cards).map((card, i) => {
      const amp = 8 + (i % 3) * 4;
      const dur = 5 + (i % 4) * 0.8;
      return gsap.to(card, {
        y: `+=${amp}`,
        duration: dur,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.9 + i * 0.15,
      });
    });

    return () => {
      floatTweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      <div className="relative mx-auto h-full max-w-[1680px]">
        {CARD_GROUPS.map((group) => (
          <div key={group.id}>
            <LargeCard card={group.large} />
            <SmallTile tile={group.small} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LargeCard({
  card,
}: {
  card: CardGroup["large"];
}) {
  return (
    <div
      data-card
      className="absolute"
      style={{
        left: `${card.leftPct}%`,
        top: `${card.topPct}%`,
        width: "204px",
      }}
    >
      <div className="flex w-full flex-col gap-[6px] rounded-[28px] border border-border-subtle bg-white p-[13px] shadow-[8px_8px_32px_rgba(0,0,0,0.1)]">
        <div
          className="aspect-square w-full rounded-[16px]"
          style={{ background: card.tone }}
        />
        <div className="px-[1.5px]">
          <p className="truncate text-xs font-semibold leading-[16px] tracking-[-0.2px] text-content-primary">
            {card.title}
          </p>
          <p className="truncate text-xs leading-[16px] tracking-[-0.2px] text-content-tertiary">
            {card.brands}
          </p>
        </div>
      </div>
    </div>
  );
}

function SmallTile({
  tile,
}: {
  tile: CardGroup["small"];
}) {
  return (
    <div
      data-card
      className="absolute"
      style={{
        left: `${tile.leftPct}%`,
        top: `${tile.topPct}%`,
        width: "140px",
        height: "140px",
      }}
    >
      <div
        className="h-full w-full overflow-hidden rounded-[28px] border border-white shadow-[8px_8px_64px_rgba(0,0,0,0.1)]"
        style={{ background: tile.tone }}
      />
    </div>
  );
}
