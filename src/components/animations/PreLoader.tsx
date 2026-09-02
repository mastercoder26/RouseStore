"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";

const PRELOADER_SESSION_KEY = "rouse-store-preloader-seen";

export default function PreLoader({ onComplete }: { onComplete?: () => void }) {
  const [dimension, setDimension] = useState({ width: 1000, height: 800 });
  // The curtain is progressive enhancement: server and first client render
  // are empty, so it can never block a no-JS document or hydration.
  const [isVisible, setIsVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const completed = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const handle = window.requestAnimationFrame(() => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    });
    return () => window.cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    const complete = () => {
      if (completed.current) return;
      completed.current = true;
      onComplete?.();
    };

    // Delay the opt-in by one frame. This is intentional: it gives the page a
    // valid, unblocked SSR/no-JS first paint before the first-session flourish.
    let exitTimer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      let hasBeenSeen = false;
      try {
        hasBeenSeen = window.sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1";
      } catch {
        // Storage can be unavailable in private browsing; the loader still runs once.
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (hasBeenSeen || reduceMotion || prefersReducedMotion) {
        complete();
        return;
      }

      try {
        window.sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
      } catch {
        // The visual still completes if session storage is unavailable.
      }

      setIsVisible(true);
      // Keep the curtain on screen for a beat, then let the curved exit finish
      // within a single, quick first-load transition.
      exitTimer = window.setTimeout(() => {
        setIsVisible(false);
        complete();
      }, 90);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
    };
  }, [onComplete, reduceMotion]);

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
      transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] as const },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && !reduceMotion && (
        <motion.div
          variants={{
            initial: { y: 0 },
            exit: {
              y: "calc(-100vh - 300px)",
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] as const },
            },
          }}
          initial="initial"
          exit="exit"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#571e2a",
            color: "#f2f0e9",
            willChange: "transform",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              fontSize: "clamp(1rem, 2.1vw, 1.45rem)",
              fontWeight: 700,
              letterSpacing: "0.14em",
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", backgroundColor: "#f2f0e9" }}
            />
            <span>RAIDER STATION</span>
          </motion.div>

          <svg
            aria-hidden="true"
            viewBox={`0 0 ${dimension.width} ${dimension.height + 300}`}
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "calc(100% + 300px)", fill: "#571e2a" }}
          >
            <motion.path variants={curve} initial="initial" exit="exit" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
