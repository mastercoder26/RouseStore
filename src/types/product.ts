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

export type UpdateProductInput = Partial<Omit<Product, "id">>;

export interface ProductFilterOptions {
  category?: string | "All items";
  stockStatus?: "all" | "inStock" | "soldOut";
  query?: string;
  sortBy?: "default" | "priceAsc" | "priceDesc" | "name";
}
