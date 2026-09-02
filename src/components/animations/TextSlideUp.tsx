"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { wordSlideUp } from "./anim";

interface TextSlideUpProps {
  text: string;
  className?: string;
  element?: "h1" | "h2" | "p" | "span";
}

export default function TextSlideUp({
  text,
  className = "",
  element = "h1",
}: TextSlideUpProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const words = text.split(" ");

  const Tag = element;

  return (
    <Tag ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            marginRight: "0.28em",
            verticalAlign: "top",
          }}
        >
          <motion.span
            variants={wordSlideUp}
            custom={i}
            initial="initial"
            animate={isInView ? "open" : "closed"}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
