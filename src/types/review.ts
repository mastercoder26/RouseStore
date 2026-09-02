/**
 * src/types/review.ts
 * Domain models for 5-star student reviews, distribution bars, and rating summaries.
 */

export type ReviewStatus = "approved" | "hidden";

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  author?: string; // Optional compatibility alias for authorName
  authorGrade?: string; // e.g., "Senior · Class of '26", "Junior", "Sophomore", "Freshman", "Faculty / Staff"
  gradeLevel?: string; // Optional compatibility alias for authorGrade
  isVerifiedStudent: boolean;
  verifiedStudent?: boolean; // Optional compatibility alias for isVerifiedStudent
  rating: number; // 1 to 5 integer
  title: string;
  comment: string;
  recommend: boolean;
  helpfulCount: number;
  status: ReviewStatus; // "approved" | "hidden"
  createdAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
}

export interface StarDistributionItem {
  count: number;
  percentage: number; // Integer between 0 and 100
}

export type StarDistribution = {
  5: StarDistributionItem;
  4: StarDistributionItem;
  3: StarDistributionItem;
  2: StarDistributionItem;
  1: StarDistributionItem;
};

export interface ProductRatingSummary {
  productId: string;
  averageRating: number; // 0.0 to 5.0, rounded to 1 decimal place (0 if 0 reviews)
  totalReviews: number; // Total count of approved reviews
  recommendPercentage: number; // 0 to 100 rounded integer percentage
  distribution: StarDistribution;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewInput {
  productId: string;
  authorName?: string;
  author?: string; // Compatibility alias
  authorGrade?: string;
  gradeLevel?: string; // Compatibility alias
  isVerifiedStudent?: boolean;
  verifiedStudent?: boolean; // Compatibility alias
  rating: number; // 1 to 5
  title: string;
  comment: string;
  recommend?: boolean;
  status?: ReviewStatus;
}

export type ReviewSubmissionInput = CreateReviewInput;

export interface ReviewFilterOptions {
  status?: ReviewStatus | "all";
  minRating?: number;
  rating?: number | "all";
  searchQuery?: string;
  sortBy?: "newest" | "highest" | "lowest" | "helpful";
}

export interface ReviewModerationStats {
  totalReviews: number;
  approvedReviews: number;
  hiddenReviews: number;
  averageRating: number;
  totalHelpfulVotes: number;
}

/**
 * Pure calculation helper for review rating summaries.
 */
export function calculateRatingSummary(
  reviews: Review[],
  productId: string = ""
): ProductRatingSummary {
  // Only include approved reviews in public metrics
  const activeReviews = reviews.filter((r) => r.status !== "hidden");
  const totalReviews = activeReviews.length;

  const emptyDistribution: StarDistribution = {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews === 0) {
    return {
      productId,
      averageRating: 0,
      totalReviews: 0,
      recommendPercentage: 0,
      distribution: emptyDistribution,
      ratingCounts,
    };
  }

  let ratingSum = 0;
  let recommendCount = 0;

  for (const review of activeReviews) {
    // Clamp rating between 1 and 5
    const clampedRating = Math.min(5, Math.max(1, Math.round(review.rating || 5)));
    ratingSum += clampedRating;

    if (clampedRating in ratingCounts) {
      ratingCounts[clampedRating as 1 | 2 | 3 | 4 | 5]++;
    }

    if (review.recommend) {
      recommendCount++;
    }
  }

  // Calculate average rounded to 1 decimal place
  const rawAverage = ratingSum / totalReviews;
  const averageRating = Math.round(rawAverage * 10) / 10;

  // Calculate recommend percentage rounded to nearest integer
  const recommendPercentage = Math.round((recommendCount / totalReviews) * 100);

  // Calculate distribution breakdown
  const distribution: StarDistribution = {
    5: {
      count: ratingCounts[5],
      percentage: Math.round((ratingCounts[5] / totalReviews) * 100),
    },
    4: {
      count: ratingCounts[4],
      percentage: Math.round((ratingCounts[4] / totalReviews) * 100),
    },
    3: {
      count: ratingCounts[3],
      percentage: Math.round((ratingCounts[3] / totalReviews) * 100),
    },
    2: {
      count: ratingCounts[2],
      percentage: Math.round((ratingCounts[2] / totalReviews) * 100),
    },
    1: {
      count: ratingCounts[1],
      percentage: Math.round((ratingCounts[1] / totalReviews) * 100),
    },
  };

  return {
    productId,
    averageRating,
    totalReviews,
    recommendPercentage,
    distribution,
    ratingCounts,
  };
}
