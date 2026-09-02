"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import styles from "./CollectionMotion.module.css";

export type CollectionMotionProps = {
  /** Called with the store product id when a gallery item is selected. */
  onSelect: (id: string) => void;
  className?: string;
};

type CollectionItem = {
  id: string;
  name: string;
  detail: string;
  image: string;
  alt: string;
};

const COLLECTION_ITEMS: CollectionItem[] = [
  {
    id: "rs-hoodie-01",
    name: "Heavyweight Sideline Hoodie",
    detail: "Heavy fleece · Rouse Maroon",
    image: "/images/raider_hoodie.jpg",
    alt: "Rouse Raiders maroon heavyweight hoodie with gold lettering",
  },
  {
    id: "rs-cap-03",
    name: "Raider FlexFit Cap",
    detail: "Performance twill · Gold R",
    image: "/images/raider_cap.jpg",
    alt: "Rouse Raiders black athletic cap with a maroon and gold R",
  },
];

/**
 * A slow, scroll-driven editorial rail inspired by the portfolio's
 * SlidingImages component. The cards are deliberately buttons so the rail
 * remains useful without hover or pointer motion.
 */
export default function CollectionMotion({ onSelect, className = "" }: CollectionMotionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Keep these hooks unconditional. Choosing a static value for reduced
  // motion happens at the style boundary below.
  const horizontalShift = useTransform(scrollYProgress, [0, 1], ["0px", `-${travel}px`]);

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
  }, []);

  const focusCard = (event: FocusEvent<HTMLButtonElement>) => {
    // Desktop keeps a native horizontal overflow surface underneath the
    // scroll transform, so keyboard focus can always bring a card into view.
    event.currentTarget.scrollIntoView({ block: "nearest", inline: "center" });
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.collection} ${className}`.trim()}
      aria-labelledby="collection-motion-title"
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>ROUSE / AFTER THE BELL</p>
          <h2 id="collection-motion-title">See you in the stands.</h2>
        </div>
        <p className={styles.instruction}>
          <span aria-hidden="true">↔</span> Scroll to explore
        </p>
      </div>

      <div className={styles.stickyFrame}>
        <div ref={viewportRef} className={styles.viewport}>
          <motion.div
            ref={trackRef}
            className={styles.track}
            style={{ x: reduceMotion ? 0 : horizontalShift }}
          >
            {COLLECTION_ITEMS.map((item, index) => (
              <article className={styles.card} key={item.id}>
                <button
                  type="button"
                  className={styles.cardButton}
                  onClick={() => onSelect(item.id)}
                  onFocus={focusCard}
                  aria-label={`View ${item.name}`}
                >
                  <span className={styles.imageFrame}>
                    <Image
                      src={item.image}
                      alt={item.alt}
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
                      <small>{item.detail}</small>
                    </span>
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </button>
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

export { COLLECTION_ITEMS };
