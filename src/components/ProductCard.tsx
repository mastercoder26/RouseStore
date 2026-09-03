"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Plus, X } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import { ProductRatingBadge } from "@/components/reviews";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, type Product } from "@/lib/store";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart } = useStore();
  const [pickingSize, setPickingSize] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const picker = useRef<HTMLDivElement>(null);
  const soldOut = product.inStock === false;
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (pickingSize) picker.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [pickingSize]);

  function closePicker() {
    setPickingSize(false);
    requestAnimationFrame(() => addButton.current?.focus());
  }
  function add(size?: string) {
    if (soldOut) return;
    addToCart(product, size);
    closePicker();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="product-card">
      <Link className="product-image-button" href={`/shop/${product.id}`} aria-label={`View ${product.name}`}>
        <span className="product-badge">{soldOut ? "Sold out" : product.tag || product.category}</span>
        <ProductVisual product={product} priority={priority} sizes="(max-width: 600px) 50vw, (max-width: 900px) 45vw, 30vw" />
        <span className="product-view" aria-hidden="true"><ArrowUpRight size={20} /></span>
      </Link>
      <div className="product-details">
        <div>
          <span className="product-category">{product.category}</span>
          <h3><Link className="product-name" href={`/shop/${product.id}`}>{product.name}</Link></h3>
        </div>
        <div className="product-price-block">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.originalPrice && <span className="product-original-price">{formatPrice(product.originalPrice)}</span>}
        </div>
      </div>
      <div className="product-rating"><ProductRatingBadge productId={product.id} size="sm" linkToReviews /></div>
      {pickingSize ? (
        <div className="card-size-picker" ref={picker} role="group" aria-label={`Choose size for ${product.name}`} onKeyDown={(event) => { if (event.key === "Escape") closePicker(); }}>
          {product.sizes?.map((size) => <button key={size} type="button" onClick={() => add(size)} aria-label={`Add ${product.name}, size ${size}`}>{size}</button>)}
          <button type="button" aria-label="Cancel size selection" onClick={closePicker}><X size={16} /></button>
        </div>
      ) : (
        <button ref={addButton} type="button" className="quick-add" disabled={soldOut} onClick={() => product.sizes?.length ? setPickingSize(true) : add()} aria-label={soldOut ? `${product.name} sold out` : product.sizes?.length ? `Select size for ${product.name}` : `Add to bag: ${product.name}`}>
          <span>{soldOut ? "Sold out" : added ? "Added to bag" : product.sizes?.length ? "Choose your size" : "Add to bag"}</span>
          {added ? <Check size={17} /> : <Plus size={17} />}
        </button>
      )}
      <span className="sr-only" role="status">{added ? `${product.name} added to bag` : ""}</span>
    </article>
  );
}
