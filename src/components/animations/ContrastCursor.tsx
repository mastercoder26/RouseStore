"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function ContrastCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 450 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isFinePointer && !isReduced) {
      const handle = requestAnimationFrame(() => setEnabled(true));
      return () => cancelAnimationFrame(handle);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 14);
      cursorY.set(e.clientY - 14);

      const target = e.target as HTMLElement | null;
      if (
        target?.closest("button") ||
        target?.closest("a") ||
        target?.closest(".product-card-minimal") ||
        target?.closest(".strip-item-card")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled, cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 900,
        pointerEvents: "none",
        width: isHovered ? "42px" : "26px",
        height: isHovered ? "42px" : "26px",
        borderRadius: "50%",
        border: "1.5px solid rgba(255, 255, 255, 0.4)",
        backgroundColor: isHovered ? "rgba(110, 26, 39, 0.35)" : "transparent",
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        transition: "width 0.2s ease, height 0.2s ease, background-color 0.2s ease",
        willChange: "transform",
      }}
    />
  );
}
