/**
 * Hero floating product cards.
 *
 * Pure-CSS infinite conveyor that:
 *   1. On load, flips each card in with a 3D rotateY reveal, staggered.
 *   2. Continuously drifts cards right-to-left across the hero.
 *   3. Fades out as a card approaches the center (where hero text sits).
 *   4. Resets off-screen right and flips back in — repeat forever.
 *
 * All motion is driven by the `hero-card-drift` @keyframes defined in
 * globals.css, controlled per-card via CSS custom properties:
 *   --card-travel: horizontal distance to cover (px, negative = leftward)
 *   animation-duration, animation-delay
 *
 * Cards are absolutely positioned on left/right bands (outside the
 * headline column) so they never directly overlap the text on any
 * viewport size. On mobile, the card count is reduced via CSS.
 */

type Card = {
  id: string;
  /** Which side of the hero the card lives on */
  side: "left" | "right";
  /** Row position as % from top of hero (0–100) */
  topPct: number;
  /** Horizontal offset from its side (px) — how far from the edge */
  offset: number;
  /** Card size variant */
  size: "sm" | "lg";
  /** Rotation at rest (deg) */
  rotate: number;
  /** Placeholder tint while product images are unwired */
  tone: string;
  /** Animation duration in seconds (slower = calmer) */
  duration: number;
  /** Delay before first appearance (seconds) */
  delay: number;
  /** How far to travel left per cycle (negative px) */
  travel: number;
  title?: string;
  brands?: string;
  /** If true, hidden on mobile (viewport < sm) */
  desktopOnly?: boolean;
};

const CARDS: Card[] = [
  // Right column — these are closer to where text is; fade-out point matters most
  {
    id: "r1",
    side: "right",
    topPct: 8,
    offset: 32,
    size: "lg",
    rotate: 3,
    tone: "#e8dfd0",
    duration: 26,
    delay: 0.2,
    travel: 560,
    title: "The New Parent Bundle",
    brands: "Brand One × Brand Two",
  },
  {
    id: "r2",
    side: "right",
    topPct: 36,
    offset: 6,
    size: "sm",
    rotate: -3,
    tone: "#d5dfe8",
    duration: 22,
    delay: 0.5,
    travel: 520,
    desktopOnly: true,
  },
  {
    id: "r3",
    side: "right",
    topPct: 58,
    offset: 28,
    size: "lg",
    rotate: -5,
    tone: "#f5e7da",
    duration: 28,
    delay: 0.8,
    travel: 600,
    title: "The Sunday Reset Bundle",
    brands: "Brand One × Brand Two",
  },
  {
    id: "r4",
    side: "right",
    topPct: 82,
    offset: 14,
    size: "sm",
    rotate: 4,
    tone: "#e2d8e6",
    duration: 24,
    delay: 1.1,
    travel: 540,
    desktopOnly: true,
  },
  // Left column — drift leftward then reset on the far right band (off-screen)
  {
    id: "l1",
    side: "left",
    topPct: 14,
    offset: 6,
    size: "lg",
    rotate: -4,
    tone: "#f4e6d1",
    duration: 30,
    delay: 0.4,
    travel: 400,
    title: "The Morning Routine Kit",
    brands: "Brand One × Brand Two",
  },
  {
    id: "l2",
    side: "left",
    topPct: 42,
    offset: 18,
    size: "sm",
    rotate: 5,
    tone: "#e6d4e4",
    duration: 25,
    delay: 0.6,
    travel: 380,
    desktopOnly: true,
  },
  {
    id: "l3",
    side: "left",
    topPct: 62,
    offset: 4,
    size: "lg",
    rotate: 3,
    tone: "#d4e4d6",
    duration: 29,
    delay: 0.9,
    travel: 420,
    title: "The Move-In Kitchen Kit",
    brands: "Brand One × Brand Two",
  },
  {
    id: "l4",
    side: "left",
    topPct: 86,
    offset: 22,
    size: "sm",
    rotate: -6,
    tone: "#f0dbc9",
    duration: 23,
    delay: 1.2,
    travel: 400,
    desktopOnly: true,
  },
];

export function HeroFloatingCards() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1200px]"
    >
      {CARDS.map((card) => (
        <FloatingCard key={card.id} card={card} />
      ))}
    </div>
  );
}

function FloatingCard({ card }: { card: Card }) {
  const isLarge = card.size === "lg";
  const width = isLarge ? 200 : 132;
  const height = isLarge ? 240 : 132;

  // Position: stick to left or right band of hero, pulled inward by `offset` px.
  // Travel is applied as an inline CSS variable so keyframes can use it.
  const positionStyle: React.CSSProperties =
    card.side === "right"
      ? { right: `${card.offset}px` }
      : { left: `${card.offset}px` };

  // For left-side cards, travel is positive (moving RIGHT off-screen then back left).
  // For right-side cards, travel is negative (moving LEFT toward center).
  // We always express drift as "start -> left movement" in the keyframes, so invert
  // the sign for the left-column cards which actually start from far-left.
  const travel = card.side === "right" ? -card.travel : -card.travel;

  return (
    <div
      className={`absolute will-change-transform ${card.desktopOnly ? "hidden sm:block" : ""}`}
      style={{
        ...positionStyle,
        top: `${card.topPct}%`,
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: "preserve-3d",
        animation: `hero-card-drift ${card.duration}s linear ${card.delay}s infinite`,
        // @ts-expect-error -- CSS custom property
        "--card-travel": `${travel}px`,
      }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-background-elevated p-3 shadow-[var(--shadow-card)]"
        style={{ transform: `rotate(${card.rotate}deg)` }}
      >
        {/* Product image placeholder — swap for real <Image> when product assets are ready */}
        <div
          className="relative flex-1 rounded-xl"
          style={{ background: card.tone }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-content-primary/30">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 7 12 3 4 7v10l8 4 8-4V7Z" />
              <path d="m4 7 8 4 8-4" />
              <path d="M12 21V11" />
            </svg>
          </div>
        </div>

        {isLarge && card.title && (
          <div className="mt-2.5 px-1 pb-0.5">
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
