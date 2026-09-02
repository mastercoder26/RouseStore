import type { Variants } from "framer-motion";

export const preloaderOpacity: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.9,
    transition: { duration: 0.6, delay: 0.2 },
  },
};

export const preloaderSlideUp: Variants = {
  initial: {
    y: 0,
  },
  exit: {
    y: "calc(-100vh - 300px)",
    transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 },
  },
};

export const wordSlideUp: Variants = {
  initial: {
    y: "100%",
  },
  open: (i: number) => ({
    y: "0%",
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as const, delay: 0.02 * i },
  }),
  closed: {
    y: "100%",
    transition: { duration: 0.5 },
  },
};

export const fadeReveal: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 },
  },
  closed: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.4 },
  },
};
