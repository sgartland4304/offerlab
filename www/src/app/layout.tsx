import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/layout/nav";
import "./globals.css";

const mediaSans = localFont({
  src: [
    {
      path: "../../assets/fonts/Media-Sans/MediaSansSemiCondensedWeb-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-media-sans",
  display: "swap",
});

const aktivGrotesk = localFont({
  src: [
    {
      path: "../../assets/fonts/AktivGrotesk/AktivGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/AktivGrotesk/AktivGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/AktivGrotesk/AktivGrotesk-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-aktiv-grotesk",
  display: "swap",
});

const fragmentMono = localFont({
  src: [
    {
      path: "../../assets/fonts/Fragment_Mono/FragmentMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Fragment_Mono/FragmentMono-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-fragment-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OfferLab — Your next customer is already someone else's",
    template: "%s | OfferLab",
  },
  description:
    "Bundle your products with other brands, unlock more from every creator, and earn on things you never had to stock or ship.",
  metadataBase: new URL("https://www.offerlab.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`antialiased ${mediaSans.variable} ${aktivGrotesk.variable} ${fragmentMono.variable}`}
    >
      <body className="bg-surface-page text-content-primary">
        <div className="px-4 pb-4">
          <div className="relative isolate min-h-dvh overflow-hidden rounded-b-[28px] bg-white">
            <Nav />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
