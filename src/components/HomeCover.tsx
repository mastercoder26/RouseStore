"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight, Sparkles, MapPin, Clock, ShieldCheck } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import LetterReveal from "@/components/animations/LetterReveal";
import HeroShowcase from "@/components/HeroShowcase";
import RaiderMarquee from "@/components/RaiderMarquee";
import ProductVisual from "@/components/ProductVisual";
import CollectionMotion from "@/components/CollectionMotion";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/store";

export default function HomeCover() {
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const { products, addToCart } = useStore();

  // Curate top 4 campus essentials
  const highlightIds = ["rs-hoodie-01", "rs-jacket-02", "rs-notebook-04", "rs-bottle-05"];
  const featured = highlightIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <>
      <section className="hero" ref={hero} aria-labelledby="hero-heading">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-title" id="hero-heading">
              <h1 className="hero-full-heading">
                <LetterReveal text="FOR THE" element="span" delay={200} />
                <LetterReveal text="SCHOOL DAY." element="span" delay={280} />
              </h1>
            </div>
            <div className="hero-bottom">
              <Magnetic strength={0.2}>
                <Link className="round-link" href="/shop" aria-label="Explore the shop collection">
                  <span>Shop</span>
                  <ArrowUpRight size={28} strokeWidth={1.4} />
                </Link>
              </Magnetic>
            </div>
          </div>
          <HeroShowcase scrollY={heroY} />
        </div>
      </section>

      {/* Infinite Smooth Marquee */}
      <div style={{ marginTop: "48px" }}>
        <RaiderMarquee />
      </div>

      {/* Featured Campus Essentials Grid */}
      <section
        style={{
          padding: "80px 4% 60px",
          width: "min(1480px, 100%)",
          margin: "0 auto",
        }}
        aria-labelledby="featured-heading"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "36px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--maroon)",
                marginBottom: "8px",
              }}
            >
              <Sparkles size={13} /> Curated Campus Drops
            </div>
            <h2
              id="featured-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 54px)",
                fontWeight: 400,
                letterSpacing: "-0.04em",
                margin: 0,
                color: "var(--ink)",
              }}
            >
              Everyday Raiders.
            </h2>
          </div>

          <Link
            href="/shop"
            className="pill-link"
            style={{
              padding: "12px 24px",
              minHeight: "44px",
              fontSize: "12px",
              gap: "14px",
            }}
          >
            <span>View Full Catalog ({products.length})</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <article className="product-card" key={product.id}>
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
                </div>
                <div className="product-price-block">
                  <span className="product-price">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>
              {product.sizes && product.sizes.length > 0 ? (
                <Link className="quick-add" href={`/shop/${product.id}`} aria-label={`Choose size for ${product.name}`}>
                  <span>Select size</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="quick-add"
                  onClick={() => addToCart(product)}
                  aria-label={`Add to bag: ${product.name}`}
                >
                  <span>Add to bag</span>
                  <ArrowUpRight size={14} />
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Horizontal Editorial Rail */}
      <CollectionMotion />

      {/* Campus Kiosk & Operations Info Section */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          padding: "70px 4% 90px",
          width: "min(1480px, 100%)",
          margin: "0 auto",
        }}
        aria-labelledby="store-info-heading"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "42px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--maroon)",
                display: "block",
                marginBottom: "10px",
              }}
            >
              About Raider Station
            </span>
            <h3
              id="store-info-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 3vw, 38px)",
                fontWeight: 400,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                margin: "0 0 16px",
                color: "var(--ink)",
              }}
            >
              Run by Raiders. Built for Rouse.
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "460px",
                margin: 0,
              }}
            >
              Raider Station is the official student-run store at Rouse High School in Leander, Texas.
              Every purchase funds campus student organizations, competitive events, and Raider traditions.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                padding: "22px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--line)",
              }}
            >
              <MapPin size={18} style={{ color: "var(--maroon)", marginBottom: "12px" }} />
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Campus Kiosk
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                Main Cafeteria Foyer · Room 1104
                <br />
                Rouse High School
              </div>
            </div>

            <div
              style={{
                padding: "22px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--line)",
              }}
            >
              <Clock size={18} style={{ color: "var(--maroon)", marginBottom: "12px" }} />
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Store Hours
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                Morning: 8:00 AM – 8:40 AM
                <br />
                Lunch Waves: All Periods
              </div>
            </div>

            <div
              style={{
                padding: "22px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--line)",
              }}
            >
              <ShieldCheck size={18} style={{ color: "var(--maroon)", marginBottom: "12px" }} />
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Campus Pickup
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                Online pre-orders ready for same-day pick up between bells.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
