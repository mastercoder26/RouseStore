"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { INTRO_REVEAL_EVENT, INTRO_SESSION_KEY } from "@/lib/intro";
import styles from "./PreLoader.module.css";

// Hard cuts keep the handmade character of the reference. The paper mark gets
// a longer hold before the single inversion and curtain reveal.
const FRAMES = [
  { file: "01-chalk-outline", at: 0, scale: 1 },
  { file: "05-bubble-doodle", at: 340, scale: 0.84 },
  { file: "02-pencil-scribble", at: 580, scale: 0.96 },
  { file: "04-halftone-print", at: 820, scale: 0.99 },
  { file: "03-torn-paper", at: 1080, scale: 1 },
] as const;
const REVEAL_AT = 2160;
const DURATION = 2920;
const EASE = "cubic-bezier(.76, 0, .24, 1)";

export default function PreLoader() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let timers: number[] = [];
    let active = false;
    let revealed = false;
    let generation = 0;

    const reveal = (animate: boolean) => {
      if (revealed) return;
      revealed = true;
      window.dispatchEvent(new CustomEvent(INTRO_REVEAL_EVENT, { detail: { animate } }));
    };

    const finish = () => {
      if (!active) return;
      active = false;
      generation += 1;
      timers.forEach(window.clearTimeout);
      timers = [];
      root.removeAttribute("data-rouse-intro");
      // Native dialog releases focus and background interaction on close.
      if (dialog.open) dialog.close();
      animations.forEach(animation => animation.cancel());
      animations = [];
      reveal(false);
      document.getElementById("main-content")?.focus({ preventScroll: true });
    };

    const animate = (element: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      if (!element) return;
      const animation = element.animate(frames, { fill: "both", ...options });
      animations.push(animation);
      return animation;
    };

    const start = async () => {
      if (active || pathname !== "/" || motionPreference.matches || document.hidden) {
        if (!active) root.removeAttribute("data-rouse-intro");
        return;
      }
      active = true;
      revealed = false;
      const run = ++generation;
      root.setAttribute("data-rouse-intro", "pending");

      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // Storage is optional; the current page still plays and exits normally.
      }

      try {
        dialog.showModal();
        // Failed assets or an interrupted animation must never hold the store closed.
        timers.push(window.setTimeout(finish, 4500));
        const images = Array.from(dialog.querySelectorAll("img"));
        await Promise.all(images.map(image => image.decode()));
        if (!active || run !== generation) return;
        root.setAttribute("data-rouse-intro", "playing");

        dialog.querySelectorAll("[data-intro-frame]").forEach((frame, index) => {
          const startOffset = FRAMES[index].at / DURATION;
          const endOffset = (FRAMES[index + 1]?.at ?? DURATION) / DURATION;
          animate(frame, [
            { opacity: index === 0 ? 1 : 0, offset: 0 },
            { opacity: 0, offset: startOffset },
            { opacity: 1, offset: startOffset },
            { opacity: 1, offset: endOffset },
            { opacity: index === FRAMES.length - 1 ? 1 : 0, offset: endOffset },
            { opacity: index === FRAMES.length - 1 ? 1 : 0, offset: 1 },
          // Repeated offsets make discrete cuts. A global steps easing would
          // freeze the entire timeline on its first frame until the end.
          ], { duration: DURATION, easing: "linear" });
        });

        animate(dialog.querySelector("[data-intro-mark]"), [
          { transform: "scale(.96)" }, { transform: "scale(1)" },
        ], { duration: 1400, easing: "cubic-bezier(.22, 1, .36, 1)" });

        animate(dialog.querySelector("[data-intro-wordmark]"), [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 500, delay: 1170, easing: "cubic-bezier(.22, 1, .36, 1)" });

        animate(dialog.querySelector("[data-intro-progress]"), [
          { transform: "scaleX(0)" }, { transform: "scaleX(1)" },
        ], { duration: REVEAL_AT, easing: "linear" });

        animate(dialog.querySelector("[data-intro-inversion]"), [
          { transform: "translateY(-101%)" }, { transform: "translateY(0)" },
        ], { duration: 580, delay: 1510, easing: EASE });

        const curtain = animate(dialog.querySelector("[data-intro-stage]"), [
          { transform: "translateY(0)" }, { transform: "translateY(-100%)" },
        ], { duration: DURATION - REVEAL_AT, delay: REVEAL_AT, easing: EASE });

        document.querySelectorAll("[data-intro-content]").forEach(element => {
          animate(element, [
            { transform: "translateY(28px)" }, { transform: "translateY(0)" },
          ], { duration: DURATION - REVEAL_AT, delay: REVEAL_AT, easing: EASE });
        });

        timers.push(window.setTimeout(() => reveal(true), REVEAL_AT));
        if (curtain) curtain.onfinish = finish;
      } catch {
        finish();
      }
    };

    const preferenceChanged = () => { if (motionPreference.matches) finish(); };
    const visibilityChanged = () => { if (document.hidden) finish(); };
    const cancel = (event: Event) => { event.preventDefault(); finish(); };
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("close", finish);
    motionPreference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);

    // Keep Strict Mode's setup/cleanup probe from consuming the first visit.
    // The head bootstrap already paints the opening frame while this waits.
    const startFrame = window.requestAnimationFrame(() => {
      if (root.hasAttribute("data-rouse-intro")) void start();
    });

    return () => {
      window.cancelAnimationFrame(startFrame);
      dialog.removeEventListener("cancel", cancel);
      dialog.removeEventListener("close", finish);
      motionPreference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      finish();
    };
  }, [pathname]);

  return (
    <dialog ref={dialogRef} id="rouse-intro" className={styles.intro} aria-label="Welcome to Raider Station" tabIndex={-1}>
      <div className={styles.stage} data-intro-stage>
        <div className={styles.topline} aria-hidden="true">
          <span>Rouse High School</span>
          <span>Leander, Texas</span>
        </div>
        <div className={styles.identity} aria-hidden="true">
          <div className={styles.mark} data-intro-mark>
            {FRAMES.map(frame => (
              <div key={frame.file} className={styles.frame} data-intro-frame style={{ "--mark-scale": frame.scale } as CSSProperties}>
                <Image src={`/images/intro/${frame.file}.webp`} width={640} height={640} alt="" loading="eager" unoptimized draggable={false} />
              </div>
            ))}
          </div>
          <div className={styles.wordmark} data-intro-wordmark>
            <span>Raider Station</span>
            <span>For the school day.</span>
          </div>
        </div>
        <div className={styles.bottomline}>
          <div className={styles.progress} aria-hidden="true"><span data-intro-progress /></div>
        </div>
        <div className={styles.inversion} data-intro-inversion aria-hidden="true" />
      </div>
    </dialog>
  );
}
