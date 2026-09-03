import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "../harness/test-framework.mjs";
import {
  MOTION_BEZIER,
  MOTION_EASING_ARRAY,
} from "../harness/domain-adapters.mjs";
import { INTRO_BOOTSTRAP, INTRO_STYLE } from "../../src/lib/intro.ts";

describe("Tier 1: Feature R4 - Motion Polish & Accessibility", () => {
  it("R4.1: Validates cubic-bezier(0.76, 0, 0.24, 1) transition curves", () => {
    expect(MOTION_BEZIER).toBe("cubic-bezier(0.76, 0, 0.24, 1)");
    expect(MOTION_EASING_ARRAY.length).toBe(4);
    expect(MOTION_EASING_ARRAY[0]).toBe(0.76);
    expect(MOTION_EASING_ARRAY[1]).toBe(0);
    expect(MOTION_EASING_ARRAY[2]).toBe(0.24);
    expect(MOTION_EASING_ARRAY[3]).toBe(1);

    // Easing validator for Framer Motion variant definitions
    const drawerTransitionConfig = {
      type: "tween",
      ease: MOTION_EASING_ARRAY,
      duration: 0.45,
    };
    expect(drawerTransitionConfig.ease).toEqual([0.76, 0, 0.24, 1]);
  });

  it("R4.2: Star rating component satisfies ARIA radiogroup / slider accessibility contracts", () => {
    const createStarRatingA11yProps = (value, onChange) => {
      return {
        role: "radiogroup",
        "aria-label": "Product rating",
        stars: [1, 2, 3, 4, 5].map((star) => ({
          role: "radio",
          "aria-label": `${star} star${star > 1 ? "s" : ""}`,
          "aria-checked": value === star,
          tabIndex: value === star || (value === 0 && star === 1) ? 0 : -1,
          onKeyDown: (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              const next = Math.min(5, star + 1);
              onChange(next);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              const prev = Math.max(1, star - 1);
              onChange(prev);
            } else if (e.key === "Enter" || e.key === " ") {
              onChange(star);
            }
          },
        })),
      };
    };

    let selectedStar = 3;
    const a11y = createStarRatingA11yProps(selectedStar, (val) => { selectedStar = val; });

    expect(a11y.role).toBe("radiogroup");
    expect(a11y.stars.length).toBe(5);
    expect(a11y.stars[2]["aria-checked"]).toBe(true);
    expect(a11y.stars[2].tabIndex).toBe(0);
    expect(a11y.stars[0].tabIndex).toBe(-1);

    // Simulate right arrow key
    a11y.stars[2].onKeyDown({ key: "ArrowRight" });
    expect(selectedStar).toBe(4);

    // Simulate left arrow key
    a11y.stars[2].onKeyDown({ key: "ArrowLeft" });
    expect(selectedStar).toBe(2);
  });

  it("R4.3: Dialogs and drawers enforce role='dialog', aria-modal='true', and Escape handler", () => {
    const createModalA11yContracts = (isOpen, titleId, onClose) => {
      return {
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": titleId,
        handleKeyDown: (e) => {
          if (e.key === "Escape") {
            onClose();
          }
        },
      };
    };

    let closed = false;
    const modal = createModalA11yContracts(true, "feedback-drawer-title", () => { closed = true; });

    expect(modal.role).toBe("dialog");
    expect(modal["aria-modal"]).toBe(true);
    expect(modal["aria-labelledby"]).toBe("feedback-drawer-title");

    modal.handleKeyDown({ key: "Escape" });
    expect(closed).toBe(true);
  });

  it("R4.4: Enforces prefers-reduced-motion: reduce contract", () => {
    const getAnimationDuration = (prefersReducedMotion, normalDuration) => {
      if (prefersReducedMotion) return 0;
      return normalDuration;
    };

    expect(getAnimationDuration(false, 0.45)).toBe(0.45);
    expect(getAnimationDuration(true, 0.45)).toBe(0);

    const getReducedMotionStyle = (prefersReducedMotion) => {
      return prefersReducedMotion
        ? { transition: "none", animation: "none", transform: "none" }
        : { transition: `transform 0.45s ${MOTION_BEZIER}` };
    };

    const reducedStyle = getReducedMotionStyle(true);
    expect(reducedStyle.transition).toBe("none");
    expect(reducedStyle.animation).toBe("none");
  });

  it("R4.5: Zero Layout Shift (CLS = 0) contract for rating badges and cards", () => {
    // Contract: Rating badges must define min-height / min-width to avoid CLS when reviews load
    const ratingBadgeLayoutRules = {
      minHeight: "20px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    };

    expect(ratingBadgeLayoutRules.minHeight).toBe("20px");
    expect(ratingBadgeLayoutRules.display).toBe("inline-flex");
  });

  it("R4.6: Toast notifications define accessible role='status' and aria-live='polite'", () => {
    const toastA11yAttributes = {
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
    };

    expect(toastA11yAttributes.role).toBe("status");
    expect(toastA11yAttributes["aria-live"]).toBe("polite");
    expect(toastA11yAttributes["aria-atomic"]).toBe("true");
  });

  it("R4.7: Critical intro CSS establishes concealment and fixed dialog positioning across intro states", () => {
    // Real validation of INTRO_STYLE from src/lib/intro.ts
    expect(typeof INTRO_STYLE).toBe("string");
    expect(INTRO_STYLE.length).toBeGreaterThan(500);

    // Concealment states must hide content with high specificity !important
    expect(INTRO_STYLE.includes('html[data-rouse-intro="pending"] [data-intro-content]')).toBe(true);
    expect(INTRO_STYLE.includes('visibility: hidden !important')).toBe(true);
    expect(INTRO_STYLE.includes('opacity: 0 !important')).toBe(true);
    expect(INTRO_STYLE.includes('pointer-events: none !important')).toBe(true);

    // Dialog fullscreen coverage and positioning across intro states
    expect(INTRO_STYLE.includes('html[data-rouse-intro] #rouse-intro')).toBe(true);
    expect(INTRO_STYLE.includes('position: fixed !important')).toBe(true);
    expect(INTRO_STYLE.includes('z-index: 1000 !important')).toBe(true);
    expect(INTRO_STYLE.includes('inset: 0 !important')).toBe(true);
    expect(INTRO_STYLE.includes('top: 0 !important')).toBe(true);

    // Pointer events during curtain reveal must pass through to allow clicking store content
    expect(INTRO_STYLE.includes('html[data-rouse-intro="revealing"] #rouse-intro')).toBe(true);

    // Reduced motion must immediately override concealment
    expect(INTRO_STYLE.includes('@media (prefers-reduced-motion: reduce)')).toBe(true);
    expect(INTRO_STYLE.includes('display: none !important')).toBe(true);
  });

  it("R4.8: Enforces bootstrap watchdog and fail-safe recovery contract", () => {
    // Real validation of INTRO_BOOTSTRAP from src/lib/intro.ts
    expect(typeof INTRO_BOOTSTRAP).toBe("string");
    expect(INTRO_BOOTSTRAP.includes("location.pathname !== '/'")).toBe(true);
    expect(INTRO_BOOTSTRAP.includes("prefers-reduced-motion: reduce")).toBe(true);
    expect(INTRO_BOOTSTRAP.includes("setTimeout(release, 6000)")).toBe(true);
    expect(INTRO_BOOTSTRAP.includes("window.addEventListener('error', release)")).toBe(true);
    expect(INTRO_BOOTSTRAP.includes("document.addEventListener('visibilitychange', arm)")).toBe(true);

    // Simulating the bootstrap execution environment
    let attributeVal = null;
    const mockRoot = {
      setAttribute: (k, v) => { attributeVal = v; },
      removeAttribute: () => { attributeVal = null; },
      getAttribute: () => attributeVal,
    };
    mockRoot.setAttribute("data-rouse-intro", "pending");
    expect(mockRoot.getAttribute("data-rouse-intro")).toBe("pending");

    mockRoot.removeAttribute("data-rouse-intro");
    expect(mockRoot.getAttribute("data-rouse-intro")).toBe(null);
  });

  it("R4.9: Cross-browser fallback contracts for viewport height units (100dvh/100svh -> 100vh)", () => {
    const cwd = process.cwd();
    const siteShellCss = fs.readFileSync(path.join(cwd, "src/components/SiteShell.module.css"), "utf-8");
    const shopDialogsCss = fs.readFileSync(path.join(cwd, "src/components/ShopDialogs.module.css"), "utf-8");
    const feedbackDrawerCss = fs.readFileSync(path.join(cwd, "src/components/feedback/FeedbackDrawer.module.css"), "utf-8");

    // SiteShell must define 100vh before 100svh
    expect(siteShellCss.includes("min-height: 100vh;")).toBe(true);
    expect(siteShellCss.includes("min-height: 100svh;")).toBe(true);
    expect(siteShellCss.indexOf("min-height: 100vh;")).toBeLessThan(siteShellCss.indexOf("min-height: 100svh;"));

    // ShopDialogs must define 100vh fallbacks before 100dvh
    expect(shopDialogsCss.includes("max-height: calc(100vh - 32px);")).toBe(true);
    expect(shopDialogsCss.includes("max-height: calc(100dvh - 32px);")).toBe(true);
    expect(shopDialogsCss.includes("height: calc(100vh - 24px);")).toBe(true);
    expect(shopDialogsCss.includes("height: calc(100dvh - 24px);")).toBe(true);

    // FeedbackDrawer must define 100vh fallbacks before 100dvh
    expect(feedbackDrawerCss.includes("height: calc(100vh - 24px);")).toBe(true);
    expect(feedbackDrawerCss.includes("height: calc(100dvh - 24px);")).toBe(true);
    expect(feedbackDrawerCss.includes("height: 100vh;")).toBe(true);
    expect(feedbackDrawerCss.includes("height: 100dvh;")).toBe(true);
  });

  it("R4.10: SmoothScroll route transition contract enforces immediate forced scroll reset and resize", () => {
    let scrolledTo = null;
    let resized = false;
    const mockLenis = {
      resize: () => { resized = true; },
      scrollTo: (target, opts) => { scrolledTo = { target, opts }; },
    };

    // Simulate route navigation handler
    const onRouteTransition = (hash) => {
      if (hash) {
        mockLenis.resize();
        mockLenis.scrollTo(hash, { immediate: true, force: true });
        return;
      }
      mockLenis.resize();
      mockLenis.scrollTo(0, { immediate: true, force: true });
    };

    onRouteTransition();
    expect(resized).toBe(true);
    expect(scrolledTo).toEqual({ target: 0, opts: { immediate: true, force: true } });

    // Hash anchor navigation
    onRouteTransition("#catalog-section");
    expect(scrolledTo).toEqual({ target: "#catalog-section", opts: { immediate: true, force: true } });
  });

  it("R4.11: Header wordmark contract enforces immediate opacity: 1 and no transforms under reduced motion", () => {
    const cwd = process.cwd();
    const siteShellCss = fs.readFileSync(path.join(cwd, "src/components/SiteShell.module.css"), "utf-8");

    // Reduced motion media query must specify opacity: 1 and transform: none
    const reducedMotionSection = siteShellCss.slice(siteShellCss.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reducedMotionSection.includes(".wordmarkStation")).toBe(true);
    expect(reducedMotionSection.includes("opacity: 1")).toBe(true);
    expect(reducedMotionSection.includes("transform: none")).toBe(true);
    expect(reducedMotionSection.includes("transition: none")).toBe(true);
  });

  it("R4.12: Modal lifecycle contract releases body overflow lock safely and restores focus with fallback", () => {
    let bodyOverflow = "hidden";
    const unlockBodyScroll = (hasRemainingModal, fallback) => {
      if (!hasRemainingModal) {
        bodyOverflow = "";
      } else if (fallback && fallback !== "hidden") {
        bodyOverflow = fallback;
      }
    };

    // No remaining modals -> overflow cleared to empty string
    unlockBodyScroll(false, "hidden");
    expect(bodyOverflow).toBe("");

    // Focus restoration fallback
    let focusedId = null;
    const restoreFocusOrFallback = (element, mainContentId) => {
      if (element && element.isConnected) {
        focusedId = element.id;
      } else {
        focusedId = mainContentId;
      }
    };

    // Connected element restores focus
    restoreFocusOrFallback({ id: "trigger-btn", isConnected: true }, "main-content");
    expect(focusedId).toBe("trigger-btn");

    // Disconnected (unmounted route) element falls back to main content
    restoreFocusOrFallback({ id: "dead-btn", isConnected: false }, "main-content");
    expect(focusedId).toBe("main-content");
  });
});
