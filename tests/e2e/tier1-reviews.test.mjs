import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ReviewRepository,
  ProductRepository,
} from "../harness/domain-adapters.mjs";

describe("Tier 1: Feature R1 - Product Reviews & 5-Star Rating System", () => {
  let storage;
  let reviewRepo;
  let productRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    reviewRepo = new ReviewRepository(storage);
    productRepo = new ProductRepository(storage);
  });

  it("R1.1: Computes authentic aggregate star rating and count for seeded Sideline Hoodie", () => {
    const summary = reviewRepo.getSummary("rs-hoodie-01");
    expect(summary.totalReviews).toBe(3);
    // Seed reviews: 5, 5, 4 => average = (5+5+4)/3 = 14/3 = 4.666... -> 4.7
    expect(summary.averageRating).toBe(4.7);
    expect(summary.recommendPercentage).toBe(100);
  });

  it("R1.2: Computes 5-to-1 star distribution breakdown counts and percentages", () => {
    const summary = reviewRepo.getSummary("rs-hoodie-01");
    expect(summary.distribution[5]).toBe(2);
    expect(summary.distribution[4]).toBe(1);
    expect(summary.distribution[3]).toBe(0);
    expect(summary.distribution[2]).toBe(0);
    expect(summary.distribution[1]).toBe(0);

    // Percentages: 2/3 = 67%, 1/3 = 33%
    expect(summary.distributionPercentages[5]).toBe(67);
    expect(summary.distributionPercentages[4]).toBe(33);
    expect(summary.distributionPercentages[3]).toBe(0);
  });

  it("R1.3: Submitting a new valid review recalculates summary immediately", () => {
    const initialSummary = reviewRepo.getSummary("rs-hoodie-01");
    expect(initialSummary.totalReviews).toBe(3);

    const created = reviewRepo.addReview({
      productId: "rs-hoodie-01",
      authorName: "Sammy Raider",
      verifiedStudent: true,
      gradeLevel: "Senior '26",
      rating: 5,
      title: "Best hoodie on campus!",
      comment: "Super comfortable and warm for fall football games.",
      isRecommended: true,
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("approved");

    const updatedSummary = reviewRepo.getSummary("rs-hoodie-01");
    expect(updatedSummary.totalReviews).toBe(4);
    // (5+5+4+5)/4 = 19/4 = 4.75 -> 4.8
    expect(updatedSummary.averageRating).toBe(4.8);
    expect(updatedSummary.distribution[5]).toBe(3);
    expect(updatedSummary.distributionPercentages[5]).toBe(75);
  });

  it("R1.4: Preserves verified student tag badges and graduation grade level metadata", () => {
    const reviews = reviewRepo.getByProductId("rs-hoodie-01");
    const verifiedStudentReview = reviews.find((r) => r.authorName === "Maya T.");
    expect(verifiedStudentReview).toBeDefined();
    expect(verifiedStudentReview.verifiedStudent).toBe(true);
    expect(verifiedStudentReview.gradeLevel).toBe("Senior '26");

    const nonVerifiedReview = reviews.find((r) => r.authorName === "Alex C.");
    expect(nonVerifiedReview).toBeDefined();
    expect(nonVerifiedReview.verifiedStudent).toBe(false);
  });

  it("R1.5: Increments helpful voting counters on individual review items", () => {
    const reviews = reviewRepo.getByProductId("rs-hoodie-01");
    const target = reviews[0];
    const initialHelpful = target.helpfulCount;

    reviewRepo.voteHelpful(target.id);

    const updated = reviewRepo.getByProductId("rs-hoodie-01").find((r) => r.id === target.id);
    expect(updated.helpfulCount).toBe(initialHelpful + 1);
  });

  it("R1.6: Derives compact average rating badges for catalog and showcase cards", () => {
    const products = productRepo.getAll();
    const catalogCardsWithBadges = products.map((product) => {
      const summary = reviewRepo.getSummary(product.id);
      return {
        id: product.id,
        name: product.name,
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
        badgeText: summary.totalReviews > 0 ? `${summary.averageRating} ★ (${summary.totalReviews})` : "No reviews yet",
      };
    });

    const hoodieBadge = catalogCardsWithBadges.find((c) => c.id === "rs-hoodie-01");
    expect(hoodieBadge.averageRating).toBe(4.7);
    expect(hoodieBadge.totalReviews).toBe(3);
    expect(hoodieBadge.badgeText).toBe("4.7 ★ (3)");

    const unratedItemBadge = catalogCardsWithBadges.find((c) => c.id === "rs-blanket-07");
    expect(unratedItemBadge.totalReviews).toBe(0);
    expect(unratedItemBadge.badgeText).toBe("No reviews yet");
  });

  it("R1.7: Validates required review fields and rejects invalid submissions", () => {
    // Missing productId
    expect(() => {
      reviewRepo.addReview({
        authorName: "Maya",
        rating: 5,
        comment: "Great item!",
      });
    }).toThrow("productId is required");

    // Invalid rating (>5)
    expect(() => {
      reviewRepo.addReview({
        productId: "rs-hoodie-01",
        authorName: "Maya",
        rating: 6,
        comment: "Great item!",
      });
    }).toThrow("rating must be between 1 and 5");

    // Empty author name
    expect(() => {
      reviewRepo.addReview({
        productId: "rs-hoodie-01",
        authorName: "   ",
        rating: 5,
        comment: "Great item!",
      });
    }).toThrow("authorName is required");

    // Empty comment
    expect(() => {
      reviewRepo.addReview({
        productId: "rs-hoodie-01",
        authorName: "Maya",
        rating: 5,
        comment: "",
      });
    }).toThrow("comment is required");
  });
});
