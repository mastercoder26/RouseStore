import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAIDER STATION | Rouse High School Store — Leander, TX",
  description:
    "Official student-centered store for Rouse High School. Spirit wear, heavyweight sideline hoodies, letterman jackets, school supplies, and campus essentials. Made by Raiders, for Raiders.",
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
    description: "Made by Raiders, for Raiders — Creating traditions that others can live up to.",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
