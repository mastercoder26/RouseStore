import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import StoreProvider from "@/components/StoreProvider";
import SiteShell from "@/components/SiteShell";
import SmoothScroll from "@/components/SmoothScroll";
import { INTRO_BOOTSTRAP } from "@/lib/intro";
import { THEME_BOOTSTRAP } from "@/lib/theme-bootstrap";
import "lenis/dist/lenis.css";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-heading", display: "swap" });

export const metadata: Metadata = {
  icons: { icon: "/images/rouse-school-mark.png", apple: "/images/rouse-school-mark.png" },
  title: "Raider Station | Your Rouse Student Store",
  description:
    "Your school-day essentials, Rouse. Browse school supplies, snacks, and Raider gear at Raider Station, your student store.",
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
    title: "Raider Station | Your Rouse Student Store",
    description: "For the school day. School supplies, snacks, and Raider gear for Rouse students.",
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
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} />
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
