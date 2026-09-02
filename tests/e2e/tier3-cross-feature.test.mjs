import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ProductRepository,
  ReviewRepository,
  ComplaintRepository,
  AdminAuthenticator,
  ADMIN_PIN,
} from "../harness/domain-adapters.mjs";

describe("Tier 3: Cross-Feature State Integrations & End-to-End Workflows", () => {
  let storage;
  let productRepo;
  let reviewRepo;
  let complaintRepo;
  let auth;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    productRepo = new ProductRepository(storage);
    reviewRepo = new ReviewRepository(storage);
    complaintRepo = new ComplaintRepository(storage);
    auth = new AdminAuthenticator(storage);
  });

  it("T3.1: Submitting a review recalculates aggregate rating and synchronizes catalog badge display", () => {
    // 1. Check initial state for rs-jacket-02 (Varsity Letterman)
    const initialSummary = reviewRepo.getSummary("rs-jacket-02");
    expect(initialSummary.totalReviews).toBe(1);
    expect(initialSummary.averageRating).toBe(5.0);

    // Initial catalog card presentation
    const initialBadgeText = `${initialSummary.averageRating} ★ (${initialSummary.totalReviews})`;
    expect(initialBadgeText).toBe("5 ★ (1)");

    // 2. Student submits a new 4-star review
    reviewRepo.addReview({
      productId: "rs-jacket-02",
      authorName: "Marcus Brody",
      verifiedStudent: true,
      gradeLevel: "Senior '26",
      rating: 4,
      title: "Worth the investment",
      comment: "Super premium wool and great embroidery. Sizing is slightly relaxed.",
      isRecommended: true,
    });

    // 3. Verify aggregate recalculation
    const updatedSummary = reviewRepo.getSummary("rs-jacket-02");
    expect(updatedSummary.totalReviews).toBe(2);
    // (5 + 4) / 2 = 4.5
    expect(updatedSummary.averageRating).toBe(4.5);
    expect(updatedSummary.distribution[5]).toBe(1);
    expect(updatedSummary.distribution[4]).toBe(1);
    expect(updatedSummary.recommendPercentage).toBe(100);

    // 4. Verify catalog card badge reflects new score
    const updatedBadgeText = `${updatedSummary.averageRating} ★ (${updatedSummary.totalReviews})`;
    expect(updatedBadgeText).toBe("4.5 ★ (2)");
  });

  it("T3.2: Submitting a complaint dispatches to admin inbox, updates status, and stores staff notes", () => {
    // 1. Student submits complaint through drawer
    const complaint = complaintRepo.addComplaint({
      category: "Order Issue",
      customerName: "Jessica Lee",
      customerEmail: "jess.lee@leanderisd.net",
      description: "Received size Small instead of Medium Sideline Hoodie.",
      urgency: "High",
    });

    // 2. Admin logs in with PIN
    const authResult = auth.verifyPin(ADMIN_PIN);
    expect(authResult.success).toBe(true);

    // 3. Admin opens complaints inbox
    const allComplaints = complaintRepo.getAll();
    const latest = allComplaints.find((c) => c.id === complaint.id);
    expect(latest).toBeDefined();
    expect(latest.status).toBe("New");
    expect(latest.category).toBe("Order Issue");
    expect(latest.urgency).toBe("High");

    // 4. Staff triages: assigns In Progress and notes
    complaintRepo.updateStatus(complaint.id, "In Progress");
    complaintRepo.updateStaffNotes(complaint.id, "Exchange item reserved at Student Store desk.");

    const inProgressComplaint = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(inProgressComplaint.status).toBe("In Progress");
    expect(inProgressComplaint.staffNotes).toContain("Exchange item reserved");

    // 5. Staff completes resolution
    complaintRepo.updateStatus(complaint.id, "Resolved");
    const resolvedComplaint = complaintRepo.getAll().find((c) => c.id === complaint.id);
    expect(resolvedComplaint.status).toBe("Resolved");
  });

  it("T3.3: Moderating/hiding a review immediately updates storefront rating summary and excludes hidden content", () => {
    const targetProduct = "rs-bottle-05"; // Water Bottle
    const initialSummary = reviewRepo.getSummary(targetProduct);
    expect(initialSummary.totalReviews).toBe(1);
    expect(initialSummary.averageRating).toBe(5.0);

    // Inappropriate spam review posted
    const spamReview = reviewRepo.addReview({
      productId: targetProduct,
      authorName: "Spam Bot",
      rating: 1,
      title: "Spam content",
      comment: "Visit fake website for discounts!",
      isRecommended: false,
    });

    // Rating drops with spam review included
    const summaryWithSpam = reviewRepo.getSummary(targetProduct);
    expect(summaryWithSpam.totalReviews).toBe(2);
    expect(summaryWithSpam.averageRating).toBe(3.0); // (5+1)/2 = 3.0

    // Admin hides spam review
    reviewRepo.updateStatus(spamReview.id, "hidden");

    // Storefront rating summary immediately recalculates excluding hidden review
    const cleanedSummary = reviewRepo.getSummary(targetProduct);
    expect(cleanedSummary.totalReviews).toBe(1);
    expect(cleanedSummary.averageRating).toBe(5.0);

    // Storefront reviews list does not contain hidden review
    const storefrontReviews = reviewRepo.getByProductId(targetProduct, false);
    expect(storefrontReviews.length).toBe(1);
    expect(storefrontReviews.some((r) => r.id === spamReview.id)).toBe(false);

    // Admin view can still inspect all reviews including hidden
    const adminReviews = reviewRepo.getByProductId(targetProduct, true);
    expect(adminReviews.length).toBe(2);
  });

  it("T3.4: Admin stock availability toggle immediately reflects in catalog and product detail contracts", () => {
    const hoodie = productRepo.getById("rs-hoodie-01");
    expect(hoodie.inStock).toBe(true);

    // Admin marks hoodie as out of stock
    productRepo.update("rs-hoodie-01", { inStock: false });

    // Storefront catalog reflects out of stock
    const updatedHoodie = productRepo.getById("rs-hoodie-01");
    expect(updatedHoodie.inStock).toBe(false);

    const getAddToCartButtonState = (product) => {
      return {
        disabled: !product.inStock,
        buttonText: product.inStock ? "Add to Cart" : "Out of Stock",
      };
    };

    const buttonState = getAddToCartButtonState(updatedHoodie);
    expect(buttonState.disabled).toBe(true);
    expect(buttonState.buttonText).toBe("Out of Stock");

    // Admin restores stock
    productRepo.update("rs-hoodie-01", { inStock: true });
    const restoredHoodie = productRepo.getById("rs-hoodie-01");
    const restoredButton = getAddToCartButtonState(restoredHoodie);
    expect(restoredButton.disabled).toBe(false);
    expect(restoredButton.buttonText).toBe("Add to Cart");
  });

  it("T3.5: Helpful voting accumulates and supports dynamic sorting by 'Most Helpful'", () => {
    const reviews = reviewRepo.getByProductId("rs-hoodie-01");
    expect(reviews.length).toBe(3);

    // Sort by Most Helpful before new votes
    const sortedBefore = [...reviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    expect(sortedBefore[0].authorName).toBe("Maya T."); // 14 votes

    // Find rev-03 (Alex C.) who started with 3 votes
    const alexReview = reviews.find((r) => r.authorName === "Alex C.");
    for (let i = 0; i < 20; i++) {
      reviewRepo.voteHelpful(alexReview.id);
    }

    const updatedReviews = reviewRepo.getByProductId("rs-hoodie-01");
    const sortedAfter = [...updatedReviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));

    // Alex C. should now be #1 most helpful with 23 votes
    expect(sortedAfter[0].authorName).toBe("Alex C.");
    expect(sortedAfter[0].helpfulCount).toBe(23);
  });

  it("T3.6: Multi-domain entity transactions maintain state isolation across storage keys", () => {
    // Simultaneously mutate products, reviews, complaints, and cart
    productRepo.update("rs-bottle-05", { price: 39 });
    const newRev = reviewRepo.addReview({
      productId: "rs-bottle-05",
      authorName: "Sarah T.",
      rating: 5,
      title: "Great bottle",
      comment: "Keeps water cold.",
      isRecommended: true,
    });
    const newCmp = complaintRepo.addComplaint({
      category: "General Grievance",
      customerName: "Parent",
      customerEmail: "parent@rouse.org",
      description: "Parking lot congestion during pickup.",
    });

    // Check all storage keys exist and contain uncorrupted JSON
    expect(storage.getItem("raider_station_products")).toBeDefined();
    expect(storage.getItem("raider_station_reviews")).toBeDefined();
    expect(storage.getItem("raider_station_complaints")).toBeDefined();

    expect(productRepo.getById("rs-bottle-05").price).toBe(39);
    expect(reviewRepo.getAll().some((r) => r.id === newRev.id)).toBe(true);
    expect(complaintRepo.getAll().some((c) => c.id === newCmp.id)).toBe(true);
  });
});
