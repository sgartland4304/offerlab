import localFont from "next/font/local";

/**
 * Aktiv Grotesk — primary typeface for body copy, UI, and nav.
 * Regular (400), Medium (500), SemiBold (600).
 */
export const aktivGrotesk = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    {
      path: "../app/fonts/AktivGrotesk/AktivGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/AktivGrotesk/AktivGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../app/fonts/AktivGrotesk/AktivGrotesk-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

/**
 * Media Sans (SemiCondensed Bold) — display typeface for large headlines.
 * Other widths (Condensed, Extended, ExtraCondensed, Regular) are
 * shipped alongside but registered separately if needed per design.
 */
export const mediaSans = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    {
      path: "../app/fonts/MediaSans/MediaSansSemiCondensedWeb-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});
