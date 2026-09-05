"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import styles from "./HomeCover.module.css";

export default function HomeCover() {
  const { products } = useStore();
  const picks = ["rs-hoodie-01", "rs-cap-03", "rs-jacket-02"]
    .map(id => products.find(product => product.id === id)).filter(product => product !== undefined);
  const featured = picks.length ? picks : products.slice(0, 3);

  return (
    <div className={styles.home}>
      <section className={styles.masthead} aria-labelledby="home-heading">
        <div className={styles.topline}><span>Rouse High School Student Store</span><span>Leander, Texas</span></div>
        <h1 id="home-heading" className={styles.brand}>ROUSE<span className={styles.brandStar} aria-hidden="true">✳</span></h1>
        <div className={styles.heroBottom}>
          <p>School supplies, snacks, accessories, and spirit wear.</p>
          <a className={styles.explore} href="#featured-products" aria-label="View featured products"><ArrowDown size={22} /></a>
        </div>
      </section>
      <section id="featured-products" className={styles.featured} aria-labelledby="featured-heading">
        <div className={styles.sectionTop}><h2 id="featured-heading">Featured products</h2></div>
        <div className="product-grid">{featured.map(product => <ProductCard key={product.id} product={product} priority />)}</div>
        <Link href="/shop" className={styles.shopAll}>Shop all products <ArrowRight size={25} /></Link>
      </section>
      <section className={styles.campaign} aria-labelledby="campaign-heading">
        <div className={styles.campaignPhoto}><Image src="/images/campaign/rouse-gear.webp" alt="Rouse maroon sweatshirt, black cap and felt pennant styled on a butter-yellow bench" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
        <div className={styles.campaignCopy}>
          <span className={styles.oval}>Spirit wear</span>
          <h2 id="campaign-heading">Rouse spirit wear</h2>
          <Link href="/shop?category=Spirit%20Wear" className={styles.collectionLink}>Shop spirit wear <ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
      </section>
      <section className={styles.categories} aria-labelledby="category-heading">
        <div className={styles.categoryHeading}><h2 id="category-heading">Shop by category</h2></div>
        <div className={styles.categoryGrid}>
          <Link href="/shop?category=School%20Supplies" className={styles.categoryCard}>
            <div className={styles.categoryImage}><Image src="/images/campaign/rouse-everyday.webp" alt="Maroon Rouse notebook, gel pens and water bottle in warm afternoon sunlight" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
            <div className={styles.categoryCaption}><h3>School supplies</h3><ArrowUpRight size={28} aria-hidden="true" /></div>
          </Link>
          <div className={styles.categoryAside}>
            <Link href="/shop?category=Accessories" className={styles.accessoriesCard}><h3>Accessories</h3><span className={styles.largeR} aria-hidden="true">R<span>✳</span></span><span className={styles.categoryAction}>Shop accessories <ArrowUpRight size={23} aria-hidden="true" /></span></Link>
            <Link href="/shop?category=Snacks%20%26%20Drinks" className={styles.snackCard}><h3>Snacks & drinks</h3><ArrowUpRight size={27} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <section className={styles.community} aria-labelledby="community-heading">
        <h2 id="community-heading">Store feedback</h2>
        <p>Share a product request, suggestion, or issue with the student store.</p>
        <Link className="text-link" href="/feedback">Open feedback form <ArrowUpRight size={17} /></Link>
      </section>
    </div>
  );
}
