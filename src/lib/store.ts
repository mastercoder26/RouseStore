/**
 * src/lib/store.ts
 * Re-exports domain models, repositories, storage drivers, and seed datasets
 * for 100% backward compatibility with all existing application components.
 */

// Re-export all domain types
export * from "@/types/product";
export * from "@/types/review";
export * from "@/types/complaint";
export * from "@/types/admin";

// Re-export seed datasets and catalog constants
export {
  PRESET_IMAGES,
  PRODUCTS,
  SEED_PRODUCTS,
  CATEGORIES,
  formatPrice,
} from "@/lib/seed/seedProducts";
export { SEED_REVIEWS } from "@/lib/seed/seedReviews";
export { SEED_COMPLAINTS } from "@/lib/seed/seedComplaints";

// Re-export repositories and storage
export * from "@/lib/storage";
export * from "@/lib/repositories";
