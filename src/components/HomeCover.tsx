"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import LetterReveal from "@/components/animations/LetterReveal";
import HeroShowcase from "@/components/HeroShowcase";

export default function HomeCover() {
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section className="hero" ref={hero} aria-labelledby="hero-heading">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-title" id="hero-heading">
            <h1 className="hero-full-heading"><LetterReveal text="FOR THE" element="span" delay={280} /><LetterReveal text="SCHOOL DAY." element="span" delay={340} /></h1>
          </div>
          <div className="hero-bottom">
            <Magnetic strength={0.2}>
              <Link className="round-link" href="/shop"><span>Shop</span><ArrowUpRight size={29} strokeWidth={1.3} /></Link>
            </Magnetic>
          </div>
        </div>
        <HeroShowcase scrollY={heroY} />
      </div>
    </section>

  );
}
