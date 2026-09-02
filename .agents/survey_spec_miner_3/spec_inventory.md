# RouseStore Specification Inventory — Features, Interactions, Admin, Motion & Accessibility

**Agent**: Survey Spec Miner 3 (Features & Interaction Spec Miner)  
**Date**: 2026-09-02  
**Target Project**: Rouse High School Student Store (Raider Station)  
**Assigned Scope**: Requirements R2, R3, R4, and Accessibility / Keyboard Navigation  
**Authoritative Sources**: `ORIGINAL_REQUEST.md`, `CLAUDE.md`, `docs/design-references.md`, existing codebase (`src/app/*`, `src/components/*`, `src/lib/store.ts`)

---

## 1. Executive Summary & Architectural Scope

This specification document outlines the functional and non-functional requirements for:
1. **R2: Global Customer Complaints & Feedback Drawer**: A slide-over drawer modal with `cubic-bezier(0.76, 0, 0.24, 1)` easing, categorized topic pills, urgency levels, structured contact info, client persistence, and spring confirmation toasts.
2. **R3: Discreet Admin Dashboard & Moderation**: Removal of the primary header "Admin" tab, discreet "Staff Admin" entry in the footer, passcode guard protection (`raider2026`), and a 3-tab management console (Catalog Inventory, Reviews Moderation, Complaints Inbox).
3. **R4: Animation Polish & Editorial Motion**: Header sliding wordmark (`cubic-bezier(0.76, 0, 0.24, 1)`), interactive star hover/tap micro-animations with scale bounce, staggered reveals, zero layout shift (CLS = 0), and strict `prefers-reduced-motion: reduce` compliance.
4. **Accessibility & Keyboard Navigation**: Full WCAG 2.1 AA compliance, complete keyboard navigation (`Tab`, `Escape`, `Enter`, `Space`, Arrow keys), focus trapping and restoration, high-contrast focus rings, and comprehensive ARIA roles (`dialog`, `radiogroup`, `tablist`, `aria-live`).

---

## 2. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R2: Feedback Drawer | Global Drawer Trigger | Opens the slide-over feedback drawer from shell footer or utility link | User click on "Student Feedback" / "Staff Admin & Support" | Drawer opens with slide-in animation | None (idempotent open) | `ORIGINAL_REQUEST.md` § R2, `SiteShell.tsx` |
| 2 | R2: Feedback Drawer | Topic / Category Selector | Single-select pill selector for complaint category | Click/keyboard on category pill | Active pill highlighted in maroon (`--maroon`) | Default fallback to first category | `ORIGINAL_REQUEST.md` § R2, `docs/design-references.md` |
| 3 | R2: Feedback Drawer | Urgency Level Selector | Select urgency (`Low`, `Medium`, `High`) for grievance triage | Click on urgency chip or dropdown | Visual urgency indicator with distinct colorway | Defaults to `Medium` if unselected | `ORIGINAL_REQUEST.md` § R2 |
| 4 | R2: Feedback Drawer | Structured Contact & Message Fields | Input fields for student name, student email/ID, optional order #, and detailed message | Text strings entered by user | Validated form state ready for dispatch | Red outline, error label, focus on invalid input | `ORIGINAL_REQUEST.md` § R2 |
| 5 | R2: Feedback Drawer | Complaint Dispatch & Persistence | Saves complaint to `ComplaintStore` / `localStorage` | Form submission event | New complaint object appended to store, form reset | Graceful in-memory fallback if `localStorage` full | `ORIGINAL_REQUEST.md` § R2 & R5, `src/lib/store.ts` |
| 6 | R2: Feedback Drawer | Animated Confirmation Toast | Spring-physics toast notification floating from bottom center | Triggered on successful complaint submission | Visual pill toast showing confirmation message and auto-dismissing in 3.8s | Close button allows manual early dismissal | `ORIGINAL_REQUEST.md` § R2, `StoreProvider.tsx` |
| 7 | R3: Admin Console | Header Nav Cleanup | Removes "Admin" link from header navigation, keeping only "Home" and "Shop" | Route change / render | Header renders only student-facing navigation links | N/A | `ORIGINAL_REQUEST.md` § R3, `SiteShell.tsx` |
| 8 | R3: Admin Console | Discreet Footer Entry | Adds subtle "Staff Admin" link in footer | User click on footer "Staff Admin" link | Direct navigation to `/admin` route | N/A | `ORIGINAL_REQUEST.md` § R3, `SiteShell.tsx` |
| 9 | R3: Admin Console | PIN Passcode Guard Modal | Protects `/admin` route behind a PIN guard requiring passcode `raider2026` | Passcode string | If correct, unlocks console and sets `sessionStorage`; if incorrect, shows error | Shake animation, error message "Incorrect passcode" | `ORIGINAL_REQUEST.md` § R3 |
| 10 | R3: Admin Console | Admin Lock / Sign Out | Allows staff to re-lock the admin dashboard session | Click "Lock Console" in admin header | Clears `sessionStorage`, re-engages PIN guard modal | N/A | `ORIGINAL_REQUEST.md` § R3 |
| 11 | R3: Admin Console | Catalog Inventory Tab | Comprehensive product manager: add, edit, price quick-edit, stock toggle, duplicate, delete, JSON backup/restore | User interaction on product cards/modals | Updates product state in `StoreProvider` & `localStorage` | Validation on price and required fields | `ORIGINAL_REQUEST.md` § R3, `src/app/admin/page.tsx` |
| 12 | R3: Admin Console | Reviews Moderation Tab | Moderates student reviews: list, filter (Approved/Hidden), toggle approve/hide, delete, aggregate metrics | Staff click on Approve/Hide/Delete | Updates review status in `ReviewStore`, recalculates product rating | Confirm prompt before deleting | `ORIGINAL_REQUEST.md` § R3 |
| 13 | R3: Admin Console | Complaints Inbox Tab | Triage student grievances: status filter (New, In Progress, Resolved), category filter, urgency indicators, staff notes | Staff clicks status pill or updates staff note | Updates complaint status & notes in `ComplaintStore` | Retains unsaved notes on blur | `ORIGINAL_REQUEST.md` § R3 |
| 14 | R4: Motion | Sliding Wordmark Header Animation | Hover / focus-visible animates copyright rotation and `Station` slide-out | Mouse hover or keyboard focus on wordmark link | `Station` translates from 105% to 0% with `cubic-bezier(0.76, 0, 0.24, 1)` | Disabled when `prefers-reduced-motion` is active | `ORIGINAL_REQUEST.md` § R4, `SiteShell.module.css` |
| 15 | R4: Motion | Interactive Star Rating Micro-Motion | Star rating hover/tap scale bounce and fill transitions | Pointer hover or click on rating stars | Star scales to 1.25x with smooth gold fill transition; label updates | No lag on fast pointer movement | `ORIGINAL_REQUEST.md` § R4 |
| 16 | R4: Motion | Slide-Over Drawer Motion | Fluid right-anchored slide-in with backdrop blur using cubic-bezier curve | Drawer open / close trigger | Slide-in from `translateX(100%)` to `translateX(0)` at 340ms | Instant transition if reduced motion active | `ORIGINAL_REQUEST.md` § R4, `ShopDialogs.module.css` |
| 17 | R4: Motion | Staggered Reveals | Staggered entrance animations for cards, reviews, complaints | Page load / filter change | Child items fade and slide up with 0.05s stagger | Motion disabled under reduced-motion query | `ORIGINAL_REQUEST.md` § R4, `anim.ts` |
| 18 | R4: Motion | Zero Layout Shift (CLS) | Prevents cumulative layout shifts during dynamic image or state loading | Dynamic async data loading | Layout dimensions stay constant (aspect ratio boxes) | N/A | `ORIGINAL_REQUEST.md` § R4, `globals.css` |
| 19 | A11y | Keyboard Trapping & Escape Close | Full keyboard control for modal dialogs and slide-over drawers | `Tab`, `Shift+Tab`, `Escape` | Focus stays within open dialog; `Escape` closes dialog | Focus restores to trigger element | `ORIGINAL_REQUEST.md` Acceptance Criteria |
| 20 | A11y | ARIA Roles & State Labels | Accessible roles for dialogs (`dialog`), star ratings (`radiogroup`), tabs (`tablist`), live updates (`polite`) | Screen reader interaction | Screen reader announces modal title, star rating count, toast message | N/A | `ORIGINAL_REQUEST.md` Acceptance Criteria |
| 21 | A11y | High-Contrast Focus Visible Rings | 2px solid maroon outline with offset on keyboard focus | Keyboard `Tab` navigation | Distinct visible outline on focused interactive element | Not shown on mouse click (`:focus:not(:focus-visible)`) | `globals.css`, `SiteShell.module.css` |

---

## 3. Detailed Specification: R2 Global Customer Complaints & Feedback Drawer

### 3.1 Visual & Structural Specifications
- **Container**: Slide-over drawer anchored to the right viewport edge.
- **Dimensions**: Desktop width `min(480px, calc(100vw - 24px))`, height `calc(100dvh - 24px)`, margin `12px 12px 12px auto`, border-radius `var(--radius-lg)` (28px). Mobile width `100vw`, height `100dvh`, margin `0`, border-radius `0`.
- **Background & Elevation**: `background: var(--bg-elevated)`, `border: 1px solid var(--line)`, `box-shadow: var(--shadow-md)`.
- **Backdrop**: `background: rgba(0, 0, 0, 0.65)`, `backdrop-filter: blur(8px)`.
- **Transition Curve**: `cubic-bezier(0.76, 0, 0.24, 1)` over `340ms`.

### 3.2 Form Schema & Field Validation

| Field Name | Type | Options / Constraints | Required | Placeholder / Default | Accessible Label |
|------------|------|-----------------------|----------|-----------------------|------------------|
| `category` | Pill Selector / Radio Group | `Order Issue`, `Item Condition / Defect`, `Sizing / Stock Request`, `General Grievance`, `Campus Service & Hours` | Yes | Default: `Order Issue` | "Complaint Category" |
| `urgency` | Segmented Control / Radio | `Low` (Suggestion), `Medium` (Standard), `High` (Urgent blocker) | Yes | Default: `Medium` | "Urgency Level" |
| `customerName` | Text Input | Non-empty string, min 2 chars | Yes | "e.g. Alex Morgan" | "Your Full Name *" |
| `customerContact` | Text / Email Input | Valid email or student ID format (e.g. `s123456@leanderisd.org`) | Yes | "e.g. student@leanderisd.org" | "Student Email or ID *" |
| `orderNumber` | Text Input | Alphanumeric (optional) | No | "e.g. RS-98214 (if applicable)" | "Order # (Optional)" |
| `productId` | Select / Text | Product selector or item name | No | "Select affected item..." | "Related Product (Optional)" |
| `description` | Textarea | Min 10 characters, max 1000 characters | Yes | "Please describe what happened..." | "Detailed Description *" |

### 3.3 Submission Lifecycle
1. User clicks trigger ("Student Feedback & Grievances" in footer or header/product page).
2. Drawer slides open with auto-focus on first interactive element.
3. User fills fields and clicks "Submit Grievance".
4. Validation runs:
   - If invalid: Error banner rendered at top with `role="alert"`, invalid inputs get `aria-invalid="true"` and red outline, focus shifts to first invalid input.
   - If valid:
     - New complaint object created:
       ```ts
       interface Complaint {
         id: string;              // e.g. "cmp-k9d8f7e2"
         category: ComplaintCategory;
         urgency: "Low" | "Medium" | "High";
         customerName: string;
         customerContact: string;
         orderNumber?: string;
         productId?: string;
         productName?: string;
         description: string;
         status: "New" | "In Progress" | "Resolved";
         staffNotes?: string;
         createdAt: string;       // ISO 8601 string
         updatedAt: string;       // ISO 8601 string
       }
       ```
     - Object saved to store & persisted to `raider_station_complaints_v1` in `localStorage`.
     - Drawer closes smoothly.
     - Form resets to default values.
     - Toast notification triggered: `"Your feedback has been submitted to Raider Station staff. Reference ID: #{id}."`

---

## 4. Detailed Specification: R3 Discreet Admin Dashboard & Moderation

### 4.1 Header Navigation & Access Entry Points
- **Primary Header (`SiteShell.tsx`)**:
  - Links array MUST only contain:
    ```ts
    const pages = [
      { href: "/", label: "Home" },
      { href: "/shop", label: "Shop" },
    ];
    ```
  - "Admin" navigation item is completely removed from the header bar.
- **Discreet Footer Entry (`SiteShell.tsx`)**:
  - Placed in footer navigation / footerDetails:
    ```tsx
    <Link href="/admin" className={styles.adminFooterLink}>Staff Admin</Link>
    ```
  - Styled discreetly using `var(--footer-muted)` color so it is unobtrusive to general students.

### 4.2 PIN Guard Security Specification
- **Passcode**: Constant `raider2026` (case-insensitive, trimmed).
- **Session State**: Persisted in `sessionStorage` under key `raider_admin_session_auth = "authenticated"`.
- **Guard Flow**:
  - When mounting `/admin`, check if `sessionStorage.getItem("raider_admin_session_auth") === "authenticated"`.
  - If authenticated: render Admin Console.
  - If unauthenticated: render `AdminPinModal` overlay.
- **PIN Modal Interface**:
  - Centered dialog with backdrop blur.
  - Shield / Lock icon in `--maroon`.
  - Heading: "Raider Station Staff Access".
  - Subheading: "Enter the staff passcode to access catalog management and moderation."
  - Password / PIN input with autoFocus, placeholder "Enter passcode...", Enter key submit.
  - "Unlock Console" primary button.
  - "Cancel & Return to Store" link returning to `/shop`.
  - On incorrect submission:
    - Input outline changes to red `#ef4444`.
    - Error message: "Incorrect passcode. Please verify staff credentials."
    - Shake micro-animation (`translateX(-6px)` -> `translateX(6px)`).
  - "Lock Console" button in Admin Header to clear session and re-lock.

### 4.3 Management Console Tabs

#### Tab 1: Catalog Inventory
- Metric Cards: Total Listings, Spirit Wear Count, Supplies/Accessories Count, Average Price, Items on Sale.
- Action Bar: Add New Listing button, Export Backup JSON, Import JSON, Reset to Defaults, View Live Shop.
- Filters: Category pills, Stock dropdown (All, In Stock, Sold Out), Sort dropdown (Default, Price Asc/Desc, Name A-Z), Live Search input.
- Grid / Table: Product cards with image visual, tag badge, stock toggle button (`In Stock` [green] / `Sold Out` [red]), clickable inline price editing, size chips, duplicate button, edit modal button, delete button (with window confirm).

#### Tab 2: Reviews Moderation
- Metric Cards: Total Reviews, Average Product Rating (e.g. `4.8 ★`), Approved Reviews Count, Hidden Reviews Count.
- Filters: Status filter pills (`All Reviews`, `Approved Only`, `Hidden Only`), Product filter dropdown, Search query.
- Reviews List Cards / Table:
  - Product thumbnail & title
  - Star rating badge (1-5 stars)
  - Review title & body copy
  - Reviewer name + `Verified Student` badge
  - Recommendation status ("Recommends this gear")
  - Helpful votes counter
  - Date formatted (e.g. `Sep 2, 2026`)
  - Status Indicator: `Approved` (green badge) or `Hidden` (orange badge)
  - Actions:
    - Toggle Approve / Hide: updates review `status: "approved" | "hidden"`. When "hidden", review is immediately excluded from public product pages and average rating calculation.
    - Delete Review: removes review permanently after confirmation prompt.

#### Tab 3: Complaints Inbox
- Metric Cards: Total Complaints, New Grievances, In Progress, Resolved Grievances.
- Filters:
  - Status pills: `All`, `New`, `In Progress`, `Resolved`
  - Category filter: `All Categories`, `Order Issue`, `Item Defect`, `Sizing/Stock`, `General`
  - Urgency filter: `All`, `High`, `Medium`, `Low`
  - Search query for customer name, contact, order #, or description
- Complaint Card Anatomy:
  - Header: Category Badge + Urgency Pill (`High` [crimson], `Medium` [gold], `Low` [neutral]) + Submission Timestamp + ID
  - Customer Info Row: Student Name, Student Email/ID, Order # (if present), Related Item (if present)
  - Message Box: Full text description
  - Status Controls: Interactive 3-segment toggle (`New` | `In Progress` | `Resolved`)
  - Staff Internal Notes:
    - Collapsible / expandable note box
    - Textarea for staff remarks (e.g. "Spoke with student; issued size M exchange at kiosk 9/2.")
    - "Save Staff Note" button with save confirmation hint
  - Archive / Delete button: removes or archives complaint record.

---

## 5. Detailed Specification: R4 Animation Polish & Editorial Motion

### 5.1 Easing & Timing Foundations
- **Primary Brand Easing Curve**: `cubic-bezier(0.76, 0, 0.24, 1)` (Power3/Power4 smooth ease-in-out).
- **Secondary Spring Physics**:
  - Modal / Drawer Spring: `stiffness: 400, damping: 35`
  - Button Tap Spring: `stiffness: 500, damping: 25`
  - Star Bounce: `stiffness: 600, damping: 20`
- **Standard Durations**:
  - Micro-interactions (hover, color, focus): `160ms` - `220ms`
  - Slide-over drawers / large modals: `320ms` - `380ms`
  - Page transitions: `280ms`

### 5.2 Header Sliding Wordmark Polish
- In `SiteShell.module.css`:
  ```css
  .wordmarkGroup {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .wordmarkCopyright {
    font-size: 0.85em;
    font-weight: 400;
    color: var(--muted);
    display: inline-block;
    line-height: 1;
    transform-origin: center center;
    transition: transform 500ms cubic-bezier(0.76, 0, 0.24, 1);
  }
  .wordmarkTrack {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    overflow: hidden;
    white-space: nowrap;
    line-height: 1.15;
  }
  .wordmarkRouse {
    display: inline-block;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--ink);
  }
  .wordmarkStation {
    display: inline-block;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--ink);
    padding-left: 0.26em;
    transform: translateX(105%);
    transition: transform 500ms cubic-bezier(0.76, 0, 0.24, 1);
    will-change: transform;
  }
  .wordmarkLink:hover .wordmarkCopyright,
  .wordmarkLink:focus-visible .wordmarkCopyright {
    transform: rotate(360deg);
  }
  .wordmarkLink:hover .wordmarkStation,
  .wordmarkLink:focus-visible .wordmarkStation {
    transform: translateX(0);
  }
  ```

### 5.3 Interactive Star Rating Hover & Click Bounce
- Component: `StarRatingInput` / `InteractiveStars`
- Behavior:
  - 5 star SVG elements in a row.
  - Hovering over star `k` (1 to 5):
    - Stars 1..k fill with gold `#cf9b44` (or obsidian gold `#dfb256`).
    - Hovered star scales up by `1.22x` with slight tilt (`rotate: 4deg`).
    - Tooltip / label underneath updates to `"1 - Poor"`, `"2 - Fair"`, `"3 - Good"`, `"4 - Very Good"`, `"5 - Excellent / Raider Pride!"`.
  - Mouse leave without click restores active rating state.
  - Clicking a star:
    - Scale bounce: compresses to `0.85x` then springs to `1.15x` and settles at `1.0x`.
    - Star value sets form state.

### 5.4 Zero Layout Shift (CLS = 0) Specifications
- **Fixed Aspect Ratio Containers**: All product cards use explicit aspect ratios (`aspect-ratio: 4 / 4.9`), hero image uses (`aspect-ratio: 1.035` or `.76`), dialog images use (`aspect-ratio: 16 / 11` or fixed pixel frames).
- **Reserved Height for Rating Blocks**: Product cards have a fixed height rating container (e.g. `min-height: 18px`) so that cards with or without reviews align identically.
- **Scroll Lock without Shift**: When modal/drawer opens, `document.body.style.overflow = "hidden"` is set with padding compensation if scrollbar width is non-zero, preventing horizontal page jitter.

### 5.5 `prefers-reduced-motion: reduce` System Compliance
- Framer Motion hook:
  ```ts
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.76, 0, 0.24, 1] };
  ```
- CSS global rule in `globals.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto !important; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    .wordmarkCopyright, .wordmarkStation {
      transition: none !important;
      transform: none !important;
    }
  }
  ```

---

## 6. Detailed Specification: Accessibility & Keyboard Navigation (WCAG 2.1 AA)

### 6.1 Keyboard Navigation Matrix

| Component | Target Element | Key | Expected Action |
|-----------|----------------|-----|-----------------|
| **Site Header** | Skip Link | `Tab` (first tab on page) | Appears at `top: 15px`, pressing `Enter` scrolls to `#main-content` |
| **Site Header** | Wordmark | `Tab` -> `Enter` | Focus outline visible, `Station` slides in, `Enter` navigates home |
| **Site Header** | Nav Links | `Tab` / `Shift+Tab` | Traverses Home, Shop; `Enter` activates route |
| **Site Header** | Theme / Bag | `Tab` -> `Enter` / `Space` | Toggles Theme menu / opens Cart drawer |
| **Feedback Drawer** | Drawer Container | `Escape` | Closes drawer, restores focus to trigger button |
| **Feedback Drawer** | Category / Urgency Pills | `Tab` / `ArrowLeft` / `ArrowRight` / `Space` | Moves focus and selects active category pill |
| **Feedback Drawer** | Form Inputs | `Tab` / `Shift+Tab` | Moves through inputs in logical reading order |
| **Feedback Drawer** | Submit Button | `Enter` / `Space` | Triggers form submission and validation |
| **Admin PIN Modal** | Passcode Input | `Enter` | Submits PIN code for verification |
| **Admin PIN Modal** | Modal Container | `Escape` | Cancels modal, redirects to `/shop` |
| **Admin Tabs** | Tab List | `ArrowLeft` / `ArrowRight` / `Enter` | Switches active tab panel between Inventory, Reviews, Complaints |
| **Star Rating Selector** | Star Rating Group | `ArrowLeft` / `ArrowRight` / `1-5` / `Space` | Increments/decrements rating, announces score to screen reader |
| **Accordions** | Accordion Trigger | `Enter` / `Space` | Toggles accordion panel open/closed (`aria-expanded`) |

### 6.2 ARIA Roles & Attribute Checklist
- **Drawers & Modals**:
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby="[heading-id]"`
  - `aria-describedby="[description-id]"`
- **Star Selector**:
  - `role="radiogroup"` with `aria-label="Rating out of 5 stars"`
  - Each star button has `role="radio"`, `aria-checked="true|false"`, `aria-label="${n} of 5 stars"`
- **Tabs**:
  - `role="tablist"`
  - Tab buttons: `role="tab"`, `aria-selected="true|false"`, `aria-controls="panel-[id]"`
  - Tab panels: `role="tabpanel"`, `id="panel-[id]"`, `aria-labelledby="tab-[id]"`
- **Status & Alerts**:
  - Toasts: `role="status"`, `aria-live="polite"`
  - Error messages: `role="alert"`, `aria-live="assertive"`
  - Results counters: `role="status"`, `aria-live="polite"`

### 6.3 Focus Rings & Contrast Standards
- **Focus Rings**: `:focus-visible` styling is uniform across the entire app:
  ```css
  :focus-visible {
    outline: 2px solid var(--maroon);
    outline-offset: 3px;
  }
  ```
- In Obsidian dark theme: `--maroon` resolves to luminous `#9e2842`, giving high contrast (> 4.5:1) against `#0c0b0b` / `#171616`.
- In Heritage / Studio / Gold themes: `--maroon` resolves to `#581825`, `#681b2a`, or `#4e1320` against light surfaces (> 7:1 contrast ratio).

---

## 7. Edge Cases & Boundary Conditions

| # | Feature | Input / Scenario | Observed / Expected Behavior |
|---|---------|------------------|------------------------------|
| 1 | Feedback Drawer | Submitting form with empty description | Submission blocked; textarea gains red outline and `aria-invalid="true"`; error text "Please enter at least 10 characters." displayed; focus shifts to textarea. |
| 2 | Feedback Drawer | Submitting complaint with very long text (1000+ chars) | Textarea scrolls vertically within drawer; character counter alerts user if limit exceeded; layout does not overflow or clip drawer buttons. |
| 3 | Feedback Drawer | Rapid double-clicking "Submit" | Submit button is immediately disabled (`disabled={isSubmitting}`) upon first click; prevents duplicate complaint IDs in store. |
| 4 | Feedback Drawer | User presses `Escape` while typing | Drawer immediately closes; form input state is preserved or cleanly reset on next open; focus returns to the trigger button that launched the drawer. |
| 5 | Feedback Drawer | Opening drawer on small mobile viewport (< 380px) | Drawer takes full viewport width (`100vw`); padding reduces to `16px`; touch targets remain >= `44px`; close button clearly accessible at top right. |
| 6 | Admin PIN Guard | Entering incorrect PIN 3+ times | PIN modal does not lock user out permanently, but continues to reject with error notice and shake feedback; user can re-type `raider2026` at any time. |
| 7 | Admin PIN Guard | Entering passcode with leading/trailing spaces or lowercase | String is trimmed and compared case-insensitively (`input.trim().toLowerCase() === "raider2026"`), allowing painless unlock. |
| 8 | Admin PIN Guard | Refreshing browser tab while in Admin | Reads `sessionStorage.getItem("raider_admin_session_auth")`; user stays authenticated and does not have to re-enter PIN on every page reload. |
| 9 | Admin PIN Guard | User clicks "Lock Console" in admin header | `sessionStorage.removeItem("raider_admin_session_auth")` is called; screen immediately locks and displays the PIN guard modal. |
| 10 | Reviews Moderation | Moderating a review from Approved to Hidden | Review status updates to `"hidden"`; public product page immediately recalculates average star score and review count without the hidden review. |
| 11 | Reviews Moderation | Deleting a review with helpful votes | System displays window confirmation prompt; on confirm, removes review from `ReviewStore` and updates product aggregate stats. |
| 12 | Complaints Inbox | Filtering complaints with 0 matches (e.g. High urgency in Sizing) | Renders clean empty state card ("No complaints match current filters") with a button to "Reset Filters". |
| 13 | Complaints Inbox | Adding and editing staff internal notes | Note input autosaves or saves on button click; updates `updatedAt` ISO timestamp; note persists in `localStorage` across reloads. |
| 14 | Motion Polish | Hovering over header wordmark on touch device | Touch event does not trap hover state; wordmark returns to resting state cleanly after touch ends. |
| 15 | Motion Polish | User enables OS "Reduce Motion" setting | Framer motion and CSS media queries instantly turn off transforms, rotations, and spring physics; transitions execute in 0ms without layout glitch. |
| 16 | Storage / Persistence | LocalStorage disabled / Quota exceeded | Storage abstraction catches `QuotaExceededError` or `SecurityError` and falls back to in-memory state; app continues functioning without crashing. |
| 17 | Zero Layout Shift | Product image slow to load / missing | Container keeps exact aspect ratio via CSS `aspect-ratio: 4 / 4.9`; placeholder background color displayed; text below does not jump when image renders. |

---

## 8. Data Models & TypeScript Contracts

```ts
// ==========================================
// COMPLAINTS DATA CONTRACT
// ==========================================
export type ComplaintCategory =
  | "Order Issue"
  | "Item Condition / Defect"
  | "Sizing / Stock Request"
  | "General Grievance"
  | "Campus Service & Hours";

export type ComplaintUrgency = "Low" | "Medium" | "High";

export type ComplaintStatus = "New" | "In Progress" | "Resolved";

export interface Complaint {
  id: string;                      // e.g. "cmp-m1a2b3c4"
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  customerName: string;
  customerContact: string;         // email or student ID
  orderNumber?: string;
  productId?: string;
  productName?: string;
  description: string;
  status: ComplaintStatus;
  staffNotes?: string;
  createdAt: string;               // ISO 8601 string
  updatedAt: string;               // ISO 8601 string
}

// ==========================================
// REVIEWS DATA CONTRACT
// ==========================================
export type ReviewStatus = "approved" | "hidden" | "flagged";

export interface ProductReview {
  id: string;                      // e.g. "rev-k7j6h5g4"
  productId: string;               // relates to Product.id
  reviewerName: string;
  isVerifiedStudent: boolean;
  rating: number;                  // 1 to 5 integer
  title: string;
  comment: string;
  recommends: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;               // ISO 8601 string
}

// ==========================================
// ADMIN DASHBOARD STATE CONTRACT
// ==========================================
export type AdminTab = "inventory" | "reviews" | "complaints";

export interface AdminMetrics {
  totalListings: number;
  activeListings: number;
  totalReviews: number;
  averageRating: number;
  pendingReviewsCount: number;
  totalComplaints: number;
  newComplaintsCount: number;
  inProgressComplaintsCount: number;
  resolvedComplaintsCount: number;
}
```

---

## 9. Verification & Acceptance Method

1. **Header Navigation Verification**:
   - Inspect `SiteShell.tsx`: Ensure `pages` array contains only `Home` and `Shop`.
   - Inspect DOM: Header navigation renders exactly 2 links ("Home", "Shop") + Bag button + Theme selector.
2. **Discreet Admin & PIN Verification**:
   - Click footer link "Staff Admin" or navigate directly to `/admin`.
   - Confirm PIN modal appears with input field.
   - Enter wrong PIN (e.g. `wrong123`) -> verify shake animation & error message.
   - Enter correct PIN `raider2026` -> verify console unlocks and `sessionStorage` stores auth flag.
   - Test tab navigation: switch between "Catalog Inventory", "Reviews Moderation", and "Complaints Inbox".
3. **Feedback Drawer Verification**:
   - Click "Feedback / Complaints" trigger in footer.
   - Verify slide-over drawer animates from right with `cubic-bezier(0.76, 0, 0.24, 1)`.
   - Select topic pill, urgency, enter student name, email, and description -> click Submit.
   - Verify animated confirmation toast pops up at bottom center and auto-dismisses after ~3.8s.
   - Open `/admin` -> switch to "Complaints Inbox" -> verify newly submitted complaint is visible.
4. **Motion Polish & Star Ratings**:
   - Hover and focus wordmark in header: verify copyright rotates 360deg and `Station` slides in.
   - Test star selector: verify scale bounce on hover, fill color transition, active label, and selection on click.
   - Test with browser `prefers-reduced-motion: reduce` simulation: verify animations transition instantaneously.
5. **Accessibility Check**:
   - Full keyboard run: `Tab` through whole page, open dialogs with `Enter`/`Space`, close with `Escape`.
   - Verify focus is trapped inside open drawers/dialogs and returns to trigger upon closing.
   - Run `npm run lint` and `npm run build` to confirm zero TypeScript or ESLint errors.
