import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-surface-page text-content-primary">
        {/* Outer page padding creates the inset around the rounded body */}
        <div className="min-h-dvh p-4">
          {/* Rounded body container */}
          <div className="relative isolate overflow-hidden rounded-[28px] bg-[#F7F5F0]">
            <Nav />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
