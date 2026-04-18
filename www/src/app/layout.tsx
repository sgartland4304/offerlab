import type { Metadata } from "next";
import { aktivGrotesk, mediaSans } from "@/lib/fonts";
import { Nav } from "@/components/layout/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OfferLab — Your next customer is already someone else's",
    template: "%s | OfferLab",
  },
  description:
    "Bundle your products with other brands, unlock more from every creator, and earn on things you never had to stock or ship.",
  metadataBase: new URL("https://www.offerlab.com"),
  manifest: "/brand/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${aktivGrotesk.variable} ${mediaSans.variable}`}
    >
      <body className="bg-background-elevated text-content-primary antialiased">
        <Nav />
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  );
}
