# Project: Raider Station Storefront Elevation

## Master Architecture
Raider Station is an editorial e-commerce platform for Rouse High School built with Next.js 16 (App Router, Turbopack, React 19), Framer Motion, Lenis smooth scrolling, Lucide icons, and pure CSS variables/modules with multi-theme support.

```
                  ┌──────────────────────────────────────────────┐
                  │                 SiteShell                    │
                  │ (Header with Sliding Wordmark, Theme Toggle, │
                  │  Cart Trigger, Footer with Staff Admin Link, │
                  │  Global Feedback Drawer Trigger, Toasts)     │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼───────────────────────────────┐
        ▼                                ▼                               ▼
┌──────────────┐                 ┌──────────────┐                ┌──────────────┐
│  Home Page   │                 │ Shop Catalog │                │Product Detail│
│Hero Carousel,│                 │ Filter, Grid,│                │ Gallery, Buy,│
│Rating Badges │                 │Rating Badges │                │5-Star Reviews│
└──────────────┘                 └──────────────┘                └──────┬───────┘
                                                                        │
┌───────────────────────────────────────────────────────────────┐       │
│                      Admin Console (/admin)                   │       │
│         (PIN Gate: 'raider2026', Session-authenticated)       │       │
│ ┌───────────────────┬──────────────────────┬────────────────┐ │       │
│ │ Catalog Inventory │  Reviews Moderation  │Complaints Inbox│ │       │
│ └───────────────────┴──────────────────────┴────────────────┘ │       │
└───────────────────────────────┬───────────────────────────────┘       │
                                │                                       │
                                ▼                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Store & State Layer                                 │
│  useStore() / useReviews() / useComplaints() / useFeedback() (React Context)  │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Typed Repository Layer                              │
│   ProductRepository     │     ReviewRepository     │    ComplaintRepository   │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Storage Driver Layer                                │
│        IStorageDriver  ──►  LocalStorageDriver  (with Memory fallback)        │
│                        ──►  [Future Live DB / PostgreSQL / Supabase Driver]   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Typed Storage Driver & LocalStorage with Memory Fallback | Robust `IStorageDriver` interface with browser storage checks and in-memory fallback for SSR/private browsing | M1 | ORIGINAL_REQUEST §R5 |
| F2 | Typed Repositories & Domain Models | TypeScript models (`Product`, `Review`, `Complaint`, `ProductRatingSummary`, `StarDistribution`) and repository interfaces (`IProductRepository`, `IReviewRepository`, `IComplaintRepository`) | M1 | ORIGINAL_REQUEST §R5 |
| F3 | Unified Context Store & State Hooks | React Context providing reactive access to products, reviews, complaints, cart, theme, toasts, and drawer controls | M1 | ORIGINAL_REQUEST §R5 |
| F4 | Authentic Seed Data for Reviews & Complaints | Curated high-school domain seed dataset for 11 products and realistic initial complaints for moderation testing | M1 | ORIGINAL_REQUEST §R1, R2, R3 |
| F5 | 5-Star Aggregate Rating & Distribution Breakdown | Mathematical calculation of average rating, total count, recommend percentage, and 5-to-1 distribution breakdown bars | M2 | ORIGINAL_REQUEST §R1 |
| F6 | Product Detail Editorial Reviews List & Badges | Verified student badges, grade level indicators, helpful voting counters with persistent client state, sort/filter | M2 | ORIGINAL_REQUEST §R1 |
| F7 | Interactive Review Submission Modal | Star selector with hover/click micro-animations, required field validation, author info, recommendation toggle, instant persistence | M2 | ORIGINAL_REQUEST §R1 |
| F8 | Catalog & Home Compact Rating Badges | Zero-CLS compact star rating and review count badges on `/shop` catalog grid and `/` home showcase cards | M2 | ORIGINAL_REQUEST §R1 |
| F9 | Global Slide-Over Feedback / Complaints Drawer | Smooth slide-over drawer accessible from footer/header and product detail, with `cubic-bezier(0.76, 0, 0.24, 1)` motion | M3 | ORIGINAL_REQUEST §R2 |
| F10 | Categorized Feedback Form with Topic Pills & Urgency | Category selection pills (Order Issue, Item Condition/Defect, Sizing/Stock Request, General Grievance), urgency level, contact info | M3 | ORIGINAL_REQUEST §R2 |
| F11 | Animated Confirmation Toast Notifications | Spring-animated toast notification system confirming complaint/review submission with auto-dismiss and accessible announcements | M3 | ORIGINAL_REQUEST §R2, R4 |
| F12 | Navigation Header Sanitation | Remove "Admin" link from primary header navigation to preserve student-first customer storefront | M4 | ORIGINAL_REQUEST §R3 |
| F13 | Discreet Staff Admin Footer Entry & PIN Modal Gate | Subtle "Staff Admin" footer link, direct `/admin` route guard requiring PIN passcode `raider2026` with session persistence | M4 | ORIGINAL_REQUEST §R3 |
| F14 | Admin Catalog Inventory Console | Comprehensive product management (search, stock toggle, inline price edit, CRUD, JSON export/import, reset) | M4 | ORIGINAL_REQUEST §R3 |
| F15 | Admin Reviews Moderation Console | Table view of all reviews, approve/hide status toggle, delete, review metrics summary, verified badge status | M4 | ORIGINAL_REQUEST §R3 |
| F16 | Admin Complaints Inbox Console | Categorized student complaints, status pills (New, In Progress, Resolved), expandable staff notes editor, urgency indicators | M4 | ORIGINAL_REQUEST §R3 |
| F17 | Sliding Wordmark & Editorial Motion Polish | Signature rotating copyright and sliding Raider Station wordmark, GPU-accelerated cubic-bezier transitions | M5 | ORIGINAL_REQUEST §R4 |
| F18 | Star Rating Interactive Physics & Micro-interactions | Interactive star fill transitions, scale bounce hover/click feedback, active rating label tooltips | M5 | ORIGINAL_REQUEST §R4 |
| F19 | Zero Layout Shift & Reduced Motion Compliance | Explicit container sizing (CLS = 0) and `@media (prefers-reduced-motion: reduce)` support across all animated elements | M5 | ORIGINAL_REQUEST §R4 |
| F20 | Comprehensive Keyboard Accessibility & ARIA | Full keyboard navigation (`Tab`, `Escape`, `Enter`, `Space`), focus trap in modals/drawers, visible focus rings, ARIA roles | M5 | ORIGINAL_REQUEST §Acceptance Criteria |
| F21 | Full E2E Test Suite Validation & Adversarial Hardening | Verification against comprehensive 4-tier E2E test suite + Tier 5 adversarial testing | M6 | ORIGINAL_REQUEST §Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Typed Storage Architecture & Repositories | Storage drivers, repository interfaces, models, seed data, unified React context & hooks | none | PLANNED |
| M2 | Product Reviews & 5-Star Rating System | Detail page reviews, 5-to-1 breakdown bars, submission modal, helpful voting, catalog badges | M1 | PLANNED |
| M3 | Global Feedback & Complaints Drawer | Slide-over drawer, topic pills, urgency, spring toast system, footer/header integration | M1 | PLANNED |
| M4 | Discreet Admin Dashboard & Moderation Console | Header cleanup, Staff Admin footer entry, PIN gate (`raider2026`), 3-tab console (Catalog, Reviews, Complaints) | M1, M2, M3 | PLANNED |
| M5 | Animation Polish, Editorial Motion & A11y | `cubic-bezier(0.76, 0, 0.24, 1)`, star physics, sliding wordmark, zero CLS, reduced motion, keyboard/ARIA | M2, M3, M4 | PLANNED |
| M6 | Full E2E Verification & Adversarial Coverage Hardening | Execute full test suite against published `TEST_READY.md`, Tier 1-4 pass verification, Tier 5 white-box hardening | M1-M5, Test Track | PLANNED |

---

## Code Layout
```
src/
├── app/
│   ├── layout.tsx                     # Root layout with theme script & StoreProvider
│   ├── page.tsx                       # Home page with hero showcase & rating badges
│   ├── shop/
│   │   ├── page.tsx                   # Shop catalog page with rating badges
│   │   └── [id]/
│   │       └── page.tsx               # Product detail page with 5-star reviews
│   └── admin/
│       └── page.tsx                   # Discreet 3-tab admin console with PIN guard
├── components/
│   ├── SiteShell.tsx                  # Global shell (header, footer, nav, toasts)
│   ├── SiteShell.module.css           # Sliding wordmark & shell styling
│   ├── StoreProvider.tsx              # Main React Context Provider
│   ├── HomeCover.tsx                  # Home hero carousel & showcase cards
│   ├── ShopCatalog.tsx                # Catalog grid & filters
│   ├── ProductDetails.tsx             # Product detail presentation
│   ├── reviews/
│   │   ├── StarRating.tsx             # Interactive / display star component
│   │   ├── ProductRatingBadge.tsx     # Compact star badge for cards
│   │   ├── RatingBreakdownBars.tsx    # 5-to-1 distribution visualizer
│   │   ├── ProductReviewsSection.tsx  # Full reviews list on product detail
│   │   ├── ReviewSubmissionModal.tsx  # Interactive review submission form
│   │   └── ReviewCard.tsx             # Single review item with helpful vote
│   ├── feedback/
│   │   ├── FeedbackDrawer.tsx         # Global slide-over complaints drawer
│   │   └── ToastNotification.tsx      # Spring-animated confirmation toast
│   └── admin/
│       ├── AdminPinModal.tsx          # Passcode modal guard ('raider2026')
│       ├── AdminCatalogTab.tsx        # Product inventory management
│       ├── AdminReviewsTab.tsx        # Reviews moderation & metrics
│       └── AdminComplaintsTab.tsx     # Categorized complaints inbox & notes
├── lib/
│   ├── storage/
│   │   ├── IStorageDriver.ts          # Storage driver contract
│   │   ├── LocalStorageDriver.ts      # LocalStorage driver with memory fallback
│   │   └── MemoryStorageDriver.ts     # In-memory storage driver
│   ├── repositories/
│   │   ├── IProductRepository.ts      # Product repository contract & implementation
│   │   ├── IReviewRepository.ts       # Review repository contract & implementation
│   │   └── IComplaintRepository.ts    # Complaint repository contract & implementation
│   ├── seed/
│   │   ├── seedProducts.ts            # 11 curated Rouse products
│   │   ├── seedReviews.ts             # Authentic seed reviews dataset
│   │   └── seedComplaints.ts          # Authentic seed complaints dataset
│   ├── motion.ts                      # Motion curve constants & variants
│   └── store.ts                       # Legacy types re-exported for backwards compatibility
└── types/
    ├── product.ts                     # Product & CartItem interfaces
    ├── review.ts                      # Review, RatingSummary, StarDistribution interfaces
    ├── complaint.ts                   # Complaint & Urgency/Status interfaces
    └── admin.ts                       # AdminSession & filter interfaces
```

---

## Interface Contracts

### 1. Storage & Repositories ↔ React Context
- `IStorageDriver`:
  - `getItem<T>(key: string): Promise<T | null> | (T | null)`
  - `setItem<T>(key: string, value: T): Promise<void> | void`
  - `removeItem(key: string): Promise<void> | void`
- `IProductRepository`:
  - `getAll(): Product[]`
  - `getById(id: string): Product | undefined`
  - `save(product: Product): void`
  - `update(id: string, updates: Partial<Product>): void`
  - `delete(id: string): void`
  - `reset(): void`
- `IReviewRepository`:
  - `getByProductId(productId: string): Review[]`
  - `getAll(): Review[]`
  - `getSummary(productId: string): ProductRatingSummary`
  - `addReview(review: Omit<Review, "id" | "createdAt" | "helpfulCount">): Review`
  - `updateStatus(reviewId: string, status: "approved" | "hidden"): void`
  - `voteHelpful(reviewId: string): void`
  - `deleteReview(reviewId: string): void`
- `IComplaintRepository`:
  - `getAll(): Complaint[]`
  - `addComplaint(complaint: Omit<Complaint, "id" | "createdAt" | "status" | "staffNotes">): Complaint`
  - `updateStatus(id: string, status: ComplaintStatus): void`
  - `updateStaffNotes(id: string, notes: string): void`
  - `deleteComplaint(id: string): void`

### 2. UI Components ↔ Context
- `useStore()` provides:
  - `products: Product[]`, CRUD methods
  - `cart: CartItem[]`, cart methods
  - `theme: ThemeId`, theme setter
  - `reviews: Review[]`, `getRatingSummary(productId: string)`
  - `addReview(...)`, `voteReviewHelpful(...)`
  - `complaints: Complaint[]`, `addComplaint(...)`, `updateComplaintStatus(...)`, `updateStaffNotes(...)`
  - `isFeedbackDrawerOpen: boolean`, `openFeedbackDrawer()`, `closeFeedbackDrawer()`
  - `toast: ToastMessage | null`, `showToast(msg: string, type?: 'success' | 'info' | 'error')`
