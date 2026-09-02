"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Plus, Search } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import TextSlideUp from "@/components/animations/TextSlideUp";
import { useStore } from "@/components/StoreProvider";
import { CATEGORIES, formatPrice, PRODUCTS, type Product } from "@/lib/store";
import styles from "./ShopCatalog.module.css";

export default function ShopCatalog() {
  const { addToCart, openProduct } = useStore();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory = category === CATEGORIES[0] || product.category === category;
      const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);

  const selectProduct = (product: Product) => openProduct(product.id);

  return (
    <section className={`catalog ${styles.catalog}`} id="catalog-section" aria-labelledby="catalog-heading">
      <div className={`section-heading ${styles.heading}`}>
        <div>
          <span className="eyebrow">The shop</span>
          <TextSlideUp text="The everyday lineup." element="h1" id="catalog-heading" />
        </div>
        <p>Everything for the home crowd.</p>
      </div>

      <div className="catalog-controls">
        <div className="category-list" role="group" aria-label="Product categories">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? "category-active" : ""}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item} <span>{item === CATEGORIES[0] ? PRODUCTS.length : PRODUCTS.filter((product) => product.category === item).length}</span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search the shop"
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <p className="results-count" role="status" aria-live="polite">
        {products.length} {products.length === 1 ? "item" : "items"}
      </p>

      <div className="product-grid" id="products-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <button type="button" className="product-image-button" onClick={() => selectProduct(product)} aria-label={`View ${product.name}`}>
              <ProductVisual product={product} />
              <span className="product-view">Take a look <ArrowUpRight size={17} aria-hidden="true" /></span>
            </button>
            <div className="product-details">
              <div>
                <span className="product-category">{product.category}</span>
                <button type="button" className="product-name" onClick={() => selectProduct(product)}>{product.name}</button>
                <p>{product.sizes ? `${product.sizes[0]} — ${product.sizes[product.sizes.length - 1]}` : "Everyday essentials"}</p>
              </div>
              <span className="product-price">{formatPrice(product.price)}</span>
            </div>
            <button
              type="button"
              className="quick-add"
              onClick={() => product.sizes ? selectProduct(product) : addToCart(product)}
              aria-label={`${product.sizes ? "Choose size for" : "Add to bag:"} ${product.name}`}
            >
              <span>{product.sizes ? "Choose your size" : "Add to bag"}</span>
              <Plus size={17} strokeWidth={1.3} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-results">
          <h2>No luck this time.</h2>
          <p>Try another search or take a look at all our goods.</p>
          <button type="button" className="text-link" onClick={() => { setQuery(""); setCategory(CATEGORIES[0]); }}>
            Clear filters <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
