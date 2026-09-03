## 2026-09-03T16:46:09Z

You are the SWE Light Orchestrator (teamwork_preview_swe).

Your working directory: /Users/akhilkonduru/vsc/RouseStore/.agents/swe_1
Project root: /Users/akhilkonduru/vsc/RouseStore
Original request file: /Users/akhilkonduru/vsc/RouseStore/.agents/ORIGINAL_REQUEST.md (inspect the latest section ## 2026-09-03T16:45:10Z).

TASK:
This is a focused bug-fixing task; keep it small and focused. Fix the initial page load visual glitch on Raider Station where the background store flashes and shows for a moment before the preloader animation plays, audit and eliminate any other UI/animation/rendering glitches across the site, ensure clean animation lifecycle and accessibility, and push the verified changes to GitHub on the main branch.

Requirements:
1. R1. Prevent Pre-Animation Flash and Background Store Exposure:
   Ensure background store elements (header, announcements, product listings, footer) are completely concealed during initial load and hydration on `/` so no flashes, layout shifts, or raw store content appear before the opening intro animation sequence begins.
2. R2. Comprehensive Storefront Glitch Audit & Fixes:
   Audit and resolve any other UI, animation, or rendering glitches across the storefront (e.g. flash of unstyled theme colors, drawer or modal transition glitches, layout shifts, unhandled image decode errors, or navigation flashes).
3. R3. Maintain Animation Lifecycle and Accessibility:
   Ensure the preloader intro sequence plays smoothly to completion, respects `prefers-reduced-motion: reduce` by bypassing the intro cleanly without glitches or flashes, and cleanly releases focus, scroll locking, and overlay state upon completion.
4. R4. Quality Assurance and Git Push:
   Verify all fixes by running project linting (`npm run lint`), production builds (`npm run build`), and the existing test suite (`npm test`), then commit the changes with a clear commit message and push directly to `origin/main`.

Acceptance Criteria:
- On initial page load or hard refresh to `/`, no store background or content flashes are visible before the intro animation starts.
- Intro animation frames transition smoothly without dropped frames, flashes, or unexpected overlay dismissals.
- When `prefers-reduced-motion: reduce` is enabled, the store opens immediately and cleanly without flashing.
- No secondary visual glitches (theme flash, drawer stutter, layout shifts) remain across primary user flows.
- `npm run lint` passes with zero errors.
- `npm run build` completes successfully.
- `npm test` passes with all existing tests intact.
- Changes are committed and successfully pushed to remote `origin/main`.

Follow the SWE Light protocol:
Maintain BRIEFING.md and progress.md in your working directory (.agents/swe_1).
Dispatch teamwork_preview_implementer to investigate and implement the fixes and push to git origin/main.
Then run review rounds with teamwork_preview_reviewer.
Once verified and finished, report completion back to the Sentinel.

## 2026-09-03T16:46:56Z

Priority Directive from user:
"dispatch more so stuff finished faster"
Please maximize parallelism across audit, implementation, and review rounds to expedite completion and delivery as fast as possible.

## 2026-09-03T16:52:17Z

Storefront Glitch Audit Report to integrate into fixes and verification:

### High Priority Fixes:
1. **Initial Preloader Concealment**:
   - Prevent background store from showing during SSR and before intro plays.
   - Keep `<dialog id="rouse-intro">` or background concealed, ensure `data-rouse-intro` lifecycle is rock solid.
2. **Admin Page Authentication Hydration Mismatch**:
   - `src/app/admin/page.tsx:37-47, 117-119` & `src/components/StoreProvider.tsx:215-227`: Synchronous storage checks during `useState` cause SSR/client mismatch. Defer client-only session check or use `useSyncExternalStore`/`useEffect`.
3. **ThemeSelector Dropdown Clipped by Footer Overflow**:
   - `src/components/SiteShell.module.css:26, 39`: `.footer` has `overflow: clip` which cuts off the top ~180px of the ThemeSelector menu when it pops upwards. Fix positioning/overflow or render theme selector outside clipped container/adjust menu placement.
4. **Lenis Background Scroll Hijacking on Drawers & Modals**:
   - `src/components/SmoothScroll.tsx:56-69`: Lenis only checks `dialog[open]`. Custom drawers (`FeedbackDrawer`, `AdminProductModal`, `ReviewSubmissionModal`) need `data-lenis-prevent` or Lenis stop/start control when open. Also observe `childList` in `MutationObserver` so unmounted dialogs don't leave Lenis permanently stopped.
5. **Route Transition Containing Block Traps Fixed Modals**:
   - `src/app/template.tsx` and `src/app/globals.css`: `.page-enter` with `transform` creates a new containing block for `position: fixed` modals during route transition. Avoid `transform` or use an opacity-based enter.
6. **Lenis Anchor / Hash Scrolling**:
   - `globals.css:126`, `HomeCover.tsx:24`: Clicking `#everyday-picks` or `#reviews` fails/jumps because Lenis disables native scroll behavior. Integrate Lenis scrollTo or support anchor clicks.
7. **HeroShowcase Invalid Prop**:
   - `src/components/HeroShowcase.tsx:77`: Uses `preload={i === 0}` which is invalid on Next.js `<Image>`; change to `priority={i === 0}`.
8. **HomeCover Featured Grid Breakpoint Conflict**:
   - `globals.css:188` vs `HomeCover.module.css:66, 84-85`: Layout jumps 2 cols -> 3 cols -> 2 cols between 540px and 900px. Align breakpoints.
9. **Accessibility**:
   - `FeedbackDrawer.tsx:476-505`: Add Arrow key navigation (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) to category radiogroup.
   - `ProductDetails.tsx:127`: Remove unnecessary `tabIndex={0}` on desktop gallery container.

Ensure all of these items are verified and resolved, tested (`npm test`, `npm run lint`, `npm run build`), and pushed to origin/main.
