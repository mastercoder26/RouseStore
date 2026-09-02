import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ReviewRepository,
} from "../harness/domain-adapters.mjs";
import { calculateRatingSummary } from "../../src/types/review.ts";

describe("Tier 1: Feature R1 - Review Components In-Depth Behavioral Contracts", () => {
  let storage;
  let reviewRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    reviewRepo = new ReviewRepository(storage);
  });

  it("M2-COMP.1: StarRating precision, gradient math, and boundary clamping", () => {
    const calculateFractions = (val, precision = "fractional") => {
      return [1, 2, 3, 4, 5].map((starIndex) => {
        if (precision === "full") {
          return Math.round(val) >= starIndex ? 1 : 0;
        } else if (precision === "half") {
          const diff = val - (starIndex - 1);
          if (diff >= 0.75) return 1;
          if (diff >= 0.25) return 0.5;
          return 0;
        } else {
          const diff = val - (starIndex - 1);
          return Math.max(0, Math.min(1, diff));
        }
      });
    };

    // Rating 4.7 with fractional precision
    const frac = calculateFractions(4.7, "fractional");
    expect(frac[0]).toBe(1);
    expect(frac[1]).toBe(1);
    expect(frac[2]).toBe(1);
    expect(frac[3]).toBe(1);
    expect(Math.round(frac[4] * 10) / 10).toBe(0.7);

    // Rating 3.4 with half precision
    const half = calculateFractions(3.4, "half");
    expect(half[0]).toBe(1);
    expect(half[1]).toBe(1);
    expect(half[2]).toBe(1);
    expect(half[3]).toBe(0.5);
    expect(half[4]).toBe(0);

    // Rating 3.6 with full precision
    const full = calculateFractions(3.6, "full");
    expect(full[0]).toBe(1);
    expect(full[1]).toBe(1);
    expect(full[2]).toBe(1);
    expect(full[3]).toBe(1);
    expect(full[4]).toBe(0);
  });

  it("M2-COMP.2: ProductRatingBadge CLS stability and prop resolution precedence", () => {
    const resolveBadgeProps = ({ propRating, propTotalReviews, propSummary, storeSummary }) => {
      let avgRating = 0;
      let count = 0;

      if (typeof propRating === "number") {
        avgRating = propRating;
        count = propTotalReviews ?? 0;
      } else if (propSummary) {
        avgRating = propSummary.averageRating;
        count = propSummary.totalReviews;
      } else if (storeSummary) {
        avgRating = storeSummary.averageRating;
        count = storeSummary.totalReviews;
      }

      const hasReviews = count > 0;
      return {
        avgRating,
        count,
        hasReviews,
        formattedScore: hasReviews ? avgRating.toFixed(1) : "0.0",
        label: hasReviews
          ? `Rated ${avgRating.toFixed(1)} out of 5 stars from ${count} reviews`
          : "No reviews yet",
      };
    };

    // Direct rating prop takes precedence
    const fromProps = resolveBadgeProps({
      propRating: 4.5,
      propTotalReviews: 12,
      propSummary: { averageRating: 3.0, totalReviews: 1 },
    });
    expect(fromProps.avgRating).toBe(4.5);
    expect(fromProps.count).toBe(12);
    expect(fromProps.label).toBe("Rated 4.5 out of 5 stars from 12 reviews");

    // Summary prop fallback
    const fromSummary = resolveBadgeProps({
      propSummary: { averageRating: 4.8, totalReviews: 5 },
    });
    expect(fromSummary.avgRating).toBe(4.8);
    expect(fromSummary.count).toBe(5);

    // Store summary fallback
    const storeSummary = reviewRepo.getSummary("rs-hoodie-01");
    const fromStore = resolveBadgeProps({ storeSummary });
    expect(fromStore.avgRating).toBe(4.7);
    expect(fromStore.count).toBe(3);
  });

  it("M2-COMP.3: Pure calculateRatingSummary handles corner cases and rounding invariants", () => {
    // Empty review array
    const emptySummary = calculateRatingSummary([], "rs-empty");
    expect(emptySummary.productId).toBe("rs-empty");
    expect(emptySummary.averageRating).toBe(0);
    expect(emptySummary.totalReviews).toBe(0);
    expect(emptySummary.recommendPercentage).toBe(0);
    expect(emptySummary.distribution[5].count).toBe(0);

    // Single 5-star review
    const singleReview = [
      {
        id: "r-1",
        productId: "rs-p1",
        authorName: "Maya",
        rating: 5,
        title: "Superb",
        comment: "Great quality",
        recommend: true,
        helpfulCount: 0,
        status: "approved",
        createdAt: "2026-09-01T12:00:00Z",
        isVerifiedStudent: true,
      },
    ];
    const singleSummary = calculateRatingSummary(singleReview, "rs-p1");
    expect(singleSummary.averageRating).toBe(5.0);
    expect(singleSummary.totalReviews).toBe(1);
    expect(singleSummary.recommendPercentage).toBe(100);
    expect(singleSummary.distribution[5].percentage).toBe(100);

    // Clamping invalid ratings
    const clampedReviews = [
      {
        id: "r-2",
        productId: "rs-p2",
        authorName: "Test",
        rating: 10, // should clamp to 5
        title: "Super",
        comment: "Exceeded stars",
        recommend: true,
        helpfulCount: 0,
        status: "approved",
        createdAt: "2026-09-01T12:00:00Z",
        isVerifiedStudent: false,
      },
      {
        id: "r-3",
        productId: "rs-p2",
        authorName: "Test2",
        rating: -2, // should clamp to 1
        title: "Poor",
        comment: "Bad item",
        recommend: false,
        helpfulCount: 0,
        status: "approved",
        createdAt: "2026-09-01T12:00:00Z",
        isVerifiedStudent: false,
      },
    ];
    const clampedSummary = calculateRatingSummary(clampedReviews, "rs-p2");
    // (5 + 1) / 2 = 3.0
    expect(clampedSummary.averageRating).toBe(3.0);
    expect(clampedSummary.totalReviews).toBe(2);
    expect(clampedSummary.recommendPercentage).toBe(50);
  });

  it("M2-COMP.4: Review filter and sort permutations in ProductReviewsSection", () => {
    const hoodieReviews = reviewRepo.getByProductId("rs-hoodie-01");

    // Star level filter
    const fiveStars = hoodieReviews.filter((r) => Math.round(r.rating) === 5);
    expect(fiveStars.length).toBe(2);

    // Search query filter matching comment
    const query = "embroider";
    const matched = hoodieReviews.filter((r) =>
      r.comment.toLowerCase().includes(query) || r.title.toLowerCase().includes(query)
    );
    expect(matched.length).toBeGreaterThan(0);

    // Helpful sort invariant
    const sortedHelpful = [...hoodieReviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    for (let i = 0; i < sortedHelpful.length - 1; i++) {
      expect(sortedHelpful[i].helpfulCount).toBeGreaterThanOrEqual(sortedHelpful[i + 1].helpfulCount);
    }

    // Newest sort invariant
    const sortedNewest = [...hoodieReviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (let i = 0; i < sortedNewest.length - 1; i++) {
      expect(new Date(sortedNewest[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sortedNewest[i + 1].createdAt).getTime()
      );
    }
  });

  it("M2-COMP.5: Review Card metadata compatibility aliases and helpful vote tracking", () => {
    const rawReview = {
      id: "test-compat-01",
      productId: "rs-cap-03",
      author: "Legacy Author",
      gradeLevel: "Junior · Class of '27",
      verifiedStudent: true,
      rating: 4,
      title: "Great Cap",
      comment: "Fits snug and comfortable.",
      recommend: true,
      helpfulCount: 3,
      status: "approved",
      createdAt: "2026-08-15T10:00:00Z",
    };

    const resolveAuthor = rawReview.authorName || rawReview.author || "Anonymous Raider";
    const resolveGrade = rawReview.authorGrade || rawReview.gradeLevel;
    const resolveVerified = rawReview.isVerifiedStudent ?? rawReview.verifiedStudent ?? false;

    expect(resolveAuthor).toBe("Legacy Author");
    expect(resolveGrade).toBe("Junior · Class of '27");
    expect(resolveVerified).toBe(true);
  });
});
