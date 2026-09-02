import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROUSE STORE | Engineered Modern Apparel & Essentials",
  description: "Discover technical garments, heavyweight hoodies, tactical outerwear, and contemporary footwear crafted with precision architecture.",
  keywords: ["Rouse Store", "streetwear", "technical outerwear", "hoodies", "luxury apparel", "modern fashion"],
  openGraph: {
    title: "ROUSE STORE | Engineered Modern Apparel",
    description: "Autumn/Winter 2026 Collection Drop - Premium streetwear and architectural silhouettes.",
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
