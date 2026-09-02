// Domain Adapters and Mathematical Reference Engines for E2E Testing

export const ADMIN_PIN = "raider2026";
export const MOTION_BEZIER = "cubic-bezier(0.76, 0, 0.24, 1)";
export const MOTION_EASING_ARRAY = [0.76, 0, 0.24, 1];

// 1. Storage Driver Reference
export class MemoryStorageDriver {
  constructor(initialData = {}) {
    this.store = new Map(Object.entries(initialData));
  }

  getItem(key) {
    if (!this.store.has(key)) return null;
    return this.store.get(key);
  }

  setItem(key, value) {
    this.store.set(key, value);
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// 2. Rating & Review Mathematical Engine
export function calculateRatingSummary(reviews = []) {
  const approvedReviews = reviews.filter((r) => r.status === "approved" || !r.status);
  const totalReviews = approvedReviews.length;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const distributionPercentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews === 0) {
    return {
      averageRating: 0.0,
      totalReviews: 0,
      recommendPercentage: 0,
      distribution,
      distributionPercentages,
    };
  }

  let totalScore = 0;
  let recommendedCount = 0;

  for (const review of approvedReviews) {
    const star = Math.max(1, Math.min(5, Math.round(review.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
    totalScore += review.rating;
    if (review.isRecommended) {
      recommendedCount++;
    }
  }

  const averageRating = Number((totalScore / totalReviews).toFixed(1));
  const recommendPercentage = Math.round((recommendedCount / totalReviews) * 100);

  for (let star = 1; star <= 5; star++) {
    distributionPercentages[star] = Math.round((distribution[star] / totalReviews) * 100);
  }

  return {
    averageRating,
    totalReviews,
    recommendPercentage,
    distribution,
    distributionPercentages,
  };
}

// 3. Authentic Seed Data
export const SEED_PRODUCTS = [
  {
    id: "rs-hoodie-01",
    name: "Sideline Hoodie",
    category: "Spirit Wear",
    price: 54,
    originalPrice: 65,
    tag: "Athletics",
    description: "Heavyweight maroon fleece hoodie with double-lined hood and gold embroidered Rouse lettering.",
    image: "/images/raider_hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    inStock: true,
  },
  {
    id: "rs-jacket-02",
    name: "Varsity Letterman",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    tag: "Heritage",
    description: "Traditional maroon melton wool body with matte black leather-touch sleeves and gold chenille R crest.",
    image: "/images/raider_jacket.jpg",
    sizes: ["M", "L", "XL", "2XL"],
    inStock: true,
  },
  {
    id: "rs-cap-03",
    name: "Raider Cap",
    category: "Spirit Wear",
    price: 32,
    originalPrice: 38,
    tag: "Sideline",
    description: "Structured six-panel black performance cap with raised gold R embroidery and flex-stretch headband.",
    image: "/images/raider_cap.jpg",
    sizes: ["S/M", "L/XL"],
    inStock: true,
  },
  {
    id: "rs-bomber-06",
    name: "Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    tag: "Outerwear",
    description: "Water-resistant matte nylon shell with breathable mesh lining and storm-flap snap closure.",
    image: "/images/jacket.jpg",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: "rs-sneaker-11",
    name: "Raider Court Low",
    category: "Spirit Wear",
    price: 95,
    originalPrice: 110,
    tag: "Limited Drop",
    description: "Low-profile court sneakers with premium leather uppers, cushioned insole, and gold heel accents.",
    image: "/images/sneaker.jpg",
    sizes: ["8", "9", "10", "11", "12"],
    inStock: true,
  },
  {
    id: "rs-notebook-04",
    name: "Everyday Notebook",
    category: "School Supplies",
    price: 14,
    tag: "College-ruled",
    description: "Durable hardcover journal with 160 college-ruled pages, ribbon placeholder, and gold foil Rouse emblem.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-bottle-05",
    name: "Raider Water Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    tag: "32 oz",
    description: "Double-walled vacuum insulated stainless steel bottle. Keeps drinks cold for 24 hours with spill-proof lid.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Blanket",
    category: "Accessories",
    price: 48,
    tag: "Game Day",
    description: "Plush 50x60 inch maroon sherpa fleece blanket with gold braided edge trim. Perfect for bleacher nights.",
    image: "/images/hero.jpg",
    inStock: true,
  },
  {
    id: "rs-pen-08",
    name: "Precision Gel Pens · 3pk",
    category: "School Supplies",
    price: 9,
    tag: "Black ink",
    description: "Triple pack of 0.5mm smooth-glide archival black gel pens with matte comfort grip barrels.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-coldbrew-09",
    name: "Nitro Cold Brew",
    category: "Snacks & Drinks",
    price: 4.5,
    tag: "12 oz Chilled",
    description: "Locally roasted 12 oz canned nitro cold brew coffee with notes of dark chocolate and caramel.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-protein-10",
    name: "Chocolate Almond Bar",
    category: "Snacks & Drinks",
    price: 3.5,
    tag: "All-natural",
    description: "Handcrafted dark chocolate bar packed with whole roasted almonds and 12g wholesome protein.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
];

export const SEED_REVIEWS = [
  {
    id: "rev-01",
    productId: "rs-hoodie-01",
    authorName: "Maya T.",
    verifiedStudent: true,
    gradeLevel: "Senior '26",
    rating: 5,
    title: "Unreal quality & perfect fit",
    comment: "Super thick fleece, kept me warm all through playoff night games. Embroidered gold lettering has zero fraying.",
    isRecommended: true,
    helpfulCount: 14,
    status: "approved",
    createdAt: "2026-08-20T14:32:00Z",
  },
  {
    id: "rev-02",
    productId: "rs-hoodie-01",
    authorName: "Jordan K.",
    verifiedStudent: true,
    gradeLevel: "Junior '27",
    rating: 5,
    title: "Best high school merch I own",
    comment: "Fits true to size with a relaxed athletic cut. Worn it 10+ times already and washed great.",
    isRecommended: true,
    helpfulCount: 9,
    status: "approved",
    createdAt: "2026-08-22T09:15:00Z",
  },
  {
    id: "rev-03",
    productId: "rs-hoodie-01",
    authorName: "Alex C.",
    verifiedStudent: false,
    rating: 4,
    title: "Great hoodie, sleeves run slightly long",
    comment: "Fleece is ultra-soft. Only tiny note is sleeves are about half an inch longer than standard L, but looks great cuffed.",
    isRecommended: true,
    helpfulCount: 3,
    status: "approved",
    createdAt: "2026-08-25T19:40:00Z",
  },
  {
    id: "rev-04",
    productId: "rs-bottle-05",
    authorName: "Coach Dave",
    verifiedStudent: false,
    rating: 5,
    title: "Ice stays frozen all practice",
    comment: "Fill it up at 7am, ice is still in there when 6th period wraps up. Indestructible powder coat.",
    isRecommended: true,
    helpfulCount: 8,
    status: "approved",
    createdAt: "2026-08-26T11:00:00Z",
  },
  {
    id: "rev-05",
    productId: "rs-jacket-02",
    authorName: "Brandon S.",
    verifiedStudent: true,
    gradeLevel: "Senior '26",
    rating: 5,
    title: "Heirloom grade varsity jacket",
    comment: "The chenille crest is top tier. Worth every penny for senior year memories.",
    isRecommended: true,
    helpfulCount: 12,
    status: "approved",
    createdAt: "2026-08-28T16:20:00Z",
  },
  {
    id: "rev-06",
    productId: "rs-sneaker-11",
    authorName: "Tyler P.",
    verifiedStudent: true,
    gradeLevel: "Sophomore '28",
    rating: 4,
    title: "Super clean court silhouette",
    comment: "Pairs effortlessly with black jeans and sideline shorts. Took 2 days to break in.",
    isRecommended: true,
    helpfulCount: 5,
    status: "approved",
    createdAt: "2026-08-29T10:10:00Z",
  },
];

export const SEED_COMPLAINTS = [
  {
    id: "cmp-01",
    category: "Sizing / Stock Request",
    customerName: "Lucas Vance",
    customerEmail: "l.vance@k12.leanderisd.net",
    description: "The Sideline Maroon Hoodie in size Medium sold out in 2 days. Will there be a restock before Homecoming?",
    urgency: "Medium",
    status: "New",
    staffNotes: "",
    createdAt: "2026-09-01T15:20:00Z",
  },
  {
    id: "cmp-02",
    category: "Order Issue",
    customerName: "Sarah Jenkins",
    customerEmail: "sjenkins@gmail.com",
    description: "Placed an order for Raider Water Bottle during open house pickup, received black cap instead.",
    urgency: "High",
    status: "In Progress",
    staffNotes: "Contacted booster club desk. Replacing at front office Friday morning.",
    createdAt: "2026-09-02T08:45:00Z",
  },
];

// 4. Repositories
export class ProductRepository {
  constructor(storageDriver, seed = SEED_PRODUCTS) {
    this.storage = storageDriver;
    this.storageKey = "raider_station_products";
    if (!this.storage.getItem(this.storageKey)) {
      this.storage.setItem(this.storageKey, JSON.parse(JSON.stringify(seed)));
    }
  }

  getAll() {
    return this.storage.getItem(this.storageKey) || [];
  }

  getById(id) {
    return this.getAll().find((p) => p.id === id);
  }

  save(product) {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      products.push(product);
    }
    this.storage.setItem(this.storageKey, products);
  }

  update(id, updates) {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === id);
    if (index >= 0) {
      products[index] = { ...products[index], ...updates };
      this.storage.setItem(this.storageKey, products);
    }
  }

  delete(id) {
    const products = this.getAll().filter((p) => p.id !== id);
    this.storage.setItem(this.storageKey, products);
  }

  reset() {
    this.storage.setItem(this.storageKey, JSON.parse(JSON.stringify(SEED_PRODUCTS)));
  }
}

export class ReviewRepository {
  constructor(storageDriver, seed = SEED_REVIEWS) {
    this.storage = storageDriver;
    this.storageKey = "raider_station_reviews";
    if (!this.storage.getItem(this.storageKey)) {
      this.storage.setItem(this.storageKey, JSON.parse(JSON.stringify(seed)));
    }
  }

  getAll() {
    return this.storage.getItem(this.storageKey) || [];
  }

  getByProductId(productId, includeHidden = false) {
    return this.getAll().filter((r) => {
      if (r.productId !== productId) return false;
      if (!includeHidden && r.status === "hidden") return false;
      return true;
    });
  }

  getSummary(productId) {
    const reviews = this.getByProductId(productId, false);
    return calculateRatingSummary(reviews);
  }

  addReview(reviewInput) {
    if (!reviewInput.productId) throw new Error("productId is required");
    if (!reviewInput.rating || reviewInput.rating < 1 || reviewInput.rating > 5) {
      throw new Error("rating must be between 1 and 5");
    }
    if (!reviewInput.authorName || !reviewInput.authorName.trim()) {
      throw new Error("authorName is required");
    }
    if (!reviewInput.comment || !reviewInput.comment.trim()) {
      throw new Error("comment is required");
    }

    const reviews = this.getAll();
    const newReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: reviewInput.productId,
      authorName: reviewInput.authorName.trim(),
      verifiedStudent: Boolean(reviewInput.verifiedStudent),
      gradeLevel: reviewInput.gradeLevel || undefined,
      rating: Number(reviewInput.rating),
      title: reviewInput.title ? reviewInput.title.trim() : "",
      comment: reviewInput.comment.trim(),
      isRecommended: reviewInput.isRecommended !== false,
      helpfulCount: 0,
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    this.storage.setItem(this.storageKey, reviews);
    return newReview;
  }

  updateStatus(reviewId, status) {
    const reviews = this.getAll();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index >= 0) {
      reviews[index].status = status;
      this.storage.setItem(this.storageKey, reviews);
    }
  }

  voteHelpful(reviewId) {
    const reviews = this.getAll();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index >= 0) {
      reviews[index].helpfulCount = (reviews[index].helpfulCount || 0) + 1;
      this.storage.setItem(this.storageKey, reviews);
    }
  }

  deleteReview(reviewId) {
    const reviews = this.getAll().filter((r) => r.id !== reviewId);
    this.storage.setItem(this.storageKey, reviews);
  }
}

export class ComplaintRepository {
  constructor(storageDriver, seed = SEED_COMPLAINTS) {
    this.storage = storageDriver;
    this.storageKey = "raider_station_complaints";
    if (!this.storage.getItem(this.storageKey)) {
      this.storage.setItem(this.storageKey, JSON.parse(JSON.stringify(seed)));
    }
  }

  getAll() {
    return this.storage.getItem(this.storageKey) || [];
  }

  addComplaint(complaintInput) {
    if (!complaintInput.category) throw new Error("category is required");
    if (!complaintInput.customerName || !complaintInput.customerName.trim()) {
      throw new Error("customerName is required");
    }
    if (!complaintInput.customerEmail || !complaintInput.customerEmail.includes("@")) {
      throw new Error("valid customerEmail is required");
    }
    if (!complaintInput.description || !complaintInput.description.trim()) {
      throw new Error("description is required");
    }

    const complaints = this.getAll();
    const newComplaint = {
      id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category: complaintInput.category,
      customerName: complaintInput.customerName.trim(),
      customerEmail: complaintInput.customerEmail.trim(),
      description: complaintInput.description.trim(),
      urgency: complaintInput.urgency || "Medium",
      status: "New",
      staffNotes: "",
      createdAt: new Date().toISOString(),
    };

    complaints.unshift(newComplaint);
    this.storage.setItem(this.storageKey, complaints);
    return newComplaint;
  }

  updateStatus(id, status) {
    const complaints = this.getAll();
    const index = complaints.findIndex((c) => c.id === id);
    if (index >= 0) {
      complaints[index].status = status;
      this.storage.setItem(this.storageKey, complaints);
    }
  }

  updateStaffNotes(id, notes) {
    const complaints = this.getAll();
    const index = complaints.findIndex((c) => c.id === id);
    if (index >= 0) {
      complaints[index].staffNotes = notes;
      this.storage.setItem(this.storageKey, complaints);
    }
  }

  deleteComplaint(id) {
    const complaints = this.getAll().filter((c) => c.id !== id);
    this.storage.setItem(this.storageKey, complaints);
  }
}

// 5. Admin Authentication Guard
export class AdminAuthenticator {
  constructor(storageDriver) {
    this.storage = storageDriver;
    this.sessionKey = "raider_station_admin_session";
  }

  verifyPin(pin) {
    if (pin === ADMIN_PIN) {
      const session = {
        authenticated: true,
        unlockedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours
      };
      this.storage.setItem(this.sessionKey, session);
      return { success: true, session };
    }
    return { success: false, error: "Incorrect admin PIN. Default is raider2026." };
  }

  isAuthenticated() {
    const session = this.storage.getItem(this.sessionKey);
    if (!session || !session.authenticated) return false;
    if (new Date(session.expiresAt) < new Date()) {
      this.logout();
      return false;
    }
    return true;
  }

  logout() {
    this.storage.removeItem(this.sessionKey);
  }
}
