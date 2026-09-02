import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ReviewRepository,
  ComplaintRepository,
  AdminAuthenticator,
  calculateRatingSummary,
} from "../harness/domain-adapters.mjs";

describe("Tier 2: Boundary, Corner Cases & Adversarial Verification", () => {
  let storage;
  let reviewRepo;
  let complaintRepo;
  let auth;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    reviewRepo = new ReviewRepository(storage);
    complaintRepo = new ComplaintRepository(storage);
    auth = new AdminAuthenticator(storage);
  });

  it("T2.1: Zero reviews calculation produces clean zero defaults without NaN or division by zero", () => {
    const emptySummary = calculateRatingSummary([]);
    expect(emptySummary.averageRating).toBe(0.0);
    expect(emptySummary.totalReviews).toBe(0);
    expect(emptySummary.recommendPercentage).toBe(0);

    for (let star = 1; star <= 5; star++) {
      expect(emptySummary.distribution[star]).toBe(0);
      expect(emptySummary.distributionPercentages[star]).toBe(0);
    }
  });

  it("T2.2: Extreme Maximum Ratings (100% 5-Star) computes perfect 5.0 and 100% recommend", () => {
    const fiveStarReviews = Array.from({ length: 25 }, (_, i) => ({
      id: `rev-five-${i}`,
      productId: "rs-test-max",
      authorName: `Student ${i}`,
      rating: 5,
      title: "Perfection",
      comment: "Absolutely top notch quality",
      isRecommended: true,
      helpfulCount: 0,
      status: "approved",
      createdAt: new Date().toISOString(),
    }));

    const summary = calculateRatingSummary(fiveStarReviews);
    expect(summary.averageRating).toBe(5.0);
    expect(summary.totalReviews).toBe(25);
    expect(summary.recommendPercentage).toBe(100);
    expect(summary.distribution[5]).toBe(25);
    expect(summary.distributionPercentages[5]).toBe(100);
    expect(summary.distribution[1]).toBe(0);
  });

  it("T2.3: Extreme Minimum Ratings (100% 1-Star) computes 1.0 and 0% recommend", () => {
    const oneStarReviews = Array.from({ length: 15 }, (_, i) => ({
      id: `rev-one-${i}`,
      productId: "rs-test-min",
      authorName: `Student ${i}`,
      rating: 1,
      title: "Poor experience",
      comment: "Did not fit properly",
      isRecommended: false,
      helpfulCount: 0,
      status: "approved",
      createdAt: new Date().toISOString(),
    }));

    const summary = calculateRatingSummary(oneStarReviews);
    expect(summary.averageRating).toBe(1.0);
    expect(summary.totalReviews).toBe(15);
    expect(summary.recommendPercentage).toBe(0);
    expect(summary.distribution[1]).toBe(15);
    expect(summary.distributionPercentages[1]).toBe(100);
    expect(summary.distribution[5]).toBe(0);
  });

  it("T2.4: Special characters, HTML meta-characters and script tags preserve raw string fidelity without execution", () => {
    const xssPayload = `<script>alert("XSS Vulnerability")</script><img src="x" onerror="alert(1)">`;
    const sqlPayload = `'; DROP TABLE products; SELECT * FROM users WHERE '1'='1`;

    const review = reviewRepo.addReview({
      productId: "rs-hoodie-01",
      authorName: "Security QA",
      rating: 4,
      title: xssPayload,
      comment: sqlPayload,
      isRecommended: true,
    });

    const retrieved = reviewRepo.getAll().find((r) => r.id === review.id);
    expect(retrieved.title).toBe(xssPayload);
    expect(retrieved.comment).toBe(sqlPayload);

    const complaint = complaintRepo.addComplaint({
      category: "General Grievance",
      customerName: `Student & < > " '`,
      customerEmail: "qa@leanderisd.net",
      description: `Testing symbols: &amp; &lt; &gt; &quot; \` $ { } [ ]`,
    });

    const retrievedComplaint = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(retrievedComplaint.description).toContain("&amp; &lt; &gt;");
  });

  it("T2.5: Unicode, multi-byte international characters and emoji fidelity", () => {
    const unicodeAuthor = "Renée 🌟 & 李雷 (Class of '26 🎓 🏈)";
    const unicodeComment = "Excelente calidad! 很棒的連帽衫 🎉. Best spirit wear ever! 🔥";

    const review = reviewRepo.addReview({
      productId: "rs-cap-03",
      authorName: unicodeAuthor,
      rating: 5,
      title: "Superb! ⭐⭐⭐⭐⭐",
      comment: unicodeComment,
      isRecommended: true,
    });

    const stored = reviewRepo.getAll().find((r) => r.id === review.id);
    expect(stored.authorName).toBe(unicodeAuthor);
    expect(stored.comment).toBe(unicodeComment);
  });

  it("T2.6: Massive comment strings (3000+ characters) serialize and persist cleanly", () => {
    const unit = "Rouse Raider Spirit! ";
    const longComment = (unit.repeat(150)).trim(); // ~3149 chars
    expect(longComment.length).toBeGreaterThan(3000);

    const review = reviewRepo.addReview({
      productId: "rs-jacket-02",
      authorName: "Detailed Reviewer",
      rating: 5,
      title: "Extremely Comprehensive Review",
      comment: longComment,
      isRecommended: true,
    });

    const stored = reviewRepo.getAll().find((r) => r.id === review.id);
    expect(stored.comment.length).toBe(longComment.length);
    expect(stored.comment).toBe(longComment);
  });

  it("T2.7: Admin PIN authentication strictly validates exact string match and rejects edge cases", () => {
    const invalidPins = [
      "RAIDER2026",          // Uppercase
      "Raider2026",          // Capitalized
      " raider2026",         // Leading space
      "raider2026 ",         // Trailing space
      "raider",              // Partial
      "2026",                // Partial
      "123456",              // Numeric generic
      "' OR '1'='1",         // SQLi attempt
      "<script>",            // XSS attempt
      "null",                // String null
      "undefined",           // String undefined
    ];

    for (const pin of invalidPins) {
      const result = auth.verifyPin(pin);
      expect(result.success).toBe(false);
    }
  });

  it("T2.8: Single user session helpful voting idempotency prevents infinite duplicate increments", () => {
    class HelpfulVoteTracker {
      constructor(storageDriver) {
        this.storage = storageDriver;
        this.votedKey = "raider_voted_reviews";
      }

      hasVoted(reviewId) {
        const voted = this.storage.getItem(this.votedKey) || [];
        return voted.includes(reviewId);
      }

      vote(reviewId, reviewRepository) {
        if (this.hasVoted(reviewId)) {
          return { success: false, reason: "Already voted helpful" };
        }
        reviewRepository.voteHelpful(reviewId);
        const voted = this.storage.getItem(this.votedKey) || [];
        voted.push(reviewId);
        this.storage.setItem(this.votedKey, voted);
        return { success: true };
      }
    }

    const voteTracker = new HelpfulVoteTracker(storage);
    const reviews = reviewRepo.getByProductId("rs-hoodie-01");
    const target = reviews[0];
    const initialCount = target.helpfulCount;

    // First vote should succeed
    const firstVote = voteTracker.vote(target.id, reviewRepo);
    expect(firstVote.success).toBe(true);

    const updatedAfterFirst = reviewRepo.getByProductId("rs-hoodie-01").find((r) => r.id === target.id);
    expect(updatedAfterFirst.helpfulCount).toBe(initialCount + 1);

    // Second vote in same session should be blocked
    const secondVote = voteTracker.vote(target.id, reviewRepo);
    expect(secondVote.success).toBe(false);
    expect(secondVote.reason).toBe("Already voted helpful");

    // Count should not increase further
    const updatedAfterSecond = reviewRepo.getByProductId("rs-hoodie-01").find((r) => r.id === target.id);
    expect(updatedAfterSecond.helpfulCount).toBe(initialCount + 1);
  });
});
