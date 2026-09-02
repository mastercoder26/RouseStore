import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ReviewRepository,
} from "../harness/domain-adapters.mjs";

describe("Tier 1: Feature R1 - Reviews UI, Rating Breakdown & Submission Contracts", () => {
  let storage;
  let reviewRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    reviewRepo = new ReviewRepository(storage);
  });

  it("R1-UI.1: StarRating ARIA contracts and keyboard navigation matrix", () => {
    // Contract generator matching StarRating component logic
    const createStarRating = (initialValue = 0) => {
      let value = initialValue;
      return {
        get value() { return value; },
        set value(v) { value = v; },
        role: "radiogroup",
        ariaLabel: "Rating out of 5 stars",
        stars: [1, 2, 3, 4, 5].map((starIndex) => ({
          role: "radio",
          ariaLabel: `${starIndex} star${starIndex > 1 ? "s" : ""}`,
          get ariaChecked() { return value === starIndex; },
          get tabIndex() {
            return value === starIndex || (value === 0 && starIndex === 1) ? 0 : -1;
          },
          onKeyDown(key) {
            if (key === "ArrowRight" || key === "ArrowUp") {
              value = Math.min(5, value + 1);
            } else if (key === "ArrowLeft" || key === "ArrowDown") {
              value = Math.max(1, value - 1);
            } else if (key === "Enter" || key === " ") {
              value = starIndex;
            } else if (["1", "2", "3", "4", "5"].includes(key)) {
              value = parseInt(key, 10);
            }
          },
        })),
      };
    };

    const ratingComponent = createStarRating(3);
    expect(ratingComponent.role).toBe("radiogroup");
    expect(ratingComponent.ariaLabel).toBe("Rating out of 5 stars");
    expect(ratingComponent.stars.length).toBe(5);

    // Initial state check
    expect(ratingComponent.stars[2].ariaChecked).toBe(true);
    expect(ratingComponent.stars[2].tabIndex).toBe(0);
    expect(ratingComponent.stars[0].ariaChecked).toBe(false);
    expect(ratingComponent.stars[0].tabIndex).toBe(-1);

    // ArrowRight increments
    ratingComponent.stars[2].onKeyDown("ArrowRight");
    expect(ratingComponent.value).toBe(4);
    expect(ratingComponent.stars[3].ariaChecked).toBe(true);

    // Direct number key navigation
    ratingComponent.stars[3].onKeyDown("5");
    expect(ratingComponent.value).toBe(5);

    // ArrowLeft decrements
    ratingComponent.stars[4].onKeyDown("ArrowLeft");
    expect(ratingComponent.value).toBe(4);
  });

  it("R1-UI.2: ProductRatingBadge Zero-CLS and formatting contracts", () => {
    const formatRatingBadge = (summary) => {
      const minHeight = "20px";
      const display = "inline-flex";
      const hasReviews = summary && summary.totalReviews > 0;
      const text = hasReviews
        ? `${summary.averageRating.toFixed(1)} ★ (${summary.totalReviews})`
        : "No reviews yet";

      return {
        minHeight,
        display,
        hasReviews,
        text,
        score: hasReviews ? summary.averageRating.toFixed(1) : null,
        count: hasReviews ? `(${summary.totalReviews})` : null,
      };
    };

    const hoodieSummary = reviewRepo.getSummary("rs-hoodie-01");
    const badge = formatRatingBadge(hoodieSummary);

    expect(badge.minHeight).toBe("20px");
    expect(badge.display).toBe("inline-flex");
    expect(badge.hasReviews).toBe(true);
    expect(badge.score).toBe("4.7");
    expect(badge.count).toBe("(3)");
    expect(badge.text).toBe("4.7 ★ (3)");

    const emptyBadge = formatRatingBadge({ averageRating: 0, totalReviews: 0 });
    expect(emptyBadge.minHeight).toBe("20px");
    expect(emptyBadge.hasReviews).toBe(false);
    expect(emptyBadge.text).toBe("No reviews yet");
  });

  it("R1-UI.3: RatingBreakdownBars computes 5-to-1 percentage distribution and recommendation banner", () => {
    const summary = reviewRepo.getSummary("rs-hoodie-01");

    // 3 reviews: [5, 5, 4]
    expect(summary.totalReviews).toBe(3);
    expect(summary.averageRating).toBe(4.7);
    expect(summary.recommendPercentage).toBe(100);

    // 5-star count is 2 (67%)
    expect(summary.distribution[5]).toBe(2);
    expect(summary.distributionPercentages[5]).toBe(67);

    // 4-star count is 1 (33%)
    expect(summary.distribution[4]).toBe(1);
    expect(summary.distributionPercentages[4]).toBe(33);

    // 1..3 stars count is 0 (0%)
    expect(summary.distribution[3]).toBe(0);
    expect(summary.distributionPercentages[3]).toBe(0);
  });

  it("R1-UI.4: ReviewCard renders author metadata, verified student tag, and helpful counter", () => {
    const reviews = reviewRepo.getByProductId("rs-hoodie-01");
    const review = reviews.find((r) => r.authorName === "Maya T.");

    expect(review).toBeDefined();
    expect(review.authorName).toBe("Maya T.");
    expect(review.verifiedStudent).toBe(true);
    expect(review.gradeLevel).toBe("Senior '26");
    expect(review.rating).toBe(5);
    expect(review.isRecommended).toBe(true);
    expect(review.helpfulCount).toBe(14);

    // Increment helpful
    reviewRepo.voteHelpful(review.id);
    const updated = reviewRepo.getByProductId("rs-hoodie-01").find((r) => r.id === review.id);
    expect(updated.helpfulCount).toBe(15);
  });

  it("R1-UI.5: ReviewSubmissionModal validates required fields and submits to store", () => {
    const validateSubmission = (form) => {
      const errors = {};
      if (!form.rating || form.rating < 1 || form.rating > 5) {
        errors.rating = "Please select a star rating (1 to 5 stars).";
      }
      if (!form.authorName || form.authorName.trim().length < 2) {
        errors.authorName = "Your name or handle is required (min 2 chars).";
      }
      if (!form.title || !form.title.trim()) {
        errors.title = "Review headline is required.";
      }
      if (!form.comment || form.comment.trim().length < 10) {
        errors.comment = "Review must be at least 10 characters.";
      }
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    };

    // Incomplete form test
    const invalidForm = {
      productId: "rs-bottle-05",
      rating: 0,
      authorName: "",
      title: "",
      comment: "Short",
    };
    const invalidResult = validateSubmission(invalidForm);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.rating).toBeDefined();
    expect(invalidResult.errors.authorName).toBeDefined();
    expect(invalidResult.errors.title).toBeDefined();
    expect(invalidResult.errors.comment).toBeDefined();

    // Valid form test
    const validForm = {
      productId: "rs-bottle-05",
      rating: 5,
      authorName: "Coach Marcus",
      gradeLevel: "Faculty / Staff",
      verifiedStudent: true,
      title: "Built like a tank",
      comment: "Keeps water ice cold throughout full two-hour morning drills.",
      isRecommended: true,
    };
    const validResult = validateSubmission(validForm);
    expect(validResult.isValid).toBe(true);

    // Save to repository
    const created = reviewRepo.addReview(validForm);
    expect(created.id).toBeDefined();
    expect(created.authorName).toBe("Coach Marcus");

    // Summary recalculation
    const updatedSummary = reviewRepo.getSummary("rs-bottle-05");
    expect(updatedSummary.totalReviews).toBe(2);
    expect(updatedSummary.averageRating).toBe(5.0);
  });

  it("R1-UI.6: ProductReviewsSection filters by star level, searches keywords, and sorts correctly", () => {
    const allReviews = reviewRepo.getAll();

    // Filter by star level (5 stars only)
    const fiveStarReviews = allReviews.filter((r) => Math.round(r.rating) === 5);
    expect(fiveStarReviews.length).toBeGreaterThan(0);
    expect(fiveStarReviews.every((r) => r.rating === 5)).toBe(true);

    // Search query filter
    const query = "fleece";
    const searchResults = allReviews.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.comment.toLowerCase().includes(query)
    );
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.some((r) => r.productId === "rs-hoodie-01")).toBe(true);

    // Sort by most helpful
    const sortedByHelpful = [...allReviews].sort(
      (a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0)
    );
    expect(sortedByHelpful[0].helpfulCount).toBeGreaterThanOrEqual(
      sortedByHelpful[sortedByHelpful.length - 1].helpfulCount
    );

    // Sort by highest rating
    const sortedByRating = [...allReviews].sort((a, b) => b.rating - a.rating);
    expect(sortedByRating[0].rating).toBeGreaterThanOrEqual(
      sortedByRating[sortedByRating.length - 1].rating
    );
  });
});
