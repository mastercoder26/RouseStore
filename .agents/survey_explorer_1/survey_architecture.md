# Architecture Survey Report: Rouse High School Storefront (Raider Station)

**Date**: 2026-09-02  
**Explorer**: Survey Explorer 1 (Codebase Architecture Explorer)  
**Target Workspace**: `/Users/akhilkonduru/vsc/RouseStore`  
**Reference Document**: `.agents/ORIGINAL_REQUEST.md`

---

## Executive Summary

The **Raider Station** codebase is a modern, high-performance Next.js 16 (React 19) e-commerce storefront built for Rouse High School in Leander, TX. The project uses the **App Router**, **Framer Motion 13**, **Lenis smooth scrolling**, **Lucide React icons**, and a custom **CSS Variables + CSS Modules** design system featuring four switchable thematic colorways (`heritage`, `obsidian`, `studio`, `gold`). 

Both `npm run lint` and `npm run build` currently pass cleanly with **zero errors and zero warnings**, statically prerendering 18 routes across the catalog.

---

## 1. Environment, Framework, and Configuration

### 1.1 Core Toolchain & Versions (`package.json`)
| Package / Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.3.4` (App Router + Turbopack) | Core web framework, SSG route generation |
| **React / React-DOM** | `19.2.8` | UI library (React 19 async param conventions) |
| **Framer Motion** | `^13.2.0` | Motion graphics, layout animations, gestures |
| **Lenis** | `^1.3.26` | Smooth momentum scrolling |
| **Lucide React** | `^1.39.0` | SVG iconography |
| **clsx** | `^2.1.1` | ClassName concatenation utility |
| **TypeScript** | `^5` | Strict mode typing (`target: ES2017`, `moduleResolution: bundler`) |
| **ESLint** | `^9` with `eslint-config-next: 16.3.4` | Flat ESLint config (`eslint.config.mjs`) |

### 1.2 TypeScript Configuration (`tsconfig.json`)
- Path alias: `@/*` mapped to `./src/*`.
- Strict mode: `strict: true`, `noEmit: true`, `isolatedModules: true`.
- Next.js TypeScript plugin configured.

### 1.3 Next.js & AGENTS.md Rules
- Next.js 16 breaking change conventions are observed: route params in dynamic pages (`src/app/shop/[id]/page.tsx`) are typed as `Promise<{ id: string }>` and resolved with `await params`.
- Turbopack root configuration is active.

### 1.4 Styling System & Theming
- **Pure CSS + CSS Modules**: No Tailwind CSS is installed in the project.
- **Theme Palettes** (`src/app/globals.css`):
  1. `heritage` (default): Warm collegiate parchment palette (`--paper: #f4f1ea`, `--maroon: #581825`, `--gold: #cf9b44`).
  2. `obsidian`: Dark stealth palette (`--paper: #0c0b0b`, `--maroon: #9e2842`, `--gold: #dfb256`).
  3. `studio`: Modern gallery cream palette (`--paper: #fbfbf9`, `--maroon: #681b2a`, `--gold: #c49138`).
  4. `gold`: Championship warm sandstone palette (`--paper: #f3ece0`, `--maroon: #4e1320`, `--gold: #b38025`).
- Stored in `localStorage.getItem('raider_theme')` and applied synchronously in `<head>` via inline script to prevent theme flashing on first paint.
- Typography: Loaded via `next/font/google`:
  - `DM_Sans` (`--font-body` / `var(--font-sans)`)
  - `Instrument_Serif` (`--font-heading` / `var(--font-display)`)

---

## 2. Route Map & Page Architectures

```
src/app/
├── layout.tsx         -> Global Root Layout (Fonts, Head theme script, StoreProvider, SmoothScroll, SiteShell)
├── template.tsx       -> Page enter fade wrapper (.page-enter)
├── globals.css        -> Global CSS tokens, theme palettes, typography, media queries
├── page.tsx           -> Route: / (Home page -> <HomeCover />)
├── page.module.css    -> Default CSS module (legacy/scaffold)
├── favicon.ico        -> Rouse school crest favicon
├── school/
│   └── page.tsx       -> Route: /school (permanentRedirect -> /shop)
├── shop/
│   ├── page.tsx       -> Route: /shop (Catalog page -> <ShopCatalog />)
│   └── [id]/
│       └── page.tsx   -> Route: /shop/[id] (SSG Product Detail -> <ProductDetailWrapper />)
└── admin/
    ├── page.tsx       -> Route: /admin (Inventory & Catalog Operations Manager)
    └── admin.module.css -> Admin console styling
```

### Detailed Route Breakdown:
1. **`/` (Home)** — `src/app/page.tsx`:
   - Renders `<HomeCover />`.
   - Displays editorial typography hero ("FOR THE SCHOOL DAY.") with `LetterReveal`.
   - Interactive hero carousel (`<HeroShowcase />`) with fine pointer tracking and autoplay.
   - Infinite smooth ticker (`<RaiderMarquee />`).
   - Curated 4-item campus drop grid with quick-add/select-size links.
   - Sticky horizontal scroll rail (`<CollectionMotion />`).
   - Campus Kiosk & Operations details (Room 1104, hours, pickup instructions).

2. **`/shop` (Catalog)** — `src/app/shop/page.tsx`:
   - Renders `<ShopCatalog />`.
   - Client-driven dynamic category selector pills (`All items`, `Spirit Wear`, `School Supplies`, `Snacks & Drinks`, `Accessories`, etc.).
   - Instant search input with filter counts.
   - Animated grid with Framer Motion `layout` and `AnimatePresence`.
   - Interactive quick-add button, size picker bar, and sold-out indicator.
   - Empty search fallback state with one-click filter reset.

3. **`/shop/[id]` (Product Detail)** — `src/app/shop/[id]/page.tsx`:
   - Static Site Generation via `generateStaticParams()` over all default `PRODUCTS`.
   - Dynamic metadata via `generateMetadata()` reading product title & description.
   - Renders `<ProductDetailWrapper id={id} initialProduct={...} />`.
   - Displays breadcrumb navigation (`Shop / Category / Name`).
   - Full-bleed image gallery with detail crop close-up frame.
   - Sticky purchase panel with size selection chips, price / compare-at price, add to bag button.
   - Highlights pill badges.
   - Accordions for "Overview & Specifications" and "Campus Pickup & Hours".
   - "Complete the Look" / recommended products grid.

4. **`/admin` (Admin Operations)** — `src/app/admin/page.tsx`:
   - Comprehensive live store management dashboard.
   - 5 KPI Metric Cards: Total Listings, Spirit Wear Count, Supplies/Gear Count, Average Price, Sale/Promotion Count.
   - Multi-filter controls: Category pills, Stock status dropdown (`All`, `In Stock`, `Sold Out`), Sort dropdown (`Default`, `Price Low->High`, `Price High->Low`, `Name A-Z`), and Search input.
   - Listing Cards with live stock status toggle switch, click-to-edit inline price, duplicate listing button, edit modal launcher, and delete action with confirmation.
   - Backup Export (`.json` download) & Backup Import (`.json` upload with schema validation).
   - Restore default catalog action.
   - Edit / Create Modal (`<AdminProductModal />`).

5. **`/school` (Redirect)** — `src/app/school/page.tsx`:
   - Server-side `permanentRedirect("/shop")`.

---

## 3. Component Hierarchy & Animation Systems

### 3.1 Component Inventory (`src/components/`)
| Component | Path | Responsibilities & Interactivity |
| :--- | :--- | :--- |
| **SiteShell** | `SiteShell.tsx` | Site header and footer wrapper. Contains rotating logo mark (`Magnetic`), sliding RouseStation wordmark, navigation links, theme switcher, bag button with live badge, skip-to-content accessibility link, and "GO RAIDERS" footer signature. |
| **StoreProvider** | `StoreProvider.tsx` | Context provider for cart state, theme state, product catalog state, and notification toasts. Synchronizes state with `localStorage`. |
| **ShopCatalog** | `ShopCatalog.tsx` | Catalog view with category filters, search input, quick size selectors, layout animations, and empty state. |
| **ShopDialogs** | `ShopDialogs.tsx` | Native HTML `<dialog>` implementations: `ProductDialog` (quick view & size selector) and `CartDrawer` (slide-out cart, quantity controls, promo code engine, sticker perk progress bar). |
| **ProductDetailWrapper** | `ProductDetailWrapper.tsx` | Client wrapper connecting product ID to `StoreProvider` state with 404 fallback. |
| **ProductDetails** | `ProductDetails.tsx` | Comprehensive product detail layout with gallery, sticky purchase panel, accordion panels, and related items. |
| **ProductVisual** | `ProductVisual.tsx` | Smart image renderer supporting local images, remote URLs, and stylized varsity "R" crest fallback cards on image error/absence. |
| **AdminProductModal** | `AdminProductModal.tsx` | Form modal for creating/editing products with preset gallery picker (10 images), custom URL input, tag/category/pricing inputs, and live preview card. |
| **HomeCover** | `HomeCover.tsx` | Homepage composition component. |
| **HeroShowcase** | `HeroShowcase.tsx` | Hero carousel featuring fine pointer-driven 3D parallax, slide transitions, thumbnail controls, pause/play toggle, and reduced-motion handling. |
| **CollectionMotion** | `CollectionMotion.tsx` | Sticky horizontal scroll rail with Framer Motion `useScroll` and `useTransform`. |
| **RaiderMarquee** | `RaiderMarquee.tsx` | Infinite looping marquee banner with Rouse school slogans. |
| **SlidingProducts** | `SlidingProducts.tsx` | Continuous horizontal sliding product strip. |
| **RoundedButton** | `RoundedButton.tsx` | Magnetic rounded button with animated circle fill hover effect. |
| **Magnetic** | `Magnetic.tsx` | Spring-physics magnetic attraction wrapper for cursor engagement (automatically disabled for touch devices or reduced motion). |
| **SmoothScroll** | `SmoothScroll.tsx` | Lenis smooth scrolling coordinator with route change reset and dialog open observer. |
| **ThemeSelector** | `ThemeSelector.tsx` | Accessible dropdown popup for choosing among the 4 theme colorways with keyboard handling (`Escape`) and click-outside dismissal. |

### 3.2 Animation Primitives (`src/components/animations/`)
| Component / File | Description |
| :--- | :--- |
| **PreLoader.tsx** | One-time-per-session SVG bezier curved curtain transition (`sessionStorage` guarded). |
| **LetterReveal.tsx** | Staggered letter-by-letter headline reveal using Web Animations API (`letter.animate`) with editorial cadence. |
| **TextSlideUp.tsx** | Word-by-word slide-up reveal with cubic-bezier easing. |
| **ContrastCursor.tsx** | Magnetic circular custom cursor with blend mode and scale expansion on interactive elements. |
| **anim.ts** | Shared Framer Motion variant definitions (`preloaderOpacity`, `preloaderSlideUp`, `wordSlideUp`, `fadeReveal`). |

---

## 4. State Management & Data Architecture (`src/lib/store.ts` & `StoreProvider.tsx`)

### 4.1 Current Data Models
```ts
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

### 4.2 Storage Keys & Persistence
- Products: `localStorage.getItem("raider_station_products_v2")` (initial fallback to default `PRODUCTS` array with 11 demo items).
- Theme: `localStorage.getItem("raider_theme")` (initial fallback to `"heritage"`).
- Preloader: `sessionStorage.getItem("rouse-store-preloader-seen")`.

---

## 5. Build, Lint & Quality Verification

| Check | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Linting** | `npm run lint` | **PASSED (0 errors, 0 warnings)** | ESLint 9 flat config executed cleanly. |
| **Production Build** | `npm run build` | **PASSED (Exit code 0)** | 18 routes statically generated (11 SSG `/shop/[id]` pages, `/`, `/shop`, `/admin`, `/school`, `/_not-found`). |

---

## 6. Gap Analysis against ORIGINAL_REQUEST.md Requirements

| Req ID | Requirement | Current Status in Codebase | Implementation Path Needed |
| :--- | :--- | :--- | :--- |
| **R1** | **Product Reviews & 5-Star Rating System** | Not yet implemented. No review models, rating stars, breakdown bars, or submission forms on `/shop/[id]`. | 1. Define `Review` types and `ReviewStore` interface.<br>2. Add review aggregation & breakdown calculations.<br>3. Implement review display cards with verified student badges and helpful voting.<br>4. Build "Write a Review" modal/inline form with interactive star rating.<br>5. Add compact star badges on catalog cards in `/shop` and `/`. |
| **R2** | **Customer Complaints & Feedback Drawer** | Not yet implemented. | 1. Define `Complaint` types and `ComplaintStore` interface.<br>2. Implement global slide-over drawer accessible from footer/shell and product pages.<br>3. Create categorized form with urgency pills and validation.<br>4. Provide animated toast feedback on submission. |
| **R3** | **Discreet Admin Dashboard & Moderation** | Admin exists at `/admin` with inventory controls, but "Admin" link is currently in primary header; no passcode guard, no review moderation tab, no complaints inbox tab. | 1. Remove "Admin" link from header `pages` array in `SiteShell.tsx`.<br>2. Add discreet "Staff Admin" link in footer.<br>3. Implement PIN guard modal (default passcode: `raider2026`).<br>4. Expand admin page into a 3-tab console: (a) Catalog Inventory, (b) Reviews Moderation, (c) Complaints Inbox. |
| **R4** | **Animation Polish & Editorial Motion** | Framer Motion & CSS transitions exist; needs cubic-bezier refinement for drawer/dialog transitions, star fill bouncy animations, and zero-layout shift. | 1. Standardize easing `cubic-bezier(0.76, 0, 0.24, 1)`.<br>2. Add micro-interactions for star selection and toast spring physics.<br>3. Verify all elements respect `prefers-reduced-motion: reduce`. |
| **R5** | **Architecture & Repository Scaffolding** | Current `StoreProvider.tsx` directly handles product and cart storage. | Abstract storage layer behind typed repository interfaces (`ProductStore`, `ReviewStore`, `ComplaintStore`) with localStorage persistence and in-memory fallbacks to enable seamless database migration. |

---

## 7. File Map & Dependency Graph

```
src/
├── app/
│   ├── layout.tsx (imports StoreProvider, SmoothScroll, SiteShell, globals.css)
│   ├── template.tsx
│   ├── globals.css (CSS tokens, 4 themes, responsive styles)
│   ├── page.tsx (renders HomeCover)
│   ├── school/page.tsx (redirects to /shop)
│   ├── shop/
│   │   ├── page.tsx (renders ShopCatalog)
│   │   └── [id]/
│   │       └── page.tsx (SSG params -> ProductDetailWrapper)
│   └── admin/
│       ├── page.tsx (Admin dashboard, uses StoreProvider, AdminProductModal, ProductVisual)
│       └── admin.module.css
├── components/
│   ├── SiteShell.tsx (Site header, footer, links, ThemeSelector, bag trigger)
│   ├── StoreProvider.tsx (Global state context, cart, products, themes, toasts)
│   ├── ShopCatalog.tsx (Catalog grid, search, filters)
│   ├── ShopDialogs.tsx (ProductDialog, CartDrawer)
│   ├── ProductDetailWrapper.tsx (Resolves live product from store)
│   ├── ProductDetails.tsx (Product details page layout, accordions, related items)
│   ├── ProductVisual.tsx (Product image & fallback varsity card)
│   ├── AdminProductModal.tsx (Create/edit listing modal)
│   ├── HomeCover.tsx (Hero, showcase, marquee, featured grid, collection motion)
│   ├── HeroShowcase.tsx (Hero carousel with pointer parallax)
│   ├── CollectionMotion.tsx (Horizontal scroll-jacking rail)
│   ├── RaiderMarquee.tsx (Infinite ticker)
│   ├── SlidingProducts.tsx (Thumbnail rail)
│   ├── RoundedButton.tsx (Magnetic button)
│   ├── Magnetic.tsx (Spring physics magnetic wrapper)
│   ├── SmoothScroll.tsx (Lenis coordinator)
│   ├── ThemeSelector.tsx (Theme switcher dropdown)
│   └── animations/
│       ├── PreLoader.tsx (Curved entrance curtain)
│       ├── LetterReveal.tsx (Staggered typography reveal)
│       ├── TextSlideUp.tsx (Word-by-word slide-up)
│       ├── ContrastCursor.tsx (Magnetic custom cursor)
│       └── anim.ts (Framer Motion variants)
└── lib/
    └── store.ts (Types, PRODUCTS default array, PRESET_IMAGES, formatPrice)
```

---

## 8. Conclusion

The Rouse High School student e-commerce storefront is structurally sound, highly responsive, and clean. All requirements from `ORIGINAL_REQUEST.md` (R1-R5) can be built cleanly on top of this architecture without breaking existing patterns.
