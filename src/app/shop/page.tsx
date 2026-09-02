import type { Metadata } from "next";
import ShopCatalog from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Shop | Raider Station",
  description: "Browse spirit wear, school supplies, and everyday goods from Raider Station.",
};

export default function ShopPage() {
  return <ShopCatalog />;
}
