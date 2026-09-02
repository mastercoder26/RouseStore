"use client";

import { useEffect, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { formatPrice } from "@/lib/store";
import { useStore } from "@/components/StoreProvider";
import styles from "./HeroShowcase.module.css";

export default function HeroShowcase({ scrollY }: { scrollY: MotionValue<number> }) {
  const { products } = useStore();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 22 });

  // Curate top showcase items
  const featuredIds = ["rs-hoodie-01", "rs-jacket-02", "rs-cap-03", "rs-bomber-06"];
  const slides = featuredIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products;

  const activeIndex = index % (slides.length || 1);
  const product = slides[activeIndex] || products[0];
  const playing = !paused && !reducedMotion && slides.length > 1;

  useEffect(() => {
    if (!playing || engaged || focused) return;
    const timer = setInterval(() => {
      if (!document.hidden && !document.querySelector("dialog[open]")) {
        setIndex(current => (current + 1) % slides.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [playing, engaged, focused, slides.length]);

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (!playing || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 16);
  }

  function leavePointer() {
    setEngaged(false);
    pointerX.set(0);
  }

  function selectSlide(next: number) {
    setIndex((next + slides.length) % slides.length);
    setPaused(true);
  }

  if (!product) return null;

  return (
    <div
      className={`hero-product ${styles.showcase}`}
      onPointerMove={movePointer}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={leavePointer}
      onFocus={() => setFocused(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Link
        className={`hero-image-button ${styles.imageButton}`}
        href={`/shop/${product.id}`}
        aria-label={`View ${product.name}`}
      >
        <motion.div
          className="hero-photo"
          style={{
            y: reducedMotion ? 0 : scrollY,
            x: playing ? x : 0,
          }}
        >
          {slides.map((item, i) => (
            <motion.div
              className={styles.portrait}
              key={item.id}
              aria-hidden={activeIndex !== i}
              initial={false}
              animate={{
                opacity: activeIndex === i ? 1 : 0,
                scale: activeIndex === i || reducedMotion ? 1 : 1.04,
              }}
              transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 760px) 75vw, 42vw"
                priority={i === 0}
                style={{ objectFit: "cover" }}
              />
            </motion.div>
          ))}
        </motion.div>
        <span className="image-view">
          <ArrowUpRight size={22} strokeWidth={1.5} />
        </span>
        <span className={styles.heroBadge}>
          {product.tag || product.category}
        </span>
      </Link>

      <div className="hero-product-caption" aria-live={playing ? "off" : "polite"}>
        <div>
          <strong>{product.name}</strong>
          <span style={{ marginLeft: "12px", color: "var(--muted)", fontSize: "11px" }}>
            {product.category}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {product.originalPrice && (
            <span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: "11px" }}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <strong style={{ color: "var(--maroon)", fontSize: "13px" }}>
            {formatPrice(product.price)}
          </strong>
        </div>
      </div>

      <div className={styles.controls} role="group" aria-label="Featured collection carousel">
        <div className={styles.thumbnailStrip} aria-hidden="true">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.thumbBtn} ${activeIndex === i ? styles.thumbBtnActive : ""}`}
              onClick={() => selectSlide(i)}
              aria-label={`Show ${item.name}`}
              aria-current={activeIndex === i}
            >
              <span className={styles.thumbImageWrap}>
                <Image src={item.image} alt="" fill sizes="36px" style={{ objectFit: "cover" }} />
              </span>
            </button>
          ))}
        </div>

        <div className={styles.buttons}>
          <button onClick={() => selectSlide(activeIndex - 1)} aria-label="Previous featured product">
            <ArrowLeft size={15} strokeWidth={1.5} />
          </button>
          <button onClick={() => selectSlide(activeIndex + 1)} aria-label="Next featured product">
            <ArrowRight size={15} strokeWidth={1.5} />
          </button>
          <button
            className={styles.playback}
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
