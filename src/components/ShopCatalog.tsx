"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Plus, Search, Check, X } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import LetterReveal from "@/components/animations/LetterReveal";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, type Product } from "@/lib/store";
import { ProductRatingBadge } from "@/components/reviews";
import styles from "./ShopCatalog.module.css";

export default function ShopCatalog() {
  const { products: storeProducts, addToCart } = useStore();
  const [category, setCategory] = useState("All items");
  const [query, setQuery] = useState("");
  const [sizePickerId, setSizePickerId] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  // Dynamically extract categories from current listings
  const categories = useMemo(() => {
    const set = new Set<string>();
    storeProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All items", ...Array.from(set)];
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return storeProducts.filter((product) => {
      const matchesCategory = category === "All items" || product.category === category;
      const searchable = `${product.name} ${product.category} ${product.description} ${product.tag}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [storeProducts, category, query]);

  const handleQuickAdd = (product: Product, size?: string) => {
    addToCart(product, size);
    setSizePickerId(null);
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((current) => (current === product.id ? null : current));
    }, 1800);
  };

  return (
    <section className={`catalog ${styles.catalog}`} id="catalog-section" aria-labelledby="catalog-heading">
      <div className={`section-heading ${styles.heading}`}>
        <LetterReveal text="Shop" element="h1" id="catalog-heading" />
        <p>Curated Rouse High School apparel, supplies, and campus provisions.</p>
      </div>

      <div className="catalog-controls">
        <div className="category-list" role="group" aria-label="Product categories">
          {categories.map((item) => {
            const isActive = category === item;
            return (
              <button
                type="button"
                key={item}
                className={isActive ? "category-active" : ""}
                onClick={() => setCategory(item)}
                aria-pressed={isActive}
              >
                {item}
                {isActive && (
                  <motion.span
                    className="active-category-indicator"
                    layoutId="active-catalog-category"
                    transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
                    style={{
                      position: "absolute",
                      bottom: "-1px",
                      left: 0,
                      right: 0,
                      height: "2px",
                      backgroundColor: "var(--maroon)",
                      borderRadius: "2px",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <label className="search-field">
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search catalog..."
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <p className="results-count" role="status" aria-live="polite">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? "listing" : "listings"}
        {category !== "All items" ? ` in ${category}` : ""}
      </p>

      <div className="product-grid" id="products-grid">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const isSoldOut = product.inStock === false;
            const isJustAdded = recentlyAddedId === product.id;
            const isPickingSize = sizePickerId === product.id;

            return (
              <motion.article
                className="product-card"
                key={product.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link className="product-image-button" href={`/shop/${product.id}`} aria-label={`View ${product.name}`}>
                  {product.tag && <span className="product-badge">{product.tag}</span>}
                  <ProductVisual product={product} />
                  <span className="product-view" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </span>
                </Link>
                <div className="product-details">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="product-category">{product.category}</span>
                    <Link className="product-name" href={`/shop/${product.id}`}>
                      {product.name}
                    </Link>
                    <div style={{ marginTop: "4px" }}>
                      <ProductRatingBadge productId={product.id} size="sm" linkToReviews />
                    </div>
                  </div>
                  <div className="product-price-block">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {/* Quick Add / Size Picker / Sold Out Controls */}
                {isSoldOut ? (
                  <div
                    className="quick-add"
                    style={{
                      opacity: 0.5,
                      cursor: "not-allowed",
                      justifyContent: "center",
                      color: "var(--muted)",
                    }}
                  >
                    <span>Sold Out</span>
                  </div>
                ) : isJustAdded ? (
                  <div
                    className="quick-add"
                    style={{
                      background: "var(--maroon)",
                      color: "#fff",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Added to Bag</span>
                  </div>
                ) : isPickingSize && product.sizes && product.sizes.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                      padding: "4px",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--bg-card)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "4px", overflowX: "auto" }}>
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleQuickAdd(product, s)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "var(--radius-pill)",
                            border: "1px solid var(--line)",
                            background: "var(--bg-surface)",
                            color: "var(--ink)",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 140ms ease, color 140ms ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--maroon)";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--bg-surface)";
                            e.currentTarget.style.color = "var(--ink)";
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSizePickerId(null)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "none",
                        background: "transparent",
                        color: "var(--muted)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      title="Cancel size selection"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : product.sizes && product.sizes.length > 0 ? (
                  <button
                    type="button"
                    className="quick-add"
                    onClick={() => setSizePickerId(product.id)}
                    aria-label={`Select size for ${product.name}`}
                  >
                    <span>Select size</span>
                    <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="quick-add"
                    onClick={() => handleQuickAdd(product)}
                    aria-label={`Add to bag: ${product.name}`}
                  >
                    <span>Add to bag</span>
                    <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-results">
          <h2>No matching listings found.</h2>
          <p>Try searching for a different term or clearing your category filters.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setQuery("");
              setCategory("All items");
            }}
          >
            Clear search filters <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
