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
  importCatalog(products: Product[]): void;
  exportCatalog(): string;
}
