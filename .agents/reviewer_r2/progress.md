# Reviewer Round 2 Progress Log

## Summary of Findings & Resolutions
1. **Legacy Safari Viewport Units Fallback**:
   - Added `min-height: 100vh;` fallback before `100svh` in `SiteShell.module.css`.
   - Added `height` and `max-height` `100vh` fallbacks before `100dvh` in `ShopDialogs.module.css` (product dialog, cart drawer, mobile layouts).
   - Added `height: calc(100vh - 24px);` and `height: 100vh;` fallbacks before `100dvh` in `FeedbackDrawer.module.css`.
   - Added `top: 0; right: 0; bottom: 0; left: 0;` before `inset: 0` in `intro.ts` and `PreLoader.module.css`.

2. **Route Transitions & Lenis Scroll Reset Under Rapid Navigation**:
   - Updated `SmoothScroll.tsx` to handle in-page hash targets and call `lenis.resize()` and `lenis.scrollTo(0, { immediate: true, force: true })`.
   - The `force: true` option ensures Lenis executes the scroll reset even if its internal state was temporarily stopped during modal or intro teardown.
   - Added immediate synchronous `window.scrollTo({ top: 0, left: 0, behavior: "instant" })` fallback ensuring non-Lenis users (e.g. `prefers-reduced-motion: reduce`) always scroll to top on route change.
   - Scheduled a post-mount animation frame `lenis.resize()` to re-measure document height after new page layout effects execute.

3. **Header Wordmark Reduced Motion Legibility**:
   - In `SiteShell.module.css`, fixed a critical bug where `@media (prefers-reduced-motion: reduce)` set `transform: none` on `.wordmarkStation` but omitted `opacity: 1`, leaving "STATION" invisible (default opacity 0) for desktop users with reduced motion enabled.
   - Applied `opacity: 1 !important; transform: none !important; transition: none !important;`.

4. **Drawer & Modal Route Navigation / Lifecycle Teardown**:
   - Updated `StoreProvider.tsx` to watch `pathname` changes and automatically close `cartOpen` and `feedbackDrawerOpen`, preventing orphaned open overlays across route transitions.
   - Fixed body scroll locking in `ShopDialogs.tsx`, `FeedbackDrawer.tsx`, `AdminProductModal.tsx`, `AdminPinModal.tsx`, and `ReviewSubmissionModal.tsx`: instead of restoring `originalOverflow` which could be `"hidden"` (if another modal or intro was active during mount), clean up to `document.body.style.overflow = ""` when no other open dialogs remain.
   - Fixed focus restoration across all modals: if the trigger element has unmounted or disconnected (due to route transition or catalog re-render), gracefully fall back to focusing `document.getElementById("main-content")?.focus({ preventScroll: true })`.
   - Integrated `useReducedMotion()` into `AdminProductModal.tsx` (`AdminProductForm`) to disable scale/translate transitions when reduced motion is requested.

5. **Client-Side Navigation Flash to `/`**:
   - In `PreLoader.tsx`, set `requested = pathname === "/" && Boolean(root.getAttribute("data-rouse-intro"))`. This prevents the 2-second intro from re-running (and flashing unhidden store content before mounting) on client navigation from `/shop` back to `/`, while preserving initial page load / hard reload intro playback (where `INTRO_BOOTSTRAP` sets `data-rouse-intro="pending"`) and explicit replay requests via wordmark click.

6. **Test Suite Hardening**:
   - Replaced toothless tests in `tier1-motion-a11y.test.mjs` with deep assertions on `INTRO_BOOTSTRAP` and `INTRO_STYLE`.
   - Added tests R4.9, R4.10, R4.11, R4.12 verifying viewport unit fallbacks, Lenis route scroll reset, wordmark reduced motion, and modal overflow/focus fallback contracts.
