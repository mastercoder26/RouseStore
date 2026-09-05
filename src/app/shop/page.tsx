import type { Metadata } from "next";
import { Suspense } from "react";
import ShopCatalog from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Shop | Raider Station",
  description: "Shop school supplies, snacks, accessories, and Rouse High School spirit wear.",
};

export default function ShopPage() {
  return <Suspense fallback={<p className="catalog-loading" role="status">Loading products…</p>}><ShopCatalog /></Suspense>;
}
