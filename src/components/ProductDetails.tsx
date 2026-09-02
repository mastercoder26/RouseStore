"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, type Product } from "@/lib/store";
import styles from "./ProductDetails.module.css";

type AccordionName = "description";

function getHighlights(product: Product) {
  switch (product.id) {
    case "rs-hoodie-01":
      return ["Heavy fleece", "Double-lined hood", "Gold lettering"];
    case "rs-jacket-02":
      return ["Maroon wool", "Black sleeves", "Gold chenille R", "Snap front"];
    case "rs-cap-03":
      return ["Structured black cap", "Embroidered R", "Stretch fit"];
    case "rs-notebook-04":
      return ["Hardcover", "College-ruled"];
    case "rs-bottle-05":
      return ["32 ounces", "Insulated stainless steel", "Gold R"];
    case "rs-bomber-06":
      return ["Lightweight", "Water-resistant"];
    case "rs-blanket-07":
      return ["Maroon fleece", "Gold border"];
    case "rs-pen-08":
      return ["Set of 3", "Smooth writing", "Black gel ink"];
    case "rs-coldbrew-09":
      return ["Chilled", "12 oz"];
    case "rs-protein-10":
      return ["Dark chocolate", "Almonds", "Contains nuts"];
    default:
      return [product.tag];
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
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [openAccordion, setOpenAccordion] = useState<AccordionName | null>(null);
  const [added, setAdded] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const add = () => {
    addToCart(product, selectedSize || undefined);
    setAdded(true);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setAdded(false), 3600);
  };

  const highlights = getHighlights(product);
  const hasSizes = Boolean(product.sizes?.length);

  return (
    <div className={styles.page}>
      <div className={styles.gallery} role="region" tabIndex={0} aria-label={`${product.name} product images`}>
        <div className={styles.galleryFrame}>
          <div className={styles.visual}>
            <ProductVisual product={product} sizes="(max-width: 760px) 94vw, 58vw" priority />
          </div>
        </div>
        {(product.id === "rs-hoodie-01" || product.id === "rs-cap-03") && (
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
          <h1 id="product-title">{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>

        {hasSizes && (
          <fieldset className={styles.sizeFieldset}>
            <legend>Size</legend>
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

        <button type="button" className={styles.addButton} onClick={add} disabled={hasSizes && !selectedSize}>
          <span>{added ? "Added" : "Add to bag"}</span>
          <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
        </button>

        <div className={styles.highlights}>
          <div className={styles.highlightList}>
            {highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
          </div>
        </div>

        <div className={styles.accordions}>
          <Accordion
            name="description"
            title="Details"
            open={openAccordion === "description"}
            onToggle={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
          >
            <p>{product.description}</p>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
