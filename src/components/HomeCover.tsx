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
        <div className={styles.topline}><span>Your day. Your people. Your store.</span><span>Leander, TX ↗</span></div>
        <h1 id="home-heading" className={styles.brand}>ROUSE<span className={styles.brandStar} aria-hidden="true">✳</span></h1>
        <div className={styles.heroBottom}>
          <span className={styles.schoolStamp}>A little school spirit.<br />A lot of everyday.</span>
          <p>Good gear.<br /><em>Great to be a Raider.</em></p>
          <a className={styles.explore} href="#everyday-picks" aria-label="Explore everyday picks"><ArrowDown size={22} /></a>
        </div>
      </section>
      <section id="everyday-picks" className={styles.featured} aria-labelledby="featured-heading">
        <div className={styles.sectionTop}><h2 id="featured-heading">The everyday lineup</h2><span>Rouse, on repeat.</span></div>
        <div className="product-grid">{featured.map(product => <ProductCard key={product.id} product={product} priority />)}</div>
        <Link href="/shop" className={styles.shopAll}>Browse the collection <ArrowRight size={25} /></Link>
      </section>
      <section className={styles.campaign} aria-labelledby="campaign-heading">
        <div className={styles.campaignPhoto}><Image src="/images/campaign/rouse-gear.webp" alt="Rouse maroon sweatshirt, black cap and felt pennant styled on a butter-yellow bench" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
        <div className={styles.campaignCopy}>
          <span className={styles.oval}>The Rouse rotation</span>
          <h2 id="campaign-heading">School colors.<br /><em>Personal style.</em></h2>
          <p>The hoodie you live in. The cap you grab on the way out. A little Raider energy, wherever the day takes you.</p>
          <Link href="/shop?category=Spirit%20Wear" className={styles.collectionLink}>Explore spirit wear <ArrowUpRight size={20} aria-hidden="true" /></Link>
          <span className={styles.campaignNote}>Maroon & gold. Always a good call.</span>
        </div>
      </section>
      <section className={styles.categories} aria-labelledby="category-heading">
        <div className={styles.categoryHeading}><span className="eyebrow">From first period to Friday night</span><h2 id="category-heading">Make it a <em>Rouse day.</em></h2></div>
        <div className={styles.categoryGrid}>
          <Link href="/shop?category=School%20Supplies" className={styles.categoryCard}>
            <div className={styles.categoryImage}><Image src="/images/campaign/rouse-everyday.webp" alt="Maroon Rouse notebook, gel pens and water bottle in warm afternoon sunlight" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
            <div className={styles.categoryCaption}><div><span>School supplies</span><h3>Class acts.</h3></div><ArrowUpRight size={28} aria-hidden="true" /></div>
          </Link>
          <div className={styles.categoryAside}>
            <Link href="/shop?category=Accessories" className={styles.accessoriesCard}><span className={styles.oval}>The finishing touches</span><h3>Little things.<br />Big Raider energy.</h3><span className={styles.largeR} aria-hidden="true">R<span>✳</span></span><span className={styles.categoryAction}>Accessories <ArrowUpRight size={23} aria-hidden="true" /></span></Link>
            <Link href="/shop?category=Snacks%20%26%20Drinks" className={styles.snackCard}><span>Snacks & drinks</span><h3>Snack break?</h3><ArrowUpRight size={27} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <section className={styles.community} aria-labelledby="community-heading">
        <span className={styles.communityMark} aria-hidden="true">✳</span>
        <h2 id="community-heading">Not just a school thing.<br /><em>A Rouse thing.</em></h2>
        <p>For the early mornings, the loud bleachers, and everything in between.</p>
        <Link className="text-link" href="/feedback">Got something in mind? Tell us <ArrowUpRight size={17} /></Link>
      </section>
    </div>
  );
}
