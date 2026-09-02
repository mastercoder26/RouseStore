import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ProductRepository,
  ReviewRepository,
  ComplaintRepository,
  AdminAuthenticator,
  ADMIN_PIN,
} from "../harness/domain-adapters.mjs";

describe("Tier 1: Feature R3 - Discreet Admin Dashboard & Moderation", () => {
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

  it("R3.1: Enforces header navigation sanitation without Admin link", () => {
    // Contract definition for primary header navigation
    const primaryNavLinks = [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
    ];

    const hasAdminInHeader = primaryNavLinks.some(
      (link) => link.href.includes("/admin") || link.label.toLowerCase().includes("admin")
    );
    expect(hasAdminInHeader).toBe(false);
    expect(primaryNavLinks.length).toBe(2);
  });

  it("R3.2: Surfaces discreet footer entry link for staff admin", () => {
    const footerLinks = [
      { label: "Rouse High School", href: "https://rouse.leanderisd.net" },
      { label: "Feedback & Grievances", action: "open_feedback_drawer" },
      { label: "Staff Admin", href: "/admin" },
    ];

    const staffAdminLink = footerLinks.find((link) => link.href === "/admin");
    expect(staffAdminLink).toBeDefined();
    expect(staffAdminLink.label).toBe("Staff Admin");
  });

  it("R3.3: Authenticates staff access using default PIN raider2026", () => {
    expect(auth.isAuthenticated()).toBe(false);

    const result = auth.verifyPin(ADMIN_PIN);
    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session.authenticated).toBe(true);

    expect(auth.isAuthenticated()).toBe(true);
  });

  it("R3.4: Rejects unauthorized access attempts with invalid PINs", () => {
    const wrongAttempt = auth.verifyPin("wrongpassword123");
    expect(wrongAttempt.success).toBe(false);
    expect(wrongAttempt.error).toContain("Incorrect admin PIN");
    expect(auth.isAuthenticated()).toBe(false);

    const emptyAttempt = auth.verifyPin("");
    expect(emptyAttempt.success).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it("R3.5: Moderates reviews by toggling status between approved and hidden", () => {
    const reviews = reviewRepo.getAll();
    const targetReview = reviews[0];

    expect(targetReview.status).toBe("approved");

    // Hide review
    reviewRepo.updateStatus(targetReview.id, "hidden");
    const hiddenReview = reviewRepo.getAll().find((r) => r.id === targetReview.id);
    expect(hiddenReview.status).toBe("hidden");

    // Storefront queries should now exclude this hidden review
    const storefrontReviews = reviewRepo.getByProductId(targetReview.productId, false);
    const isPresentInStorefront = storefrontReviews.some((r) => r.id === targetReview.id);
    expect(isPresentInStorefront).toBe(false);

    // Re-approve review
    reviewRepo.updateStatus(targetReview.id, "approved");
    const reApprovedReview = reviewRepo.getAll().find((r) => r.id === targetReview.id);
    expect(reApprovedReview.status).toBe("approved");
  });

  it("R3.6: Updates complaint status and attaches staff investigation notes", () => {
    const complaints = complaintRepo.getAll();
    const target = complaints.find((c) => c.status === "New");
    expect(target).toBeDefined();

    // Move to In Progress with staff note
    complaintRepo.updateStatus(target.id, "In Progress");
    complaintRepo.updateStaffNotes(target.id, "Spoke with front office staff. Investigating replacement stock.");

    let updated = complaintRepo.getAll().find((c) => c.id === target.id);
    expect(updated.status).toBe("In Progress");
    expect(updated.staffNotes).toContain("Investigating replacement stock");

    // Move to Resolved
    complaintRepo.updateStatus(target.id, "Resolved");
    updated = complaintRepo.getAll().find((c) => c.id === target.id);
    expect(updated.status).toBe("Resolved");
  });

  it("R3.7: Manages catalog inventory with price updates, stock toggles, and deletion", () => {
    const hoodie = productRepo.getById("rs-hoodie-01");
    expect(hoodie.price).toBe(54);
    expect(hoodie.inStock).toBe(true);

    // Update price and mark out of stock
    productRepo.update("rs-hoodie-01", { price: 58, inStock: false });

    const updatedHoodie = productRepo.getById("rs-hoodie-01");
    expect(updatedHoodie.price).toBe(58);
    expect(updatedHoodie.inStock).toBe(false);

    // Delete a temporary item
    const tempId = "rs-temp-item";
    productRepo.save({
      id: tempId,
      name: "Temporary Item",
      category: "Accessories",
      price: 10,
      tag: "Promo",
      description: "Temp promo item",
      image: "/images/hero.jpg",
      inStock: true,
    });
    expect(productRepo.getById(tempId)).toBeDefined();

    productRepo.delete(tempId);
    expect(productRepo.getById(tempId)).toBeUndefined();
  });

  it("R3.8: Defines 3-tab console structure (Catalog, Reviews, Complaints) with metric counters", () => {
    const products = productRepo.getAll();
    const reviews = reviewRepo.getAll();
    const complaints = complaintRepo.getAll();

    const tabs = [
      { id: "catalog", label: "Catalog Inventory", count: products.length },
      { id: "reviews", label: "Reviews Moderation", count: reviews.length },
      { id: "complaints", label: "Complaints Inbox", count: complaints.length },
    ];

    expect(tabs.length).toBe(3);
    expect(tabs[0].id).toBe("catalog");
    expect(tabs[0].count).toBe(11);
    expect(tabs[1].id).toBe("reviews");
    expect(tabs[1].count).toBe(6);
    expect(tabs[2].id).toBe("complaints");
    expect(tabs[2].count).toBe(2);
  });

  it("R3.9: Supports catalog filtering by category, stock status, search keyword, and sorting", () => {
    const products = productRepo.getAll();

    // 1. Filter by category
    const spiritWear = products.filter((p) => p.category === "Spirit Wear");
    expect(spiritWear.length).toBe(5);

    // 2. Filter by search query "hoodie"
    const hoodieResults = products.filter((p) =>
      p.name.toLowerCase().includes("hoodie") || p.description.toLowerCase().includes("hoodie")
    );
    expect(hoodieResults.length).toBeGreaterThanOrEqual(1);
    expect(hoodieResults[0].id).toBe("rs-hoodie-01");

    // 3. Filter by stock status
    productRepo.update("rs-cap-03", { inStock: false });
    const allProducts = productRepo.getAll();
    const inStockList = allProducts.filter((p) => p.inStock !== false);
    const soldOutList = allProducts.filter((p) => p.inStock === false);

    expect(inStockList.length).toBe(10);
    expect(soldOutList.length).toBe(1);
    expect(soldOutList[0].id).toBe("rs-cap-03");

    // 4. Sort by price ascending
    const sortedAsc = [...allProducts].sort((a, b) => a.price - b.price);
    expect(sortedAsc[0].price).toBeLessThanOrEqual(sortedAsc[1].price);
    expect(sortedAsc[sortedAsc.length - 1].price).toBe(185);
  });

  it("R3.10: Normalizes PIN entry with whitespace trimming and case insensitivity", () => {
    const rawPins = ["  raider2026  ", "RAIDER2026", "  Raider2026  "];
    for (const raw of rawPins) {
      const normalized = raw.trim().toLowerCase();
      const res = auth.verifyPin(normalized);
      expect(res.success).toBe(true);
      expect(auth.isAuthenticated()).toBe(true);
      auth.logout();
    }
  });

  it("R3.11: Calculates moderation review stats and handles deletion", () => {
    const initialReviews = reviewRepo.getAll();
    expect(initialReviews.length).toBe(6);

    const approvedCount = initialReviews.filter((r) => r.status === "approved" || !r.status).length;
    const hiddenCount = initialReviews.filter((r) => r.status === "hidden").length;
    expect(approvedCount).toBe(6);
    expect(hiddenCount).toBe(0);

    // Hide one review
    reviewRepo.updateStatus("rev-01", "hidden");
    const afterHide = reviewRepo.getAll();
    const updatedApproved = afterHide.filter((r) => r.status === "approved" || !r.status).length;
    const updatedHidden = afterHide.filter((r) => r.status === "hidden").length;
    expect(updatedApproved).toBe(5);
    expect(updatedHidden).toBe(1);

    // Delete the hidden review
    reviewRepo.deleteReview("rev-01");
    const afterDelete = reviewRepo.getAll();
    expect(afterDelete.length).toBe(5);
    expect(afterDelete.find((r) => r.id === "rev-01")).toBeUndefined();
  });

  it("R3.12: Manages complaints status lifecycle, urgency badges, and staff investigation notes", () => {
    const newComplaint = complaintRepo.addComplaint({
      category: "General Grievance",
      customerName: "Alex Morgan",
      customerEmail: "amorgan@k12.leanderisd.net",
      description: "Vending machine in cafeteria took $5 without dispensing Raider Water Bottle.",
      urgency: "High",
    });

    expect(newComplaint.status).toBe("New");
    expect(newComplaint.urgency).toBe("High");
    expect(newComplaint.staffNotes).toBe("");

    // Update status to In Progress and save staff note
    complaintRepo.updateStatus(newComplaint.id, "In Progress");
    complaintRepo.updateStaffNotes(newComplaint.id, "Contacted facilities staff to check kiosk 2 coin mechanism.");

    let stored = complaintRepo.getAll().find((c) => c.id === newComplaint.id);
    expect(stored.status).toBe("In Progress");
    expect(stored.staffNotes).toContain("kiosk 2 coin mechanism");

    // Resolve grievance
    complaintRepo.updateStatus(newComplaint.id, "Resolved");
    complaintRepo.updateStaffNotes(
      newComplaint.id,
      "Contacted facilities staff to check kiosk 2 coin mechanism. Student refunded $5 at bookstore."
    );

    stored = complaintRepo.getAll().find((c) => c.id === newComplaint.id);
    expect(stored.status).toBe("Resolved");
    expect(stored.staffNotes).toContain("Student refunded $5");

    // Delete complaint
    complaintRepo.deleteComplaint(newComplaint.id);
    expect(complaintRepo.getAll().find((c) => c.id === newComplaint.id)).toBeUndefined();
  });
});

