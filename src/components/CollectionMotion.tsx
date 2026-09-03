"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/store";
import styles from "./CollectionMotion.module.css";

export type CollectionMotionProps = {
  /** Optional callback when a gallery item is clicked */
  onSelect?: (id: string) => void;
  className?: string;
};

export default function CollectionMotion({ onSelect, className = "" }: CollectionMotionProps) {
  const { products } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const horizontalShift = useTransform(scrollYProgress, [0, 1], ["0px", `-${travel}px`]);

  // Curate top showcase items
  const featuredIds = ["rs-hoodie-01", "rs-jacket-02", "rs-cap-03", "rs-sneaker-11", "rs-bomber-06"];
  const items = featuredIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || typeof ResizeObserver === "undefined") return;

    const measureTravel = () => {
      setTravel(Math.max(0, track.scrollWidth - viewport.clientWidth));
    };

    measureTravel();
    const observer = new ResizeObserver(measureTravel);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [items.length]);

  const focusCard = (event: FocusEvent<HTMLAnchorElement>) => {
    event.currentTarget.scrollIntoView({ block: "nearest", inline: "center" });
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.collection} ${className}`.trim()}
      aria-labelledby="collection-motion-title"
    >
      <div className={styles.stickyFrame}>
        <div className={styles.heading}>
          <div>
            <p className={styles.kicker}>ROUSE / AFTER THE BELL</p>
            <h2 id="collection-motion-title">See you in the stands.</h2>
          </div>
          <p className={styles.instruction}>
            <span aria-hidden="true">↔</span> Scroll to explore
          </p>
        </div>

        <div ref={viewportRef} className={styles.viewport}>
          <motion.div
            ref={trackRef}
            className={styles.track}
            style={{ x: reduceMotion ? 0 : horizontalShift }}
          >
            {items.map((item, index) => (
              <article className={styles.card} key={item.id}>
                <Link
                  href={`/shop/${item.id}`}
                  className={styles.cardButton}
                  onClick={() => onSelect?.(item.id)}
                  onFocus={focusCard}
                  aria-label={`View ${item.name}`}
                >
                  <span className={styles.imageFrame}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 700px) 78vw, 48vw"
                      className={styles.image}
                    />
                    <span className={styles.index} aria-hidden="true">
                      0{index + 1}
                    </span>
                  </span>
                  <span className={styles.cardMeta}>
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {item.tag || item.category} · {formatPrice(item.price)}
                      </small>
                    </span>
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </Link>
              </article>
            ))}

            <aside className={styles.typePanel} aria-label="Rouse Raiders collection mark">
              <span className={styles.typeEyebrow}>ROUSE HIGH SCHOOL</span>
              <strong>ROUSE</strong>
              <strong>RAIDERS</strong>
              <span className={styles.typeRule} aria-hidden="true" />
              <span className={styles.typeFooter}>LEANDER · TEXAS / 2026</span>
            </aside>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
