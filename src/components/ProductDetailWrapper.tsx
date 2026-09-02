"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductDetails from "@/components/ProductDetails";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/lib/store";

export default function ProductDetailWrapper({
  id,
  initialProduct,
}: {
  id: string;
  initialProduct?: Product;
}) {
  const { getProductById } = useStore();
  const liveProduct = getProductById(id) || initialProduct;

  if (!liveProduct) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "48px 24px",
          gap: "16px",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "3rem", margin: 0 }}>
          Listing Not Found
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: "420px", fontSize: "14px" }}>
          This product may have been updated or removed from the store catalog.
        </p>
        <Link
          href="/shop"
          className="pill-link"
          style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "10px" }}
        >
          <ArrowLeft size={16} /> Return to Shop
        </Link>
      </div>
    );
  }

  return <ProductDetails product={liveProduct} />;
}
