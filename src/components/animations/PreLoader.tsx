"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { INTRO_REQUEST_EVENT, INTRO_REVEAL_EVENT } from "@/lib/intro";
import styles from "./PreLoader.module.css";

// Hard cuts keep the handmade character of the reference. The paper mark gets
// a longer hold before the curtain reveal, on a steady black background.
const FRAMES = [
  { file: "01-chalk-outline", at: 0, scale: 1 },
  { file: "06-stitched-thread", at: 180, scale: 1 },
  { file: "05-bubble-doodle", at: 310, scale: 0.84 },
  { file: "09-crumpled-foil", at: 440, scale: 0.99 },
  { file: "02-pencil-scribble", at: 570, scale: 0.96 },
  { file: "08-folded-ribbon", at: 700, scale: 1 },
  { file: "04-halftone-print", at: 830, scale: 0.99 },
  { file: "07-dry-brush-paint", at: 960, scale: 0.99 },
  { file: "10-ceramic-mosaic", at: 1090, scale: 1 },
  { file: "03-torn-paper", at: 1220, scale: 1 },
] as const;
const FINAL_FRAME_AT = FRAMES[FRAMES.length - 1].at;
const REVEAL_AT = FINAL_FRAME_AT + 360;
const DURATION = REVEAL_AT + 480;
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
    let active = false;
    let ready = false;
    let requested = pathname === "/";
    let revealed = false;
    let generation = 0;
    let frameRequest = 0;
    let watchdog = 0;
    let elapsed = 0;
    let previousTime: number | null = null;
    let visibleFrame = -1;
    const frames = Array.from(dialog.querySelectorAll<HTMLElement>("[data-intro-frame]"));

    const reveal = (animate: boolean) => {
      if (revealed) return;
      revealed = true;
      window.dispatchEvent(new CustomEvent(INTRO_REVEAL_EVENT, { detail: { animate } }));
    };

    const finish = () => {
      if (!active) return;
      active = false;
      ready = false;
      generation += 1;
      window.cancelAnimationFrame(frameRequest);
      window.clearTimeout(watchdog);
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
      // One visible-time clock drives every effect, including the curtain.
      animation.pause();
      animation.currentTime = 0;
      animations.push(animation);
      return animation;
    };

    const tick = (now: number) => {
      if (!active || !ready || document.hidden) return;
      // Do not skip logos after a dropped frame or a busy browser main thread.
      if (previousTime !== null) elapsed += Math.min(now - previousTime, 80);
      previousTime = now;
      let index = 0;
      FRAMES.forEach((frame, candidate) => {
        if (elapsed >= frame.at) index = candidate;
      });
      if (index !== visibleFrame) {
        frames.forEach((frame, candidate) => { frame.hidden = candidate !== index; });
        visibleFrame = index;
      }
      animations.forEach(animation => { animation.currentTime = elapsed; });
      if (elapsed >= REVEAL_AT) reveal(true);
      if (elapsed >= DURATION) finish();
      else frameRequest = window.requestAnimationFrame(tick);
    };

    const resume = () => {
      if (!active || document.hidden) return;
      previousTime = null;
      window.clearTimeout(watchdog);
      watchdog = window.setTimeout(finish, 10000);
      if (ready) {
        window.cancelAnimationFrame(frameRequest);
        frameRequest = window.requestAnimationFrame(tick);
      }
    };

    const start = async () => {
      if (active || pathname !== "/" || motionPreference.matches) {
        if (!active) root.removeAttribute("data-rouse-intro");
        return;
      }
      // A background tab must wait until its first visible visit to play.
      if (document.hidden) return;
      requested = false;
      active = true;
      ready = false;
      revealed = false;
      elapsed = 0;
      previousTime = null;
      visibleFrame = 0;
      frames.forEach((frame, index) => { frame.hidden = index !== 0; });
      const run = ++generation;
      root.setAttribute("data-rouse-intro", "loading");

      try {
        dialog.showModal();
        // Failed assets or an interrupted animation must never hold the store closed.
        resume();
        const images = Array.from(dialog.querySelectorAll("img"));
        await Promise.all(images.map(image => image.decode()));
        if (!active || run !== generation) return;
        root.setAttribute("data-rouse-intro", "playing");

        animate(dialog.querySelector("[data-intro-mark]"), [
          { transform: "scale(.96)" }, { transform: "scale(1)" },
        ], { duration: FINAL_FRAME_AT, easing: "cubic-bezier(.22, 1, .36, 1)" });

        animate(dialog.querySelector("[data-intro-wordmark]"), [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 300, delay: FINAL_FRAME_AT, easing: "cubic-bezier(.22, 1, .36, 1)" });

        animate(dialog.querySelector("[data-intro-progress]"), [
          { transform: "scaleX(0)" }, { transform: "scaleX(1)" },
        ], { duration: REVEAL_AT, easing: "linear" });

        animate(dialog.querySelector("[data-intro-stage]"), [
          { transform: "translateY(0)" }, { transform: "translateY(-100%)" },
        ], { duration: DURATION - REVEAL_AT, delay: REVEAL_AT, easing: EASE });

        document.querySelectorAll("[data-intro-content]").forEach(element => {
          animate(element, [
            { transform: "translateY(28px)" }, { transform: "translateY(0)" },
          ], { duration: DURATION - REVEAL_AT, delay: REVEAL_AT, easing: EASE });
        });

        ready = true;
        resume();
      } catch {
        finish();
      }
    };

    const preferenceChanged = () => { if (motionPreference.matches) finish(); };
    const visibilityChanged = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameRequest);
        window.clearTimeout(watchdog);
        previousTime = null;
      } else if (active) resume();
      else if (requested) void start();
    };
    const request = () => {
      if (pathname !== "/" || active) return;
      requested = true;
      void start();
    };
    const pageShown = (event: PageTransitionEvent) => {
      if (event.persisted) {
        finish();
        request();
      }
    };
    const cancel = (event: Event) => { event.preventDefault(); finish(); };
    const closed = () => { if (!dialog.open) finish(); };
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("close", closed);
    motionPreference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener(INTRO_REQUEST_EVENT, request);
    window.addEventListener("pageshow", pageShown);

    // Keep Strict Mode's setup/cleanup probe from consuming the first visit.
    // The head bootstrap already paints the opening frame while this waits.
    const startFrame = window.requestAnimationFrame(() => {
      if (requested) void start();
    });

    return () => {
      window.cancelAnimationFrame(startFrame);
      dialog.removeEventListener("cancel", cancel);
      dialog.removeEventListener("close", closed);
      motionPreference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener(INTRO_REQUEST_EVENT, request);
      window.removeEventListener("pageshow", pageShown);
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
            {FRAMES.map((frame, index) => (
              <div key={frame.file} className={styles.frame} data-intro-frame hidden={index !== 0} style={{ "--mark-scale": frame.scale } as CSSProperties}>
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
      </div>
    </dialog>
  );
}
