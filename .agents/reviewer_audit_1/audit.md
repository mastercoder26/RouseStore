# Comprehensive Storefront Glitch, Animation Lifecycle & Accessibility Audit

**Audit Date:** 2026-09-03  
**Target Application:** Raider Station (Rouse High School Student Store)  
**Auditor Archetype:** Reviewer & QA Specialist (`reviewer@swe_light` / `qa@swe_light`)  
**Workspace:** `/Users/akhilkonduru/vsc/RouseStore`  
**Focus Areas:** Requirement 2 (Comprehensive Storefront Glitch Audit) & Requirement 3 (Animation Lifecycle & Accessibility)

---

## Executive Summary

An adversarial audit of the Raider Station codebase was conducted covering client hydration boundaries, paint concealments, theme switching, modal/drawer transitions, layout shifts, motion accessibility (`prefers-reduced-motion: reduce`), focus trapping, body scroll locks, and overlay teardown.

While the core storefront features (catalog, reviews, complaints, admin console) demonstrate high visual quality and functional maturity, **8 distinct issues** were identified ranging from high-impact visual glitches to accessibility contract gaps. Most critically, the initial page load visual glitch on `/` is caused by a missing critical inline CSS concealment layer in `<head>`, allowing the raw store markup to paint before the preloader's external CSS chunk is parsed or before `showModal()` is invoked.

---

## Audit Findings Matrix

| ID | Category | Severity | Area | Description |
|---|---|---|---|---|
| **AUD-01** | Visual Glitch / Lifecycle | **High** | Initial Paint Concealment | Initial page load flashes unstyled/raw store content before preloader curtain renders |
| **AUD-02** | Accessibility / A11y | **High** | Admin Modals | `AdminProductModal` lacks `role="dialog"`, `aria-modal`, Escape handler, focus trap, and body scroll lock |
| **AUD-03** | Accessibility / UX | **Medium** | Admin Authentication | `AdminPinModal` lacks focus trap and body scroll lock; allows background tabbing and scrolling |
| **AUD-04** | Layout Shift (CLS) | **Medium** | Global Shell | Missing `scrollbar-gutter: stable` causes 15px layout shift upon modal/drawer scroll lock |
| **AUD-05** | Motion Accessibility | **Medium** | Theme Selector | `ThemeSelector` Framer Motion dropdown does not honor `prefers-reduced-motion: reduce` |
| **AUD-06** | Motion Accessibility | **Low** | Interactive Cursor | `ContrastCursor` lacks dynamic change listener for `prefers-reduced-motion` |
| **AUD-07** | Visual Lifecycle | **Medium** | Shell Staging | `SiteShell` footer is omitted from `data-intro-content`, breaking preloader curtain sync |
| **AUD-08** | Robustness / Lifecycle | **Medium** | Preloader Decoding | `PreLoader` uses `Promise.all` for image decoding; a single decode error aborts entire intro sequence |

---

## Detailed Findings, Root Cause Analysis & Remedies

### AUD-01: Background Store Flash and Preloader Concealment During Hydration

- **Severity:** High
- **Requirement:** R1 (Prevent Pre-Animation Flash and Background Store Exposure) & R2 (Glitch Audit)
- **Files Affected:**
  - `src/lib/intro.ts`
  - `src/app/layout.tsx`
  - `src/app/globals.css`
  - `src/components/animations/PreLoader.module.css`
  - `src/components/animations/PreLoader.tsx`

#### 1. Input → Expected → Actual
- **Input:** Hard refresh (Cmd+Shift+R) or first-time navigation to `http://localhost:3000/`.
- **Expected:** Viewport is immediately solid black/preloader-concealed with 0ms visual exposure of header, announcement banner, product cards, or footer prior to the intro mark playing.
- **Actual:** The announcement banner, header navigation, hero section, and product cards flash briefly on screen before being covered by the preloader curtain.

#### 2. Root Cause Analysis
1. `INTRO_BOOTSTRAP` runs an inline script in `<head>` that sets `data-rouse-intro="pending"` on `<html>`. However, **no critical CSS is inlined in `<head>`** to conceal the body or store shell.
2. In Next.js App Router, CSS for `.intro` is placed in an external CSS bundle (`/_next/static/chunks/...css`). Before this bundle finishes downloading and parsing, the browser performs its First Contentful Paint (FCP) on the server-rendered HTML body.
3. Because `<dialog id="rouse-intro">` is initially rendered without the `open` attribute, browser user-agent stylesheets apply `dialog:not([open]) { display: none; }` until overridden by external CSS.
4. In `PreLoader.tsx`, `start()` is queued via `requestAnimationFrame` on client mount and awaits `Promise.all(images.map(img => img.decode()))`. During this async gap before `dialog.showModal()` executes, any painted store content is fully visible.
5. In React Strict Mode (development), unmounting during component initialization executes `finish()`, which removes `data-rouse-intro`, immediately exposing the store before the second mount attempts to initialize the preloader.

#### 3. Test Reproduction Steps
1. In Chrome DevTools, open the **Network** tab and throttle network to "Fast 3G" or "Slow 4G".
2. Navigate to `http://localhost:3000/` and perform a hard refresh.
3. Observe that the header, banner, and hero typography paint immediately in parchment/white before the black preloader overlay pops into view.

#### 4. Suggested Remedy
In `src/lib/intro.ts`, extend the critical head script or embed an inline `<style>` directly in `<head>` of `src/app/layout.tsx` so that `html[data-rouse-intro]` immediately and synchronously conceals the storefront before any stylesheet chunk is downloaded:

```html
<!-- Inside src/app/layout.tsx <head> -->
<style dangerouslySetInnerHTML={{ __html: `
  html[data-rouse-intro] {
    background-color: #000 !important;
    overflow: hidden !important;
  }
  html[data-rouse-intro] body {
    background-color: #000 !important;
  }
  html[data-rouse-intro] #rouse-intro {
    display: block !important;
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: #000 !important;
    z-index: 99999 !important;
  }
  html[data-rouse-intro] [data-intro-content],
  html[data-rouse-intro] header,
  html[data-rouse-intro] main,
  html[data-rouse-intro] footer {
    visibility: hidden !important;
  }
`}} />
```

---

### AUD-02: `AdminProductModal` Missing ARIA Dialog Semantics, Escape Key, Focus Trapping & Scroll Lock

- **Severity:** High
- **Requirement:** R2 (Glitch Audit) & R3 (Animation Lifecycle and Accessibility)
- **Files Affected:** `src/components/AdminProductModal.tsx`

#### 1. Input → Expected → Actual
- **Input:** On `/admin`, enter staff PIN `raider2026`, navigate to "Catalog & Inventory", and click "+ Add New Product" or "Edit".
- **Expected:**
  1. Container has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
  2. Pressing `Escape` closes the modal.
  3. Body scroll is locked (`overflow: hidden`).
  4. Pressing `Tab` / `Shift+Tab` cycles only among the form controls inside the modal.
  5. Closing the modal restores focus to the triggering button.
  6. Opening/closing transitions respect `prefers-reduced-motion: reduce`.
- **Actual:**
  1. The modal container is an unsemantic `<div>` without ARIA dialog attributes.
  2. Pressing `Escape` does nothing.
  3. Background page can be scrolled while the modal is open.
  4. `Tab` navigation leaves the modal and focuses underlying table buttons and footer links.
  5. Trigger button focus is lost on close.
  6. Framer Motion animation runs even under reduced-motion settings.

#### 2. Root Cause Analysis
`AdminProductModal.tsx` was created as an inline form container without integrating the standardized `useDialogLifecycle` hook or the keyboard focus trap implemented in `FeedbackDrawer.tsx` and `ReviewSubmissionModal.tsx`.

#### 3. Test Reproduction Steps
1. Navigate to `http://localhost:3000/admin`.
2. Enter `raider2026` to unlock the console.
3. Click "+ Add New Product".
4. Press `Escape` — modal remains open.
5. Use mouse scroll wheel — underlying inventory table scrolls.
6. Press `Tab` past the final form button ("Create Product Listing") — focus jumps to background navigation links.

#### 4. Suggested Remedy
Enhance `src/components/AdminProductModal.tsx`:
1. Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="admin-product-modal-title"`.
2. Add `useEffect` to lock `document.body.style.overflow = "hidden"` on mount and restore on unmount.
3. Add `onKeyDown` handler listening for `Escape` to call `onClose()`.
4. Add Tab/Shift-Tab focus trapping loop across focusable elements.
5. Import `useReducedMotion` and set `transition={{ duration: reducedMotion ? 0 : 0.22 }}`.

---

### AUD-03: `AdminPinModal` Missing Focus Trap and Body Scroll Lock

- **Severity:** Medium
- **Requirement:** R3 (Animation Lifecycle and Accessibility)
- **Files Affected:** `src/components/admin/AdminPinModal.tsx`

#### 1. Input → Expected → Actual
- **Input:** Navigate to `/admin`.
- **Expected:** Focus is trapped inside the PIN modal; background cannot be scrolled or focused.
- **Actual:** Pressing `Shift+Tab` moves focus out of the modal to the skip link and header links in the background; background body remains scrollable.

#### 2. Root Cause Analysis
`AdminPinModal.tsx` only calls `inputRef.current?.focus()` on mount. It lacks a `Tab` key loop listener and does not set `document.body.style.overflow = "hidden"`.

#### 3. Test Reproduction Steps
1. Navigate to `http://localhost:3000/admin`.
2. With the PIN prompt displayed, press `Shift+Tab`.
3. Notice focus jumps to the skip link (`.skip-link`) behind the backdrop.

#### 4. Suggested Remedy
In `src/components/admin/AdminPinModal.tsx`:
1. Add a `useEffect` that sets `document.body.style.overflow = "hidden"` and restores it on cleanup.
2. Implement Tab key trapping between the PIN input and the submit button.

---

### AUD-04: Missing `scrollbar-gutter: stable` Causing Layout Shift on Modal/Drawer Open

- **Severity:** Medium
- **Requirement:** R2 (Layout Shift & Glitch Audit)
- **Files Affected:** `src/app/globals.css`

#### 1. Input → Expected → Actual
- **Input:** Open `FeedbackDrawer`, `CartDrawer`, or `ReviewSubmissionModal` on any desktop browser with classic scrollbars enabled (Windows, Linux, or macOS with "Show scroll bars: Always").
- **Expected:** Background storefront does not shift or jitter when the drawer or modal opens and closes.
- **Actual:** When `document.body.style.overflow = "hidden"` is engaged, the browser removes the 15-17px vertical scrollbar, causing the entire layout (header, product cards, footer) to violently jump to the right. When the overlay closes, the content jumps back to the left.

#### 2. Root Cause Analysis
`src/app/globals.css` does not declare `scrollbar-gutter: stable` on the root `html` element.

#### 3. Test Reproduction Steps
1. On macOS, go to System Settings > Appearance > Show scroll bars > Always.
2. Visit `http://localhost:3000/shop`.
3. Click "Bag" or "Feedback & grievances".
4. Observe the 15px layout jump in the header and catalog grid.

#### 4. Suggested Remedy
In `src/app/globals.css`:
```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 110px;
  background: var(--paper);
  scrollbar-gutter: stable;
}
```

---

### AUD-05: `ThemeSelector` Framer Motion Dropdown Ignores `prefers-reduced-motion: reduce`

- **Severity:** Medium
- **Requirement:** R3 (Animation Lifecycle and Accessibility)
- **Files Affected:** `src/components/ThemeSelector.tsx`

#### 1. Input → Expected → Actual
- **Input:** Enable `prefers-reduced-motion: reduce` in OS or Chrome DevTools Rendering tab, navigate to any page, click the Theme selector button in the footer.
- **Expected:** The theme selection menu appears and disappears instantaneously without slide or scale animations.
- **Actual:** The menu animates using `initial={{ opacity: 0, y: 8, scale: 0.96 }}` and `transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}`.

#### 2. Root Cause Analysis
In `src/components/ThemeSelector.tsx` lines 88-92, `useReducedMotion` is not imported or consulted.

#### 3. Test Reproduction Steps
1. In Chrome DevTools, open Command Menu (`Cmd+Shift+P`) and type "Emulate CSS prefers-reduced-motion: reduce".
2. Scroll to the footer and click the theme pill.
3. Observe the vertical slide and scale animation of the popup menu.

#### 4. Suggested Remedy
In `src/components/ThemeSelector.tsx`:
```tsx
import { useReducedMotion } from "framer-motion";
// ...
const prefersReducedMotion = useReducedMotion();
// ...
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
```

---

### AUD-06: `ContrastCursor` Missing Dynamic `prefers-reduced-motion` Event Listener

- **Severity:** Low
- **Requirement:** R3 (Animation Lifecycle and Accessibility)
- **Files Affected:** `src/components/animations/ContrastCursor.tsx`

#### 1. Input → Expected → Actual
- **Input:** User enables `prefers-reduced-motion: reduce` during an active browsing session.
- **Expected:** The custom magnetic/contrast cursor ring disables immediately without requiring a page reload.
- **Actual:** `ContrastCursor` only checks `window.matchMedia("(prefers-reduced-motion: reduce)").matches` once during component mount. Mid-session preference changes are ignored.

#### 2. Root Cause Analysis
Missing `change` event listener on the media query in `ContrastCursor.tsx` (unlike `Magnetic.tsx` which correctly subscribes to `reducedMotion.addEventListener("change", ...)`).

#### 3. Test Reproduction Steps
1. Open site in browser.
2. Toggle OS prefers-reduced-motion to "Reduce".
3. Notice cursor continues tracking pointer movements.

#### 4. Suggested Remedy
In `src/components/animations/ContrastCursor.tsx`, attach a `change` event listener to `window.matchMedia("(prefers-reduced-motion: reduce)")` to dynamically set `enabled = false` when reduction is turned on.

---

### AUD-07: Missing `data-intro-content` on SiteShell `footer`

- **Severity:** Medium
- **Requirement:** R1 (Concealment) & R3 (Animation Lifecycle)
- **Files Affected:** `src/components/SiteShell.tsx`

#### 1. Input → Expected → Actual
- **Input:** Inspect `SiteShell.tsx` line 43.
- **Expected:** All major page containers rendered by the shell (`announcement`, `header`, `main`, `footer`) participate in the preloader intro reveal sequence.
- **Actual:** `<footer className={styles.footer}>` lacks `data-intro-content`.

#### 2. Root Cause Analysis
`SiteShell.tsx` has `data-intro-content` on `.announcement`, `.header`, and `.main`, but accidentally missed `.footer`. When the preloader curtain pulls up and reveals content with upward translation, the footer does not participate. Furthermore, any CSS rules targeting `[data-intro-content]` for concealment fail to conceal the footer.

#### 3. Suggested Remedy
In `src/components/SiteShell.tsx` line 43, add `data-intro-content`:
```tsx
<footer className={styles.footer} data-intro-content>
```

---

### AUD-08: `PreLoader` Image Decoding Failure Fragility

- **Severity:** Medium
- **Requirement:** R1 (Concealment) & R3 (Animation Lifecycle)
- **Files Affected:** `src/components/animations/PreLoader.tsx`

#### 1. Input → Expected → Actual
- **Input:** A single decorative frame asset (e.g. `09-crumpled-foil.webp`) fails to load or decodes slowly on a congested connection.
- **Expected:** The preloader gracefully plays through available frames or transitions cleanly without an abrupt crash.
- **Actual:** `await Promise.all(images.map(image => image.decode()))` rejects immediately on the first decode failure. The `catch` block calls `finish()`, which abruptly dismisses the dialog, removes `data-rouse-intro`, and exposes the store prematurely.

#### 2. Root Cause Analysis
`Promise.all` fails fast. In `PreLoader.tsx` lines 136-173:
```tsx
try {
  dialog.showModal();
  resume();
  const images = Array.from(dialog.querySelectorAll("img"));
  await Promise.all(images.map(image => image.decode()));
  // ...
} catch {
  finish();
}
```

#### 3. Suggested Remedy
Use `Promise.allSettled` or individual `.catch()` handlers with a timeout boundary so that a single slow or corrupted frame does not crash the preloader:
```tsx
await Promise.all(
  images.map(image =>
    image.decode().catch(() => {
      /* Gracefully ignore single frame decode failure */
    })
  )
);
```

---

## Verification Plan & Regression Safeguards

To ensure that addressing the audit findings does not introduce regressions:
1. **Automated Test Suite:**
   Run `npm test` across all 94 existing tests:
   - `tier1-admin.test.mjs`
   - `tier1-complaints.test.mjs`
   - `tier1-feedback-drawer.test.mjs`
   - `tier1-motion-a11y.test.mjs`
   - `tier1-reviews-components.test.mjs`
   - `tier1-reviews-ui.test.mjs`
   - `tier1-reviews.test.mjs`
   - `tier1-storage-repositories.test.mjs`
   - `tier2-boundary-corner.test.mjs`
   - `tier2-challenger2-rating-state.test.mjs`
   - `tier3-cross-feature.test.mjs`
   - `tier4-user-journeys.test.mjs`
   - `tier5-storage-stress.test.mjs`
2. **Build and Lint Checks:**
   - `npm run lint` must pass with 0 errors and 0 warnings.
   - `npm run build` must succeed without TypeScript or Turbopack bundling errors.
3. **Reduced-Motion Emulation:**
   - Verify that with `prefers-reduced-motion: reduce`, `/` bypasses the preloader instantly without flashing and opens the store in clean static state.
   - Verify `ThemeSelector` and `AdminProductModal` animate with 0ms duration under reduced motion.
4. **Keyboard Accessibility Verification:**
   - Verify `AdminProductModal` closes on `Escape` and traps `Tab` cycles.
   - Verify `AdminPinModal` traps `Tab` between input and submit button.
