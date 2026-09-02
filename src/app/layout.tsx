import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import StoreProvider from "@/components/StoreProvider";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-heading", display: "swap" });

export const metadata: Metadata = {
  icons: { icon: "/images/rouse-school-mark.jpg", apple: "/images/rouse-school-mark.jpg" },
  title: "RAIDER STATION | Rouse High School Store — Leander, TX",
  description:
    "Raider Station, a store for the Rouse High School community in Leander, Texas. Explore maroon and gold spirit wear, school supplies, and everyday essentials.",
  keywords: [
    "Raider Station",
    "Rouse High School",
    "Rouse Raiders",
    "Leander ISD",
    "Leander Texas",
    "School Store",
    "Spirit Wear",
    "Varsity Jacket",
  ],
  openGraph: {
    title: "RAIDER STATION | Rouse High School Store",
    description: "For the home crowd. Maroon and gold spirit wear and everyday goods for the Rouse High School community.",
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
    <html lang="en" className={`${sans.variable} ${display.variable}`} data-scroll-behavior="smooth">
      <body><StoreProvider><SiteShell>{children}</SiteShell></StoreProvider></body>
    </html>
  );
}
