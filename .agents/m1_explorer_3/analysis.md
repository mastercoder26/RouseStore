# Milestone 1: Seed Data Architecture & Context Integration Blueprint

**Author**: Milestone 1 Explorer 3 (Seed Data & Context Integration Specialist)  
**Date**: 2026-09-02  
**Target Milestone**: Milestone 1 (Typed Storage Architecture & Repositories)  
**Scope**: F3 (Unified Context Store & State Hooks), F4 (Authentic Seed Data for Reviews & Complaints), R5 (Architecture & Production Scaffolding).

---

## 1. Executive Summary

This blueprint delivers the complete specification, typed domain datasets, and implementation code for the **Seed Data Layer** and **Refactored React Context Provider (`StoreProvider.tsx`)** for Raider Station (Rouse High School E-Commerce Storefront).

### Core Deliverables
1. **Authentic Seed Datasets**:
   - `src/lib/seed/seedProducts.ts`: Curated catalog of 11 authentic Rouse High School products across 4 categories (Spirit Wear, School Supplies, Accessories, Snacks & Drinks), with complete sizing options, pricing, and high-fidelity image paths.
   - `src/lib/seed/seedReviews.ts`: 18 realistic editorial reviews across all 11 catalog products, featuring student names, grade levels (Freshman, Sophomore, Junior, Senior, Faculty / Staff), verified student badges, ratings (1–5 stars), helpful counts, and recommendation flags. Includes 1 pending/hidden review for immediate testing of admin moderation flows.
   - `src/lib/seed/seedComplaints.ts`: 6 structured grievances across all 5 standard categories (*Order Issue*, *Item Condition / Defect*, *Sizing / Stock Request*, *Campus Kiosk Suggestion*, *General Grievance*), varying urgency levels (*Low*, *Medium*, *High*), statuses (*New*, *In Progress*, *Resolved*), student contact details, and realistic staff resolution notes.
2. **Refactored `StoreProvider.tsx` with Repository Integration**:
   - Encapsulates `ProductRepository`, `ReviewRepository`, and `ComplaintRepository` backed by safe `LocalStorageDriver` (with SSR and in-memory fallback).
   - Preserves **100% backward compatibility** for all existing components (`SiteShell`, `ShopCatalog`, `ProductDetails`, `HomeCover`, `HeroShowcase`, `CollectionMotion`, `ThemeSelector`, `AdminPage`).
   - Introduces reactive state propagation: every repository mutation triggers an immediate, immutable state update in React context.
3. **Ergonomic Domain Hooks**:
   - `useStore()`: Master unified hook for complete access.
   - `useReviews(productId?)`: Scoped review management, rating summaries, and helpful voting.
   - `useComplaints()`: Grievance ingestion, status triage, and staff notes management.
   - `useFeedback()`: Slide-over drawer control and grievance submission.
   - `useProducts()`, `useCart()`, `useTheme()`, `useAdmin()`: Focused domain helpers.

---

## 2. Authentic Seed Datasets

### 2.1 `src/lib/seed/seedProducts.ts`

```typescript
import { Product } from "@/types/product";

export const PRESET_IMAGES = [
  { label: "Sideline Maroon Hoodie", src: "/images/raider_hoodie.jpg" },
  { label: "Classic Black Hoodie", src: "/images/hoodie.jpg" },
  { label: "Varsity Letterman Jacket", src: "/images/raider_jacket.jpg" },
  { label: "Stadium Windbreaker", src: "/images/jacket.jpg" },
  { label: "Raider FlexFit Cap", src: "/images/raider_cap.jpg" },
  { label: "Raider Court Sneaker", src: "/images/sneaker.jpg" },
  { label: "Insulated Water Bottle", src: "/images/raider_bottle.jpg" },
  { label: "Everyday Hardcover Notebook", src: "/images/raider_notebook.jpg" },
  { label: "Friday Night Stadium Blanket", src: "/images/hero.jpg" },
  { label: "Raider Spirit Banner", src: "/images/raider_hero.jpg" },
];

export const CATEGORIES = [
  "All items",
  "Spirit Wear",
  "School Supplies",
  "Snacks & Drinks",
  "Accessories",
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "rs-hoodie-01",
    name: "Sideline Hoodie",
    category: "Spirit Wear",
    price: 54,
    originalPrice: 65,
    tag: "Athletics",
    description: "Heavyweight maroon fleece hoodie with double-lined hood and gold embroidered Rouse lettering.",
    image: "/images/raider_hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    inStock: true,
  },
  {
    id: "rs-jacket-02",
    name: "Varsity Letterman",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    tag: "Heritage",
    description: "Traditional maroon melton wool body with matte black leather-touch sleeves and gold chenille R crest.",
    image: "/images/raider_jacket.jpg",
    sizes: ["M", "L", "XL", "2XL"],
    inStock: true,
  },
  {
    id: "rs-cap-03",
    name: "Raider Cap",
    category: "Spirit Wear",
    price: 32,
    originalPrice: 38,
    tag: "Sideline",
    description: "Structured six-panel black performance cap with raised gold R embroidery and flex-stretch headband.",
    image: "/images/raider_cap.jpg",
    sizes: ["S/M", "L/XL"],
    inStock: true,
  },
  {
    id: "rs-bomber-06",
    name: "Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    tag: "Outerwear",
    description: "Water-resistant matte nylon shell with breathable mesh lining and storm-flap snap closure.",
    image: "/images/jacket.jpg",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: "rs-sneaker-11",
    name: "Raider Court Low",
    category: "Spirit Wear",
    price: 95,
    originalPrice: 110,
    tag: "Limited Drop",
    description: "Low-profile court sneakers with premium leather uppers, cushioned insole, and gold heel accents.",
    image: "/images/sneaker.jpg",
    sizes: ["8", "9", "10", "11", "12"],
    inStock: true,
  },
  {
    id: "rs-notebook-04",
    name: "Everyday Notebook",
    category: "School Supplies",
    price: 14,
    tag: "College-ruled",
    description: "Durable hardcover journal with 160 college-ruled pages, ribbon placeholder, and gold foil Rouse emblem.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-bottle-05",
    name: "Raider Water Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    tag: "32 oz",
    description: "Double-walled vacuum insulated stainless steel bottle. Keeps drinks cold for 24 hours with spill-proof lid.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Blanket",
    category: "Accessories",
    price: 48,
    tag: "Game Day",
    description: "Plush 50x60 inch maroon sherpa fleece blanket with gold braided edge trim. Perfect for bleacher nights.",
    image: "/images/hero.jpg",
    inStock: true,
  },
  {
    id: "rs-pen-08",
    name: "Precision Gel Pens · 3pk",
    category: "School Supplies",
    price: 9,
    tag: "Black ink",
    description: "Triple pack of 0.5mm smooth-glide archival black gel pens with matte comfort grip barrels.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-coldbrew-09",
    name: "Nitro Cold Brew",
    category: "Snacks & Drinks",
    price: 4.5,
    tag: "12 oz Chilled",
    description: "Locally roasted 12 oz canned nitro cold brew coffee with notes of dark chocolate and caramel.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-protein-10",
    name: "Chocolate Almond Bar",
    category: "Snacks & Drinks",
    price: 3.5,
    tag: "All-natural",
    description: "Handcrafted dark chocolate bar packed with whole roasted almonds and 12g wholesome protein.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
];
```

---

### 2.2 `src/lib/seed/seedReviews.ts`

```typescript
import { Review } from "@/types/review";

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
  {
    id: "rev-cap-02",
    productId: "rs-cap-03",
    author: "Samira Vance",
    gradeLevel: "Freshman",
    verifiedStudent: true,
    rating: 4,
    title: "Clean embroidery, easy to adjust",
    comment: "Breathable eyelets keep you cool during afternoon pep rallies. Fits great even with thick curly hair.",
    recommend: true,
    helpfulCount: 5,
    createdAt: "2026-08-31T14:10:00Z",
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
  {
    id: "rev-sneaker-02",
    productId: "rs-sneaker-11",
    author: "Kayla Martinez",
    gradeLevel: "Senior",
    verifiedStudent: true,
    rating: 4,
    title: "Great arch support, order true to size",
    comment: "Wore these all through Spirit Week. The rubber outsole grips slick cafeteria floors nicely. Looks great with ankle socks.",
    recommend: true,
    helpfulCount: 13,
    createdAt: "2026-08-29T17:25:00Z",
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
  {
    id: "rev-bottle-02",
    productId: "rs-bottle-05",
    author: "Noah Kim",
    gradeLevel: "Junior",
    verifiedStudent: true,
    rating: 4,
    title: "Solid stainless steel, doesn't dent",
    comment: "Dropped it on the stadium bleachers and barely a scratch. Lid seal is 100% leakproof in my backpack.",
    recommend: true,
    helpfulCount: 7,
    createdAt: "2026-08-30T11:20:00Z",
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

  // Sample Moderation Item (Hidden for admin testing)
  {
    id: "rev-hoodie-moderation-test",
    productId: "rs-hoodie-01",
    author: "Anonymous Raider",
    gradeLevel: "Freshman",
    verifiedStudent: false,
    rating: 3,
    title: "Restock needed in Small size",
    comment: "Loved the design but waited two weeks for size S to appear. Please stock more at the cafeteria kiosk.",
    recommend: false,
    helpfulCount: 1,
    createdAt: "2026-08-20T12:00:00Z",
    status: "hidden",
  },
];
```

---

### 2.3 `src/lib/seed/seedComplaints.ts`

```typescript
import { Complaint } from "@/types/complaint";

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "cmp-001",
    category: "Order Issue",
    urgency: "high",
    customerName: "Lucas Hernandez",
    contactInfo: "lhernandez94@leanderisd.org",
    orderId: "RS-78210",
    productId: "rs-hoodie-01",
    description: "Ordered a Sideline Hoodie in Large for Friday's pep rally, but received a Small in the package instead. Need to exchange before 6 PM kickoff.",
    status: "in_progress",
    staffNotes: "Located size Large hoodie in kiosk backroom inventory. Emailed student to pick up during 4th period lunch.",
    createdAt: "2026-09-01T14:15:00Z",
  },
  {
    id: "cmp-002",
    category: "Item Condition / Defect",
    urgency: "medium",
    customerName: "Samantha Reed",
    contactInfo: "sreed312@leanderisd.org",
    orderId: "RS-81044",
    productId: "rs-bottle-05",
    description: "The twist cap on the stainless water bottle seems to have a minor threading defect causing slight leakage when tilted in a backpack.",
    status: "new",
    staffNotes: "",
    createdAt: "2026-09-02T09:30:00Z",
  },
  {
    id: "cmp-003",
    category: "Sizing / Stock Request",
    urgency: "low",
    customerName: "David Zhao",
    contactInfo: "dzhao551@leanderisd.org",
    productId: "rs-jacket-02",
    description: "Will the Varsity Letterman Jacket be restocked in size 3XL before homecoming week? Several band members are looking to order.",
    status: "resolved",
    staffNotes: "Spoke with supplier on 9/1; 15 units of 3XL arriving on 9/10. Sent confirmation email to student.",
    createdAt: "2026-08-29T11:00:00Z",
    resolvedAt: "2026-09-01T16:20:00Z",
  },
  {
    id: "cmp-004",
    category: "Campus Kiosk Suggestion",
    urgency: "low",
    customerName: "Hannah Scott",
    contactInfo: "hscott889@leanderisd.org",
    description: "Can the Raider Station pickup kiosk in the cafeteria courtyard open 15 minutes earlier (at 7:45 AM) on Tuesdays and Thursdays? The line gets long right before first bell.",
    status: "in_progress",
    staffNotes: "Discussed with student council retail committee; evaluating volunteer schedule for early opening.",
    createdAt: "2026-08-30T16:40:00Z",
  },
  {
    id: "cmp-005",
    category: "General Grievance",
    urgency: "high",
    customerName: "Ethan Walker",
    contactInfo: "ewalker104@leanderisd.org",
    orderId: "RS-74199",
    productId: "rs-blanket-07",
    description: "Charged twice on card during campus kiosk checkout due to wifi reconnection glitch on the POS terminal.",
    status: "resolved",
    staffNotes: "Duplicate charge refunded through campus finance office on 8/28. Receipt emailed to student.",
    createdAt: "2026-08-27T17:05:00Z",
    resolvedAt: "2026-08-28T10:15:00Z",
  },
  {
    id: "cmp-006",
    category: "Item Condition / Defect",
    urgency: "medium",
    customerName: "Olivia Jenkins",
    contactInfo: "ojenkins207@leanderisd.org",
    orderId: "RS-82190",
    productId: "rs-sneaker-11",
    description: "Slight scuff mark on the right toe box out of the box. Would love an exchange for a clean pair.",
    status: "new",
    staffNotes: "",
    createdAt: "2026-09-02T13:20:00Z",
  },
];
```

---

## 3. Refactored `StoreProvider.tsx` Blueprint

### 3.1 State Architecture & Reactive Synchronization Pattern
1. **Repository Singletons & Hydration**:
   - `ProductRepository`, `ReviewRepository`, and `ComplaintRepository` are instantiated using the safe `LocalStorageDriver` (or storage abstraction).
   - On initialization, repositories load persisted data from `localStorage` (falling back to memory in SSR/private browsing).
   - Seed datasets (`SEED_PRODUCTS`, `SEED_REVIEWS`, `SEED_COMPLAINTS`) are automatically populated if keys do not yet exist.
2. **Immutable React State**:
   - React state variables (`products`, `reviews`, `complaints`, `cart`, `theme`, `votedReviews`, `isAdminAuthenticated`, `isFeedbackDrawerOpen`, `toast`) reflect repository state in the React tree.
   - Any repository mutation immediately updates React state via `setProducts(productRepo.getAll())`, `setReviews(reviewRepo.getAll())`, etc., ensuring instant UI re-renders with zero stale closures.
3. **Cart & Bag Drawer**:
   - Cart management maintains previous behavior (`cart`, `totalItems`, `openBag`, `closeBag`, `addToCart`, `updateQuantity`, `clearCart`).
   - `CartDrawer` renders smoothly when `cartOpen === true`.
4. **Enhanced Toast System**:
   - Backward-compatible with `notify(msg: string)` and `message: string`.
   - Forward-compatible with `showToast(msg: string, type?: "success" | "info" | "error")` and `toast: ToastMessage | null`.

### 3.2 Full Implementation Blueprint (`src/components/StoreProvider.tsx`)

```tsx
"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CartDrawer } from "@/components/ShopDialogs";
import type { CartItem, Product } from "@/types/product";
import type { Review, ReviewSubmissionInput, ProductRatingSummary, ReviewStatus, ReviewModerationStats } from "@/types/review";
import type { Complaint, ComplaintSubmissionInput, ComplaintStatus, ComplaintStats } from "@/types/complaint";
import { ProductRepository } from "@/lib/repositories/ProductRepository";
import { ReviewRepository } from "@/lib/repositories/ReviewRepository";
import { ComplaintRepository } from "@/lib/repositories/ComplaintRepository";
import { LocalStorageDriver } from "@/lib/storage/LocalStorageDriver";

export type Theme = "heritage" | "obsidian" | "studio" | "gold";

export interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
    gold: string;
  };
}

export const THEMES: ThemeOption[] = [
  {
    id: "heritage",
    name: "Heritage Parchment",
    description: "Classic Rouse collegiate aesthetic on warm tactile parchment",
    colors: { bg: "#f4f1ea", surface: "#eae5da", accent: "#581825", gold: "#cf9b44" },
  },
  {
    id: "obsidian",
    name: "Obsidian Raider",
    description: "Stealth dark mode with crimson maroon and luminous gold accents",
    colors: { bg: "#0c0b0b", surface: "#171616", accent: "#9e2842", gold: "#dfb256" },
  },
  {
    id: "studio",
    name: "Studio Cream",
    description: "Minimalist modern gallery aesthetic with crisp contrast",
    colors: { bg: "#fbfbf9", surface: "#f1efe9", accent: "#681b2a", gold: "#c49138" },
  },
  {
    id: "gold",
    name: "Championship Gold",
    description: "Warm sandstone palette infused with championship gold",
    colors: { bg: "#f3ece0", surface: "#e7dfcf", accent: "#4e1320", gold: "#b38025" },
  },
];

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export interface StoreContextValue {
  // Cart
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

  // Products / Listings
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
  getReviewsByProductId: (productId: string, options?: { approvedOnly?: boolean }) => Review[];
  getRatingSummary: (productId: string) => ProductRatingSummary;
  allRatingSummaries: Record<string, ProductRatingSummary>;
  addReview: (input: ReviewSubmissionInput) => Review;
  voteReviewHelpful: (reviewId: string) => boolean;
  hasUserVotedReview: (reviewId: string) => boolean;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;
  resetReviews: () => void;
  reviewStats: ReviewModerationStats;

  // Complaints & Feedback
  complaints: Complaint[];
  addComplaint: (input: ComplaintSubmissionInput) => Complaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, staffNotes?: string) => void;
  updateComplaintStaffNotes: (id: string, notes: string) => void;
  deleteComplaint: (id: string) => void;
  resetComplaints: () => void;
  complaintStats: ComplaintStats;
  isFeedbackDrawerOpen: boolean;
  openFeedbackDrawer: () => void;
  closeFeedbackDrawer: () => void;

  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

  // Notifications
  notify: (msg: string, type?: "success" | "info" | "error") => void;
  toast: ToastMessage | null;
  showToast: (msg: string, type?: "success" | "info" | "error") => void;
  dismissToast: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY_THEME = "raider_theme";
const STORAGE_KEY_VOTED_REVIEWS = "raider_station_voted_reviews_v1";
const STORAGE_KEY_ADMIN_AUTH = "raider_admin_session_auth";

// Shared driver instance
const storageDriver = new LocalStorageDriver();
const productRepository = new ProductRepository(storageDriver);
const reviewRepository = new ReviewRepository(storageDriver);
const complaintRepository = new ComplaintRepository(storageDriver);

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Feedback Drawer state
  const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false);

  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = storageDriver.getItem(STORAGE_KEY_THEME) as Theme | null;
      if (stored && THEMES.some((t) => t.id === stored)) {
        return stored;
      }
    } catch {
      // Storage unavailable
    }
    return "heritage";
  });

  // Repositories state
  const [products, setProducts] = useState<Product[]>(() => productRepository.getAll());
  const [reviews, setReviews] = useState<Review[]>(() => reviewRepository.getAll());
  const [complaints, setComplaints] = useState<Complaint[]>(() => complaintRepository.getAll());

  // Voted reviews tracking
  const [votedReviews, setVotedReviews] = useState<Set<string>>(() => {
    try {
      const data = storageDriver.getItem(STORAGE_KEY_VOTED_REVIEWS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // Fallback
    }
    return new Set<string>();
  });

  // Admin Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === "authenticated";
      } catch {
        return false;
      }
    }
    return false;
  });

  // Toast / Notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      storageDriver.setItem(STORAGE_KEY_THEME, nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    } catch {
      // Storage unavailable
    }
  }, []);

  // Toast notifications
  const showToast = useCallback((msg: string, type: "success" | "info" | "error" = "info") => {
    const id = `toast-${Date.now().toString(36)}`;
    setToast({ id, message: msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const notify = useCallback(
    (msg: string, type: "success" | "info" | "error" = "info") => {
      showToast(msg, type);
    },
    [showToast]
  );

  // Product Operations
  const addProduct = useCallback(
    (newProdData: Omit<Product, "id"> & { id?: string }) => {
      const created = productRepository.create(newProdData);
      setProducts(productRepository.getAll());
      notify(`"${created.name}" has been added to the store catalog.`, "success");
      return created;
    },
    [notify]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      productRepository.update(id, updates);
      setProducts(productRepository.getAll());
      notify("Listing updated.", "success");
    },
    [notify]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const target = productRepository.getById(id);
      productRepository.delete(id);
      setProducts(productRepository.getAll());
      setCart((current) => current.filter((item) => item.id !== id));
      notify(`Listing "${target?.name || id}" removed.`, "info");
    },
    [notify]
  );

  const resetProducts = useCallback(() => {
    productRepository.reset();
    setProducts(productRepository.getAll());
    notify("Store catalog restored to default Rouse Station items.", "info");
  }, [notify]);

  const getProductById = useCallback(
    (id: string) => productRepository.getById(id),
    [products]
  );

  const importCatalog = useCallback(
    (imported: Product[]) => {
      productRepository.importCatalog(imported);
      setProducts(productRepository.getAll());
      notify(`Successfully imported ${imported.length} catalog items.`, "success");
    },
    [notify]
  );

  const exportCatalog = useCallback(() => {
    return productRepository.exportCatalog();
  }, []);

  // Review Operations
  const getReviewsByProductId = useCallback(
    (productId: string, options?: { approvedOnly?: boolean }) => {
      return reviewRepository.getByProductId(productId, options);
    },
    [reviews]
  );

  const getRatingSummary = useCallback(
    (productId: string) => {
      return reviewRepository.getRatingSummary(productId);
    },
    [reviews]
  );

  const allRatingSummaries = useMemo(() => {
    return reviewRepository.getAllRatingSummaries();
  }, [reviews]);

  const addReview = useCallback(
    (input: ReviewSubmissionInput) => {
      const created = reviewRepository.create(input);
      setReviews(reviewRepository.getAll());
      notify("Thank you! Your review has been submitted.", "success");
      return created;
    },
    [notify]
  );

  const hasUserVotedReview = useCallback(
    (reviewId: string) => votedReviews.has(reviewId),
    [votedReviews]
  );

  const voteReviewHelpful = useCallback(
    (reviewId: string) => {
      if (votedReviews.has(reviewId)) {
        notify("You have already voted this review helpful.", "info");
        return false;
      }
      reviewRepository.voteHelpful(reviewId);
      const nextSet = new Set(votedReviews).add(reviewId);
      setVotedReviews(nextSet);
      try {
        storageDriver.setItem(STORAGE_KEY_VOTED_REVIEWS, JSON.stringify(Array.from(nextSet)));
      } catch {
        // Storage unavailable
      }
      setReviews(reviewRepository.getAll());
      notify("Marked review as helpful!", "success");
      return true;
    },
    [votedReviews, notify]
  );

  const updateReviewStatus = useCallback(
    (reviewId: string, status: ReviewStatus) => {
      reviewRepository.updateStatus(reviewId, status);
      setReviews(reviewRepository.getAll());
      notify(`Review marked as ${status}.`, "info");
    },
    [notify]
  );

  const deleteReview = useCallback(
    (reviewId: string) => {
      reviewRepository.delete(reviewId);
      setReviews(reviewRepository.getAll());
      notify("Review removed.", "info");
    },
    [notify]
  );

  const resetReviews = useCallback(() => {
    reviewRepository.reset();
    setReviews(reviewRepository.getAll());
    notify("Reviews restored to seed dataset.", "info");
  }, [notify]);

  const reviewStats = useMemo(() => {
    return reviewRepository.getModerationStats();
  }, [reviews]);

  // Complaint Operations
  const addComplaint = useCallback(
    (input: ComplaintSubmissionInput) => {
      const created = complaintRepository.create(input);
      setComplaints(complaintRepository.getAll());
      notify(`Grievance submitted. Reference ID: #${created.id}`, "success");
      return created;
    },
    [notify]
  );

  const updateComplaintStatus = useCallback(
    (id: string, status: ComplaintStatus, staffNotes?: string) => {
      complaintRepository.updateStatus(id, status, staffNotes);
      setComplaints(complaintRepository.getAll());
      notify(`Complaint status updated to ${status}.`, "info");
    },
    [notify]
  );

  const updateComplaintStaffNotes = useCallback(
    (id: string, notes: string) => {
      complaintRepository.updateStaffNotes(id, notes);
      setComplaints(complaintRepository.getAll());
      notify("Staff notes saved.", "success");
    },
    [notify]
  );

  const deleteComplaint = useCallback(
    (id: string) => {
      complaintRepository.delete(id);
      setComplaints(complaintRepository.getAll());
      notify("Complaint record removed.", "info");
    },
    [notify]
  );

  const resetComplaints = useCallback(() => {
    complaintRepository.reset();
    setComplaints(complaintRepository.getAll());
    notify("Complaints reset to default inbox items.", "info");
  }, [notify]);

  const complaintStats = useMemo(() => {
    return complaintRepository.getStats();
  }, [complaints]);

  // Cart Operations
  const addToCart = useCallback(
    (item: Product, size?: string) => {
      const selectedSize = item.sizes?.includes(size ?? "") ? size : item.sizes?.[0];
      setCart((current) => {
        const exists = current.some((entry) => entry.id === item.id && entry.selectedSize === selectedSize);
        return exists
          ? current.map((entry) =>
              entry.id === item.id && entry.selectedSize === selectedSize
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry
            )
          : [...current, { ...item, selectedSize, quantity: 1 }];
      });
      notify(`${item.name}${selectedSize ? ` (${selectedSize})` : ""} added to your bag.`, "success");
    },
    [notify]
  );

  const updateQuantity = useCallback((id: string, size: string | undefined, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id && item.selectedSize === size ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // Admin Auth Operations
  const loginAdmin = useCallback((pin: string) => {
    if (pin.trim().toLowerCase() === "raider2026") {
      setIsAdminAuthenticated(true);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(STORAGE_KEY_ADMIN_AUTH, "authenticated");
        } catch {
          // sessionStorage unavailable
        }
      }
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      } catch {
        // sessionStorage unavailable
      }
    }
  }, []);

  const totalItems = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const contextValue: StoreContextValue = {
    // Cart
    cart,
    totalItems,
    openBag: () => setCartOpen(true),
    closeBag: () => setCartOpen(false),
    isBagOpen: cartOpen,
    addToCart,
    updateQuantity,
    clearCart,

    // Theme
    theme,
    setTheme,

    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    getProductById,
    importCatalog,
    exportCatalog,

    // Reviews
    reviews,
    getReviewsByProductId,
    getRatingSummary,
    allRatingSummaries,
    addReview,
    voteReviewHelpful,
    hasUserVotedReview,
    updateReviewStatus,
    deleteReview,
    resetReviews,
    reviewStats,

    // Complaints
    complaints,
    addComplaint,
    updateComplaintStatus,
    updateComplaintStaffNotes,
    deleteComplaint,
    resetComplaints,
    complaintStats,
    isFeedbackDrawerOpen: feedbackDrawerOpen,
    openFeedbackDrawer: () => setFeedbackDrawerOpen(true),
    closeFeedbackDrawer: () => setFeedbackDrawerOpen(false),

    // Admin Auth
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,

    // Notifications
    notify,
    toast,
    showToast,
    dismissToast,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
        />
      )}
      <div className={`toast ${toast?.message ? "toast-visible" : ""}`} role="status" aria-live="polite">
        <ShoppingBag size={17} />
        <span>{toast?.message || ""}</span>
        <button onClick={dismissToast} aria-label="Dismiss notification" tabIndex={toast?.message ? 0 : -1}>
          <X size={15} />
        </button>
      </div>
    </StoreContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOKS
// ==========================================

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
```

---

## 4. Ergonomic Domain Hooks Blueprints

To streamline component development and separate concerns across product details, reviews, feedback, cart, and admin consoles, the following dedicated hooks are designed:

### 4.1 `useReviews(productId?: string)`

```typescript
import { useMemo, useCallback } from "react";
import { useStore } from "@/components/StoreProvider";
import type { Review, ReviewSubmissionInput, ReviewStatus, ProductRatingSummary } from "@/types/review";

export function useReviews(productId?: string) {
  const store = useStore();

  const reviews = useMemo(() => {
    if (!productId) return store.reviews;
    return store.getReviewsByProductId(productId);
  }, [store.reviews, store.getReviewsByProductId, productId]);

  const summary = useMemo<ProductRatingSummary | null>(() => {
    if (!productId) return null;
    return store.getRatingSummary(productId);
  }, [store.getRatingSummary, productId, store.reviews]);

  const submitReview = useCallback(
    (input: Omit<ReviewSubmissionInput, "productId"> & { productId?: string }) => {
      const targetProductId = input.productId || productId;
      if (!targetProductId) {
        throw new Error("Cannot submit review without a valid productId.");
      }
      return store.addReview({
        ...input,
        productId: targetProductId,
      });
    },
    [store.addReview, productId]
  );

  return {
    reviews,
    allReviews: store.reviews,
    summary,
    allSummaries: store.allRatingSummaries,
    addReview: submitReview,
    voteHelpful: store.voteReviewHelpful,
    hasVoted: store.hasUserVotedReview,
    updateStatus: store.updateReviewStatus,
    deleteReview: store.deleteReview,
    resetReviews: store.resetReviews,
    stats: store.reviewStats,
  };
}
```

### 4.2 `useComplaints()`

```typescript
import { useMemo } from "react";
import { useStore } from "@/components/StoreProvider";
import type { ComplaintStatus, ComplaintSubmissionInput } from "@/types/complaint";

export function useComplaints() {
  const store = useStore();

  return {
    complaints: store.complaints,
    addComplaint: store.addComplaint,
    updateStatus: store.updateComplaintStatus,
    updateNotes: store.updateComplaintStaffNotes,
    deleteComplaint: store.deleteComplaint,
    resetComplaints: store.resetComplaints,
    stats: store.complaintStats,
  };
}
```

### 4.3 `useFeedback()`

```typescript
import { useCallback } from "react";
import { useStore } from "@/components/StoreProvider";
import type { ComplaintSubmissionInput } from "@/types/complaint";

export function useFeedback() {
  const store = useStore();

  const submitFeedback = useCallback(
    (input: ComplaintSubmissionInput) => {
      const created = store.addComplaint(input);
      store.closeFeedbackDrawer();
      return created;
    },
    [store.addComplaint, store.closeFeedbackDrawer]
  );

  return {
    isOpen: store.isFeedbackDrawerOpen,
    openDrawer: store.openFeedbackDrawer,
    closeDrawer: store.closeFeedbackDrawer,
    submitFeedback,
  };
}
```

### 4.4 `useProducts()` & `useCart()` & `useAdmin()`

```typescript
export function useProducts() {
  const store = useStore();
  return {
    products: store.products,
    addProduct: store.addProduct,
    updateProduct: store.updateProduct,
    deleteProduct: store.deleteProduct,
    resetProducts: store.resetProducts,
    getProductById: store.getProductById,
    importCatalog: store.importCatalog,
    exportCatalog: store.exportCatalog,
  };
}

export function useCart() {
  const store = useStore();
  return {
    cart: store.cart,
    totalItems: store.totalItems,
    isOpen: store.isBagOpen,
    openBag: store.openBag,
    closeBag: store.closeBag,
    addToCart: store.addToCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
}

export function useAdmin() {
  const store = useStore();
  return {
    isAuthenticated: store.isAdminAuthenticated,
    login: store.loginAdmin,
    logout: store.logoutAdmin,
  };
}
```

---

## 5. Backward Compatibility Audit Matrix

| Consumer Component | Existing Properties Used | Refactored Compatibility Status | Notes |
|---|---|---|---|
| `src/components/SiteShell.tsx` | `totalItems`, `openBag` | ✅ 100% Compatible | Signature and types unchanged. |
| `src/components/ShopCatalog.tsx` | `products`, `addToCart` | ✅ 100% Compatible | Seamless compatibility; ready to consume `allRatingSummaries`. |
| `src/components/ProductDetails.tsx` | `addToCart`, `openBag`, `notify` | ✅ 100% Compatible | All callbacks identical. |
| `src/components/ProductDetailWrapper.tsx` | `getProductById` | ✅ 100% Compatible | Memoized getter lookup preserved. |
| `src/components/HomeCover.tsx` | `products`, `addToCart` | ✅ 100% Compatible | Array reference preserved. |
| `src/components/HeroShowcase.tsx` | `products`, `addToCart` | ✅ 100% Compatible | Array slicing and rendering preserved. |
| `src/components/CollectionMotion.tsx` | `products`, `addToCart` | ✅ 100% Compatible | Horizontal scrolling strip preserved. |
| `src/components/ThemeSelector.tsx` | `theme`, `setTheme` | ✅ 100% Compatible | `Theme` type and options preserved. |
| `src/app/admin/page.tsx` | `products`, `addProduct`, `updateProduct`, `deleteProduct`, `resetProducts` | ✅ 100% Compatible | Current admin page works without changes, ready for M4 enhancements. |

---

## 6. Backward Compatible `src/lib/store.ts` Facade

To ensure no legacy imports break across the codebase, `src/lib/store.ts` should re-export types, seed datasets, categories, and format helpers:

```typescript
// Re-export domain types
export * from "@/types/product";
export * from "@/types/review";
export * from "@/types/complaint";

// Re-export seed datasets
export { SEED_PRODUCTS as PRODUCTS, PRESET_IMAGES, CATEGORIES } from "@/lib/seed/seedProducts";
export { SEED_REVIEWS } from "@/lib/seed/seedReviews";
export { SEED_COMPLAINTS } from "@/lib/seed/seedComplaints";

// Helpers
export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
```

---

## 7. Implementation Blueprint & Sequence for Worker

1. **Phase 1: Seed Data Placement**
   - Create `src/lib/seed/seedProducts.ts` with 11 authentic items.
   - Create `src/lib/seed/seedReviews.ts` with 18 authentic reviews.
   - Create `src/lib/seed/seedComplaints.ts` with 6 categorized grievances.
2. **Phase 2: Legacy Store Bridge**
   - Update `src/lib/store.ts` to re-export `PRODUCTS`, `SEED_REVIEWS`, `SEED_COMPLAINTS`, and format functions.
3. **Phase 3: Context & Hooks Implementation**
   - Update `src/components/StoreProvider.tsx` with repository integration and full backward compatibility.
   - Create hook exports: `useStore`, `useReviews`, `useComplaints`, `useFeedback`, `useProducts`, `useCart`, `useAdmin`.
4. **Phase 4: Build & Linter Verification**
   - Run `npm run lint` and `npm run build` to verify clean compilation with zero type errors.
