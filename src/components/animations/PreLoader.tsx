"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { preloaderOpacity, preloaderSlideUp } from "./anim";

const WORDS = [
  "ROUSE HIGH SCHOOL",
  "RAIDERS",
  "LEANDER, TEXAS",
  "CREATING TRADITIONS",
  "THE RAIDER STATION",
];

export default function PreLoader({ onComplete }: { onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (index === WORDS.length - 1) {
      const finishTimer = setTimeout(() => {
        setIsDone(true);
        if (onComplete) onComplete();
      }, 700);
      return () => clearTimeout(finishTimer);
    }

    const timer = setTimeout(
      () => {
        setIndex((prev) => prev + 1);
      },
      index === 0 ? 900 : 180
    );

    return () => clearTimeout(timer);
  }, [index, onComplete]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
    dimension.height
  } Q${dimension.width / 2} ${dimension.height + 300} 0 ${
    dimension.height
  } L0 0`;

  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
    dimension.height
  } Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;

  const curve: Variants = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {!isDone && (
        <motion.div
          variants={preloaderSlideUp}
          initial="initial"
          exit="exit"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            color: "#fafafa",
            willChange: "transform",
          }}
        >
          {dimension.width > 0 && (
            <>
              <motion.div
                variants={preloaderOpacity}
                initial="initial"
                animate="enter"
                style={{
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  fontSize: "clamp(1.2rem, 3vw, 2rem)",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.08em",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#6e1a27",
                    border: "1px solid #f59e0b",
                  }}
                />
                <span>{WORDS[index]}</span>
              </motion.div>

              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  width: "100%",
                  height: "calc(100% + 300px)",
                  fill: "#09090b",
                }}
              >
                <motion.path
                  variants={curve}
                  initial="initial"
                  exit="exit"
                />
              </svg>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
