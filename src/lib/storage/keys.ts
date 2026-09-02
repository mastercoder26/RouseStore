/**
 * src/lib/storage/keys.ts
 * Canonical storage keys for RouseStore Raider Station.
 */

export const STORAGE_KEYS = {
  PRODUCTS: "raider_station_products_v2",
  REVIEWS: "raider_station_reviews_v1",
  COMPLAINTS: "raider_station_complaints_v1",
  THEME: "raider_theme",
  ADMIN_SESSION: "raider_admin_session_auth",
  CART: "raider_station_cart_v1",
  VOTED_REVIEWS: "raider_station_voted_reviews_v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
