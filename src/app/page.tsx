"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Plus, Search, ShoppingBag, X } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import PreLoader from "@/components/animations/PreLoader";
import TextSlideUp from "@/components/animations/TextSlideUp";
import ProductVisual from "@/components/ProductVisual";
import CollectionMotion from "@/components/CollectionMotion";
import { ProductDialog, CartDrawer } from "@/components/ShopDialogs";
import { PRODUCTS, CATEGORIES, formatPrice, type Product, type CartItem } from "@/lib/store";

const FEATURED = ["rs-hoodie-01", "rs-cap-03", "rs-notebook-04", "rs-bottle-05"];

export default function Home() {
  const [category, setCategory] = useState("All goods");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hero = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const products = useMemo(() => PRODUCTS.filter(item => {
    const matchesCategory = category === "All goods" || item.category === category;
    const matchesQuery = `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFeatured = showAll || category !== "All goods" || query.trim() || FEATURED.includes(item.id);
    return matchesCategory && matchesQuery && matchesFeatured;
  }), [category, query, showAll]);

  function addToCart(item: Product, size?: string) {
    const selectedSize = item.sizes?.includes(size ?? "") ? size : item.sizes?.[0];
    setCart(current => {
      const exists = current.some(entry => entry.id === item.id && entry.selectedSize === selectedSize);
      return exists ? current.map(entry => entry.id === item.id && entry.selectedSize === selectedSize ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, selectedSize, quantity: 1 }];
    });
    setMessage(`${item.name}${selectedSize ? ` / ${selectedSize}` : ""} added to your bag.`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 3600);
  }

  function updateQuantity(id: string, size: string | undefined, delta: number) {
    setCart(current => current.map(item => item.id === id && item.selectedSize === size ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  }

  function chooseCategory(next: string) {
    setCategory(next);
    setShowAll(true);
  }

  function openProduct(id: string) {
    const selected = PRODUCTS.find(item => item.id === id);
    if (selected) setProduct(selected);
  }

  return (
    <>
      <PreLoader />
      <a className="skip-link" href="#catalog-section">Skip to the shop</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Raider Station home">
          <span className="school-mark"><Image src="/images/rouse-school-mark.jpg" width={60} height={60} alt="" /></span>
          <span>RAIDER<br />STATION</span>
        </a>
        <div className="header-school">Rouse High School<br /><span>Leander, Texas</span></div>
        <nav aria-label="Main navigation">
          <a href="#catalog-section">The shop<span className="nav-dot" /></a>
          <a href="#our-school">Our school</a>
        </nav>
        <Magnetic strength={0.15}>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}>
            <ShoppingBag size={18} strokeWidth={1.5} /><span>Bag</span><span className="bag-count">{totalItems}</span>
          </button>
        </Magnetic>
      </header>

      <main id="top">
        <section className="hero" ref={hero} aria-labelledby="hero-heading">
          <div className="hero-eyebrow"><span>The Rouse High School collection</span><span>Maroon. Gold. Always.</span></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-title" id="hero-heading">
                <h1 className="hero-full-heading"><TextSlideUp text="FOR THE" element="span" delay={400} /><TextSlideUp text="HOME CROWD." element="span" delay={480} /></h1>
              </div>
              <div className="hero-bottom">
                <p>Rouse on your sleeve.<br />Raiders, through and through.<br /><span>Spirit wear & everyday goods.</span></p>
                <Magnetic strength={0.2}>
                  <a className="round-link" href="#catalog-section"><span>Shop the<br />collection</span><ArrowDownRight size={29} strokeWidth={1.3} /></a>
                </Magnetic>
              </div>
              <div className="hero-footnote"><span>Made for the maroon & gold.</span><ArrowDown size={17} strokeWidth={1.4} /></div>
            </div>
            <div className="hero-product">
              <button className="hero-image-button" onClick={() => openProduct("rs-hoodie-01")} aria-label="View Sideline Hoodie">
                <motion.div className="hero-photo" style={{ y: reducedMotion ? 0 : heroY }}>
                  <Image src="/images/raider_hoodie.jpg" alt="Maroon Rouse Raiders hoodie with gold collegiate lettering" fill sizes="(max-width: 760px) 100vw, 50vw" preload />
                </motion.div>
                <span className="image-corner">THE SIDELINE COLLECTION</span>
                <span className="image-view"><ArrowUpRight size={25} strokeWidth={1.2} /></span>
              </button>
              <div className="hero-product-caption"><span><strong>The Sideline Hoodie</strong><span>Maroon / heavyweight fleece</span></span><span>{formatPrice(54)}</span></div>
            </div>
          </div>
        </section>

        <section className="intro-statement" aria-label="Welcome to Raider Station">
          <span className="eyebrow">Around here</span>
          <TextSlideUp text="School spirit doesn’t stop at the final bell." element="h2" />
          <p>For the early mornings, the packed bleachers, and the people who make Rouse feel like Rouse.</p>
        </section>

        <section className="catalog" id="catalog-section" aria-labelledby="catalog-heading">
          <div className="section-heading"><div><span className="eyebrow">The shop</span><h2 id="catalog-heading">The everyday lineup.</h2></div><p>A few things to make your own.</p></div>
          <div className="catalog-controls">
            <div className="category-list" role="group" aria-label="Product categories">
              {CATEGORIES.map(item => <button key={item} className={category === item ? "category-active" : ""} onClick={() => chooseCategory(item)} aria-pressed={category === item}>{item}{" "}<span>{item === "All goods" ? PRODUCTS.length : PRODUCTS.filter(p => p.category === item).length}</span></button>)}
            </div>
            <label className="search-field"><Search size={17} strokeWidth={1.5} /><input id="search-input" type="search" placeholder="Search the shop" aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} /></label>
          </div>
          <p className="results-count" role="status">{products.length} {products.length === 1 ? "item" : "items"}{category === "All goods" && !showAll && !query.trim() ? " / the favourites" : ""}</p>
          <div className="product-grid" id="products-grid">
            {products.map((item) => (
              <article className="product-card" key={item.id}>
                <button className="product-image-button" onClick={() => setProduct(item)} aria-label={`View ${item.name}`}>
                  <ProductVisual product={item} />
                  <span className="product-view">Take a look <ArrowUpRight size={17} /></span>
                </button>
                <div className="product-details"><div><span className="product-category">{item.category}</span><button className="product-name" onClick={() => setProduct(item)}>{item.name}</button><p>{item.sizes ? `${item.sizes[0]} — ${item.sizes[item.sizes.length - 1]}` : "Everyday essentials"}</p></div><span className="product-price">{formatPrice(item.price)}</span></div>
                <button className="quick-add" onClick={() => item.sizes ? setProduct(item) : addToCart(item)} aria-label={`${item.sizes ? "Choose size for" : "Add to bag:"} ${item.name}`}><span>{item.sizes ? "Choose your size" : "Add to bag"}</span><Plus size={17} strokeWidth={1.3} /></button>
              </article>
            ))}
          </div>
          {products.length === 0 && <div className="empty-results"><h3>No luck this time.</h3><p>Try another search or take a look at all our goods.</p><button className="text-link" onClick={() => { setQuery(""); setCategory("All goods"); setShowAll(true); }}>Clear filters <ArrowRight size={18} /></button></div>}
          {category === "All goods" && !query.trim() && <div className="catalog-more"><button className="pill-link" onClick={() => setShowAll(!showAll)}>{showAll ? "Back to the favourites" : "See all the goods"}<ArrowUpRight size={19} /></button><span>{showAll ? "The full Raider Station collection." : "A few favourites. There’s more where these came from."}</span></div>}
        </section>

        <CollectionMotion onSelect={openProduct} />

        <section className="school-section" id="our-school" aria-label="Our school">
          <div className="school-kicker"><span className="eyebrow">Our kind of place</span><span>Leander, Texas</span></div>
          <div className="school-content"><TextSlideUp text="Rooted on Raider Way." element="h2" className="school-heading" /><div className="school-copy"><div className="school-logo"><Image src="/images/rouse-school-mark.jpg" width={150} height={150} alt="Rouse High School crest" /></div><p>Rouse High School. Home of the Raiders since 2008. Part of Leander ISD, right here in Leander, Texas.</p><p>For students in the halls and everyone cheering from the stands. Wear a little maroon and gold wherever the day takes you.</p><a className="text-link" href="https://rhs.leanderisd.org/" target="_blank" rel="noreferrer">Meet Rouse High School <ArrowUpRight size={18} /></a></div></div>
          <div className="school-address"><span>ROUSE HIGH SCHOOL</span><span>1222 Raider Way<br />Leander, TX 78641</span><a href="https://rhs.leanderisd.org/calendar" target="_blank" rel="noreferrer">What’s happening at Rouse <ArrowUpRight size={16} /></a></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top"><span>From first bell to Friday night.</span><a href="#top">Back to top <ArrowUpRight size={18} /></a></div>
        <a className="footer-wordmark" href="#catalog-section" aria-label="Shop Raider Station">GO RAIDERS<span>↗</span></a>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Raider Station</span><span>Rouse High School / Leander, TX</span><a href="https://www.leanderisd.org/" target="_blank" rel="noreferrer">Leander ISD <ArrowUpRight size={13} /></a></div>
      </footer>

      {product && <ProductDialog product={product} onClose={() => setProduct(null)} onAdd={addToCart} />}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdateQuantity={updateQuantity} />}
      <div className={`toast ${message ? "toast-visible" : ""}`} role="status" aria-live="polite"><ShoppingBag size={18} /><span>{message}</span><button onClick={() => setMessage("")} aria-label="Dismiss notification" tabIndex={message ? 0 : -1}><X size={16} /></button></div>
    </>
  );
}
