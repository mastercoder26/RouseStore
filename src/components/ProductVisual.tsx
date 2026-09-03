"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/store";

export default function ProductVisual({
  product,
  sizes = "(max-width: 600px) 50vw, 25vw",
  priority = false,
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  const hasImage = Boolean(product.image && !imgError);
  const isExternal = product.image?.startsWith("http") || product.image?.startsWith("data:");

  if (hasImage) {
    return (
      <div className="product-visual-wrap" style={{ position: "relative", width: "100%", height: "100%", background: "var(--photo-surface)", overflow: "hidden" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={isExternal}
          onError={() => setImgError(true)}
          className="product-photo"
          style={{ objectFit: "cover", transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </div>
    );
  }

  // Refined editorial varsity studio placeholder when image is not present
  return (
    <div
      className="product-studio-placeholder"
      role="img"
      aria-label={`${product.name} studio card`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-surface)",
        color: "var(--ink)",
        position: "relative",
        padding: "24px 16px",
        textAlign: "center",
        userSelect: "none",
        border: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "1.5px solid var(--maroon)",
          color: "var(--maroon)",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 600,
          lineHeight: 1,
          marginBottom: "12px",
          backgroundColor: "var(--bg-card)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        R
      </div>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--maroon)",
          marginBottom: "4px",
        }}
      >
        {product.category}
      </span>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--muted)",
          maxWidth: "85%",
          lineHeight: 1.3,
        }}
      >
        {product.name}
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "12px",
          fontSize: "9px",
          letterSpacing: "0.08em",
          color: "var(--muted)",
          opacity: 0.7,
          textTransform: "uppercase",
        }}
      >
        Raider Station
      </span>
    </div>
  );
}
