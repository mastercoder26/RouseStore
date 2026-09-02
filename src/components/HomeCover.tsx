"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import TextSlideUp from "@/components/animations/TextSlideUp";
import { useStore } from "@/components/StoreProvider";
import { formatPrice } from "@/lib/store";

export default function HomeCover() {
  const hero = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { openProduct } = useStore();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
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
              <Link className="round-link" href="/shop"><span>Shop the<br />collection</span><ArrowUpRight size={29} strokeWidth={1.3} /></Link>
            </Magnetic>
          </div>
          <Link className="hero-footnote" href="/school"><span>Rooted on Raider Way. Meet our school.</span><ArrowUpRight size={17} strokeWidth={1.4} /></Link>
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

  );
}
