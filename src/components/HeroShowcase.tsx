"use client";

import { useEffect, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { PRODUCTS, formatPrice } from "@/lib/store";
import ProductVisual from "@/components/ProductVisual";
import styles from "./HeroShowcase.module.css";

const slides = ["rs-hoodie-01", "rs-cap-03"].map(id => PRODUCTS.find(product => product.id === id)!);
const accents = ["rs-notebook-04", "rs-bottle-05"].map(id => PRODUCTS.find(product => product.id === id)!);

export default function HeroShowcase({ scrollY }: { scrollY: MotionValue<number> }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<number[]>([]);
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 22 });
  const product = slides[index];
  const playing = !paused && !reducedMotion;

  useEffect(() => {
    if (!playing || engaged || focused || !loadedSlides.includes((index + 1) % slides.length)) return;
    const timer = setInterval(() => {
      if (!document.hidden && !document.querySelector("dialog[open]")) setIndex(current => (current + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [playing, engaged, focused, index, loadedSlides]);

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (!playing || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * 22);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - .5) * 18);
  }

  function leavePointer() {
    setEngaged(false);
    pointerX.set(0);
    pointerY.set(0);
  }

  function selectSlide(next: number) {
    const nextIndex = (next + slides.length) % slides.length;
    if (!loadedSlides.includes(nextIndex)) return;
    setIndex(nextIndex);
    setPaused(true);
  }

  return (
    <div className={`hero-product ${styles.showcase}`} onPointerMove={movePointer} onPointerEnter={() => setEngaged(true)} onPointerLeave={leavePointer} onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <Link className={`hero-image-button ${styles.imageButton}`} href={`/shop/${product.id}`} aria-label={`View ${product.name}`}>
        <motion.div className="hero-photo" style={{ y: reducedMotion ? 0 : scrollY }}>
          {slides.map((item, i) => (
            <motion.div
              className={styles.portrait}
              key={item.id}
              aria-hidden={index !== i}
              initial={false}
              // The bottom photograph remains opaque while the top one fades.
              // Fading both exposes the backdrop and causes a pale color pulse.
              animate={{ opacity: i === 0 || index === i ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : .7, ease: [.22, 1, .36, 1] }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 760px) 65vw, 40vw"
                priority={i === 0}
                loading={i === 0 ? undefined : "eager"}
                onLoad={() => setLoadedSlides(current => current.includes(i) ? current : [...current, i])}
              />
            </motion.div>
          ))}
        </motion.div>
        <span className="image-view"><ArrowUpRight size={25} strokeWidth={1.2} /></span>
      </Link>
      <div className="hero-product-caption" aria-live={playing ? "off" : "polite"}>
        <strong>{product.name}</strong><span>{formatPrice(product.price)}</span>
      </div>
      <div className={styles.controls} role="group" aria-label="Featured products">
        <span className={styles.counter}>0{index + 1} <span>/ 0{slides.length}</span></span>
        <div className={styles.buttons}>
          <button disabled={!loadedSlides.includes((index + 1) % slides.length)} onClick={() => selectSlide(index - 1)} aria-label="Previous featured product"><ArrowLeft size={16} strokeWidth={1.4} /></button>
          <button disabled={!loadedSlides.includes((index + 1) % slides.length)} onClick={() => selectSlide(index + 1)} aria-label="Next featured product"><ArrowRight size={16} strokeWidth={1.4} /></button>
          <button className={styles.playback} onClick={() => setPaused(!paused)} aria-label={paused ? "Play product animation" : "Pause product animation"}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
        </div>
      </div>
      <motion.div className={styles.accents} style={{ x: playing ? x : 0, y: playing ? y : 0 }} aria-hidden="true">
        {accents.map((item, i) => <div key={item.id} className={`${styles.accent} ${i === 1 ? styles.secondAccent : ""}`} style={{ animationPlayState: playing && !engaged && !focused ? "running" : "paused" }}><ProductVisual product={item} /></div>)}
      </motion.div>
    </div>
  );
}
