/**
 * src/lib/repositories/index.ts
 * Barrel export for all typed repository contracts and implementations.
 */

import { ProductRepository } from "./ProductRepository";
import { ReviewRepository } from "./ReviewRepository";
import { ComplaintRepository } from "./ComplaintRepository";

export * from "./IProductRepository";
export * from "./ProductRepository";
export * from "./IReviewRepository";
export * from "./ReviewRepository";
export * from "./IComplaintRepository";
export * from "./ComplaintRepository";

// Shared repository singleton instances
let productRepositoryInstance: ProductRepository | null = null;
let reviewRepositoryInstance: ReviewRepository | null = null;
let complaintRepositoryInstance: ComplaintRepository | null = null;

export function getProductRepository(): ProductRepository {
  if (!productRepositoryInstance) {
    productRepositoryInstance = new ProductRepository();
  }
  return productRepositoryInstance;
}

export function getReviewRepository(): ReviewRepository {
  if (!reviewRepositoryInstance) {
    reviewRepositoryInstance = new ReviewRepository();
  }
  return reviewRepositoryInstance;
}

export function getComplaintRepository(): ComplaintRepository {
  if (!complaintRepositoryInstance) {
    complaintRepositoryInstance = new ComplaintRepository();
  }
  return complaintRepositoryInstance;
}
