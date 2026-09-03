"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

interface LenisContextType {
  getLenis: () => Lenis | null;
}

const LenisContext = createContext<LenisContextType>({ getLenis: () => null });

export function useLenis() {
  const { getLenis } = useContext(LenisContext);
  return getLenis();
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easeOut
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      anchors: true,
    });

    lenisRef.current = lenis;

    // Attach to window for convenience/debugging
    if (typeof window !== "undefined") {
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Watch for open dialogs or custom modals to prevent background scrolling
    const checkModalState = () => {
      const hasModal = Boolean(
        document.querySelector("dialog[open]") ||
        document.querySelector("[role='dialog']:not([aria-hidden='true'])") ||
        document.body.style.overflow === "hidden"
      );
      if (hasModal) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    const observer = new MutationObserver(checkModalState);

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["open", "style", "aria-hidden"],
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top upon navigating to a new page
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return (
    <LenisContext.Provider value={{ getLenis: () => lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}
