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
        document.documentElement.hasAttribute("data-rouse-intro") ||
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

    checkModalState();

    const observer = new MutationObserver(checkModalState);

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["open", "style", "aria-hidden"],
    });

    const rootObserver = new MutationObserver(checkModalState);

    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-rouse-intro"],
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      rootObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top upon navigating to a new page, with support for hash targets and forced immediate reset
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        if (lenisRef.current) {
          lenisRef.current.resize();
          lenisRef.current.scrollTo(hash, { immediate: true, force: true });
        } else {
          target.scrollIntoView();
        }
        return;
      }
    }
    if (lenisRef.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(0, { immediate: true, force: true });
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    const rafId = requestAnimationFrame(() => {
      if (lenisRef.current) {
        lenisRef.current.resize();
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return (
    <LenisContext.Provider value={{ getLenis: () => lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}
