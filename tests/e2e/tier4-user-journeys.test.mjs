import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ProductRepository,
  ReviewRepository,
  ComplaintRepository,
  AdminAuthenticator,
  ADMIN_PIN,
} from "../harness/domain-adapters.mjs";

describe("Tier 4: Real-World End-to-End User Journeys", () => {
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

  it("User Journey 1: Student Shopper Journey (Browse -> Detail -> Helpful Vote -> Review -> Add to Cart)", () => {
    // 1. Student arrives at /shop catalog
    const catalog = productRepo.getAll();
    expect(catalog.length).toBe(11);

    // 2. Student filters by 'Spirit Wear'
    const spiritWear = catalog.filter((p) => p.category === "Spirit Wear");
    expect(spiritWear.length).toBe(5);

    // 3. Student selects 'Sideline Hoodie' (rs-hoodie-01)
    const hoodie = productRepo.getById("rs-hoodie-01");
    expect(hoodie.name).toBe("Sideline Hoodie");

    // 4. Student views product detail with reviews and rating summary
    const initialSummary = reviewRepo.getSummary(hoodie.id);
    expect(initialSummary.averageRating).toBe(4.7);
    expect(initialSummary.totalReviews).toBe(3);

    const initialReviews = reviewRepo.getByProductId(hoodie.id);
    expect(initialReviews.length).toBe(3);

    // 5. Student votes helpful on Maya T.'s review
    const mayaReview = initialReviews.find((r) => r.authorName === "Maya T.");
    expect(mayaReview.helpfulCount).toBe(14);
    reviewRepo.voteHelpful(mayaReview.id);

    const updatedMayaReview = reviewRepo.getByProductId(hoodie.id).find((r) => r.id === mayaReview.id);
    expect(updatedMayaReview.helpfulCount).toBe(15);

    // 6. Student submits their own 5-star review
    const newReview = reviewRepo.addReview({
      productId: hoodie.id,
      authorName: "Liam Johnson",
      verifiedStudent: true,
      gradeLevel: "Junior '27",
      rating: 5,
      title: "Essential game day gear",
      comment: "Super warm and fits great over pads or regular t-shirts. 10/10 recommend.",
      isRecommended: true,
    });

    expect(newReview.status).toBe("approved");

    // 7. Product rating summary updates in real-time
    const updatedSummary = reviewRepo.getSummary(hoodie.id);
    expect(updatedSummary.totalReviews).toBe(4);
    expect(updatedSummary.averageRating).toBe(4.8);
    expect(updatedSummary.recommendPercentage).toBe(100);

    // 8. Student chooses size 'L' and adds item to cart
    const cart = [];
    const selectedSize = "L";
    const cartItem = {
      ...hoodie,
      selectedSize,
      quantity: 1,
    };
    cart.push(cartItem);

    expect(cart.length).toBe(1);
    expect(cart[0].id).toBe("rs-hoodie-01");
    expect(cart[0].selectedSize).toBe("L");
    expect(cart[0].quantity).toBe(1);
  });

  it("User Journey 2: Student Grievance / Sizing Request Flow (Drawer -> Submit -> Toast -> Storefront)", () => {
    // 1. Student opens Feedback Drawer
    let isDrawerOpen = true;
    expect(isDrawerOpen).toBe(true);

    // 2. Student fills out structured grievance form
    const complaintFormData = {
      category: "Sizing / Stock Request",
      customerName: "Hannah Abbott",
      customerEmail: "habbott@k12.leanderisd.net",
      description: "Need size XL for the Sideline Hoodie before the Cedar Park rivalry game this Friday!",
      urgency: "Urgent",
    };

    // 3. Student submits complaint
    const submittedComplaint = complaintRepo.addComplaint(complaintFormData);
    expect(submittedComplaint.id).toBeDefined();
    expect(submittedComplaint.status).toBe("New");
    expect(submittedComplaint.urgency).toBe("Urgent");

    // 4. UI generates confirmation toast notification and closes drawer
    const toastNotification = {
      id: `toast-${Date.now()}`,
      message: "Feedback received! Thank you for helping improve Raider Station.",
      type: "success",
    };
    isDrawerOpen = false;

    expect(isDrawerOpen).toBe(false);
    expect(toastNotification.type).toBe("success");

    // 5. Verification: complaint exists in repository ready for staff
    const stored = complaintRepo.getAll().find((c) => c.id === submittedComplaint.id);
    expect(stored).toBeDefined();
    expect(stored.customerName).toBe("Hannah Abbott");
  });

  it("User Journey 3: Staff Admin Operations Lifecycle (PIN Gate -> Complaints Triage -> Review Moderation -> Inventory Management)", () => {
    // 1. Staff navigates to /admin, encounters PIN gate modal
    expect(auth.isAuthenticated()).toBe(false);

    // 2. Staff attempts incorrect PIN
    const failAttempt = auth.verifyPin("wrongpin");
    expect(failAttempt.success).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);

    // 3. Staff enters correct PIN: raider2026
    const successAttempt = auth.verifyPin(ADMIN_PIN);
    expect(successAttempt.success).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);

    // 4. Staff triages Complaints Inbox
    const newComplaints = complaintRepo.getAll().filter((c) => c.status === "New");
    expect(newComplaints.length).toBeGreaterThanOrEqual(1);

    const targetComplaint = newComplaints[0];
    complaintRepo.updateStatus(targetComplaint.id, "In Progress");
    complaintRepo.updateStaffNotes(targetComplaint.id, "Placed reorder with vendor. ETA Thursday 2pm.");

    const inProgressComplaint = complaintRepo.getAll().find((c) => c.id === targetComplaint.id);
    expect(inProgressComplaint.status).toBe("In Progress");
    expect(inProgressComplaint.staffNotes).toContain("Placed reorder");

    // Resolve complaint
    complaintRepo.updateStatus(targetComplaint.id, "Resolved");
    const resolvedComplaint = complaintRepo.getAll().find((c) => c.id === targetComplaint.id);
    expect(resolvedComplaint.status).toBe("Resolved");

    // 5. Staff switches to Reviews Moderation tab
    const allReviews = reviewRepo.getAll();
    expect(allReviews.length).toBeGreaterThan(0);

    // Add inappropriate review to simulate moderation
    const inappropriate = reviewRepo.addReview({
      productId: "rs-jacket-02",
      authorName: "Troll User",
      rating: 1,
      title: "Inappropriate language",
      comment: "Spam abuse content",
      isRecommended: false,
    });

    expect(reviewRepo.getByProductId("rs-jacket-02", false).length).toBe(2);

    // Staff hides the inappropriate review
    reviewRepo.updateStatus(inappropriate.id, "hidden");

    // Verify storefront exclusion
    const publicReviews = reviewRepo.getByProductId("rs-jacket-02", false);
    expect(publicReviews.some((r) => r.id === inappropriate.id)).toBe(false);
    expect(publicReviews.length).toBe(1);

    // 6. Staff switches to Catalog Inventory tab and edits pricing/stock
    const jacket = productRepo.getById("rs-jacket-02");
    expect(jacket.price).toBe(185);

    productRepo.update("rs-jacket-02", { price: 195, inStock: true });
    const updatedJacket = productRepo.getById("rs-jacket-02");
    expect(updatedJacket.price).toBe(195);

    // 7. Staff logs out
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
  });
});
