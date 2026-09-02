"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus, Search } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import LetterReveal from "@/components/animations/LetterReveal";
import { useStore } from "@/components/StoreProvider";
import { CATEGORIES, formatPrice, PRODUCTS } from "@/lib/store";
import styles from "./ShopCatalog.module.css";

export default function ShopCatalog() {
  const { addToCart } = useStore();
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

  return (
    <section className={`catalog ${styles.catalog}`} id="catalog-section" aria-labelledby="catalog-heading">
      <div className={`section-heading ${styles.heading}`}>
        <LetterReveal text="Shop" element="h1" id="catalog-heading" />
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
              {item}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search"
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
            <Link className="product-image-button" href={`/shop/${product.id}`} aria-label={`View ${product.name}`}>
              <ProductVisual product={product} />
              <span className="product-view" aria-hidden="true"><ArrowUpRight size={17} /></span>
            </Link>
            <div className="product-details">
              <div>
                <Link className="product-name" href={`/shop/${product.id}`}>{product.name}</Link>
              </div>
              <span className="product-price">{formatPrice(product.price)}</span>
            </div>
            {product.sizes ? <Link className="quick-add" href={`/shop/${product.id}`} aria-label={`Choose size for ${product.name}`}><span>Select size</span><Plus size={17} strokeWidth={1.3} aria-hidden="true" /></Link> : <button
              type="button"
              className="quick-add"
              onClick={() => addToCart(product)}
              aria-label={`Add to bag: ${product.name}`}
            >
              <span>Add to bag</span>
              <Plus size={17} strokeWidth={1.3} aria-hidden="true" />
            </button>}
          </article>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-results">
          <h2>No results.</h2>
          <button type="button" className="text-link" onClick={() => { setQuery(""); setCategory(CATEGORIES[0]); }}>
            Clear filters <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
