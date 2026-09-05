import type { Metadata } from "next";
import { DM_Sans, Fraunces, Instrument_Serif } from "next/font/google";
import StoreProvider from "@/components/StoreProvider";
import SiteShell from "@/components/SiteShell";
import SmoothScroll from "@/components/SmoothScroll";
import { INTRO_BOOTSTRAP, INTRO_STYLE } from "@/lib/intro";
import { THEME_BOOTSTRAP } from "@/lib/theme-bootstrap";
import "lenis/dist/lenis.css";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-heading", display: "swap" });
const brand = Fraunces({ subsets: ["latin"], variable: "--font-brand", display: "swap" });

export const metadata: Metadata = {
  icons: { icon: "/images/rouse-school-mark.png", apple: "/images/rouse-school-mark.png" },
  title: "Raider Station | Rouse High School Student Store",
  description: "Shop school supplies, snacks, accessories, and Rouse High School spirit wear.",
  keywords: [
    "Raider Station",
    "Rouse High School",
    "Rouse Raiders",
    "Leander ISD",
    "Rouse Student Store",
    "School Store",
    "Spirit Wear",
    "School Supplies",
  ],
  openGraph: {
    title: "Raider Station | Rouse High School Student Store",
    description: "Shop school supplies, snacks, accessories, and Rouse High School spirit wear.",
    url: "https://rouse-store-seven.vercel.app",
    siteName: "Raider Station",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${brand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} />
        <style dangerouslySetInnerHTML={{ __html: INTRO_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <SmoothScroll>
            <SiteShell>{children}</SiteShell>
          </SmoothScroll>
        </StoreProvider>
      </body>
    </html>
  );
}
