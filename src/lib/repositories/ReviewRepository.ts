/**
 * src/lib/repositories/ReviewRepository.ts
 * Concrete ReviewRepository with rating math calculation and moderation support.
 */

import type { IStorageDriver } from "@/lib/storage/IStorageDriver";
import { getStorageDriver } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  type Review,
  type CreateReviewInput,
  type ProductRatingSummary,
  type ReviewStatus,
  type ReviewFilterOptions,
  type ReviewModerationStats,
  calculateRatingSummary,
} from "@/types/review";
import { SEED_REVIEWS } from "@/lib/seed/seedReviews";
import type { IReviewRepository } from "./IReviewRepository";

export class ReviewRepository implements IReviewRepository {
  private driver: IStorageDriver;
  private key: string;
  private initialReviews: Review[];

  constructor(
    driver?: IStorageDriver,
    initialReviews: Review[] = SEED_REVIEWS,
    key: string = STORAGE_KEYS.REVIEWS
  ) {
    this.driver = driver || getStorageDriver();
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
    const productReviews = this.getByProductId(productId, false); // Only approved reviews
    return calculateRatingSummary(productReviews, productId);
  }

  public addReview(input: CreateReviewInput): Review {
    const id = `rev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const clampedRating = Math.min(5, Math.max(1, Math.round(input.rating || 5)));
    const authorName = (input.authorName || input.author || "Anonymous Raider").trim();
    const authorGrade = (input.authorGrade || input.gradeLevel || "Verified Student").trim();
    const isVerified = input.isVerifiedStudent ?? input.verifiedStudent ?? true;

    const newReview: Review = {
      id,
      productId: input.productId,
      authorName,
      author: authorName,
      authorGrade,
      gradeLevel: authorGrade,
      isVerifiedStudent: isVerified,
      verifiedStudent: isVerified,
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
          (r.author && r.author.toLowerCase().includes(q)) ||
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

  public getStats(): ReviewModerationStats {
    const all = this.getAll(true);
    const approved = all.filter((r) => r.status !== "hidden");
    const hidden = all.filter((r) => r.status === "hidden");

    const totalHelpfulVotes = all.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);
    const avgRating =
      approved.length > 0
        ? Math.round((approved.reduce((sum, r) => sum + r.rating, 0) / approved.length) * 10) / 10
        : 0;

    return {
      totalReviews: all.length,
      approvedReviews: approved.length,
      hiddenReviews: hidden.length,
      averageRating: avgRating,
      totalHelpfulVotes,
    };
  }
}
