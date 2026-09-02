/**
 * src/lib/repositories/ProductRepository.ts
 * Concrete ProductRepository with storage driver persistence and seed catalog fallback.
 */

import type { IStorageDriver } from "@/lib/storage/IStorageDriver";
import { getStorageDriver } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilterOptions,
} from "@/types/product";
import { SEED_PRODUCTS } from "@/lib/seed/seedProducts";
import type { IProductRepository } from "./IProductRepository";

export class ProductRepository implements IProductRepository {
  private driver: IStorageDriver;
  private key: string;
  private initialProducts: Product[];

  constructor(
    driver?: IStorageDriver,
    initialProducts: Product[] = SEED_PRODUCTS,
    key: string = STORAGE_KEYS.PRODUCTS
  ) {
    this.driver = driver || getStorageDriver();
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

  public importCatalog(products: Product[]): void {
    if (Array.isArray(products) && products.length > 0) {
      this.driver.setItem(this.key, products);
    }
  }

  public exportCatalog(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }
}
