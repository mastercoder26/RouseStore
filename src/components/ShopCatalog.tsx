"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import styles from "./ShopCatalog.module.css";

export default function ShopCatalog() {
  const { products } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const categories = useMemo(() => ["All items", ...new Set(products.map(product => product.category))], [products]);
  const requestedCategory = searchParams.get("category") || "All items";
  const category = categories.includes(requestedCategory) ? requestedCategory : "All items";
  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visible = products.filter(product =>
      (category === "All items" || product.category === category) &&
      (!term || `${product.name} ${product.category} ${product.description} ${product.tag ?? ""}`.toLowerCase().includes(term))
    );
    if (sort === "price-low") visible.sort((a, b) => a.price - b.price);
    if (sort === "price-high") visible.sort((a, b) => b.price - a.price);
    if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name));
    return visible;
  }, [products, category, query, sort]);

  function selectCategory(value: string) {
    router.replace(value === "All items" ? "/shop" : `/shop?category=${encodeURIComponent(value)}`, { scroll: false });
  }

  return (
    <section className={styles.catalog} id="catalog-section" aria-labelledby="catalog-heading">
      <div className={styles.heading}>
        <span className="eyebrow">The Rouse collection</span>
        <h1 id="catalog-heading">Your daily <em>rotation.</em></h1>
        <p>A little gear. A few essentials. All Rouse.</p>
      </div>
      <div className={styles.controls}>
        <div className={styles.categories} role="group" aria-label="Product categories">
          {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => selectCategory(item)}>{item === "All items" ? "Shop all" : item}<span>{item === "All items" ? products.length : products.filter(product => product.category === item).length}</span></button>)}
        </div>
        <label className="search-field"><Search size={17} aria-hidden="true" /><input type="search" placeholder="Find your thing" aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} /></label>
      </div>
      <div className={styles.resultsBar}>
        <p className="results-count" role="status" aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? "good thing" : "good things"}{category !== "All items" ? ` in ${category}` : " to make your day"}</p>
        <label className={styles.sort}>Sort by<select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
      </div>
      <div className="product-grid" id="products-grid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>
      {!filteredProducts.length && <div className="empty-results"><h2>Nothing here. Yet.</h2><p>Try another search or take a look at everything.</p><button type="button" className="pill-link" onClick={() => { setQuery(""); selectCategory("All items"); }}>Clear filters <X size={16} /></button></div>}
      <p className={styles.endnote}>You made it to the bottom. Good taste.</p>
    </section>
  );
}
