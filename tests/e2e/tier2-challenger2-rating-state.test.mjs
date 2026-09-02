import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ReviewRepository,
  ComplaintRepository,
  calculateRatingSummary,
} from "../harness/domain-adapters.mjs";

describe("Tier 2: Challenger 2 - Rating Calculation Math & Repository State Mechanics", () => {
  let storage;
  let reviewRepo;
  let complaintRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    reviewRepo = new ReviewRepository(storage);
    complaintRepo = new ComplaintRepository(storage);
  });

  // 1. Empty review array stress
  it("CH2.1: Empty review arrays produce exact 0 metrics without NaN or zero divisions", () => {
    const summary = calculateRatingSummary([]);
    expect(summary.averageRating).toBe(0.0);
    expect(summary.totalReviews).toBe(0);
    expect(summary.recommendPercentage).toBe(0);

    for (let star = 1; star <= 5; star++) {
      expect(summary.distribution[star]).toBe(0);
      expect(summary.distributionPercentages[star]).toBe(0);
    }
  });

  // 2. Extreme distribution skews
  it("CH2.2: Extreme distribution skews (100% 5-Star, 100% 1-Star, 100% 3-Star, Bimodal)", () => {
    // 100% 5-Star
    const reviews5 = Array.from({ length: 60 }, (_, i) => ({
      id: `r5-${i}`,
      rating: 5,
      isRecommended: true,
      status: "approved",
    }));
    const s5 = calculateRatingSummary(reviews5);
    expect(s5.averageRating).toBe(5.0);
    expect(s5.totalReviews).toBe(60);
    expect(s5.recommendPercentage).toBe(100);
    expect(s5.distributionPercentages[5]).toBe(100);
    expect(s5.distributionPercentages[1]).toBe(0);

    // 100% 1-Star
    const reviews1 = Array.from({ length: 45 }, (_, i) => ({
      id: `r1-${i}`,
      rating: 1,
      isRecommended: false,
      status: "approved",
    }));
    const s1 = calculateRatingSummary(reviews1);
    expect(s1.averageRating).toBe(1.0);
    expect(s1.totalReviews).toBe(45);
    expect(s1.recommendPercentage).toBe(0);
    expect(s1.distributionPercentages[1]).toBe(100);
    expect(s1.distributionPercentages[5]).toBe(0);

    // 100% 3-Star
    const reviews3 = Array.from({ length: 30 }, (_, i) => ({
      id: `r3-${i}`,
      rating: 3,
      isRecommended: true,
      status: "approved",
    }));
    const s3 = calculateRatingSummary(reviews3);
    expect(s3.averageRating).toBe(3.0);
    expect(s3.totalReviews).toBe(30);
    expect(s3.distributionPercentages[3]).toBe(100);
    expect(s3.distributionPercentages[1]).toBe(0);
    expect(s3.distributionPercentages[5]).toBe(0);

    // Bimodal 50/50 1-Star and 5-Star
    const bimodal = [
      ...Array.from({ length: 25 }, (_, i) => ({ id: `b1-${i}`, rating: 1, isRecommended: false, status: "approved" })),
      ...Array.from({ length: 25 }, (_, i) => ({ id: `b5-${i}`, rating: 5, isRecommended: true, status: "approved" })),
    ];
    const sb = calculateRatingSummary(bimodal);
    expect(sb.averageRating).toBe(3.0);
    expect(sb.totalReviews).toBe(50);
    expect(sb.recommendPercentage).toBe(50);
    expect(sb.distributionPercentages[1]).toBe(50);
    expect(sb.distributionPercentages[5]).toBe(50);
  });

  // 3. Hidden vs approved review filtering
  it("CH2.3: Hidden vs approved review filtering accurately excludes unapproved items from summary math", () => {
    const mixed = [
      { id: "m1", rating: 5, isRecommended: true, status: "approved" },
      { id: "m2", rating: 5, isRecommended: true, status: "approved" },
      { id: "m3", rating: 4, isRecommended: true, status: "approved" },
      { id: "m4", rating: 1, isRecommended: false, status: "hidden" },
      { id: "m5", rating: 1, isRecommended: false, status: "hidden" },
    ];

    const summary = calculateRatingSummary(mixed);
    expect(summary.totalReviews).toBe(3);
    // (5 + 5 + 4) / 3 = 14/3 = 4.666... -> 4.7
    expect(summary.averageRating).toBe(4.7);
    expect(summary.recommendPercentage).toBe(100);
    expect(summary.distribution[5]).toBe(2);
    expect(summary.distribution[4]).toBe(1);
    expect(summary.distribution[1]).toBe(0);
  });

  // 4. Fractional rating rounding (strictly 1 decimal place)
  it("CH2.4: Fractional rating rounding formats strictly to 1 decimal place across complex permutations", () => {
    const testCases = [
      { ratings: [5, 4], expected: 4.5 },
      { ratings: [5, 4, 4], expected: 4.3 }, // 13/3 = 4.333333333333333 -> 4.3
      { ratings: [5, 5, 4], expected: 4.7 }, // 14/3 = 4.666666666666667 -> 4.7
      { ratings: [1, 2, 4], expected: 2.3 }, // 7/3 = 2.3333333333333335 -> 2.3
      { ratings: [1, 5, 5, 5, 5, 5, 5], expected: 4.4 }, // 31/7 = 4.428571428571429 -> 4.4
      { ratings: [1, 5, 5, 5, 5, 5], expected: 4.3 }, // 26/6 = 4.333333333333333 -> 4.3
      { ratings: [1, 1, 1, 2], expected: 1.3 }, // 5/4 = 1.25 -> 1.3
      { ratings: [1, 2, 3, 4, 5], expected: 3.0 }, // 15/5 = 3.0
      { ratings: [2, 3, 3], expected: 2.7 }, // 8/3 = 2.6666666666666665 -> 2.7
      { ratings: [3, 4, 4], expected: 3.7 }, // 11/3 = 3.6666666666666665 -> 3.7
      { ratings: [4, 4, 5, 5, 5, 5, 5], expected: 4.7 }, // 33/7 = 4.714285714285714 -> 4.7
      { ratings: [1, 1, 2, 2, 3, 4, 5, 5], expected: 2.9 }, // 23/8 = 2.875 -> 2.9
    ];

    for (const { ratings, expected } of testCases) {
      const reviews = ratings.map((r, i) => ({ id: `r-${i}`, rating: r, status: "approved" }));
      const res = calculateRatingSummary(reviews);
      expect(res.averageRating).toBe(expected);
      const parts = res.averageRating.toString().split(".");
      if (parts.length > 1) {
        expect(parts[1].length <= 1).toBeTruthy();
      }
    }
  });

  // 5. ReviewRepository Helpful Voting & Moderation Mechanics
  it("CH2.5: ReviewRepository handles multi-step helpful voting and moderation state transitions", () => {
    const hoodieReviews = reviewRepo.getByProductId("rs-hoodie-01");
    const target = hoodieReviews[0];
    const initialHelpful = target.helpfulCount;

    // Increment vote
    reviewRepo.voteHelpful(target.id);
    const updated = reviewRepo.getByProductId("rs-hoodie-01").find((r) => r.id === target.id);
    expect(updated.helpfulCount).toBe(initialHelpful + 1);

    // 25 successive votes
    for (let i = 0; i < 25; i++) {
      reviewRepo.voteHelpful(target.id);
    }
    const updatedAfter25 = reviewRepo.getByProductId("rs-hoodie-01").find((r) => r.id === target.id);
    expect(updatedAfter25.helpfulCount).toBe(initialHelpful + 26);

    // Moderation: Hide review -> summary recalculates immediately
    const summaryBefore = reviewRepo.getSummary("rs-hoodie-01");
    reviewRepo.updateStatus(target.id, "hidden");

    const summaryAfterHide = reviewRepo.getSummary("rs-hoodie-01");
    expect(summaryAfterHide.totalReviews).toBe(summaryBefore.totalReviews - 1);

    // Restore to approved
    reviewRepo.updateStatus(target.id, "approved");
    const summaryAfterRestore = reviewRepo.getSummary("rs-hoodie-01");
    expect(summaryAfterRestore.totalReviews).toBe(summaryBefore.totalReviews);
  });

  // 6. ComplaintRepository Status Transitions and Staff Notes
  it("CH2.6: ComplaintRepository handles lifecycle transitions: New -> In Progress -> Resolved with Staff Notes", () => {
    const complaint = complaintRepo.addComplaint({
      category: "Campus Kiosk Suggestion",
      customerName: "Alex Student",
      customerEmail: "alex@leanderisd.net",
      description: "Request for iced matcha tea at the campus kiosk.",
      urgency: "Medium",
    });

    expect(complaint.id).toBeDefined();
    expect(complaint.status).toBe("New");
    expect(complaint.staffNotes).toBe("");

    // Update status to In Progress
    complaintRepo.updateStatus(complaint.id, "In Progress");
    const inProgress = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(inProgress.status).toBe("In Progress");

    // Update staff notes
    complaintRepo.updateStaffNotes(complaint.id, "Contacted cafeteria vendor for supplier quote.");
    const withNotes = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(withNotes.staffNotes).toBe("Contacted cafeteria vendor for supplier quote.");

    // Update status to Resolved
    complaintRepo.updateStatus(complaint.id, "Resolved");
    const resolved = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(resolved.status).toBe("Resolved");
    expect(resolved.staffNotes).toBe("Contacted cafeteria vendor for supplier quote.");

    // Delete complaint
    complaintRepo.deleteComplaint(complaint.id);
    const afterDelete = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(afterDelete).toBeUndefined();
  });
});
