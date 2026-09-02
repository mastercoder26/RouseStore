/**
 * tests/stress/challenger-2-stress-suite.mjs
 * 
 * Comprehensive Empirical Challenger 2 Stress Suite
 * Testing:
 *   1. calculateRatingSummary mathematical engine (pure TypeScript implementation)
 *   2. ReviewRepository state, helpful voting, moderation status transitions, and CRUD
 *   3. ComplaintRepository state, status transitions, staff notes, and triage
 */

import { calculateRatingSummary } from "@/types/review";
import { ReviewRepository } from "@/lib/repositories/ReviewRepository";
import { ComplaintRepository } from "@/lib/repositories/ComplaintRepository";
import { MemoryStorageDriver } from "@/lib/storage/MemoryStorageDriver";
import { SEED_REVIEWS } from "@/lib/seed/seedReviews";
import { SEED_COMPLAINTS } from "@/lib/seed/seedComplaints";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function assert(condition, message, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ [PASS] ${message}`);
  } else {
    failedTests++;
    findings.push({ message, details });
    console.error(`  ✖ [FAIL] ${message} ${details ? `(${details})` : ""}`);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runStressSuite() {
  console.log("\n================================================================================");
  console.log(" 🔬 CHALLENGER 2 EMPIRICAL STRESS TEST SUITE: RATING MATH & REPOSITORY STATES");
  console.log("================================================================================\n");

  // =============================================================================
  // SECTION 1: calculateRatingSummary Stress Tests
  // =============================================================================
  console.log("--- SECTION 1: calculateRatingSummary Engine ---");

  // 1.1 Empty array handling
  {
    const emptySummary = calculateRatingSummary([], "rs-empty-test");
    assert(emptySummary.productId === "rs-empty-test", "Empty review array preserves specified productId");
    assert(emptySummary.totalReviews === 0, "Empty review array totalReviews is 0");
    assert(emptySummary.averageRating === 0, "Empty review array averageRating is exactly 0");
    assert(!Number.isNaN(emptySummary.averageRating), "Empty review array averageRating is not NaN");
    assert(Number.isFinite(emptySummary.averageRating), "Empty review array averageRating is finite");
    assert(emptySummary.recommendPercentage === 0, "Empty review array recommendPercentage is 0");
    
    // Verify distribution keys 1-5 present with count 0, percentage 0
    for (let star = 1; star <= 5; star++) {
      assert(star in emptySummary.distribution, `Empty array distribution contains key ${star}`);
      assert(emptySummary.distribution[star].count === 0, `Empty array distribution[${star}].count is 0`);
      assert(emptySummary.distribution[star].percentage === 0, `Empty array distribution[${star}].percentage is 0`);
    }

    // Verify ratingCounts keys 1-5 present with 0
    for (let star = 1; star <= 5; star++) {
      assert(star in emptySummary.ratingCounts, `Empty array ratingCounts contains key ${star}`);
      assert(emptySummary.ratingCounts[star] === 0, `Empty array ratingCounts[${star}] is 0`);
    }
  }

  // 1.2 Array containing only hidden reviews
  {
    const onlyHidden = [
      {
        id: "rev-h1",
        productId: "rs-hidden-test",
        authorName: "Hidden User 1",
        rating: 5,
        title: "Hidden Title",
        comment: "Hidden Comment",
        recommend: true,
        helpfulCount: 10,
        status: "hidden",
        createdAt: "2026-08-01T00:00:00Z",
      },
      {
        id: "rev-h2",
        productId: "rs-hidden-test",
        authorName: "Hidden User 2",
        rating: 1,
        title: "Hidden Title 2",
        comment: "Hidden Comment 2",
        recommend: false,
        helpfulCount: 0,
        status: "hidden",
        createdAt: "2026-08-02T00:00:00Z",
      },
    ];

    const hiddenSummary = calculateRatingSummary(onlyHidden, "rs-hidden-test");
    assert(hiddenSummary.totalReviews === 0, "Only hidden reviews produces totalReviews = 0");
    assert(hiddenSummary.averageRating === 0, "Only hidden reviews produces averageRating = 0 (no NaN)");
    assert(hiddenSummary.recommendPercentage === 0, "Only hidden reviews produces recommendPercentage = 0");
    assert(hiddenSummary.distribution[5].count === 0, "Only hidden reviews produces 0 count for 5 stars");
    assert(hiddenSummary.distribution[1].count === 0, "Only hidden reviews produces 0 count for 1 star");
  }

  // 1.3 Mixed approved and hidden reviews
  {
    const mixed = [
      { id: "m1", productId: "p", authorName: "A", rating: 5, title: "T", comment: "C", recommend: true, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },
      { id: "m2", productId: "p", authorName: "B", rating: 5, title: "T", comment: "C", recommend: true, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },
      { id: "m3", productId: "p", authorName: "C", rating: 4, title: "T", comment: "C", recommend: true, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },
      { id: "m4", productId: "p", authorName: "D", rating: 1, title: "T", comment: "C", recommend: false, helpfulCount: 0, status: "hidden", createdAt: "2026-08-01" },
      { id: "m5", productId: "p", authorName: "E", rating: 1, title: "T", comment: "C", recommend: false, helpfulCount: 0, status: "hidden", createdAt: "2026-08-01" },
    ];

    const mixedSummary = calculateRatingSummary(mixed, "p");
    assert(mixedSummary.totalReviews === 3, "Mixed reviews accurately filters out hidden items (3 approved)");
    // (5 + 5 + 4) / 3 = 14/3 = 4.666... -> 4.7
    assert(mixedSummary.averageRating === 4.7, "Mixed reviews average is 4.7 (excluding hidden 1-star reviews)");
    assert(mixedSummary.recommendPercentage === 100, "Mixed reviews recommend percentage is 100%");
    assert(mixedSummary.distribution[5].count === 2, "Mixed reviews distribution[5].count is 2");
    assert(mixedSummary.distribution[4].count === 1, "Mixed reviews distribution[4].count is 1");
    assert(mixedSummary.distribution[1].count === 0, "Mixed reviews distribution[1].count is 0 (hidden reviews omitted)");
  }

  // 1.4 Extreme distribution skews
  // 100% 5-Star skew
  {
    const count = 100;
    const reviews5 = Array.from({ length: count }, (_, i) => ({
      id: `r5-${i}`,
      productId: "rs-skew-5",
      authorName: `Student ${i}`,
      rating: 5,
      title: "Great",
      comment: "Excellent",
      recommend: true,
      helpfulCount: 0,
      status: "approved",
      createdAt: "2026-08-01",
    }));

    const s5 = calculateRatingSummary(reviews5, "rs-skew-5");
    assert(s5.averageRating === 5.0, "100% 5-Star skew yields averageRating 5.0");
    assert(s5.totalReviews === 100, "100% 5-Star skew yields totalReviews 100");
    assert(s5.recommendPercentage === 100, "100% 5-Star skew yields recommendPercentage 100");
    assert(s5.distribution[5].count === 100 && s5.distribution[5].percentage === 100, "100% 5-Star distribution[5] is 100 count and 100%");
    for (let star = 1; star <= 4; star++) {
      assert(s5.distribution[star].count === 0 && s5.distribution[star].percentage === 0, `100% 5-Star distribution[${star}] is 0`);
    }
  }

  // 100% 1-Star skew
  {
    const count = 80;
    const reviews1 = Array.from({ length: count }, (_, i) => ({
      id: `r1-${i}`,
      productId: "rs-skew-1",
      authorName: `Student ${i}`,
      rating: 1,
      title: "Bad",
      comment: "Poor",
      recommend: false,
      helpfulCount: 0,
      status: "approved",
      createdAt: "2026-08-01",
    }));

    const s1 = calculateRatingSummary(reviews1, "rs-skew-1");
    assert(s1.averageRating === 1.0, "100% 1-Star skew yields averageRating 1.0");
    assert(s1.totalReviews === 80, "100% 1-Star skew yields totalReviews 80");
    assert(s1.recommendPercentage === 0, "100% 1-Star skew yields recommendPercentage 0");
    assert(s1.distribution[1].count === 80 && s1.distribution[1].percentage === 100, "100% 1-Star distribution[1] is 80 count and 100%");
    for (let star = 2; star <= 5; star++) {
      assert(s1.distribution[star].count === 0 && s1.distribution[star].percentage === 0, `100% 1-Star distribution[${star}] is 0`);
    }
  }

  // All 3-Star skew
  {
    const count = 50;
    const reviews3 = Array.from({ length: count }, (_, i) => ({
      id: `r3-${i}`,
      productId: "rs-skew-3",
      authorName: `Student ${i}`,
      rating: 3,
      title: "Average",
      comment: "Neutral",
      recommend: true,
      helpfulCount: 0,
      status: "approved",
      createdAt: "2026-08-01",
    }));

    const s3 = calculateRatingSummary(reviews3, "rs-skew-3");
    assert(s3.averageRating === 3.0, "All 3-Star skew yields averageRating 3.0");
    assert(s3.totalReviews === 50, "All 3-Star skew yields totalReviews 50");
    assert(s3.distribution[3].count === 50 && s3.distribution[3].percentage === 100, "All 3-Star distribution[3] is 50 count and 100%");
    assert(s3.distribution[5].count === 0 && s3.distribution[1].count === 0, "All 3-Star distribution[5] and [1] are 0");
  }

  // Bimodal 50% 1-Star / 50% 5-Star skew
  {
    const bimodal = [
      ...Array.from({ length: 40 }, (_, i) => ({
        id: `b1-${i}`,
        productId: "rs-bimodal",
        authorName: `S1-${i}`,
        rating: 1,
        title: "T",
        comment: "C",
        recommend: false,
        helpfulCount: 0,
        status: "approved",
        createdAt: "2026-08-01",
      })),
      ...Array.from({ length: 40 }, (_, i) => ({
        id: `b5-${i}`,
        productId: "rs-bimodal",
        authorName: `S5-${i}`,
        rating: 5,
        title: "T",
        comment: "C",
        recommend: true,
        helpfulCount: 0,
        status: "approved",
        createdAt: "2026-08-01",
      })),
    ];

    const sb = calculateRatingSummary(bimodal, "rs-bimodal");
    assert(sb.averageRating === 3.0, "Bimodal 50/50 1-Star and 5-Star yields averageRating 3.0");
    assert(sb.recommendPercentage === 50, "Bimodal 50/50 yields recommendPercentage 50");
    assert(sb.distribution[1].percentage === 50, "Bimodal distribution[1].percentage is 50");
    assert(sb.distribution[5].percentage === 50, "Bimodal distribution[5].percentage is 50");
    assert(sb.distribution[2].percentage === 0 && sb.distribution[3].percentage === 0 && sb.distribution[4].percentage === 0, "Bimodal middle stars are 0%");
  }

  // 1.5 Fractional Rating Rounding: Comprehensive Grid Stress Test
  {
    console.log("  Running fractional rounding permutation stress tests...");
    let roundingFailures = 0;
    let combinationsTested = 0;

    // Test known tricky fractions
    const specificFractions = [
      { ratings: [5, 4], expectedAvg: 4.5 },
      { ratings: [5, 4, 4], expectedAvg: 4.3 }, // 13/3 = 4.333333333333333 -> 4.3
      { ratings: [5, 5, 4], expectedAvg: 4.7 }, // 14/3 = 4.666666666666667 -> 4.7
      { ratings: [1, 2, 4], expectedAvg: 2.3 }, // 7/3 = 2.3333333333333335 -> 2.3
      { ratings: [1, 5, 5, 5, 5, 5, 5], expectedAvg: 4.4 }, // 31/7 = 4.428571428571429 -> 4.4
      { ratings: [1, 5, 5, 5, 5, 5], expectedAvg: 4.3 }, // 26/6 = 4.333333333333333 -> 4.3
      { ratings: [1, 1, 1, 2], expectedAvg: 1.3 }, // 5/4 = 1.25 -> 1.3
      { ratings: [1, 2, 3, 4, 5], expectedAvg: 3.0 }, // 15/5 = 3.0
      { ratings: [2, 3, 3], expectedAvg: 2.7 }, // 8/3 = 2.6666666666666665 -> 2.7
      { ratings: [3, 4, 4], expectedAvg: 3.7 }, // 11/3 = 3.6666666666666665 -> 3.7
      { ratings: [4, 4, 5, 5, 5, 5, 5], expectedAvg: 4.7 }, // 33/7 = 4.714285714285714 -> 4.7
      { ratings: [1, 1, 2, 2, 3, 4, 5, 5], expectedAvg: 2.9 }, // 23/8 = 2.875 -> 2.9
    ];

    for (const { ratings, expectedAvg } of specificFractions) {
      const list = ratings.map((r, i) => ({
        id: `f-${i}`,
        productId: "frac",
        authorName: `A${i}`,
        rating: r,
        title: "T",
        comment: "C",
        recommend: r >= 4,
        helpfulCount: 0,
        status: "approved",
        createdAt: "2026-08-01",
      }));

      const sum = calculateRatingSummary(list, "frac");
      assert(sum.averageRating === expectedAvg, `Fractional average for [${ratings.join(",")}] is ${expectedAvg} (Got: ${sum.averageRating})`);
    }

    // Large Monte-Carlo & Grid verification: Verify strictly 1 decimal place and no JS precision leaking
    for (let total = 1; total <= 100; total += 7) {
      for (let sum = total; sum <= total * 5; sum += 3) {
        combinationsTested++;
        const avg = sum / total;
        const expectedRounded = Math.round(avg * 10) / 10;

        const arr = [];
        let remSum = sum;
        for (let i = 0; i < total; i++) {
          const remainingSlots = total - i - 1;
          let star = Math.min(5, Math.max(1, remSum - remainingSlots * 5));
          if (remSum - star < remainingSlots * 1) {
            star = remSum - remainingSlots * 1;
          }
          arr.push({
            id: `mc-${i}`,
            productId: "mc",
            authorName: "M",
            rating: star,
            title: "T",
            comment: "C",
            recommend: star >= 4,
            helpfulCount: 0,
            status: "approved",
            createdAt: "2026-08-01",
          });
          remSum -= star;
        }

        const res = calculateRatingSummary(arr, "mc");
        
        // Strict 1 decimal place check
        const parts = res.averageRating.toString().split(".");
        if (parts.length > 1 && parts[1].length > 1) {
          roundingFailures++;
          console.error(`Floating point precision leak detected: ${res.averageRating}`);
        }
        if (res.averageRating !== expectedRounded) {
          roundingFailures++;
        }
      }
    }

    assert(roundingFailures === 0, `All ${combinationsTested} fractional permutations have strictly <= 1 decimal place with zero precision leakage`);
  }

  // 1.6 Clamping, Out-of-Bounds & Falsy Rating Behavior Analysis
  {
    // Out-of-bounds ratings (upper bound & negative)
    const clampedReviews = [
      { id: "c1", productId: "p", authorName: "A", rating: -10, title: "T", comment: "C", recommend: false, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" }, // clamped to 1
      { id: "c2", productId: "p", authorName: "B", rating: 1, title: "T", comment: "C", recommend: false, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },   // 1
      { id: "c3", productId: "p", authorName: "C", rating: 99, title: "T", comment: "C", recommend: true, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },   // clamped to 5
      { id: "c4", productId: "p", authorName: "D", rating: 4.8, title: "T", comment: "C", recommend: true, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },  // rounded & clamped to 5
    ];

    const clampedSummary = calculateRatingSummary(clampedReviews, "p");
    // clamped: 1, 1, 5, 5 -> sum = 12 / 4 = 3.0
    assert(clampedSummary.averageRating === 3.0, "Clamping handles -10->1, 1->1, 99->5, 4.8->5 (avg = 3.0)");
    assert(clampedSummary.distribution[1].count === 2, "Clamped distribution[1] count is 2");
    assert(clampedSummary.distribution[5].count === 2, "Clamped distribution[5] count is 2");

    // Empirical probe on falsy rating 0:
    // In calculateRatingSummary: Math.round(review.rating || 5)
    // If rating is 0, 0 || 5 results in 5.
    const zeroRatingReview = [
      { id: "z1", productId: "p", authorName: "Zero", rating: 0, title: "T", comment: "C", recommend: false, helpfulCount: 0, status: "approved", createdAt: "2026-08-01" },
    ];
    const zeroSummary = calculateRatingSummary(zeroRatingReview, "p");
    if (zeroSummary.averageRating === 5.0) {
      console.warn("  ℹ [NOTE / BEHAVIOR OBSERVED]: review.rating = 0 evaluates to 5.0 because `review.rating || 5` treats 0 as falsy.");
    }
  }

  // 1.7 Large scale stress test (10,000 reviews)
  {
    const bigList = Array.from({ length: 10000 }, (_, i) => ({
      id: `big-${i}`,
      productId: "rs-big",
      authorName: `Student ${i}`,
      rating: (i % 5) + 1, // evenly distributed 1, 2, 3, 4, 5
      title: "Title",
      comment: "Comment",
      recommend: (i % 5) + 1 >= 4,
      helpfulCount: i,
      status: "approved",
      createdAt: "2026-08-01",
    }));

    const startTime = performance.now();
    const bigSummary = calculateRatingSummary(bigList, "rs-big");
    const elapsed = performance.now() - startTime;

    assert(bigSummary.totalReviews === 10000, "10,000 reviews totalReviews is 10,000");
    assert(bigSummary.averageRating === 3.0, "10,000 reviews evenly distributed avg is 3.0");
    assert(bigSummary.distribution[5].count === 2000, "10,000 reviews distribution[5] is 2000");
    assert(bigSummary.distribution[5].percentage === 20, "10,000 reviews distribution[5] percentage is 20%");
    assert(elapsed < 50, `10,000 reviews calculated in under 50ms (Elapsed: ${elapsed.toFixed(2)}ms)`);
  }

  // =============================================================================
  // SECTION 2: ReviewRepository State & Mechanics Stress Tests
  // =============================================================================
  console.log("\n--- SECTION 2: ReviewRepository Mechanics ---");

  {
    const driver = new MemoryStorageDriver();
    const reviewRepo = new ReviewRepository(driver, SEED_REVIEWS);

    // 2.1 Initialization
    const allInitial = reviewRepo.getAll(true);
    assert(allInitial.length === SEED_REVIEWS.length, `ReviewRepository initializes with exactly ${SEED_REVIEWS.length} seed reviews`);
    
    const publicInitial = reviewRepo.getAll(false);
    const hiddenSeedCount = SEED_REVIEWS.filter(r => r.status === "hidden").length;
    assert(publicInitial.length === SEED_REVIEWS.length - hiddenSeedCount, `ReviewRepository.getAll(false) hides ${hiddenSeedCount} hidden reviews`);

    // 2.2 Helpful voting mechanics
    const hoodieReviews = reviewRepo.getByProductId("rs-hoodie-01", true);
    const targetReview = hoodieReviews[0];
    const initialHelpful = targetReview.helpfulCount;

    await sleep(2);
    // Single vote
    const newCount = reviewRepo.voteHelpful(targetReview.id);
    assert(newCount === initialHelpful + 1, `voteHelpful increments count from ${initialHelpful} to ${initialHelpful + 1}`);

    const fetchedAfterVote = reviewRepo.getById(targetReview.id);
    assert(fetchedAfterVote.helpfulCount === initialHelpful + 1, "Persisted helpfulCount in driver matches incremented value");
    assert(typeof fetchedAfterVote.updatedAt === "string" && !isNaN(Date.parse(fetchedAfterVote.updatedAt)), "voteHelpful records valid updatedAt ISO timestamp");

    // Stress voting: 50 successive votes
    for (let i = 0; i < 50; i++) {
      reviewRepo.voteHelpful(targetReview.id);
    }
    const fetchedAfter50 = reviewRepo.getById(targetReview.id);
    assert(fetchedAfter50.helpfulCount === initialHelpful + 1 + 50, `50 successive votes correctly accumulated to ${initialHelpful + 51}`);

    // Helpful vote on non-existent review
    const invalidVote = reviewRepo.voteHelpful("non-existent-review-id");
    assert(invalidVote === 0, "voteHelpful on non-existent ID safely returns 0 without crashing");

    // 2.3 Status Updating Mechanics & Moderation
    const moderationReview = reviewRepo.getById("rev-hoodie-01");
    assert(moderationReview.status === "approved", "rev-hoodie-01 starts with status 'approved'");

    const summaryBeforeHide = reviewRepo.getSummary("rs-hoodie-01");
    const countBeforeHide = summaryBeforeHide.totalReviews;

    // Hide review
    const hideSuccess = reviewRepo.updateStatus("rev-hoodie-01", "hidden");
    assert(hideSuccess === true, "updateStatus to 'hidden' returns true");

    const fetchedHidden = reviewRepo.getById("rev-hoodie-01");
    assert(fetchedHidden.status === "hidden", "Review status is now 'hidden'");

    // Verify storefront query excludes hidden review immediately
    const publicHoodieReviews = reviewRepo.getByProductId("rs-hoodie-01", false);
    assert(!publicHoodieReviews.some(r => r.id === "rev-hoodie-01"), "getByProductId(productId, false) excludes hidden review");

    const summaryAfterHide = reviewRepo.getSummary("rs-hoodie-01");
    assert(summaryAfterHide.totalReviews === countBeforeHide - 1, `getSummary immediately decrements totalReviews from ${countBeforeHide} to ${countBeforeHide - 1}`);

    // Restore review to approved
    const approveSuccess = reviewRepo.updateStatus("rev-hoodie-01", "approved");
    assert(approveSuccess === true, "updateStatus to 'approved' returns true");

    const summaryAfterApprove = reviewRepo.getSummary("rs-hoodie-01");
    assert(summaryAfterApprove.totalReviews === countBeforeHide, `getSummary restores totalReviews back to ${countBeforeHide}`);

    // Non-existent review status update
    const invalidStatusUpdate = reviewRepo.updateStatus("fake-id", "hidden");
    assert(invalidStatusUpdate === false, "updateStatus on invalid review ID safely returns false");

    // 2.4 Add Review Mechanics & Normalization
    const created = reviewRepo.addReview({
      productId: "rs-hoodie-01",
      authorName: "  Stress Tester  ",
      authorGrade: "Senior",
      rating: 5,
      title: "  Fabulous Hoodie  ",
      comment: "  Super warm and stylish!  ",
      recommend: true,
    });

    assert(created.id.startsWith("rev-"), "addReview generates unique ID prefixed with 'rev-'");
    assert(created.authorName === "Stress Tester", "addReview trims authorName");
    assert(created.title === "Fabulous Hoodie", "addReview trims title");
    assert(created.comment === "Super warm and stylish!", "addReview trims comment");
    assert(created.helpfulCount === 0, "addReview initializes helpfulCount to 0");
    assert(created.status === "approved", "addReview defaults status to 'approved'");
    assert(created.isVerifiedStudent === true, "addReview defaults isVerifiedStudent to true");
    assert(created.author === "Stress Tester", "addReview sets author compatibility alias");
    assert(created.gradeLevel === "Senior", "addReview sets gradeLevel compatibility alias");

    // 2.5 Filtering and Sorting
    const filterByRating = reviewRepo.filterReviews({ rating: 5, status: "all" });
    assert(filterByRating.every(r => r.rating === 5), "filterReviews by rating 5 returns only 5-star reviews");

    const filterByMinRating = reviewRepo.filterReviews({ minRating: 4, status: "all" });
    assert(filterByMinRating.every(r => r.rating >= 4), "filterReviews by minRating 4 returns only >=4-star reviews");

    const filterBySearch = reviewRepo.filterReviews({ searchQuery: "Gupton", status: "all" });
    assert(filterBySearch.length > 0 && filterBySearch.every(r => r.comment.includes("Gupton")), "filterReviews by searchQuery searches comment text");

    const sortedByHelpful = reviewRepo.filterReviews({ sortBy: "helpful", status: "all" });
    let helpfulSorted = true;
    for (let i = 0; i < sortedByHelpful.length - 1; i++) {
      if ((sortedByHelpful[i].helpfulCount || 0) < (sortedByHelpful[i + 1].helpfulCount || 0)) {
        helpfulSorted = false;
        break;
      }
    }
    assert(helpfulSorted, "filterReviews sortBy 'helpful' orders descending");

    // 2.6 Stats
    const stats = reviewRepo.getStats();
    assert(stats.totalReviews === reviewRepo.getAll(true).length, "getStats totalReviews matches total review count");
    assert(stats.approvedReviews === reviewRepo.getAll(false).length, "getStats approvedReviews matches approved count");
    assert(stats.hiddenReviews === stats.totalReviews - stats.approvedReviews, "getStats hiddenReviews matches hidden count");
    assert(stats.totalHelpfulVotes > 0, "getStats totalHelpfulVotes accurately computes sum");

    // 2.7 Delete Review
    const deleteTargetId = created.id;
    const deleteSuccess = reviewRepo.deleteReview(deleteTargetId);
    assert(deleteSuccess === true, "deleteReview returns true for existing review");
    assert(reviewRepo.getById(deleteTargetId) === undefined, "Deleted review no longer exists in repository");

    const deleteNonExistent = reviewRepo.deleteReview("non-existent-id");
    assert(deleteNonExistent === false, "deleteReview returns false for non-existent review");
  }

  // =============================================================================
  // SECTION 3: ComplaintRepository State & Mechanics Stress Tests
  // =============================================================================
  console.log("\n--- SECTION 3: ComplaintRepository Mechanics ---");

  {
    const driver = new MemoryStorageDriver();
    const complaintRepo = new ComplaintRepository(driver, SEED_COMPLAINTS);

    // 3.1 Initialization
    const allComplaints = complaintRepo.getAll();
    assert(allComplaints.length === SEED_COMPLAINTS.length, `ComplaintRepository initializes with ${SEED_COMPLAINTS.length} seed complaints`);

    // 3.2 Add Complaint
    const newCmp = complaintRepo.addComplaint({
      customerName: "  Alex Raider  ",
      customerEmail: "  alex.raider@leanderisd.net  ",
      category: "Campus Kiosk Suggestion",
      urgency: "high",
      description: "  Add Apple Pay support to the cafeteria merch terminal.  ",
      studentId: "RHS-99481",
      productId: "rs-coldbrew-09",
    });

    assert(newCmp.id.startsWith("cmp-"), "addComplaint creates unique ID with 'cmp-' prefix");
    assert(newCmp.customerName === "Alex Raider", "addComplaint trims customerName");
    assert(newCmp.customerEmail === "alex.raider@leanderisd.net", "addComplaint trims customerEmail");
    assert(newCmp.contactInfo === "alex.raider@leanderisd.net", "addComplaint sets contactInfo alias");
    assert(newCmp.description === "Add Apple Pay support to the cafeteria merch terminal.", "addComplaint trims description");
    assert(newCmp.status === "new", "addComplaint defaults status to 'new'");
    assert(newCmp.staffNotes === "", "addComplaint defaults staffNotes to empty string");
    assert(newCmp.studentId === "RHS-99481", "addComplaint preserves studentId");
    assert(newCmp.productId === "rs-coldbrew-09", "addComplaint preserves productId");

    // Compatibility input with contactInfo instead of customerEmail
    const cmpCompat = complaintRepo.addComplaint({
      customerName: "Jordan Smith",
      contactInfo: "jsmith@gmail.com",
      category: "Order Issue",
      description: "Missing sticker pack in order.",
    });
    assert(cmpCompat.customerEmail === "jsmith@gmail.com", "addComplaint maps contactInfo to customerEmail");
    assert(cmpCompat.urgency === "medium", "addComplaint defaults urgency to 'medium'");

    // 3.3 Status updating mechanics & timestamps
    const targetId = newCmp.id;

    await sleep(2);
    // Transition: new -> in_progress
    const progressUpdate = complaintRepo.updateStatus(targetId, "in_progress");
    assert(progressUpdate === true, "updateStatus to 'in_progress' returns true");

    const inProgressCmp = complaintRepo.getById(targetId);
    assert(inProgressCmp.status === "in_progress", "Complaint status is 'in_progress'");
    assert(inProgressCmp.resolvedAt === undefined, "Complaint resolvedAt is undefined while in_progress");
    assert(typeof inProgressCmp.updatedAt === "string" && !isNaN(Date.parse(inProgressCmp.updatedAt)), "updateStatus produces valid ISO updatedAt timestamp");

    await sleep(2);
    // Transition: in_progress -> resolved (with staff notes)
    const resolveUpdate = complaintRepo.updateStatus(targetId, "resolved", "Square terminal updated with NFC.");
    assert(resolveUpdate === true, "updateStatus to 'resolved' returns true");

    const resolvedCmp = complaintRepo.getById(targetId);
    assert(resolvedCmp.status === "resolved", "Complaint status is 'resolved'");
    assert(resolvedCmp.resolvedAt !== undefined && resolvedCmp.resolvedAt.length > 0, "Complaint records resolvedAt timestamp when resolved");
    assert(resolvedCmp.staffNotes === "Square terminal updated with NFC.", "updateStatus updates staffNotes when provided");

    await sleep(2);
    // Transition: resolved -> in_progress (re-opening)
    const reopenUpdate = complaintRepo.updateStatus(targetId, "in_progress");
    assert(reopenUpdate === true, "Re-opening complaint to 'in_progress' succeeds");

    const reopenedCmp = complaintRepo.getById(targetId);
    assert(reopenedCmp.status === "in_progress", "Reopened complaint status is 'in_progress'");
    assert(reopenedCmp.resolvedAt === undefined, "Reopened complaint clears resolvedAt timestamp");
    assert(reopenedCmp.staffNotes === "Square terminal updated with NFC.", "Reopened complaint preserves existing staffNotes when not provided");

    // Invalid ID status update
    const invalidStatus = complaintRepo.updateStatus("non-existent-cmp", "resolved");
    assert(invalidStatus === false, "updateStatus on non-existent ID returns false");

    // 3.4 Staff notes updating mechanics
    const notesUpdate = complaintRepo.updateStaffNotes(targetId, "Booster parent followed up via phone.");
    assert(notesUpdate === true, "updateStaffNotes returns true");

    const updatedNotesCmp = complaintRepo.getById(targetId);
    assert(updatedNotesCmp.staffNotes === "Booster parent followed up via phone.", "Staff notes updated successfully");

    const invalidNotes = complaintRepo.updateStaffNotes("fake-cmp-id", "notes");
    assert(invalidNotes === false, "updateStaffNotes on invalid ID returns false");

    // 3.5 Filtering & Sorting
    const newComplaints = complaintRepo.filterComplaints({ status: "new" });
    assert(newComplaints.every(c => c.status === "new"), "filterComplaints by status 'new' returns only new complaints");

    const kioskComplaints = complaintRepo.filterComplaints({ category: "Campus Kiosk Suggestion" });
    assert(kioskComplaints.every(c => c.category === "Campus Kiosk Suggestion"), "filterComplaints by category returns matching complaints");

    const urgentSort = complaintRepo.filterComplaints({ sortBy: "urgency" });
    const urgencyRank = { urgent: 4, high: 3, medium: 2, low: 1 };
    let isUrgencySorted = true;
    for (let i = 0; i < urgentSort.length - 1; i++) {
      if (urgencyRank[urgentSort[i].urgency] < urgencyRank[urgentSort[i + 1].urgency]) {
        isUrgencySorted = false;
        break;
      }
    }
    assert(isUrgencySorted, "filterComplaints sortBy 'urgency' orders high-to-low");

    const searchFilter = complaintRepo.filterComplaints({ searchQuery: "Apple Pay" });
    assert(searchFilter.length > 0 && searchFilter.some(c => c.id === targetId), "filterComplaints searchQuery finds complaint by description substring");

    // 3.6 Stats
    const stats = complaintRepo.getStats();
    assert(stats.totalComplaints === complaintRepo.getAll().length, "ComplaintStats totalComplaints matches total count");
    assert(stats.newComplaints === complaintRepo.getByStatus("new").length, "ComplaintStats newComplaints matches new count");
    assert(stats.inProgressComplaints === complaintRepo.getByStatus("in_progress").length, "ComplaintStats inProgressComplaints matches in_progress count");
    assert(stats.resolvedComplaints === complaintRepo.getByStatus("resolved").length, "ComplaintStats resolvedComplaints matches resolved count");

    // 3.7 Delete Complaint
    const deleteSuccess = complaintRepo.deleteComplaint(targetId);
    assert(deleteSuccess === true, "deleteComplaint returns true for existing complaint");
    assert(complaintRepo.getById(targetId) === undefined, "Deleted complaint is no longer retrievable");

    const invalidDelete = complaintRepo.deleteComplaint("non-existent-cmp");
    assert(invalidDelete === false, "deleteComplaint returns false for non-existent complaint");
  }

  console.log("\n================================================================================");
  console.log(` 📊 SUMMARY: ${totalTests} total tests | ${passedTests} passed | ${failedTests} failed`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    console.error("FAILURES ENCOUNTERED:");
    findings.forEach((f, i) => console.error(` ${i + 1}. ${f.message}`));
    process.exit(1);
  } else {
    console.log("🌟 ALL EMPIRICAL CHALLENGER 2 STRESS TESTS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  }
}

runStressSuite().catch((err) => {
  console.error("Fatal error during stress suite execution:", err);
  process.exit(1);
});
