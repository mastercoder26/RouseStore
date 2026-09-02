# Milestone 1 Analysis: Domain Models, Repositories & Rating Math

## Executive Summary
This document provides the complete architectural specification and production-ready implementation blueprints for the **Domain Models & Repositories Layer** of Raider Station (Milestone 1, Requirement R5). It defines the four domain type modules (`product.ts`, `review.ts`, `complaint.ts`, `admin.ts`), the typed repository contracts and classes (`ProductRepository`, `ReviewRepository`, `ComplaintRepository`), and the exact mathematical formulation for review aggregation metrics (average rating, distribution breakdown, recommendation rate).

---

## 1. Domain Type Definitions

### 1.1 Product & Cart Domain (`src/types/product.ts`)
Defines the core catalog items, categories, cart entities, and product mutation payloads.

```typescript
/**
 * src/types/product.ts
 * Domain models for Raider Station catalog products and customer cart.
 */

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
  createdAt?: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface PresetImage {
  label: string;
  src: string;
}

export interface CreateProductInput {
  id?: string;
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

export interface UpdateProductInput extends Partial<Omit<Product, "id">> {}

export interface ProductFilterOptions {
  category?: string | "All items";
  stockStatus?: "all" | "inStock" | "soldOut";
  query?: string;
  sortBy?: "default" | "priceAsc" | "priceDesc" | "name";
}
```

---

### 1.2 Review & Rating Domain (`src/types/review.ts`)
Defines customer reviews, verified student tags, rating breakdowns, helpful votes, and summary aggregations.

```typescript
/**
 * src/types/review.ts
 * Domain models for 5-star student reviews, distribution bars, and rating summaries.
 */

export type ReviewStatus = "approved" | "hidden";

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorGrade?: string; // e.g., "Senior · Class of '26", "Junior", "Sophomore", "Freshman", "Staff"
  isVerifiedStudent: boolean;
  rating: number; // 1 to 5 integer
  title: string;
  comment: string;
  recommend: boolean;
  helpfulCount: number;
  status: ReviewStatus; // Default: "approved"
  createdAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
}

export interface StarDistributionItem {
  count: number;
  percentage: number; // Integer between 0 and 100
}

export type StarDistribution = {
  5: StarDistributionItem;
  4: StarDistributionItem;
  3: StarDistributionItem;
  2: StarDistributionItem;
  1: StarDistributionItem;
};

export interface ProductRatingSummary {
  productId: string;
  averageRating: number; // 0.0 to 5.0, rounded to 1 decimal place (e.g., 4.8; 0 if 0 reviews)
  totalReviews: number; // Total count of approved reviews
  recommendPercentage: number; // 0 to 100 rounded integer percentage (e.g., 95)
  distribution: StarDistribution;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewInput {
  productId: string;
  authorName: string;
  authorGrade?: string;
  isVerifiedStudent?: boolean;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  recommend?: boolean;
  status?: ReviewStatus;
}

export interface ReviewFilterOptions {
  status?: ReviewStatus | "all";
  minRating?: number;
  rating?: number | "all";
  searchQuery?: string;
  sortBy?: "newest" | "highest" | "lowest" | "helpful";
}
```

---

### 1.3 Complaint & Feedback Domain (`src/types/complaint.ts`)
Defines structured student complaints, category topics, urgency levels, status lifecycle, and administrative notes.

```typescript
/**
 * src/types/complaint.ts
 * Domain models for customer complaints, feedback drawer submissions, and admin moderation inbox.
 */

export type ComplaintCategory =
  | "Order Issue"
  | "Item Condition / Defect"
  | "Sizing / Stock Request"
  | "General Grievance"
  | string;

export type ComplaintUrgency = "low" | "medium" | "high" | "urgent";

export type ComplaintStatus = "new" | "in_progress" | "resolved";

export interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  studentId?: string; // Optional Rouse student ID (e.g. "RHS-10492")
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  description: string;
  status: ComplaintStatus;
  staffNotes?: string;
  productId?: string; // Optional related product ID
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

export interface CreateComplaintInput {
  customerName: string;
  customerEmail: string;
  studentId?: string;
  category: ComplaintCategory;
  urgency?: ComplaintUrgency; // Defaults to "medium"
  description: string;
  productId?: string;
}

export interface ComplaintFilterOptions {
  status?: ComplaintStatus | "all";
  category?: ComplaintCategory | "all";
  urgency?: ComplaintUrgency | "all";
  searchQuery?: string;
  sortBy?: "newest" | "oldest" | "urgency";
}
```

---

### 1.4 Admin Management Domain (`src/types/admin.ts`)
Defines administrative tab navigation, PIN gate session model, moderation filters, and dashboard aggregate metrics.

```typescript
/**
 * src/types/admin.ts
 * Domain models for discreet admin portal, PIN authentication, and moderation console.
 */

export type AdminTab = "catalog" | "reviews" | "complaints";

export interface AdminSession {
  isAuthenticated: boolean;
  authenticatedAt?: string;
  expiresAt?: string;
}

export interface AdminCatalogMetrics {
  totalListings: number;
  inStockCount: number;
  soldOutCount: number;
  averagePrice: number;
  saleCount: number;
}

export interface AdminReviewsMetrics {
  totalReviews: number;
  approvedReviews: number;
  hiddenReviews: number;
  averageRating: number;
  totalHelpfulVotes: number;
}

export interface AdminComplaintsMetrics {
  totalComplaints: number;
  newComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  urgentComplaints: number;
}

export interface AdminOverviewMetrics {
  catalog: AdminCatalogMetrics;
  reviews: AdminReviewsMetrics;
  complaints: AdminComplaintsMetrics;
}

export interface AdminPinVerificationResult {
  success: boolean;
  error?: string;
}
```

---

## 2. Review Rating Mathematical Specification & Helper

### 2.1 Mathematical Formulas

Given a list of approved reviews $R = [r_1, r_2, \dots, r_n]$ for a specific product:

1. **Total Count ($n$):**
   $$n = |R|$$

2. **Average Rating ($\bar{R}$):**
   - If $n = 0$, $\bar{R} = 0.0$.
   - If $n > 0$:
     $$\bar{R}_{\text{raw}} = \frac{1}{n} \sum_{i=1}^n \min(5, \max(1, r_i.\text{rating}))$$
     $$\bar{R} = \frac{\text{Math.round}(\bar{R}_{\text{raw}} \times 10)}{10}$$
     *Output constraint:* Single decimal precision (e.g., `4.8`, `5.0`, `3.3`).

3. **Recommendation Percentage ($P_{\text{rec}}$):**
   - If $n = 0$, $P_{\text{rec}} = 0$.
   - If $n > 0$:
     $$C_{\text{rec}} = \sum_{i=1}^n \mathbb{I}(r_i.\text{recommend} == \text{true})$$
     $$P_{\text{rec}} = \min\left(100, \max\left(0, \text{Math.round}\left(\frac{C_{\text{rec}}}{n} \times 100\right)\right)\right)$$
     *Output constraint:* Integer between `0` and `100`.

4. **5-to-1 Star Distribution ($D_k$ for $k \in \{5, 4, 3, 2, 1\}$):**
   - For each star tier $k$:
     $$C_k = \sum_{i=1}^n \mathbb{I}(\text{Math.round}(r_i.\text{rating}) == k)$$
     $$P_k = \begin{cases} 0 & \text{if } n = 0 \\ \min\left(100, \max\left(0, \text{Math.round}\left(\frac{C_k}{n} \times 100\right)\right)\right) & \text{if } n > 0 \end{cases}$$
     $$D_k = \{ \text{count}: C_k, \text{percentage}: P_k \}$$

---

### 2.2 Rating Math Helper Implementation
This pure utility function can be used in `ReviewRepository` as well as directly in unit tests and component transforms.

```typescript
/**
 * Pure calculation helper for review rating summaries.
 */
export function calculateRatingSummary(
  reviews: Review[],
  productId: string = ""
): ProductRatingSummary {
  // Only include approved reviews in public metrics
  const activeReviews = reviews.filter((r) => r.status !== "hidden");
  const totalReviews = activeReviews.length;

  const emptyDistribution: StarDistribution = {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews === 0) {
    return {
      productId,
      averageRating: 0,
      totalReviews: 0,
      recommendPercentage: 0,
      distribution: emptyDistribution,
      ratingCounts,
    };
  }

  let ratingSum = 0;
  let recommendCount = 0;

  for (const review of activeReviews) {
    // Clamp rating between 1 and 5
    const clampedRating = Math.min(5, Math.max(1, Math.round(review.rating || 5)));
    ratingSum += clampedRating;

    if (clampedRating in ratingCounts) {
      ratingCounts[clampedRating as 1 | 2 | 3 | 4 | 5]++;
    }

    if (review.recommend) {
      recommendCount++;
    }
  }

  // Calculate average rounded to 1 decimal place
  const rawAverage = ratingSum / totalReviews;
  const averageRating = Math.round(rawAverage * 10) / 10;

  // Calculate recommend percentage rounded to nearest integer
  const recommendPercentage = Math.round((recommendCount / totalReviews) * 100);

  // Calculate distribution breakdown
  const distribution: StarDistribution = {
    5: {
      count: ratingCounts[5],
      percentage: Math.round((ratingCounts[5] / totalReviews) * 100),
    },
    4: {
      count: ratingCounts[4],
      percentage: Math.round((ratingCounts[4] / totalReviews) * 100),
    },
    3: {
      count: ratingCounts[3],
      percentage: Math.round((ratingCounts[3] / totalReviews) * 100),
    },
    2: {
      count: ratingCounts[2],
      percentage: Math.round((ratingCounts[2] / totalReviews) * 100),
    },
    1: {
      count: ratingCounts[1],
      percentage: Math.round((ratingCounts[1] / totalReviews) * 100),
    },
  };

  return {
    productId,
    averageRating,
    totalReviews,
    recommendPercentage,
    distribution,
    ratingCounts,
  };
}
```

---

## 3. Typed Repository Interfaces & Implementation Blueprints

### 3.1 `IProductRepository` & `ProductRepository`

#### Interface (`src/lib/repositories/IProductRepository.ts`)
```typescript
/**
 * src/lib/repositories/IProductRepository.ts
 * Repository contract for product inventory storage operations.
 */

import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilterOptions,
} from "@/types/product";

export interface IProductRepository {
  getAll(): Product[];
  getById(id: string): Product | undefined;
  save(product: Product): void;
  add(input: CreateProductInput): Product;
  update(id: string, updates: UpdateProductInput): Product | undefined;
  delete(id: string): boolean;
  filter(options: ProductFilterOptions): Product[];
  reset(defaultProducts?: Product[]): void;
}
```

#### Implementation (`src/lib/repositories/ProductRepository.ts`)
```typescript
/**
 * src/lib/repositories/ProductRepository.ts
 * Concrete ProductRepository with storage driver persistence and seed catalog fallback.
 */

import type { IStorageDriver } from "@/lib/storage/IStorageDriver";
import { LocalStorageDriver } from "@/lib/storage/LocalStorageDriver";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilterOptions,
} from "@/types/product";
import type { IProductRepository } from "./IProductRepository";

export const STORAGE_KEY_PRODUCTS = "raider_station_products_v2";

export class ProductRepository implements IProductRepository {
  private driver: IStorageDriver;
  private key: string;
  private initialProducts: Product[];

  constructor(
    driver?: IStorageDriver,
    initialProducts: Product[] = [],
    key: string = STORAGE_KEY_PRODUCTS
  ) {
    this.driver = driver || new LocalStorageDriver();
    this.initialProducts = initialProducts;
    this.key = key;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    const existing = this.driver.getItem<Product[]>(this.key);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      if (this.initialProducts.length > 0) {
        this.driver.setItem(this.key, this.initialProducts);
      }
    }
  }

  public getAll(): Product[] {
    const items = this.driver.getItem<Product[]>(this.key);
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }
    return [...this.initialProducts];
  }

  public getById(id: string): Product | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  public save(product: Product): void {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === product.id);
    let updated: Product[];

    if (index >= 0) {
      updated = [...products];
      updated[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      updated = [product, ...products];
    }

    this.driver.setItem(this.key, updated);
  }

  public add(input: CreateProductInput): Product {
    const id =
      input.id?.trim() ||
      `rs-item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newProduct: Product = {
      ...input,
      id,
      inStock: input.inStock ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.getAll();
    const updated = [newProduct, ...current];
    this.driver.setItem(this.key, updated);
    return newProduct;
  }

  public update(id: string, updates: UpdateProductInput): Product | undefined {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...products];
    updatedList[index] = updatedProduct;
    this.driver.setItem(this.key, updatedList);
    return updatedProduct;
  }

  public delete(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    this.driver.setItem(this.key, filtered);
    return true;
  }

  public filter(options: ProductFilterOptions): Product[] {
    let list = this.getAll();
    const q = options.query?.trim().toLowerCase();

    if (options.category && options.category !== "All items") {
      list = list.filter((p) => p.category === options.category);
    }

    if (options.stockStatus && options.stockStatus !== "all") {
      if (options.stockStatus === "inStock") {
        list = list.filter((p) => p.inStock !== false);
      } else if (options.stockStatus === "soldOut") {
        list = list.filter((p) => p.inStock === false);
      }
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (options.sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (options.sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (options.sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  public reset(defaultProducts?: Product[]): void {
    const listToSet = defaultProducts || this.initialProducts;
    this.driver.setItem(this.key, listToSet);
  }
}
```

---

### 3.2 `IReviewRepository` & `ReviewRepository`

#### Interface (`src/lib/repositories/IReviewRepository.ts`)
```typescript
/**
 * src/lib/repositories/IReviewRepository.ts
 * Repository contract for review submission, helpful voting, and moderation operations.
 */

import type {
  Review,
  CreateReviewInput,
  ProductRatingSummary,
  ReviewStatus,
  ReviewFilterOptions,
} from "@/types/review";

export interface IReviewRepository {
  getAll(includeHidden?: boolean): Review[];
  getByProductId(productId: string, includeHidden?: boolean): Review[];
  getById(reviewId: string): Review | undefined;
  getSummary(productId: string): ProductRatingSummary;
  addReview(input: CreateReviewInput): Review;
  updateStatus(reviewId: string, status: ReviewStatus): boolean;
  voteHelpful(reviewId: string): number;
  deleteReview(reviewId: string): boolean;
  filterReviews(options: ReviewFilterOptions): Review[];
  reset(defaultReviews?: Review[]): void;
}
```

#### Implementation (`src/lib/repositories/ReviewRepository.ts`)
```typescript
/**
 * src/lib/repositories/ReviewRepository.ts
 * Concrete ReviewRepository with rating math calculation and moderation support.
 */

import type { IStorageDriver } from "@/lib/storage/IStorageDriver";
import { LocalStorageDriver } from "@/lib/storage/LocalStorageDriver";
import {
  type Review,
  type CreateReviewInput,
  type ProductRatingSummary,
  type ReviewStatus,
  type ReviewFilterOptions,
} from "@/types/review";
import { calculateRatingSummary } from "@/types/review";
import type { IReviewRepository } from "./IReviewRepository";

export const STORAGE_KEY_REVIEWS = "raider_station_reviews_v1";

export class ReviewRepository implements IReviewRepository {
  private driver: IStorageDriver;
  private key: string;
  private initialReviews: Review[];

  constructor(
    driver?: IStorageDriver,
    initialReviews: Review[] = [],
    key: string = STORAGE_KEY_REVIEWS
  ) {
    this.driver = driver || new LocalStorageDriver();
    this.initialReviews = initialReviews;
    this.key = key;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    const existing = this.driver.getItem<Review[]>(this.key);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      if (this.initialReviews.length > 0) {
        this.driver.setItem(this.key, this.initialReviews);
      }
    }
  }

  public getAll(includeHidden: boolean = false): Review[] {
    const items = this.driver.getItem<Review[]>(this.key);
    const all = Array.isArray(items) && items.length > 0 ? items : [...this.initialReviews];
    return includeHidden ? all : all.filter((r) => r.status !== "hidden");
  }

  public getByProductId(productId: string, includeHidden: boolean = false): Review[] {
    return this.getAll(includeHidden)
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getById(reviewId: string): Review | undefined {
    return this.getAll(true).find((r) => r.id === reviewId);
  }

  public getSummary(productId: string): ProductRatingSummary {
    const productReviews = this.getByProductId(productId, false); // Only approved
    return calculateRatingSummary(productReviews, productId);
  }

  public addReview(input: CreateReviewInput): Review {
    const id = `rev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const clampedRating = Math.min(5, Math.max(1, Math.round(input.rating || 5)));

    const newReview: Review = {
      id,
      productId: input.productId,
      authorName: input.authorName.trim(),
      authorGrade: input.authorGrade?.trim() || "Verified Student",
      isVerifiedStudent: input.isVerifiedStudent ?? true,
      rating: clampedRating,
      title: input.title.trim(),
      comment: input.comment.trim(),
      recommend: input.recommend ?? clampedRating >= 4,
      helpfulCount: 0,
      status: input.status ?? "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.getAll(true);
    const updated = [newReview, ...current];
    this.driver.setItem(this.key, updated);
    return newReview;
  }

  public updateStatus(reviewId: string, status: ReviewStatus): boolean {
    const current = this.getAll(true);
    const index = current.findIndex((r) => r.id === reviewId);
    if (index === -1) return false;

    current[index] = {
      ...current[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.driver.setItem(this.key, current);
    return true;
  }

  public voteHelpful(reviewId: string): number {
    const current = this.getAll(true);
    const index = current.findIndex((r) => r.id === reviewId);
    if (index === -1) return 0;

    const newCount = (current[index].helpfulCount || 0) + 1;
    current[index] = {
      ...current[index],
      helpfulCount: newCount,
      updatedAt: new Date().toISOString(),
    };

    this.driver.setItem(this.key, current);
    return newCount;
  }

  public deleteReview(reviewId: string): boolean {
    const current = this.getAll(true);
    const filtered = current.filter((r) => r.id !== reviewId);
    if (filtered.length === current.length) return false;

    this.driver.setItem(this.key, filtered);
    return true;
  }

  public filterReviews(options: ReviewFilterOptions): Review[] {
    let list = this.getAll(options.status === "all" || options.status === "hidden");

    if (options.status && options.status !== "all") {
      list = list.filter((r) => r.status === options.status);
    }

    if (typeof options.rating === "number") {
      list = list.filter((r) => r.rating === options.rating);
    }

    if (typeof options.minRating === "number") {
      list = list.filter((r) => r.rating >= options.minRating!);
    }

    if (options.searchQuery?.trim()) {
      const q = options.searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.authorName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }

    if (options.sortBy === "highest") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (options.sortBy === "lowest") {
      list = [...list].sort((a, b) => a.rating - b.rating);
    } else if (options.sortBy === "helpful") {
      list = [...list].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }

  public reset(defaultReviews?: Review[]): void {
    const listToSet = defaultReviews || this.initialReviews;
    this.driver.setItem(this.key, listToSet);
  }
}
```

---

### 3.3 `IComplaintRepository` & `ComplaintRepository`

#### Interface (`src/lib/repositories/IComplaintRepository.ts`)
```typescript
/**
 * src/lib/repositories/IComplaintRepository.ts
 * Repository contract for complaints inbox and customer feedback management.
 */

import type {
  Complaint,
  CreateComplaintInput,
  ComplaintStatus,
  ComplaintFilterOptions,
} from "@/types/complaint";

export interface IComplaintRepository {
  getAll(): Complaint[];
  getById(id: string): Complaint | undefined;
  getByStatus(status: ComplaintStatus): Complaint[];
  addComplaint(input: CreateComplaintInput): Complaint;
  updateStatus(id: string, status: ComplaintStatus): boolean;
  updateStaffNotes(id: string, notes: string): boolean;
  deleteComplaint(id: string): boolean;
  filterComplaints(options: ComplaintFilterOptions): Complaint[];
  reset(defaultComplaints?: Complaint[]): void;
}
```

#### Implementation (`src/lib/repositories/ComplaintRepository.ts`)
```typescript
/**
 * src/lib/repositories/ComplaintRepository.ts
 * Concrete ComplaintRepository with category badges, status transitions, and staff notes.
 */

import type { IStorageDriver } from "@/lib/storage/IStorageDriver";
import { LocalStorageDriver } from "@/lib/storage/LocalStorageDriver";
import type {
  Complaint,
  CreateComplaintInput,
  ComplaintStatus,
  ComplaintFilterOptions,
} from "@/types/complaint";
import type { IComplaintRepository } from "./IComplaintRepository";

export const STORAGE_KEY_COMPLAINTS = "raider_station_complaints_v1";

export class ComplaintRepository implements IComplaintRepository {
  private driver: IStorageDriver;
  private key: string;
  private initialComplaints: Complaint[];

  constructor(
    driver?: IStorageDriver,
    initialComplaints: Complaint[] = [],
    key: string = STORAGE_KEY_COMPLAINTS
  ) {
    this.driver = driver || new LocalStorageDriver();
    this.initialComplaints = initialComplaints;
    this.key = key;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    const existing = this.driver.getItem<Complaint[]>(this.key);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      if (this.initialComplaints.length > 0) {
        this.driver.setItem(this.key, this.initialComplaints);
      }
    }
  }

  public getAll(): Complaint[] {
    const items = this.driver.getItem<Complaint[]>(this.key);
    const all = Array.isArray(items) && items.length > 0 ? items : [...this.initialComplaints];
    return [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): Complaint | undefined {
    return this.getAll().find((c) => c.id === id);
  }

  public getByStatus(status: ComplaintStatus): Complaint[] {
    return this.getAll().filter((c) => c.status === status);
  }

  public addComplaint(input: CreateComplaintInput): Complaint {
    const id = `cmp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    const newComplaint: Complaint = {
      id,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      studentId: input.studentId?.trim() || undefined,
      category: input.category,
      urgency: input.urgency || "medium",
      description: input.description.trim(),
      status: "new",
      staffNotes: "",
      productId: input.productId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.getAll();
    const updated = [newComplaint, ...current];
    this.driver.setItem(this.key, updated);
    return newComplaint;
  }

  public updateStatus(id: string, status: ComplaintStatus): boolean {
    const current = this.getAll();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return false;

    current[index] = {
      ...current[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.driver.setItem(this.key, current);
    return true;
  }

  public updateStaffNotes(id: string, notes: string): boolean {
    const current = this.getAll();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return false;

    current[index] = {
      ...current[index],
      staffNotes: notes,
      updatedAt: new Date().toISOString(),
    };

    this.driver.setItem(this.key, current);
    return true;
  }

  public deleteComplaint(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((c) => c.id !== id);
    if (filtered.length === current.length) return false;

    this.driver.setItem(this.key, filtered);
    return true;
  }

  public filterComplaints(options: ComplaintFilterOptions): Complaint[] {
    let list = this.getAll();

    if (options.status && options.status !== "all") {
      list = list.filter((c) => c.status === options.status);
    }

    if (options.category && options.category !== "all") {
      list = list.filter((c) => c.category === options.category);
    }

    if (options.urgency && options.urgency !== "all") {
      list = list.filter((c) => c.urgency === options.urgency);
    }

    if (options.searchQuery?.trim()) {
      const q = options.searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.customerEmail.toLowerCase().includes(q) ||
          (c.studentId && c.studentId.toLowerCase().includes(q)) ||
          c.description.toLowerCase().includes(q) ||
          (c.staffNotes && c.staffNotes.toLowerCase().includes(q))
      );
    }

    if (options.sortBy === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (options.sortBy === "urgency") {
      const urgencyRank: Record<string, number> = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      list = [...list].sort(
        (a, b) => (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0)
      );
    }

    return list;
  }

  public reset(defaultComplaints?: Complaint[]): void {
    const listToSet = defaultComplaints || this.initialComplaints;
    this.driver.setItem(this.key, listToSet);
  }
}
```

---

## 4. Backwards Compatibility & Integration Blueprint

### 4.1 Re-exports in `src/lib/store.ts`
To prevent any breakage for existing imports across the project, `src/lib/store.ts` should re-export all types while retaining its legacy helper functions and arrays:

```typescript
/**
 * src/lib/store.ts
 * Re-exports domain models and legacy store constants for 100% backward compatibility.
 */

export * from "@/types/product";
export * from "@/types/review";
export * from "@/types/complaint";
export * from "@/types/admin";

export { PRESET_IMAGES, PRODUCTS, CATEGORIES, formatPrice } from "@/lib/seed/seedProducts";
```

### 4.2 Storage Driver Interoperability
- All three repositories accept an optional `IStorageDriver` in their constructors:
  ```typescript
  const productRepo = new ProductRepository(storageDriver, seedProducts);
  const reviewRepo = new ReviewRepository(storageDriver, seedReviews);
  const complaintRepo = new ComplaintRepository(storageDriver, seedComplaints);
  ```
- If omitted, repositories default to `new LocalStorageDriver()` which automatically handles SSR environments and private browsing fallback via in-memory storage.

---

## 5. Test Vectors & Unit Verification Matrix

| Test Scenario | Input Data | Expected Output | Formula Verified |
| :--- | :--- | :--- | :--- |
| **Empty reviews** | `[]` | `avg: 0`, `total: 0`, `rec: 0%`, all 5..1 counts: `0`, percentages: `0%` | Zero division guard |
| **Single 5-star review** | `[{ rating: 5, rec: true }]` | `avg: 5.0`, `total: 1`, `rec: 100%`, 5-star: `1 (100%)`, 4..1: `0 (0%)` | Exact boundary match |
| **Mixed reviews (3 reviews)** | Ratings: `[5, 4, 5]`, Rec: `[true, true, false]` | `avg: 4.7` (14/3 = 4.666...), `total: 3`, `rec: 67%` (2/3), 5-star: `2 (67%)`, 4-star: `1 (33%)` | Rounding to 1 decimal & nearest percent |
| **Hidden review moderation** | `[{ rating: 5, status: "approved" }, { rating: 1, status: "hidden" }]` | `avg: 5.0`, `total: 1`, `rec: 100%` | Moderation filter isolation |
| **Helpful vote mutation** | Review with `helpfulCount: 3` -> `voteHelpful(id)` | `helpfulCount: 4`, persisted in driver | In-place immutable counter update |
| **Complaint status change** | Complaint `status: "new"` -> `updateStatus(id, "resolved")` | `status: "resolved"`, `updatedAt` refreshed | Status transition lifecycle |
| **Staff note append** | Complaint with no notes -> `updateStaffNotes(id, "Issued refund")` | `staffNotes: "Issued refund"` | Staff annotation workflow |

---

## 6. Implementation Checklist for Worker

1. [ ] Create `src/types/product.ts` with complete `Product`, `CartItem`, `CreateProductInput`, `UpdateProductInput`, and filter types.
2. [ ] Create `src/types/review.ts` with `Review`, `StarDistribution`, `ProductRatingSummary`, `CreateReviewInput`, and `calculateRatingSummary()` helper.
3. [ ] Create `src/types/complaint.ts` with `Complaint`, `ComplaintCategory`, `ComplaintUrgency`, `ComplaintStatus`, and `CreateComplaintInput`.
4. [ ] Create `src/types/admin.ts` with `AdminTab`, `AdminSession`, and dashboard metrics interfaces.
5. [ ] Create repository contracts: `src/lib/repositories/IProductRepository.ts`, `IReviewRepository.ts`, `IComplaintRepository.ts`.
6. [ ] Create repository implementations: `src/lib/repositories/ProductRepository.ts`, `ReviewRepository.ts`, `ComplaintRepository.ts`.
7. [ ] Ensure `src/lib/store.ts` re-exports all domain types for backward compatibility.
8. [ ] Verify `npm run lint` passes with 0 errors.
