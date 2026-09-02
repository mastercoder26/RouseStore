# Handoff Report — Survey Explorer 2 (Product & State Model Explorer)

**Date**: 2026-09-02  
**Agent ID / Name**: Survey Explorer 2 (`aad03a67-340e-485d-bbae-89e43c12925f`)  
**Recipient**: Parent Orchestrator (`c4e20483-932c-4198-951e-a1eeef046665`)  
**Mission**: Investigate data models, state management, product flow (Home, `/shop`, `/shop/[id]`, `/admin`), and technical specifications for R1 (Product Reviews & Ratings) and R5 (Repository Architecture & Storage Scaffolding).

---

## 1. Observation

1. **Current Product & Store Types (`src/lib/store.ts:1-20`)**:
   - `Product` interface contains: `id: string`, `name: string`, `category: ProductCategory`, `price: number`, `originalPrice?: number`, `tag: string`, `description: string`, `image: string`, `sizes?: string[]`, `inStock?: boolean`.
   - `CartItem` extends `Product` with `quantity: number` and `selectedSize?: string`.
   - Default catalog contains 11 static items (`PRODUCTS: Product[]`, lines 34-156).
   - Image presets contain 10 curated local JPEG files (`PRESET_IMAGES`, lines 21-32).
   - No reviews, ratings, complaints, or moderation types exist anywhere in the codebase.

2. **State Context & Persistence (`src/components/StoreProvider.tsx:49-199`)**:
   - Monolithic `StoreProvider` manages `cart`, `cartOpen`, `theme`, `products`, and `message` (toast).
   - Direct `window.localStorage` calls with keys `raider_station_products_v2` (lines 82, 107, 142) and `raider_theme` (lines 83, 93, 131).
   - Direct inline script in `src/app/layout.tsx:44-48` applies theme attribute from `localStorage.getItem('raider_theme')` to prevent flash.
   - Product mutations (`addProduct`, `updateProduct`, `deleteProduct`, `resetProducts`) directly write to `localStorage` without a repository abstraction.

3. **Product Listing & Detail Pages**:
   - **Home (`src/app/page.tsx` & `src/components/HomeCover.tsx:20-165`)**: Reads `products` from `useStore()`. Highlights 4 items in `HeroShowcase` (`rs-hoodie-01`, `rs-jacket-02`, `rs-cap-03`, `rs-bomber-06`) and 4 items in the Everyday Raiders grid (`rs-hoodie-01`, `rs-jacket-02`, `rs-notebook-04`, `rs-bottle-05`). No rating badges or star counts currently displayed.
   - **Shop Catalog (`src/app/shop/page.tsx` & `src/components/ShopCatalog.tsx:13-258`)**: Reads `products` from `useStore()`. Implements category filtering, dynamic category extraction, text search, size picker pill, and Framer Motion grid. No star rating badges or review counts displayed.
   - **Product Detail (`src/app/shop/[id]/page.tsx` & `src/components/ProductDetails.tsx:70-317`)**: Dynamic route with `generateStaticParams()` on static `PRODUCTS`. `ProductDetails.tsx` renders gallery visual, price, radio-button size selection, and description accordions. Does not include review summaries, 5-to-1 breakdown bars, reviews list, or review submission forms.
   - **Admin Management (`src/app/admin/page.tsx:26-495`)**: Single-view inventory manager for products (search, stock filter, sorting, CRUD modal, inline price edit, export/import JSON, reset). Does not have PIN protection, review moderation, or complaints inbox tabs.

---

## 2. Logic Chain

1. **Decoupling Need (R5)**:
   - *Observation*: Direct calls to `window.localStorage` in `StoreProvider.tsx` tightly couple state to the browser storage API.
   - *Inference*: To support seamless transition to backend databases (PostgreSQL/Supabase/Prisma) while maintaining robust client-side functionality with in-memory fallbacks for SSR/private browsing, a 3-tier architecture is required: `IStorageDriver` → Typed Domain Repositories (`IProductRepository`, `IReviewRepository`, `IComplaintRepository`) → React Context Provider & Custom Hooks (`useStore`, `useReviews`, `useComplaints`).

2. **Product Reviews & 5-Star Rating Architecture (R1)**:
   - *Observation*: Products currently lack rating metadata, but `/shop`, Home, and `/shop/[id]` require average ratings and review counts without layout shift.
   - *Inference*: A dedicated `Review` model with `productId`, `rating` (1-5), `author`, `gradeLevel`, `verifiedStudent`, `title`, `comment`, `recommend`, `helpfulCount`, `createdAt`, and `status` (`approved` | `hidden` | `pending`) must be introduced.
   - *Inference*: An aggregate summary calculator function (`getRatingSummary(productId)`) must compute `averageRating`, `totalReviews`, `recommendPercentage`, and `distribution` (5-1 star counts and percentages).
   - *Inference*: Seed reviews for all 11 default products must be authored with authentic Rouse High School context to provide an editorial visual review section out of the box.

3. **Customer Complaints & Feedback State (R2 & R3)**:
   - *Observation*: The user requested a global slide-over complaints drawer and admin moderation inbox.
   - *Inference*: A `Complaint` entity with `id`, `category` (5 structured topics), `urgency` (low, medium, high), `customerName`, `contactInfo`, `description`, `status` (`new` | `in_progress` | `resolved`), `staffNotes`, and `createdAt` is required.
   - *Inference*: `StoreProvider` must expose `complaints`, `addComplaint()`, `updateComplaintStatus()`, and feedback drawer visibility state.

4. **Discreet Admin Console & Moderation (R3)**:
   - *Observation*: Header nav currently displays "Admin" (`SiteShell.tsx:17`).
   - *Inference*: Remove "Admin" from `SiteShell.tsx` main nav, add discreet "Staff Admin" in footer, protect `/admin` with passcode guard modal (`raider2026`), and split `/admin` into 3 clean management tabs: **Catalog Inventory**, **Reviews Moderation**, and **Complaints Inbox**.

---

## 3. Caveats

1. **Server-Side Static Generation vs. Dynamic LocalStorage**:
   - `app/shop/[id]/page.tsx` uses `generateStaticParams()` based on `PRODUCTS` in `store.ts`. Custom products created via admin in `localStorage` are resolved dynamically client-side by `ProductDetailWrapper.tsx` and `dynamicParams = true`. This is expected for client-side demo persistence.
2. **Helpful Voting Client Tracking**:
   - Client-side helpful voting uses `localStorage["raider_station_voted_reviews_v1"]` to prevent multiple upvotes from the same browser. In a multi-user server environment, this would be tied to user authentication or IP fingerprinting.
3. **No Live External Database**:
   - Per project instructions, an external live database is excluded; typed repository interfaces are designed with clean async-ready contracts for immediate plug-and-play future connection.

---

## 4. Conclusion

1. The data models and state architecture have been fully specified in `survey_state_models.md`.
2. Concrete TypeScript interfaces and repository contracts have been defined for `ProductStore`, `ReviewStore`, `ComplaintStore`, and `StorageDriver`.
3. Complete seed data (14 realistic reviews across all 11 catalog products) has been authored with Rouse High School context.
4. Component blueprints for `StarRating`, `ProductRatingBadge`, `ProductReviewsSection`, `ReviewSubmissionModal`, `FeedbackDrawer`, `AdminPinModal`, `AdminReviewsTable`, and `AdminComplaintsTable` have been fully drafted and aligned with design references.

---

## 5. Verification Method

To independently verify the survey and specifications:
1. **Inspect Survey Report**:
   ```bash
   cat .agents/survey_explorer_2/survey_state_models.md
   ```
2. **Inspect Existing Files Referenced**:
   - `src/lib/store.ts` (Product types and mock data)
   - `src/components/StoreProvider.tsx` (Current context and localStorage keys)
   - `src/components/SiteShell.tsx` (Header navigation with Admin link)
   - `src/app/shop/[id]/page.tsx` (Product detail route structure)
   - `src/components/ProductDetails.tsx` (Product detail layout)
   - `src/app/admin/page.tsx` (Admin inventory console)
3. **Verify Type Checking & Build Integrity**:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
