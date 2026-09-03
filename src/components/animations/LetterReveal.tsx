"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { INTRO_REVEAL_EVENT } from "@/lib/intro";

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

// A repeatable uneven cadence gives the reveal a hand-set editorial rhythm
// without scrambling, replacing, or randomly changing any characters.
const STAGGER_MS = [0, 120, 28, 240, 70, 190, 310, 20, 180, 90, 270, 135, 55, 225, 110, 330];
const REVEAL_DURATION_MS = 440;
const MAX_START_DELAY_MS = 400;

interface LetterRevealProps {
  text: string;
  element?: "span" | "h1" | "h2";
  className?: string;
  id?: string;
  delay?: number;
}

export default function LetterReveal({
  text,
  element: Tag = "span",
  className = "",
  id,
  delay = 0,
}: LetterRevealProps) {
  const container = useRef<HTMLElement>(null);
  const animations = useRef<Animation[]>([]);
  const inView = useInView(container, { once: true, margin: "-30px" });
  const reducedMotion = useReducedMotion();

  const cancelReveal = useCallback(() => {
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
  }, []);

  const playReveal = useCallback(() => {
    const node = container.current;
    if (!node) return;

    cancelReveal();
    const letters = node.querySelectorAll<HTMLElement>("[data-reveal-letter]");
    const startDelay = Math.min(Math.max(delay, 0), MAX_START_DELAY_MS);

    animations.current = Array.from(letters).map((letter, index) =>
      letter.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: REVEAL_DURATION_MS,
          delay: startDelay + STAGGER_MS[index % STAGGER_MS.length],
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "both",
        },
      ),
    );
  }, [cancelReveal, delay]);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    if (document.documentElement.hasAttribute("data-rouse-intro")) {
      const revealAfterIntro = (event: Event) => {
        if ((event as CustomEvent<{ animate: boolean }>).detail.animate) playReveal();
        else cancelReveal();
      };
      window.addEventListener(INTRO_REVEAL_EVENT, revealAfterIntro, { once: true });
      return () => {
        window.removeEventListener(INTRO_REVEAL_EVENT, revealAfterIntro);
        cancelReveal();
      };
    }
    playReveal();
    return cancelReveal;
  }, [cancelReveal, inView, playReveal, reducedMotion]);

  const handlePointerEnter = () => {
    if (!inView || reducedMotion) return;
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;
    playReveal();
  };

  // Keep the callback ref compatible with each permitted semantic Tag while
  // observing one stable HTMLElement reference for the in-view hook.
  const setContainer = (node: HTMLElement | null) => {
    container.current = node;
  };

  let characterIndex = 0;

  return (
    <Tag
      ref={setContainer}
      className={className}
      id={id}
      onPointerEnter={handlePointerEnter}
    >
      <span style={visuallyHidden}>{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, wordIndex, words) => (
          <span
            key={`${word}-${wordIndex}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              marginRight: "0.22em",
              verticalAlign: "top",
            }}
          >
            {Array.from(word).map((character) => {
              const index = characterIndex;
              characterIndex += 1;
              return (
                <span
                  key={`${character}-${index}`}
                  data-reveal-letter
                  style={{ display: "inline-block" }}
                >
                  {character}
                </span>
              );
            })}
            {wordIndex < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
