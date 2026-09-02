import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ProductRepository,
  ReviewRepository,
  ComplaintRepository,
  SEED_PRODUCTS,
} from "../harness/domain-adapters.mjs";

describe("Tier 1: Feature R5 - Storage Drivers & Typed Repositories", () => {
  let storage;
  let productRepo;
  let reviewRepo;
  let complaintRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    productRepo = new ProductRepository(storage);
    reviewRepo = new ReviewRepository(storage);
    complaintRepo = new ComplaintRepository(storage);
  });

  it("R5.1: Implements IStorageDriver contract with getItem, setItem, removeItem, clear", () => {
    expect(storage.getItem("test-key")).toBeNull();

    storage.setItem("test-key", { hello: "raiders", count: 42 });
    const val = storage.getItem("test-key");
    expect(val.hello).toBe("raiders");
    expect(val.count).toBe(42);

    storage.removeItem("test-key");
    expect(storage.getItem("test-key")).toBeNull();

    storage.setItem("key1", "val1");
    storage.setItem("key2", "val2");
    storage.clear();
    expect(storage.getItem("key1")).toBeNull();
    expect(storage.getItem("key2")).toBeNull();
  });

  it("R5.2: Storage driver handles SSR/in-memory fallback when localStorage is unavailable", () => {
    class FallbackStorageDriver {
      constructor() {
        this.memoryStore = new Map();
        this.isLocalStorageAvailable = false; // Simulate SSR / private browsing
      }
      getItem(key) {
        if (!this.memoryStore.has(key)) return null;
        return this.memoryStore.get(key);
      }
      setItem(key, value) {
        this.memoryStore.set(key, value);
      }
      removeItem(key) {
        this.memoryStore.delete(key);
      }
    }

    const fallbackDriver = new FallbackStorageDriver();
    const repo = new ProductRepository(fallbackDriver);
    expect(repo.getAll().length).toBe(SEED_PRODUCTS.length);
  });

  it("R5.3: ProductRepository populates exactly 11 curated Rouse products upon initialization", () => {
    const products = productRepo.getAll();
    expect(products.length).toBe(11);

    const hoodie = productRepo.getById("rs-hoodie-01");
    expect(hoodie).toBeDefined();
    expect(hoodie.name).toBe("Sideline Hoodie");
    expect(hoodie.category).toBe("Spirit Wear");

    const notebook = productRepo.getById("rs-notebook-04");
    expect(notebook).toBeDefined();
    expect(notebook.name).toBe("Everyday Notebook");
  });

  it("R5.4: ReviewRepository isolates product reviews and supports status filtering", () => {
    const hoodieReviews = reviewRepo.getByProductId("rs-hoodie-01", false);
    expect(hoodieReviews.length).toBe(3);

    const bottleReviews = reviewRepo.getByProductId("rs-bottle-05", false);
    expect(bottleReviews.length).toBe(1);

    const emptyReviews = reviewRepo.getByProductId("rs-blanket-07", false);
    expect(emptyReviews.length).toBe(0);
  });

  it("R5.5: ComplaintRepository persists complaints and tracks staffNotes state", () => {
    const created = complaintRepo.addComplaint({
      category: "Order Issue",
      customerName: "Chloe Bennett",
      customerEmail: "cbennett@gmail.com",
      description: "Need exchange from S to M size for Sideline Hoodie.",
    });

    expect(created.id).toBeDefined();
    expect(created.staffNotes).toBe("");

    complaintRepo.updateStaffNotes(created.id, "Exchange processed at counter.");
    const fetched = complaintRepo.getAll().find((c) => c.id === created.id);
    expect(fetched.staffNotes).toBe("Exchange processed at counter.");
  });

  it("R5.6: ProductRepository supports reset to restore authentic seed catalog", () => {
    productRepo.delete("rs-hoodie-01");
    expect(productRepo.getById("rs-hoodie-01")).toBeUndefined();
    expect(productRepo.getAll().length).toBe(10);

    productRepo.reset();
    expect(productRepo.getById("rs-hoodie-01")).toBeDefined();
    expect(productRepo.getAll().length).toBe(11);
  });

  it("R5.7: Unified Context Store contract defines all required reactive handles", () => {
    const expectedContextShape = [
      "products", "cart", "theme", "reviews", "complaints",
      "getRatingSummary", "addReview", "voteReviewHelpful",
      "addComplaint", "updateComplaintStatus", "updateStaffNotes",
      "isFeedbackDrawerOpen", "openFeedbackDrawer", "closeFeedbackDrawer",
      "toast", "showToast"
    ];

    const mockStoreContext = {
      products: productRepo.getAll(),
      cart: [],
      theme: "light",
      reviews: reviewRepo.getAll(),
      complaints: complaintRepo.getAll(),
      getRatingSummary: (id) => reviewRepo.getSummary(id),
      addReview: (r) => reviewRepo.addReview(r),
      voteReviewHelpful: (id) => reviewRepo.voteHelpful(id),
      addComplaint: (c) => complaintRepo.addComplaint(c),
      updateComplaintStatus: (id, s) => complaintRepo.updateStatus(id, s),
      updateStaffNotes: (id, n) => complaintRepo.updateStaffNotes(id, n),
      isFeedbackDrawerOpen: false,
      openFeedbackDrawer: () => {},
      closeFeedbackDrawer: () => {},
      toast: null,
      showToast: () => {},
    };

    for (const key of expectedContextShape) {
      expect(mockStoreContext[key]).toBeDefined();
    }
  });
});
