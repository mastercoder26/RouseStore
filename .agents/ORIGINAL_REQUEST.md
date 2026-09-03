# Original User Request

## 2026-09-02T22:31:32Z

Elevate the Rouse High School student e-commerce storefront (Raider Station) to production-grade quality (excluding an external live database) by introducing user reviews and ratings, a structured complaints/support flow, a discreet admin interface with the header tab removed, and silky-smooth interactive animations.

Working directory: /Users/akhilkonduru/vsc/RouseStore
Integrity mode: development

## Visual & Interaction References (Mobbin)
- [Glossier on Mobbin](https://mobbin.com/sites/sections/9912097d-5d6a-4046-8c0d-6ac555885561) & [KÖPPEN on Mobbin](https://mobbin.com/sites/sections/32e27c57-1beb-458c-8409-dc03af32f610): Editorial product reviews with bold aggregate ratings, 5-to-1 star distribution bars, verified student badges, and clean review submission cards.
- [Brilliant on Mobbin](https://mobbin.com/screens/99fea2d8-5783-43ca-b4bd-5fe033b6c490) & [Uxcel on Mobbin](https://mobbin.com/screens/ba6f533f-2102-462a-bc04-30ee06df0515): Restrained feedback and complaints slide-over drawer with topic pills, structured fields, and animated confirmation toasts.
- [Shopify on Mobbin](https://mobbin.com/screens/c1f2d4fb-b258-45d0-b345-1bb356118be3) & [Squarespace on Mobbin](https://mobbin.com/screens/73a6fc00-421e-4c71-8d6a-e1f43b2f78ed): Discreet administrative management console with clean metric cards, tabular reviews moderation, and categorized complaints inbox.
- [Airwallex on Mobbin](https://mobbin.com/screens/46ff1614-b773-43c7-abfd-5e949a89cbd9) & [Peec AI on Mobbin](https://mobbin.com/screens/64329409-eafa-4327-b1f8-7917b6bef1f1): Silky smooth slide-over drawer transitions using `cubic-bezier(0.76, 0, 0.24, 1)` easing, backdrop blur, and fluid gesture handling.
- [Whop on Mobbin](https://mobbin.com/screens/6cc10d46-2f15-48e3-9bb3-2ca63e561ced) & [DoorDash on Mobbin](https://mobbin.com/screens/edbae552-d10a-4e66-81f1-252028138900): Interactive star rating hover & click animations with scale bounce feedback.
- [Maze on Mobbin](https://mobbin.com/screens/30545233-1c08-436f-959b-253654674e61) & [Lovable on Mobbin](https://mobbin.com/screens/3d6804ac-999b-446c-ba5c-ce03fc3803cc): Subtle spring-animated confirmation toast notifications.

## Requirements

### R1. Product Reviews & 5-Star Rating System
- Provide a customer review and rating system on product detail pages (`/shop/[id]`) with aggregate star rating display, review counts, distribution breakdown bars (5 to 1 star), and verified student tag badges.
- Enable customers to submit reviews via a polished modal or inline form with interactive star selector, reviewer name, rating, title, comments, and recommendation toggle.
- Display compact average star ratings and review counts on catalog cards across `/shop` and home product showcases without disrupting layout alignment.
- Include "helpful" voting counters on individual reviews with client-side state tracking.

### R2. Global Customer Complaints & Feedback Drawer
- Implement an accessible, global "Feedback / Complaints" slide-over drawer accessible from the site shell (footer action and/or subtle header utility) and linked on product pages.
- Capture structured complaint submissions: complaint category (e.g. Order Issue, Item Condition / Defect, Sizing / Stock Request, General Grievance), customer contact info, detailed description, and urgency.
- Provide instant visual feedback with animated confirmation toast and dispatch entries to store state for admin review.

### R3. Discreet Admin Dashboard & Moderation
- Remove the "Admin" tab from the primary header navigation to keep the customer-facing navigation clean, minimal, and student-focused.
- Surface discreet administrative entry via a subtle footer link ("Staff Admin") and direct navigation to `/admin`, protected with a clean, tasteful PIN / passcode guard modal (default passcode: `raider2026`).
- Elevate the admin dashboard into a comprehensive, restrained management console featuring:
  1. **Catalog Inventory**: View, search, edit, toggle availability, and add products.
  2. **Reviews Moderation**: View submitted reviews, approve/hide reviews, and inspect review metrics.
  3. **Complaints Inbox**: View student complaints with category badges, status toggles (New, In Progress, Resolved), and staff notes.

### R4. Animation Polish & Editorial Motion
- Polish interactive animations across all components using Framer Motion and GPU-accelerated CSS transforms (`cubic-bezier(0.76, 0, 0.24, 1)`):
  - Retain and refine the signature sliding wordmark in the header.
  - Smooth slide-in/fade-in for the feedback drawer and dialog backdrops.
  - Interactive star fill transitions and button hover states.
  - Staggered product detail reveals and toast notifications.
- Ensure strict zero-layout-shift and respect `prefers-reduced-motion: reduce` across all animated elements.

### R5. Architecture & Production Scaffolding
- Implement a modular state architecture with client persistence (`localStorage`) and in-memory fallbacks for reviews, complaints, and products.
- Abstract storage operations behind a typed repository interface (e.g., `ReviewStore`, `ComplaintStore`, `ProductStore`) to allow immediate plug-and-play connection to a live database (PostgreSQL, Supabase, Prisma) in the future.

## Acceptance Criteria

### Customer Experience & Storefront
- [ ] Header navigation displays only customer links ("Home", "Shop") with the "Admin" link removed.
- [ ] Product detail page (`/shop/[id]`) displays interactive rating summary, distribution breakdown, reviews list, and "Write a Review" button.
- [ ] Submitting a review validates required fields, updates the product's average score immediately, and persists to local storage.
- [ ] Catalog cards in `/shop` and home showcases display aggregate star ratings and review counts.
- [ ] Global feedback drawer opens smoothly from the footer/shell, accepts categorized complaints, displays confirmation toast, and resets form fields.

### Admin & Moderation
- [ ] Discreet footer link ("Staff Admin") opens the admin portal; entering the correct PIN unlocks the console.
- [ ] Admin console includes dedicated tabs for Products, Reviews Moderation, and Complaints Inbox.
- [ ] Staff can filter complaints by status (All, New, Resolved) and update complaint resolution status.
- [ ] Staff can moderate reviews (approve / hide / delete).

### Motion & Quality Standards
- [ ] All animations run at 60/120fps with zero layout shift; animations gracefully disable or shorten when `prefers-reduced-motion: reduce` is active.
- [ ] All interactive elements (modal dialogs, drawers, star selectors) support keyboard navigation (`Tab`, `Escape`, `Enter`, `Space`) with visible focus outlines and ARIA attributes.
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run build` completes successfully with all static and dynamic routes rendered.

## Follow-up — 2026-09-02T22:41:25Z

The user requested to "wrap up soon". Please prioritize finishing the remaining milestones (Reviews & Ratings on product pages, Complaints drawer, Discreet Admin Console, and smooth animations polish), run the verification test suite and build, and bring the project to a clean, production-ready completion promptly.

## 2026-09-03T16:45:10Z

This is a focused bug-fixing task; keep it small and focused. Fix the initial page load visual glitch on Raider Station where the background store flashes and shows for a moment before the preloader animation plays, audit and eliminate any other UI/animation/rendering glitches across the site, ensure clean animation lifecycle and accessibility, and push the verified changes to GitHub on the main branch.

Working directory: /Users/akhilkonduru/vsc/RouseStore
Integrity mode: development

## Requirements

### R1. Prevent Pre-Animation Flash and Background Store Exposure
Ensure background store elements (header, announcements, product listings, footer) are completely concealed during initial load and hydration on `/` so no flashes, layout shifts, or raw store content appear before the opening intro animation sequence begins.

### R2. Comprehensive Storefront Glitch Audit & Fixes
Audit and resolve any other UI, animation, or rendering glitches across the storefront (e.g. flash of unstyled theme colors, drawer or modal transition glitches, layout shifts, unhandled image decode errors, or navigation flashes).

### R3. Maintain Animation Lifecycle and Accessibility
Ensure the preloader intro sequence plays smoothly to completion, respects `prefers-reduced-motion: reduce` by bypassing the intro cleanly without glitches or flashes, and cleanly releases focus, scroll locking, and overlay state upon completion.

### R4. Quality Assurance and Git Push
Verify all fixes by running project linting, production builds, and the existing test suite (`npm test`), then commit the changes with a clear commit message and push directly to `origin/main`.

## Acceptance Criteria

### Visual Concealment & Animation Stability
- [ ] On initial page load or hard refresh to `/`, no store background or content flashes are visible before the intro animation starts.
- [ ] Intro animation frames transition smoothly without dropped frames, flashes, or unexpected overlay dismissals.
- [ ] When `prefers-reduced-motion: reduce` is enabled, the store opens immediately and cleanly without flashing.
- [ ] No secondary visual glitches (theme flash, drawer stutter, layout shifts) remain across primary user flows.

### Verification & Delivery
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run build` completes successfully.
- [ ] `npm test` passes with all existing tests intact.
- [ ] Changes are committed and successfully pushed to remote `origin/main`.

## 2026-09-03T16:46:44Z

User directive: "dispatch more so stuff finished faster". Please maximize parallelism across audit, implementation, and review agents to expedite completion.

## 2026-09-03T16:52:08Z

Storefront Glitch Audit Report:

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
