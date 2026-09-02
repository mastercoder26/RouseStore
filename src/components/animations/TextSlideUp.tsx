"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const visuallyHidden: CSSProperties = {
  position: "absolute", width: "1px", height: "1px", padding: 0,
  margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap", border: 0,
};

interface TextSlideUpProps {
  text: string;
  className?: string;
  element?: "h1" | "h2" | "p" | "span";
  id?: string;
  delay?: number;
}

export default function TextSlideUp({ text, className = "", element: Tag = "h1", id, delay = 0 }: TextSlideUpProps) {
  const container = useRef<HTMLElement>(null);
  const revealed = useRef(false);
  const inView = useInView(container, { once: true, margin: "-30px" });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || reducedMotion || revealed.current) return;
    const words = container.current?.querySelectorAll<HTMLElement>("[data-reveal-word]");
    if (!words?.length) return;
    revealed.current = true;
    const animations = Array.from(words).map((word, index) => word.animate(
      [{ transform: "translateY(105%)" }, { transform: "translateY(0)" }],
      { duration: 650, delay: delay + index * 25, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "backwards" },
    ));
    return () => animations.forEach(animation => animation.cancel());
  }, [inView, reducedMotion, delay]);

  // Text remains visible in the server document. Animation is a one-time
  // enhancement when the actual words enter the viewport.
  return (
    <Tag ref={node => { container.current = node; }} className={className} id={id}>
      <span style={visuallyHidden}>{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, index, words) => (
          <span key={`${word}-${index}`} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.22em", verticalAlign: "top" }}>
            <span data-reveal-word style={{ display: "inline-block" }}>{word}</span>
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
