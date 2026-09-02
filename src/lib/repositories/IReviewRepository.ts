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
  ReviewModerationStats,
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
  getStats(): ReviewModerationStats;
}
