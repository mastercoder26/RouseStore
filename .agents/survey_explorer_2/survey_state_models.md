# Raider Station — Product & State Model Architecture Survey

**Date**: 2026-09-02  
**Author**: Survey Explorer 2 (Product & State Model Explorer)  
**Target Milestone**: Survey / Exploration Phase  
**Scope**: Product Data Models, State Management, Product Flow (Home, `/shop`, `/shop/[id]`, `/admin`), R1 (Reviews & 5-Star Ratings), R2/R3 (Complaints & Admin Moderation), and R5 (Repository Architecture & Storage Abstractions).

---

## 1. Executive Summary

This investigation evaluates the current data architecture and state management in the **Raider Station** student storefront and delivers concrete, production-grade TypeScript models, repository interfaces, and state patterns required to implement:
- **R1: Product Reviews & 5-Star Rating System** (editorial summaries, 5-to-1 star distribution bars, verified student badges, review submission modal, helpful voting, and catalog card badges).
- **R2: Global Customer Complaints & Feedback Drawer** (structured grievance intake, category tags, urgency levels).
- **R3: Discreet Admin Management & Moderation Console** (catalog inventory, review moderation, complaint ticketing).
- **R5: Architecture & Production Scaffolding** (typed repository pattern with localStorage persistence, in-memory fallbacks, and backend database readiness).

### Key Findings
1. **Monolithic Context & Raw Storage Access**: The existing application relies on a single monolithic `StoreProvider.tsx` (`StoreContext`) that directly invokes `window.localStorage` with key `raider_station_products_v2` and `raider_theme`. There are no storage abstractions or repository layers.
2. **Missing Entity Stores**: There are currently **zero** reviews or complaints data structures or stores in the codebase.
3. **Product Flow & Component Coupling**:
   - `HomeCover.tsx` displays top products via `HeroShowcase.tsx` and curated campus drops.
   - `ShopCatalog.tsx` manages catalog filtering, search, and quick size picker.
   - `ProductDetails.tsx` renders the product visual, pricing, radio-button size selection, and description accordions.
   - None of these surfaces currently display ratings or review counts.
4. **Seamless Extensibility**: By introducing a typed repository pattern (`IProductRepository`, `IReviewRepository`, `IComplaintRepository`) backed by a safe `StorageDriver` layer, the application can maintain 100% client-side functionality with `localStorage` and in-memory fallbacks while allowing an instant, single-line swap to Prisma, PostgreSQL, Supabase, or REST APIs in the future.

---

## 2. Current Product & State Architecture Audit

### 2.1 Existing Type Definitions (`src/lib/store.ts`)
```typescript
export type ProductCategory = "Spirit Wear" | "School Supplies" | "Snacks & Drinks" | "Accessories" | string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  tag: string;
  description: string;
  image: string;
  sizes?: string[];
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}
```

### 2.2 Static Catalog & Presets
- **Preset Images (`PRESET_IMAGES`)**: 10 curated local JPEG images located in `public/images/` (`/images/raider_hoodie.jpg`, `/images/raider_jacket.jpg`, `/images/raider_cap.jpg`, `/images/jacket.jpg`, `/images/sneaker.jpg`, `/images/raider_bottle.jpg`, `/images/raider_notebook.jpg`, `/images/hero.jpg`, `/images/raider_hero.jpg`, `/images/hoodie.jpg`).
- **Default Products (`PRODUCTS`)**: 11 curated items across 4 core categories:
  1. `rs-hoodie-01`: Sideline Hoodie ($54, orig $65) · *Spirit Wear*
  2. `rs-jacket-02`: Varsity Letterman ($185, orig $220) · *Spirit Wear*
  3. `rs-cap-03`: Raider Cap ($32, orig $38) · *Spirit Wear*
  4. `rs-bomber-06`: Stadium Windbreaker ($88, orig $105) · *Spirit Wear*
  5. `rs-sneaker-11`: Raider Court Low ($95, orig $110) · *Spirit Wear*
  6. `rs-notebook-04`: Everyday Notebook ($14) · *School Supplies*
  7. `rs-bottle-05`: Raider Water Bottle ($36, orig $42) · *Accessories*
  8. `rs-blanket-07`: Friday Night Blanket ($48) · *Accessories*
  9. `rs-pen-08`: Precision Gel Pens · 3pk ($9) · *School Supplies*
  10. `rs-coldbrew-09`: Nitro Cold Brew ($4.50) · *Snacks & Drinks*
  11. `rs-protein-10`: Chocolate Almond Bar ($3.50) · *Snacks & Drinks*

### 2.3 Existing State Management (`src/components/StoreProvider.tsx`)
- **State Properties**:
  - `cart: CartItem[]`
  - `cartOpen: boolean`
  - `theme: Theme` (`"heritage" | "obsidian" | "studio" | "gold"`)
  - `products: Product[]`
  - `message: string` (Toast notification)
- **Persistence Mechanism**:
  - `raider_station_products_v2` in `localStorage`: initialized synchronously in `useState` with SSR `typeof window !== "undefined"` guards and parsed array verification.
  - `raider_theme` in `localStorage`: synced with `<html data-theme="...">` inline script in `src/app/layout.tsx` to prevent theme flash.
- **Identified Deficiencies**:
  - Direct calls to `window.localStorage.setItem()` inside React callbacks with no repository encapsulation.
  - No error handling for storage quota limits (`QuotaExceededError`) or private browsing restrictions.
  - No data versioning, schema migration, or entity relationships between products, reviews, and complaints.
  - Toast system is a single string with fixed 3.8s timeout, unable to handle multi-toast queues or distinct toast types (e.g. success, info, warning).

### 2.4 Page-by-Page Product Flow Audit

| Page / Route | Component Chain | Current Product Data Flow | Required Enhancements (R1–R5) |
|---|---|---|---|
| **Home (`/`)** | `app/page.tsx` → `HomeCover.tsx` → `HeroShowcase.tsx`, `CollectionMotion.tsx` | Reads `products` from `useStore()`. Curates 4 featured items for Hero, 4 for Essentials grid, 5 for horizontal motion strip. | Integrate compact star rating badges (e.g. `★ 4.9 (18)`) onto product cards in the Everyday Raiders showcase. |
| **Catalog (`/shop`)** | `app/shop/page.tsx` → `ShopCatalog.tsx` | Reads `products` from `useStore()`. Computes dynamic categories, executes text search, handles quick-add & size picker pill. | Integrate compact star rating badges on all catalog cards; ensure sorting/filtering can optionally consider top-rated items without layout shift. |
| **Detail (`/shop/[id]`)** | `app/shop/[id]/page.tsx` → `ProductDetailWrapper.tsx` → `ProductDetails.tsx` | Server component reads `PRODUCTS` for static params & initial props; client wrapper queries `getProductById(id)` from `useStore()`. | Add editorial rating summary header, 5-to-1 star distribution bars, verified student reviews list, helpful voting buttons, and "Write a Review" modal. |
| **Admin (`/admin`)** | `app/admin/page.tsx` → `AdminProductModal.tsx` | Reads `products` from `useStore()`. Full CRUD, stock toggling, inline price editing, JSON import/export, reset defaults. | Add discreet PIN guard (`raider2026`), split console into 3 tabs: **Catalog Inventory**, **Reviews Moderation**, **Complaints Inbox**. |

---

## 3. Target Domain Models & TypeScript Specifications

### 3.1 Product Domain Model
```typescript
export type ProductCategory = 
  | "Spirit Wear" 
  | "School Supplies" 
  | "Snacks & Drinks" 
  | "Accessories" 
  | string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  tag: string;
  description: string;
  image: string;
  sizes?: string[];
  inStock?: boolean;
}
```

### 3.2 Review & Rating Domain Models (R1)
```typescript
export type StudentGradeLevel = 
  | "Freshman" 
  | "Sophomore" 
  | "Junior" 
  | "Senior" 
  | "Faculty / Staff" 
  | "Raider Alumni";

export type ReviewStatus = "approved" | "pending" | "hidden";

export interface Review {
  id: string;
  productId: string;
  author: string;
  gradeLevel?: StudentGradeLevel;
  verifiedStudent: boolean;
  rating: number; // Integer between 1 and 5
  title: string;
  comment: string;
  recommend: boolean;
  helpfulCount: number;
  createdAt: string; // ISO 8601 string
  status: ReviewStatus;
}

export interface ReviewSubmissionInput {
  productId: string;
  author: string;
  gradeLevel?: StudentGradeLevel;
  rating: number;
  title: string;
  comment: string;
  recommend: boolean;
}

export interface StarDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ProductRatingSummary {
  productId: string;
  averageRating: number;      // e.g. 4.8
  totalReviews: number;       // e.g. 14
  recommendPercentage: number; // 0 - 100%
  distribution: StarDistribution;
  percentages: StarDistribution;
}
```

### 3.3 Complaint & Feedback Domain Models (R2 & R3)
```typescript
export type ComplaintCategory = 
  | "Order Issue" 
  | "Item Condition / Defect" 
  | "Sizing / Stock Request" 
  | "Campus Kiosk Suggestion" 
  | "General Grievance";

export type ComplaintUrgency = "low" | "medium" | "high";

export type ComplaintStatus = "new" | "in_progress" | "resolved";

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  customerName: string;
  contactInfo: string; // Student Email, Phone, or Student ID
  orderId?: string;
  productId?: string;
  description: string;
  status: ComplaintStatus;
  staffNotes?: string;
  createdAt: string; // ISO 8601 string
  resolvedAt?: string;
}

export interface ComplaintSubmissionInput {
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  customerName: string;
  contactInfo: string;
  orderId?: string;
  productId?: string;
  description: string;
}
```

### 3.4 Admin Moderation & Metric Models (R3)
```typescript
export interface ReviewModerationStats {
  totalReviews: number;
  approvedCount: number;
  pendingCount: number;
  hiddenCount: number;
  overallAverageRating: number;
}

export interface ComplaintStats {
  totalComplaints: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  highUrgencyCount: number;
}
```

---

## 4. Storage Abstraction & Repository Pattern Design (R5)

To decouple the UI from storage technology, we define a modular Repository Pattern.

```
┌─────────────────────────────────────────────────────────────────┐
│                    React UI Layer (Hooks)                       │
│       useProducts()   useReviews()   useComplaints()   useCart() │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                   Unified Store Context Provider                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                      Repository Layer                           │
│   ┌─────────────────────┬───────────────────┬───────────────┐   │
│   │  ProductRepository  │  ReviewRepository │ ComplaintRepo │   │
│   └─────────────────────┴───────────────────┴───────────────┘   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                    Storage Driver Abstraction                   │
│   ┌─────────────────────────────┬───────────────────────────┐   │
│   │    LocalStorageDriver       │    MemoryStorageDriver    │   │
│   │  (Browser persistent store) │   (SSR / In-Memory cache) │   │
│   └─────────────────────────────┴───────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ (Future Swap)
┌────────────────────────────────▼────────────────────────────────┐
│               PostgreSQL / Supabase / Prisma Driver             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 Storage Driver Interface (`src/lib/storage/driver.ts`)
```typescript
export interface IStorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export class LocalStorageDriver implements IStorageDriver {
  private fallbackMemory = new Map<string, string>();

  getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return this.fallbackMemory.get(key) ?? null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return this.fallbackMemory.get(key) ?? null;
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") {
      this.fallbackMemory.set(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[LocalStorageDriver] Storage failed for key "${key}", falling back to memory`, error);
      this.fallbackMemory.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (typeof window === "undefined") {
      this.fallbackMemory.delete(key);
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      this.fallbackMemory.delete(key);
    }
  }

  clear(): void {
    if (typeof window === "undefined") {
      this.fallbackMemory.clear();
      return;
    }
    try {
      window.localStorage.clear();
    } catch {
      this.fallbackMemory.clear();
    }
  }
}
```

### 4.2 Product Repository Interface (`src/lib/repositories/ProductRepository.ts`)
```typescript
export interface IProductRepository {
  getAll(): Product[];
  getById(id: string): Product | undefined;
  create(product: Omit<Product, "id"> & { id?: string }): Product;
  update(id: string, updates: Partial<Product>): Product | null;
  delete(id: string): boolean;
  reset(): Product[];
  importCatalog(products: Product[]): Product[];
  exportCatalog(): string;
}
```

### 4.3 Review Repository Interface (`src/lib/repositories/ReviewRepository.ts`)
```typescript
export interface IReviewRepository {
  getAll(): Review[];
  getByProductId(productId: string, options?: { approvedOnly?: boolean }): Review[];
  getRatingSummary(productId: string): ProductRatingSummary;
  getAllRatingSummaries(): Record<string, ProductRatingSummary>;
  create(input: ReviewSubmissionInput): Review;
  voteHelpful(reviewId: string): { reviewId: string; helpfulCount: number; userVoted: boolean };
  hasUserVoted(reviewId: string): boolean;
  updateStatus(reviewId: string, status: ReviewStatus): Review | null;
  delete(reviewId: string): boolean;
  getModerationStats(): ReviewModerationStats;
  reset(): Review[];
}
```

### 4.4 Complaint Repository Interface (`src/lib/repositories/ComplaintRepository.ts`)
```typescript
export interface IComplaintRepository {
  getAll(): Complaint[];
  getById(id: string): Complaint | undefined;
  create(input: ComplaintSubmissionInput): Complaint;
  updateStatus(id: string, status: ComplaintStatus, staffNotes?: string): Complaint | null;
  delete(id: string): boolean;
  getStats(): ComplaintStats;
  reset(): Complaint[];
}
```

### 4.5 Storage Keys & Migration Plan
To ensure clean isolation and schema safety, standard storage keys are specified:
- `raider_station_products_v2`: Products catalog (retains backward compatibility).
- `raider_station_reviews_v1`: Reviews collection with default seed hydration.
- `raider_station_complaints_v1`: Complaints inbox submissions.
- `raider_station_voted_reviews_v1`: Client array of review IDs upvoted in current browser.
- `raider_admin_auth_v1`: Admin unlock session state (timestamped).
- `raider_theme`: Active colorway theme (`heritage`, `obsidian`, `studio`, `gold`).

---

## 5. R1 Deep Dive: Product Reviews & 5-Star Rating System

### 5.1 Aggregate Score & Distribution Calculation Algorithm
Given a set of reviews for a product:
1. Filter reviews by `status === "approved"` (or all reviews in dev mode).
2. If `reviews.length === 0`:
   - `averageRating = 5.0` (or unrated default)
   - `totalReviews = 0`
   - `recommendPercentage = 100`
   - `distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }`
   - `percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }`
3. If `reviews.length > 0`:
   - `totalReviews = reviews.length`
   - `sum = reviews.reduce((acc, r) => acc + r.rating, 0)`
   - `averageRating = Math.round((sum / totalReviews) * 10) / 10`
   - `recommendCount = reviews.filter(r => r.recommend).length`
   - `recommendPercentage = Math.round((recommendCount / totalReviews) * 100)`
   - `distribution[rating] = count of reviews with rating`
   - `percentages[rating] = Math.round((count / totalReviews) * 100)`

### 5.2 Curated Initial Seed Reviews
To ensure the storefront launches with rich, authentic Rouse High School editorial content, realistic initial reviews are defined for all 11 catalog products:

```typescript
export const SEED_REVIEWS: Review[] = [
  // rs-hoodie-01: Sideline Hoodie
  {
    id: "rev-hoodie-01",
    productId: "rs-hoodie-01",
    author: "Elena Rostova",
    gradeLevel: "Senior",
    verifiedStudent: true,
    rating: 5,
    title: "Best hoodie for Friday Night football games",
    comment: "The double-lined hood and heavyweight fleece are incredible. Wore this to all the chilly playoff games at Gupton Stadium and stayed warm all night. The gold embroidery doesn't fray in the wash either!",
    recommend: true,
    helpfulCount: 28,
    createdAt: "2026-08-28T14:22:00Z",
    status: "approved",
  },
  {
    id: "rev-hoodie-02",
    productId: "rs-hoodie-01",
    author: "Marcus Chen",
    gradeLevel: "Junior",
    verifiedStudent: true,
    rating: 5,
    title: "True to size, super soft inside",
    comment: "I'm 6'1 and size Large fits perfectly with room for a t-shirt underneath. The maroon color matches our school fight song uniforms exactly.",
    recommend: true,
    helpfulCount: 14,
    createdAt: "2026-08-30T10:15:00Z",
    status: "approved",
  },
  {
    id: "rev-hoodie-03",
    productId: "rs-hoodie-01",
    author: "Taylor Brooks",
    gradeLevel: "Sophomore",
    verifiedStudent: true,
    rating: 4,
    title: "Great quality, slightly snug wrists",
    comment: "Love the heavyweight feel! The wrist cuffs are slightly snug when pushed up on forearms, but stretches comfortably after a few days.",
    recommend: true,
    helpfulCount: 6,
    createdAt: "2026-09-01T08:45:00Z",
    status: "approved",
  },

  // rs-jacket-02: Varsity Letterman
  {
    id: "rev-jacket-01",
    productId: "rs-jacket-02",
    author: "Jordan Hayes",
    gradeLevel: "Senior",
    verifiedStudent: true,
    rating: 5,
    title: "Heritage heirloom quality",
    comment: "The chenille R crest and melton wool are top-notch. Worth every penny for senior year memories. Looks amazing with jeans or over a game jersey.",
    recommend: true,
    helpfulCount: 32,
    createdAt: "2026-08-25T18:30:00Z",
    status: "approved",
  },
  {
    id: "rev-jacket-02",
    productId: "rs-jacket-02",
    author: "Coach Miller",
    gradeLevel: "Faculty / Staff",
    verifiedStudent: true,
    rating: 5,
    title: "Outstanding craftsmanship for our Raiders",
    comment: "Snap closures are heavy-duty and the leather-feel sleeves hold up great in Texas winter weather. Standard-issue Rouse pride.",
    recommend: true,
    helpfulCount: 19,
    createdAt: "2026-08-27T12:00:00Z",
    status: "approved",
  },

  // rs-cap-03: Raider Cap
  {
    id: "rev-cap-01",
    productId: "rs-cap-03",
    author: "Aiden Patel",
    gradeLevel: "Junior",
    verifiedStudent: true,
    rating: 5,
    title: "Structured fit that keeps its shape",
    comment: "The flex-stretch band fits comfortably without squeezing your temples. The raised gold embroidery looks sharp under bright stadium lights.",
    recommend: true,
    helpfulCount: 11,
    createdAt: "2026-08-29T16:10:00Z",
    status: "approved",
  },

  // rs-bomber-06: Stadium Windbreaker
  {
    id: "rev-bomber-01",
    productId: "rs-bomber-06",
    author: "Sienna Rodriguez",
    gradeLevel: "Senior",
    verifiedStudent: true,
    rating: 5,
    title: "Lightweight and rain-ready",
    comment: "Keeps the autumn rain off during track practice. Mesh lining is breathable so you don't overheat during 5th period.",
    recommend: true,
    helpfulCount: 9,
    createdAt: "2026-08-31T09:20:00Z",
    status: "approved",
  },

  // rs-sneaker-11: Raider Court Low
  {
    id: "rev-sneaker-01",
    productId: "rs-sneaker-11",
    author: "Devon Washington",
    gradeLevel: "Junior",
    verifiedStudent: true,
    rating: 5,
    title: "Cleanest campus kicks yet",
    comment: "Gold heel accents give it a premium designer look. Cushioning is great for walking across the entire campus from the arts wing to the gym.",
    recommend: true,
    helpfulCount: 22,
    createdAt: "2026-08-26T11:40:00Z",
    status: "approved",
  },

  // rs-notebook-04: Everyday Notebook
  {
    id: "rev-notebook-01",
    productId: "rs-notebook-04",
    author: "Chloe Bennett",
    gradeLevel: "Sophomore",
    verifiedStudent: true,
    rating: 5,
    title: "Fountain & gel pen approved! No bleed-through",
    comment: "Thick, high quality pages. The ribbon placeholder and gold foil Rouse seal make it look like a high-end journal.",
    recommend: true,
    helpfulCount: 15,
    createdAt: "2026-08-29T14:05:00Z",
    status: "approved",
  },

  // rs-bottle-05: Raider Water Bottle
  {
    id: "rev-bottle-01",
    productId: "rs-bottle-05",
    author: "Liam Garcia",
    gradeLevel: "Freshman",
    verifiedStudent: true,
    rating: 5,
    title: "Ice stays frozen all school day",
    comment: "Filled with ice at 7:30 AM before first bell and it still had ice cubes after 7th period athletics. Fits in backpack side pockets easily.",
    recommend: true,
    helpfulCount: 18,
    createdAt: "2026-08-28T19:15:00Z",
    status: "approved",
  },

  // rs-blanket-07: Friday Night Blanket
  {
    id: "rev-blanket-01",
    productId: "rs-blanket-07",
    author: "Maya Lindqvist",
    gradeLevel: "Senior",
    verifiedStudent: true,
    rating: 5,
    title: "Sherpa lining is unbelievably soft",
    comment: "Huge 50x60 size covers two people easily on the metal bleachers. Everyone asks where we bought it during halftime!",
    recommend: true,
    helpfulCount: 21,
    createdAt: "2026-08-24T20:30:00Z",
    status: "approved",
  },

  // rs-pen-08: Precision Gel Pens · 3pk
  {
    id: "rev-pen-01",
    productId: "rs-pen-08",
    author: "Zachary Morris",
    gradeLevel: "Junior",
    verifiedStudent: true,
    rating: 5,
    title: "Ultra smooth 0.5mm tip",
    comment: "Zero smearing during rapid note taking in AP History. The matte barrel grip feels comfortable during long exam sessions.",
    recommend: true,
    helpfulCount: 8,
    createdAt: "2026-08-30T15:50:00Z",
    status: "approved",
  },

  // rs-coldbrew-09: Nitro Cold Brew
  {
    id: "rev-coldbrew-01",
    productId: "rs-coldbrew-09",
    author: "Alex Rivera",
    gradeLevel: "Senior",
    verifiedStudent: true,
    rating: 5,
    title: "Essential for 8 AM advisory",
    comment: "Smooth, velvety cold brew with no bitterness. The kiosk pickup between bells is super fast.",
    recommend: true,
    helpfulCount: 12,
    createdAt: "2026-09-01T07:55:00Z",
    status: "approved",
  },

  // rs-protein-10: Chocolate Almond Bar
  {
    id: "rev-protein-01",
    productId: "rs-protein-10",
    author: "Brooke Simmons",
    gradeLevel: "Sophomore",
    verifiedStudent: true,
    rating: 5,
    title: "Delicious post-practice snack",
    comment: "Real roasted almonds and rich dark chocolate. Not chalky like typical grocery protein bars. 10/10!",
    recommend: true,
    helpfulCount: 7,
    createdAt: "2026-08-31T16:45:00Z",
    status: "approved",
  },
];
```

### 5.3 UI Component Specifications for R1

#### 1. `StarRating` Component (`src/components/StarRating.tsx`)
- **Props**:
  - `rating: number` (current score or value)
  - `maxStars?: number` (default 5)
  - `interactive?: boolean` (interactive hover & click vs static display)
  - `onChange?: (value: number) => void`
  - `size?: "sm" | "md" | "lg"` (sm: 12px, md: 16px, lg: 24px)
  - `showValue?: boolean`
  - `activeColor?: string` (default `var(--gold)`)
- **Interactions**:
  - Hover preview with micro-scale bounce using Framer Motion (`scale: 1.25`, transition `spring(400, 25)`).
  - Active selection feedback label ("1 - Needs Work", "2 - Fair", "3 - Good", "4 - Great!", "5 - Raider Exceptional!").
  - Full keyboard access: arrow keys left/right, space/enter to select, `aria-label="Rating: X of 5 stars"`.

#### 2. `ProductRatingBadge` Component (`src/components/ProductRatingBadge.tsx`)
- **Props**: `productId: string`, `compact?: boolean`
- **Output**: Compact pill displaying star icon, average rating (e.g. `4.9`), and total reviews count (e.g. `(14)`).
- **Zero layout shift**: Fixed line-height and height so it aligns cleanly between product title and price on Home and `/shop` cards.

#### 3. `ProductReviewsSection` Component (`src/components/ProductReviewsSection.tsx`)
- **Editorial Summary Card**:
  - Left column: Large bold average rating number (e.g. `4.9`), 5-star display, total review count, and recommendation percentage badge (`96% of students recommend`).
  - Middle column: 5-to-1 horizontal percentage progress bars with smooth filled width transitions. Clicking a bar filters reviews by that star rating.
  - Right column: "Write a Review" primary button.
- **Reviews List**:
  - Filters & sorting: Sort by "Most Recent", "Highest Rating", "Lowest Rating", "Most Helpful".
  - Review Cards: Verified student badge pill (`✓ Verified Student · Senior`), star rating, date formatted (e.g. `Aug 28, 2026`), review headline, review description, recommendation flag (`✓ Recommends this item`), and "Helpful (X)" voting button.

#### 4. `ReviewSubmissionModal` Component (`src/components/ReviewSubmissionModal.tsx`)
- **Accessible Dialog**:
  - Traps focus with `useDialogLifecycle` / native `<dialog>` or accessible overlay.
  - Interactive star rating selector (1-5).
  - Student Name field with grade selector pills (`Freshman`, `Sophomore`, `Junior`, `Senior`, `Faculty / Staff`).
  - Review Title field (e.g. "Best hoodie for Friday Night games").
  - Review Comment textarea with character count helper.
  - Recommendation Toggle ("Would you recommend this item to fellow Raiders?").
  - Animated submit button with spring confirmation toast.
  - Optimistic UI update: review appears immediately in product review list, aggregate summary recalculates instantly.

---

## 6. R2 & R3 State & Model Requirements (Complaints & Admin Moderation)

### 6.1 Complaints & Support Feedback Drawer (R2)
- **Global Accessibility**: Accessible via subtle "Feedback & Complaints" trigger in site footer, header utility, and product detail accordion.
- **Drawer State Management**:
  - `complaintsDrawerOpen: boolean` in store context.
  - Slide-over animation with right anchor, backdrop blur, `cubic-bezier(0.76, 0, 0.24, 1)` easing.
- **Structured Fields**:
  - Category selector pills: `Order Issue`, `Item Condition / Defect`, `Sizing / Stock Request`, `Campus Kiosk Suggestion`, `General Grievance`.
  - Urgency selector: `Low` (General Inquiry), `Medium` (Next-day resolution), `High` (Immediate attention needed).
  - Customer contact info: Name & Student Email / ID.
  - Optional Order Reference / Product reference.
  - Description textarea.
- **Submission Action**:
  - Dispatches to `ComplaintRepository.create()`.
  - Triggers spring toast notification: *"Thank you! Your feedback has been submitted to Raider Station staff."*
  - Resets form and auto-closes drawer.

### 6.2 Admin Moderation Console (R3)
- **Discreet Access**:
  - Admin header tab removed from main customer navigation (`/`, `/shop`).
  - Discreet footer link: `"Staff Admin"` linking to `/admin`.
  - Passcode Guard Modal: Prompt for PIN passcode (`raider2026`). On valid entry, saves authenticated session to `sessionStorage` / state.
- **Admin Tabbed Architecture**:
  1. **Tab 1: Inventory & Catalog**:
     - Search, category filter, stock status filter (`All`, `In Stock`, `Sold Out`), sorting.
     - Add new product modal, edit product modal, duplicate listing, delete listing, inline price quick-edit, stock toggle.
     - Export catalog JSON backup, import catalog JSON, reset to defaults.
  2. **Tab 2: Reviews Moderation**:
     - Overview metrics: Total Reviews, Approved, Pending, Hidden, Average Store Rating.
     - Product filter dropdown & status filter (`All`, `Approved`, `Pending`, `Hidden`).
     - Review moderation table: Product Name, Reviewer & Grade, Star Rating, Review Title & Comment, Date, Status Badge (`Approved`, `Hidden`), Actions (`Approve`, `Hide`, `Delete`).
  3. **Tab 3: Complaints & Grievances Inbox**:
     - Overview metrics: Total Submissions, New, In Progress, Resolved, Urgent Items.
     - Status tabs: `All`, `New`, `In Progress`, `Resolved`.
     - Complaint card / table view: Category pill, Urgency badge (`High` = Red, `Medium` = Amber, `Low` = Slate), Customer Name & Contact, Description, Timestamp, Resolution Status Toggle (`New` ➔ `In Progress` ➔ `Resolved`), Staff Notes modal/input.

---

## 7. Refactored React Context Architecture

### 7.1 Unified Store Context Interface
To maintain full backwards compatibility with all existing components while providing access to the new repositories:

```typescript
export interface StoreContextValue {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id"> & { id?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  getProductById: (id: string) => Product | undefined;
  importCatalog: (products: Product[]) => void;
  exportCatalog: () => string;

  // Reviews & Ratings
  reviews: Review[];
  getReviewsByProduct: (productId: string) => Review[];
  getRatingSummary: (productId: string) => ProductRatingSummary;
  allRatingSummaries: Record<string, ProductRatingSummary>;
  addReview: (input: ReviewSubmissionInput) => Review;
  voteHelpful: (reviewId: string) => void;
  hasUserVotedReview: (reviewId: string) => boolean;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;
  resetReviews: () => void;
  reviewStats: ReviewModerationStats;

  // Complaints & Feedback
  complaints: Complaint[];
  addComplaint: (input: ComplaintSubmissionInput) => Complaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, notes?: string) => void;
  deleteComplaint: (id: string) => void;
  resetComplaints: () => void;
  complaintStats: ComplaintStats;
  isFeedbackDrawerOpen: boolean;
  openFeedbackDrawer: () => void;
  closeFeedbackDrawer: () => void;

  // Cart / Bag
  cart: CartItem[];
  totalItems: number;
  openBag: () => void;
  closeBag: () => void;
  isBagOpen: boolean;
  addToCart: (product: Product, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, delta: number) => void;
  clearCart: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

  // Notifications / Toast
  notify: (msg: string, type?: "success" | "info" | "warning") => void;
}
```

### 7.2 Dedicated Ergonomic Custom Hooks
```typescript
// 1. Primary hook
export function useStore(): StoreContextValue;

// 2. Focused domain hooks
export function useProducts();
export function useReviews(productId?: string);
export function useComplaints();
export function useCart();
export function useTheme();
export function useAdmin();
```

---

## 8. Concrete Implementation Directory Layout

```
src/
├── app/
│   ├── admin/
│   │   ├── admin.module.css
│   │   └── page.tsx              # Elevated 3-tab Admin console with PIN guard
│   ├── shop/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Product Detail with Reviews & Ratings
│   │   └── page.tsx              # Shop Catalog with Rating Badges
│   ├── globals.css               # Shared themes, variables, animations
│   ├── layout.tsx                # RootLayout with StoreProvider, SmoothScroll
│   └── page.tsx                  # HomeCover with Curated Ratings
├── components/
│   ├── AdminProductModal.tsx     # Product Add/Edit Dialog
│   ├── AdminPinModal.tsx         # PIN / Passcode Guard Modal (raider2026)
│   ├── AdminReviewsTable.tsx     # Reviews moderation table & actions
│   ├── AdminComplaintsTable.tsx  # Complaints inbox & resolution workflow
│   ├── FeedbackDrawer.tsx        # Global slide-over drawer (R2)
│   ├── FeedbackDrawer.module.css
│   ├── ProductDetails.tsx        # Product specs, gallery, size picker
│   ├── ProductRatingBadge.tsx    # Compact catalog card rating pill (R1)
│   ├── ProductReviewsSection.tsx # Editorial reviews & breakdown bars (R1)
│   ├── ProductReviewsSection.module.css
│   ├── ReviewSubmissionModal.tsx # Star selector & review submission modal
│   ├── StarRating.tsx            # Animated 5-star selector / display
│   ├── ShopCatalog.tsx           # Catalog with rating badges
│   ├── SiteShell.tsx             # Header (admin link removed) & Footer ("Staff Admin")
│   ├── StoreProvider.tsx         # Unified context provider
│   └── ToastNotification.tsx     # Spring animated confirmation toast
└── lib/
    ├── store.ts                  # Product & Cart base types, presets, PRODUCTS
    ├── storage/
    │   └── driver.ts             # IStorageDriver, LocalStorageDriver, MemoryDriver
    ├── repositories/
    │   ├── ProductRepository.ts  # IProductRepository implementation
    │   ├── ReviewRepository.ts   # IReviewRepository & seed data implementation
    │   └── ComplaintRepository.ts# IComplaintRepository implementation
    └── mock-data/
        └── seed-reviews.ts       # Authentic Rouse student review seeds
```

---

## 9. Verification & Quality Assurance Strategy

1. **Type Safety & Static Analysis**:
   - Verify `npm run lint` passes with 0 errors and 0 warnings.
   - Run `npx tsc --noEmit` to verify type completeness across all models and repositories.
2. **Repository Unit & In-Memory Fallback Verification**:
   - Verify all CRUD methods on `ProductRepository`, `ReviewRepository`, and `ComplaintRepository` operate cleanly both with `localStorage` available and in memory fallback mode (simulating private browsing / SSR).
3. **Data Integrity & Recalculation Tests**:
   - Verify adding a 1-star or 5-star review dynamically updates `averageRating`, `totalReviews`, and `percentages` immediately.
   - Verify "Helpful" button prevents double-voting from the same client session.
4. **Performance & Motion Standards**:
   - Verify zero layout shift when star rating badges render on catalog cards.
   - Test `prefers-reduced-motion: reduce` across star hover animations, drawer transitions, and toast notifications.
5. **Static Site Generation & Build**:
   - Verify `npm run build` completes successfully with all dynamic `/shop/[id]` routes rendering without errors.

---
*Report completed by Survey Explorer 2. Ready for handoff to Orchestrator and Implementer agents.*
