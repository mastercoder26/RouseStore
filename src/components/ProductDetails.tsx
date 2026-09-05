"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ChevronDown, Check } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, type Product } from "@/lib/store";
import { ProductRatingBadge, ProductReviewsSection } from "@/components/reviews";
import styles from "./ProductDetails.module.css";

type AccordionName = "description" | "pickup";

function getHighlights(product: Product) {
  switch (product.id) {
    case "rs-hoodie-01":
      return ["Heavy fleece", "Double-lined hood", "Gold lettering"];
    case "rs-jacket-02":
      return ["Maroon wool", "Black sleeves", "Gold chenille R", "Snap front"];
    case "rs-cap-03":
      return ["Structured black cap", "Embroidered R", "Stretch fit"];
    case "rs-notebook-04":
      return ["Hardcover", "College-ruled", "Rouse Gold imprint"];
    case "rs-bottle-05":
      return ["32 ounces", "Insulated stainless steel", "Laser-etched R"];
    case "rs-bomber-06":
      return ["Lightweight", "Water-resistant shell", "Raider typography"];
    case "rs-blanket-07":
      return ["Plush maroon fleece", "Gold trim", "Stadium-ready"];
    case "rs-sneaker-11":
      return ["Varsity low-top", "Cushioned insole", "Gold accents"];
    default:
      return product.tag ? [product.tag] : ["Campus essential"];
  }
}

function Accordion({
  name,
  title,
  open,
  onToggle,
  children,
}: {
  name: AccordionName;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const panelId = `product-${name}-panel`;

  return (
    <div className={styles.accordion}>
      <button
        type="button"
        className={styles.accordionTrigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{title}</span>
        <ChevronDown size={16} strokeWidth={1.4} aria-hidden="true" />
      </button>
      <div id={panelId} className={`${styles.accordionPanel} ${open ? styles.accordionPanelOpen : ""}`} aria-hidden={!open}>
        <div className={styles.accordionInner}>{children}</div>
      </div>
    </div>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const { products, addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [openAccordion, setOpenAccordion] = useState<AccordionName | null>("description");
  const [added, setAdded] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const add = () => {
    addToCart(product, selectedSize || undefined);
    setAdded(true);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setAdded(false), 3000);
  };

  const highlights = getHighlights(product);
  const hasSizes = Boolean(product.sizes?.length);
  const isSoldOut = product.inStock === false;

  const related = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.tag === product.tag))
    .slice(0, 4);

  const fallbackRelated = related.length >= 3 ? related : products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className={styles.breadcrumb}
      >
        <Link
          href="/shop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: "var(--maroon)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={13} /> Shop
        </Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>{product.name}</span>
      </nav>

      <div className={styles.page}>
        <div className={styles.gallery} role="region" aria-label={`${product.name} product images`}>
          <div className={styles.galleryFrame}>
            <div className={styles.visual}>
              <ProductVisual product={product} sizes="(max-width: 760px) 94vw, 58vw" priority />
            </div>
          </div>
          {(product.id === "rs-hoodie-01" || product.id === "rs-cap-03" || product.id === "rs-jacket-02") && (
            <div className={`${styles.galleryFrame} ${styles.detailFrame}`}>
              <div className={styles.visual}>
                <ProductVisual product={product} sizes="(max-width: 760px) 94vw, 58vw" />
              </div>
              <span className={styles.imageLabel}>Detail crop</span>
            </div>
          )}
        </div>

        <section className={styles.purchasePanel} aria-labelledby="product-title">
          <div className={styles.titleRow}>
            <div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--maroon)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                {product.tag || product.category}
              </span>
              <h1 id="product-title">{product.name}</h1>
              <div style={{ marginTop: "6px" }}>
                <ProductRatingBadge productId={product.id} linkToReviews size="md" />
              </div>
            </div>
            <div className={styles.priceRow}>
              <p className={styles.price}>{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    textDecoration: "line-through",
                    marginTop: "-4px",
                  }}
                >
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {hasSizes && (
            <fieldset className={styles.sizeFieldset}>
              <legend>Select Size</legend>
              <div className={styles.sizeOptions}>
                {product.sizes?.map((size) => (
                  <label key={size} className={`${styles.sizeOption} ${selectedSize === size ? styles.sizeOptionSelected : ""}`}>
                    <input
                      type="radio"
                      name={`product-size-${product.id}`}
                      value={size}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <button
            type="button"
            className={styles.addButton}
            onClick={add}
            disabled={isSoldOut || (hasSizes && !selectedSize)}
            style={isSoldOut ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            <span>{isSoldOut ? "Sold Out" : added ? "Added to Bag" : "Add to bag"}</span>
            {added ? <Check size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" />}
          </button>

          <div className={styles.highlights}>
            <div className={styles.highlightList}>
              {highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </div>

          <div className={styles.accordions}>
            <Accordion
              name="description"
              title="The details"
              open={openAccordion === "description"}
              onToggle={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
            >
              <p>{product.description}</p>
            </Accordion>

            <Accordion
              name="pickup"
              title="Store information"
              open={openAccordion === "pickup"}
              onToggle={() => setOpenAccordion(openAccordion === "pickup" ? null : "pickup")}
            >
              <p>
                Explore the demo collection and build your bag. Online checkout is not available yet.
                No order has been placed.
              </p>
            </Accordion>
          </div>
        </section>
      </div>

      {/* 5-Star Product Reviews & Ratings Section */}
      <ProductReviewsSection product={product} />

      {fallbackRelated.length > 0 && (
        <section className={styles.related} aria-labelledby="related-heading">
          <div className={styles.relatedHeading}>
            <h2 id="related-heading">Related products</h2>
            <Link href="/shop" className="text-link">Shop all <ArrowUpRight size={17} /></Link>
          </div>
          <div className="product-grid">{fallbackRelated.slice(0, 3).map(item => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </div>
  );
}
