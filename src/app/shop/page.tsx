import type { Metadata } from "next";
import ShopCatalog from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Shop | Raider Station",
  description: "Need a pen, a snack, or a new hoodie? Shop school supplies, snacks, and Raider gear for your day at Rouse.",
};

export default function ShopPage() {
  return <ShopCatalog />;
}
