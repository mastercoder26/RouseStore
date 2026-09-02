# Handoff Report — Survey Spec Miner 3 (Features, Interactions, Motion & Accessibility)

**Agent**: Survey Spec Miner 3  
**Target File / Deliverable**: `.agents/survey_spec_miner_3/spec_inventory.md`  
**Parent Conversation ID**: `c4e20483-932c-4198-951e-a1eeef046665`  
**Date**: 2026-09-02  

---

## 1. Observation

Direct codebase and specification observations:
- **`ORIGINAL_REQUEST.md` (lines 26-46)**:
  - Line 26-30 (R2): Specifies global "Feedback / Complaints" slide-over drawer accessible from the site shell (footer/header) and product pages, capturing structured submissions (category e.g. Order Issue, Item Condition / Defect, Sizing / Stock Request, General Grievance; urgency; contact info; description) with instant animated confirmation toast and dispatch to store state.
  - Line 31-38 (R3): Specifies removing "Admin" tab from header navigation, adding subtle footer link "Staff Admin" and direct navigation to `/admin`, protected with PIN guard modal (default passcode: `raider2026`), and comprehensive 3-tab console (Catalog Inventory, Reviews Moderation, Complaints Inbox with status toggles New/In Progress/Resolved and staff notes).
  - Line 39-46 (R4): Specifies animations using Framer Motion and GPU-accelerated CSS transforms (`cubic-bezier(0.76, 0, 0.24, 1)`): sliding wordmark in header, slide-in/fade-in for feedback drawer, interactive star rating hover/click bounce, staggered reveals, zero layout shift, and `prefers-reduced-motion: reduce` compliance.
  - Line 68: All interactive elements must support keyboard navigation (`Tab`, `Escape`, `Enter`, `Space`) with visible focus outlines and ARIA attributes.
- **`src/components/SiteShell.tsx` (lines 14-18, 51-67)**:
  - Header navigation currently includes `{ href: "/admin", label: "Admin" }` in `pages`, violating R3 requirement to remove the Admin link from the primary header navigation.
  - Footer currently renders `pages.map(...)` and lacks a discreet "Staff Admin" entry and "Feedback / Grievances" drawer trigger.
- **`src/components/SiteShell.module.css` (lines 47-98, 99-109)**:
  - Contains `.wordmarkCopyright` rotating 360deg and `.wordmarkStation` translating from `translateX(105%)` to `translateX(0)` with `transition: transform 500ms cubic-bezier(0.76, 0, 0.24, 1)`.
- **`src/app/admin/page.tsx` (lines 26-495)**:
  - Currently contains only single-view Inventory management with metric cards, filters, product grid, duplicate/delete/inline-price/edit/export/import.
  - Lacks PIN passcode protection modal (`raider2026`), lacks the 3-tab navigation system (`Catalog Inventory`, `Reviews Moderation`, `Complaints Inbox`), and lacks moderation/inbox controls.
- **`src/components/ShopDialogs.tsx` & `src/components/ShopDialogs.module.css`**:
  - Implements `useDialogLifecycle` with focus restoration and body scroll lock.
  - Implements `CartDrawer` with `cubic-bezier(.16, 1, .3, 1)` easing.
- **`src/lib/store.ts` (lines 1-172) & `src/components/StoreProvider.tsx` (lines 1-267)**:
  - Implements `ProductStore` and cart state with `localStorage` persistence.
  - Needs extension / companion typed stores for `ComplaintStore` and `ReviewStore` with persistence and action dispatchers (`addComplaint`, `updateComplaintStatus`, `updateStaffNote`, `deleteComplaint`).

---

## 2. Logic Chain

1. **R2 Requirements Formulation**:
   - Because the feedback drawer is global and requires slide-over motion with `cubic-bezier(0.76, 0, 0.24, 1)` and spring toast feedback, it should be anchored in `StoreProvider` / `SiteShell` and triggered via a context method (`openFeedbackDrawer()`) or accessible footer action.
   - The form requires categorized topic pills (`Order Issue`, `Item Condition / Defect`, `Sizing / Stock Request`, `General Grievance`, `Campus Service & Hours`), urgency selection (`Low`, `Medium`, `High`), contact fields (name, email/student ID, optional order #), and description.
   - Submissions must dispatch a new typed `Complaint` object into `ComplaintStore`, persist to `localStorage`, trigger the bottom spring toast, and reset the form.

2. **R3 Requirements Formulation**:
   - Primary header nav in `SiteShell.tsx` must be modified to only have `Home` and `Shop`.
   - A subtle "Staff Admin" link must be added to the footer.
   - Accessing `/admin` must check `sessionStorage.getItem("raider_admin_session_auth")`. If unauthenticated, the `AdminPinModal` must block the view, requiring passcode `raider2026`.
   - The `/admin` dashboard must be refactored into 3 top-level tabs:
     - Tab 1: **Catalog Inventory** (retaining full product CRUD, quick price edit, stock toggle, JSON backup/restore).
     - Tab 2: **Reviews Moderation** (listing all student reviews with product details, verified student badges, filter by status [All/Approved/Hidden], toggle Approve/Hide, delete review, and metric cards).
     - Tab 3: **Complaints Inbox** (listing student complaints with urgency color tags, status toggle [New/In Progress/Resolved], expandable staff notes with save functionality, and filter by status/category/urgency).

3. **R4 & A11y Formulation**:
   - Motion must standardize on `cubic-bezier(0.76, 0, 0.24, 1)` for slide-over drawer transitions and wordmark hover reveals.
   - Star selector must feature micro-bounce physics (`whileHover={{ scale: 1.25 }}`, `whileTap={{ scale: 0.85 }}`), smooth gold fill transitions, and active descriptive labels ("5 stars - Excellent / Raider Pride!").
   - Container layout shift must be prevented using explicit aspect ratios and reserved rating containers (CLS = 0).
   - `@media (prefers-reduced-motion: reduce)` and `useReducedMotion()` must zero all animations for full compliance.
   - Full keyboard accessibility (`Tab`, `Escape`, `Enter`, `Space`, Arrows) and ARIA attributes (`role="dialog"`, `aria-modal="true"`, `role="radiogroup"`, `aria-live="polite"`) must be enforced across all modals and drawers.

---

## 3. Caveats

- **External Database vs Client Storage**: In accordance with project requirements, persistence is client-side (`localStorage` and `sessionStorage`) behind clean typed repository interfaces, designed for future backend plug-and-play.
- **PIN Security**: The PIN `raider2026` is a discreet client-side guard for the school kiosk environment as specified in `ORIGINAL_REQUEST.md`. It does not replace full server-side JWT authentication if a remote backend is later connected.
- **Seed Data**: Initial complaints and reviews should have realistic Rouse High School demo seed data so the moderation and inbox interfaces are immediately testable and demonstrable out-of-the-box.

---

## 4. Conclusion

All functional requirements, user interactions, animation standards, accessibility specifications, and edge cases for Requirements R2, R3, R4, and WCAG 2.1 AA keyboard navigation have been comprehensively mined, structured, and recorded in `.agents/survey_spec_miner_3/spec_inventory.md`.

---

## 5. Verification Method

To verify these specifications:
1. Inspect `.agents/survey_spec_miner_3/spec_inventory.md` for complete specification tables, edge cases, and data contract definitions.
2. Verify that all assigned items from `DISPATCH.md` (R2 Feedback Drawer, R3 Discreet Admin & Moderation, R4 Motion Polish, Accessibility & Keyboard Nav) are fully mapped.
3. Builders can implement against the TypeScript contracts and component behavior matrices provided in Sections 3, 4, 5, 6, and 8 of `spec_inventory.md`.
