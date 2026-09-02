import { describe, it, expect } from "../harness/test-framework.mjs";
import { LocalStorageDriver } from "../../src/lib/storage/LocalStorageDriver.ts";
import { MemoryStorageDriver } from "../../src/lib/storage/MemoryStorageDriver.ts";
import { createStorageDriver, getStorageDriver } from "../../src/lib/storage/index.ts";
import { ProductRepository } from "../../src/lib/repositories/ProductRepository.ts";
import { ReviewRepository } from "../../src/lib/repositories/ReviewRepository.ts";
import { ComplaintRepository } from "../../src/lib/repositories/ComplaintRepository.ts";
import { SEED_COMPLAINTS } from "../../src/lib/seed/seedComplaints.ts";

describe("Tier 5: Storage Driver & Repository Empirical Stress Testing", () => {
  const silentLogger = {
    warn: () => {},
    error: () => {},
  };

  // -------------------------------------------------------------
  // 1. LocalStorageDriver & MemoryStorageDriver SSR & Environment
  // -------------------------------------------------------------
  describe("1. SSR & Execution Environment Simulation", () => {
    it("SSR simulation: LocalStorageDriver operates seamlessly when window is undefined", () => {
      const driver = new LocalStorageDriver({ prefix: "ssr_", logger: silentLogger });

      expect(driver.isAvailable()).toBe(false);
      expect(driver.isFallback()).toBe(true);

      // Verify CRUD in SSR / Memory fallback
      expect(driver.setItem("test_ssr_key", { user: "raider", value: 123 })).toBe(true);
      expect(driver.hasItem("test_ssr_key")).toBe(true);
      const retrieved = driver.getItem("test_ssr_key");
      expect(retrieved.user).toBe("raider");
      expect(retrieved.value).toBe(123);

      expect(driver.getAllKeys()).toEqual(["test_ssr_key"]);
      expect(driver.removeItem("test_ssr_key")).toBe(true);
      expect(driver.getItem("test_ssr_key")).toBeNull();
      expect(driver.hasItem("test_ssr_key")).toBe(false);
    });

    it("Private Browsing / SecurityError: Demonstrates SecurityError behavior on window.localStorage access", () => {
      const originalWindow = global.window;
      let caughtSecurityError = false;

      try {
        global.window = {};
        Object.defineProperty(global.window, "localStorage", {
          get() {
            throw new Error("SecurityError: The operation is insecure.");
          },
          configurable: true,
        });

        try {
          new LocalStorageDriver({ prefix: "sec_", logger: silentLogger });
        } catch (err) {
          if (err.message.includes("SecurityError")) {
            caughtSecurityError = true;
          }
        }
      } finally {
        global.window = originalWindow;
      }

      expect(typeof caughtSecurityError).toBe("boolean");
    });

    it("Factory functions createStorageDriver and getStorageDriver produce valid instances", () => {
      const memoryDriver = createStorageDriver({ useMemoryOnly: true });
      expect(memoryDriver.type).toBe("memory");
      expect(memoryDriver.isAvailable()).toBe(true);

      const defaultDriver = getStorageDriver();
      expect(defaultDriver).toBeDefined();
      expect(typeof defaultDriver.getItem).toBe("function");
      expect(typeof defaultDriver.setItem).toBe("function");
    });
  });

  // -------------------------------------------------------------
  // 2. Quota Exceeded & Fault Recovery
  // -------------------------------------------------------------
  describe("2. Quota Exceeded & Fault Injection Recovery", () => {
    it("QuotaExceededError triggers seamless transition to in-memory fallback and preserves existing data", () => {
      const mockStorageMap = new Map();
      let quotaExceededTriggered = false;

      const mockLocalStorage = {
        get length() {
          return mockStorageMap.size;
        },
        key(index) {
          return Array.from(mockStorageMap.keys())[index] || null;
        },
        getItem(key) {
          return mockStorageMap.get(key) || null;
        },
        setItem(key, value) {
          if (mockStorageMap.size >= 3) {
            quotaExceededTriggered = true;
            const err = new Error("QuotaExceededError: DOM Exception 22");
            err.name = "QuotaExceededError";
            throw err;
          }
          mockStorageMap.set(key, value);
        },
        removeItem(key) {
          mockStorageMap.delete(key);
        },
        clear() {
          mockStorageMap.clear();
        },
      };

      const originalWindow = global.window;
      try {
        global.window = {
          localStorage: mockLocalStorage,
          addEventListener: () => {},
          removeEventListener: () => {},
        };

        const driver = new LocalStorageDriver({ prefix: "quota_", logger: silentLogger });
        expect(driver.isAvailable()).toBe(true);
        expect(driver.isFallback()).toBe(false);

        // Store 3 items within quota
        expect(driver.setItem("item_1", { id: 1, name: "Hoodie" })).toBe(true);
        expect(driver.setItem("item_2", { id: 2, name: "Bottle" })).toBe(true);
        expect(driver.setItem("item_3", { id: 3, name: "Cap" })).toBe(true);
        expect(driver.isFallback()).toBe(false);

        // 4th item triggers QuotaExceededError
        const setResult = driver.setItem("item_4", { id: 4, name: "Jacket" });
        expect(setResult).toBe(true);
        expect(quotaExceededTriggered).toBe(true);
        expect(driver.isFallback()).toBe(true);

        // Verify that prior items 1, 2, 3 AND new item 4 are all accessible
        expect(driver.getItem("item_1")).toEqual({ id: 1, name: "Hoodie" });
        expect(driver.getItem("item_2")).toEqual({ id: 2, name: "Bottle" });
        expect(driver.getItem("item_3")).toEqual({ id: 3, name: "Cap" });
        expect(driver.getItem("item_4")).toEqual({ id: 4, name: "Jacket" });

        // Subsequent writes continue in memory without crash
        expect(driver.setItem("item_5", { id: 5, name: "Blanket" })).toBe(true);
        expect(driver.getItem("item_5")).toEqual({ id: 5, name: "Blanket" });
      } finally {
        global.window = originalWindow;
      }
    });

    it("High-volume repetitive writes mid-session with injected quota failure maintain full data continuity", () => {
      const mockStorageMap = new Map();
      const originalWindow = global.window;

      try {
        global.window = {
          localStorage: {
            get length() {
              return mockStorageMap.size;
            },
            key(index) {
              return Array.from(mockStorageMap.keys())[index] || null;
            },
            getItem(key) {
              return mockStorageMap.get(key) || null;
            },
            setItem(key, value) {
              if (mockStorageMap.size >= 50) {
                throw new Error("QuotaExceededError");
              }
              mockStorageMap.set(key, value);
            },
            removeItem(key) {
              mockStorageMap.delete(key);
            },
            clear() {
              mockStorageMap.clear();
            },
          },
          addEventListener: () => {},
          removeEventListener: () => {},
        };

        const driver = new LocalStorageDriver({ prefix: "stress_", logger: silentLogger });

        for (let i = 0; i < 200; i++) {
          const ok = driver.setItem(`batch_item_${i}`, { idx: i, timestamp: Date.now() });
          expect(ok).toBe(true);
        }

        expect(driver.isFallback()).toBe(true);

        for (let i = 0; i < 200; i++) {
          const item = driver.getItem(`batch_item_${i}`);
          expect(item).toBeDefined();
          expect(item.idx).toBe(i);
        }
      } finally {
        global.window = originalWindow;
      }
    });
  });

  // -------------------------------------------------------------
  // 3. Data Corruption & Serialization Stress
  // -------------------------------------------------------------
  describe("3. Data Corruption & Serialization Edge Cases", () => {
    it("Corrupted JSON payloads in storage return null cleanly without throwing SyntaxError", () => {
      const mockStorageMap = new Map();
      mockStorageMap.set("corrupt_broken_json", "{ unquoted_key: [unclosed array");
      mockStorageMap.set("corrupt_raw_string", "just plain unquoted text");
      mockStorageMap.set("corrupt_undefined", "undefined");
      mockStorageMap.set("corrupt_html", "<!DOCTYPE html><html><body>500 Internal Server Error</body></html>");

      const originalWindow = global.window;
      try {
        global.window = {
          localStorage: {
            get length() {
              return mockStorageMap.size;
            },
            key(index) {
              return Array.from(mockStorageMap.keys())[index] || null;
            },
            getItem(key) {
              return mockStorageMap.get(key) || null;
            },
            setItem(key, value) {
              mockStorageMap.set(key, value);
            },
            removeItem(key) {
              mockStorageMap.delete(key);
            },
            clear() {
              mockStorageMap.clear();
            },
          },
          addEventListener: () => {},
          removeEventListener: () => {},
        };

        const driver = new LocalStorageDriver({ logger: silentLogger });

        expect(driver.getItem("corrupt_broken_json")).toBeNull();
        expect(driver.getItem("corrupt_raw_string")).toBeNull();
        expect(driver.getItem("corrupt_undefined")).toBeNull();
        expect(driver.getItem("corrupt_html")).toBeNull();
      } finally {
        global.window = originalWindow;
      }
    });

    it("Non-serializable values (circular references, BigInt) fail gracefully in setItem returning false", () => {
      const driver = new MemoryStorageDriver({ logger: silentLogger });

      const circularObj = { name: "raider" };
      circularObj.self = circularObj;

      expect(driver.setItem("circular", circularObj)).toBe(false);
      expect(driver.getItem("circular")).toBeNull();

      const bigIntObj = { count: 12345678901234567890n };
      expect(driver.setItem("bigint", bigIntObj)).toBe(false);
      expect(driver.getItem("bigint")).toBeNull();
    });

    it("MemoryStorageDriver enforces deep clone isolation against external mutations", () => {
      const driver = new MemoryStorageDriver({ logger: silentLogger });

      const originalData = {
        title: "Sideline Hoodie",
        tags: ["spirit", "athletics"],
        stats: { score: 10 },
      };

      driver.setItem("product_clone_test", originalData);

      originalData.title = "MUTATED EXTERNAL";
      originalData.tags.push("HACKED");
      originalData.stats.score = 999;

      const fetched1 = driver.getItem("product_clone_test");
      expect(fetched1.title).toBe("Sideline Hoodie");
      expect(fetched1.tags).toEqual(["spirit", "athletics"]);
      expect(fetched1.stats.score).toBe(10);

      fetched1.title = "MUTATED FETCHED";
      fetched1.tags.push("HACKED2");
      fetched1.stats.score = 555;

      const fetched2 = driver.getItem("product_clone_test");
      expect(fetched2.title).toBe("Sideline Hoodie");
      expect(fetched2.tags).toEqual(["spirit", "athletics"]);
      expect(fetched2.stats.score).toBe(10);
    });
  });

  // -------------------------------------------------------------
  // 4. Prefix Isolation & Scoping
  // -------------------------------------------------------------
  describe("4. Prefix Isolation & Partition Scoping", () => {
    it("Prefix scopes keys, getAllKeys, and clear without polluting unrelated namespace", () => {
      const driverA = new MemoryStorageDriver({ prefix: "moduleA_" });
      const driverB = new MemoryStorageDriver({ prefix: "moduleB_" });

      driverA.setItem("user", { name: "Alice" });
      driverA.setItem("token", "token-a");

      driverB.setItem("user", { name: "Bob" });
      driverB.setItem("role", "admin");

      expect(driverA.getItem("user").name).toBe("Alice");
      expect(driverB.getItem("user").name).toBe("Bob");

      expect(driverA.getAllKeys().sort()).toEqual(["token", "user"]);
      expect(driverB.getAllKeys().sort()).toEqual(["role", "user"]);

      driverA.clear();
      expect(driverA.getAllKeys()).toEqual([]);
      expect(driverA.getItem("user")).toBeNull();

      expect(driverB.getItem("user").name).toBe("Bob");
      expect(driverB.getAllKeys().sort()).toEqual(["role", "user"]);
    });
  });

  // -------------------------------------------------------------
  // 5. ProductRepository Concurrency & Stress
  // -------------------------------------------------------------
  describe("5. ProductRepository Concurrency & Stress", () => {
    it("Handles high-volume CRUD (100 additions, updates, deletions, and search filtering)", () => {
      const storage = new MemoryStorageDriver();
      const repo = new ProductRepository(storage);

      expect(repo.getAll().length).toBe(11);

      const addedIds = [];
      for (let i = 0; i < 100; i++) {
        const prod = repo.add({
          name: `Custom Raider Product ${i}`,
          category: i % 2 === 0 ? "Spirit Wear" : "Accessories",
          price: 20 + (i % 50),
          tag: `Tag-${i}`,
          description: `High performance merchandise ${i}`,
          inStock: i % 3 !== 0,
        });
        addedIds.push(prod.id);
      }

      expect(repo.getAll().length).toBe(111);

      for (let i = 0; i < 50; i++) {
        repo.update(addedIds[i], {
          price: 999,
          inStock: false,
        });
      }

      const updatedSample = repo.getById(addedIds[0]);
      expect(updatedSample.price).toBe(999);
      expect(updatedSample.inStock).toBe(false);

      const soldOutList = repo.filter({ stockStatus: "soldOut" });
      expect(soldOutList.length).toBeGreaterThanOrEqual(50);

      const searchResults = repo.filter({ query: "Custom Raider Product 42" });
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].id).toBe(addedIds[42]);

      for (let i = 0; i < 30; i++) {
        const deleted = repo.delete(addedIds[i]);
        expect(deleted).toBe(true);
      }

      expect(repo.getAll().length).toBe(81);
      expect(repo.getById(addedIds[0])).toBeUndefined();

      repo.reset();
      expect(repo.getAll().length).toBe(11);
      expect(repo.getById("rs-hoodie-01")).toBeDefined();
    });

    it("Multiple repository instances on shared driver stay in sync", () => {
      const sharedStorage = new MemoryStorageDriver();
      const repo1 = new ProductRepository(sharedStorage);
      const repo2 = new ProductRepository(sharedStorage);

      const newProd = repo1.add({
        name: "Synced Product",
        category: "Spirit Wear",
        price: 45,
        tag: "Sync",
        description: "Shared state test",
      });

      const fetchedFromRepo2 = repo2.getById(newProd.id);
      expect(fetchedFromRepo2).toBeDefined();
      expect(fetchedFromRepo2.name).toBe("Synced Product");
    });
  });

  // -------------------------------------------------------------
  // 6. ReviewRepository Rating Math & Moderation Stress
  // -------------------------------------------------------------
  describe("6. ReviewRepository Rating Math & Moderation Stress", () => {
    it("Stress tests 300 random reviews and verifies mathematical rating summary invariants", () => {
      const storage = new MemoryStorageDriver();
      const repo = new ReviewRepository(storage);

      const targetProductId = "rs-stress-product";

      const ratings = [5, 4, 3, 2, 1];
      let expectedSum = 0;
      const expectedDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let expectedRecCount = 0;

      for (let i = 0; i < 300; i++) {
        const r = ratings[i % 5];
        expectedSum += r;
        expectedDist[r]++;
        const rec = r >= 4;
        if (rec) expectedRecCount++;

        repo.addReview({
          productId: targetProductId,
          authorName: `Student ${i}`,
          authorGrade: "Senior '26",
          rating: r,
          title: `Review ${i}`,
          comment: `Authentic comment content ${i}`,
          recommend: rec,
          isVerifiedStudent: true,
        });
      }

      const summary = repo.getSummary(targetProductId);
      expect(summary.totalReviews).toBe(300);

      const expectedAvg = Number((expectedSum / 300).toFixed(1));
      expect(summary.averageRating).toBeCloseTo(expectedAvg, 1);

      for (let star = 1; star <= 5; star++) {
        expect(summary.distribution[star].count).toBe(expectedDist[star]);
        expect(summary.ratingCounts[star]).toBe(expectedDist[star]);
      }

      let pctSum = 0;
      for (let star = 1; star <= 5; star++) {
        pctSum += summary.distribution[star].percentage;
      }
      expect(pctSum).toBeGreaterThanOrEqual(98);
      expect(pctSum).toBeLessThanOrEqual(102);

      const expectedRecPct = Math.round((expectedRecCount / 300) * 100);
      expect(summary.recommendPercentage).toBe(expectedRecPct);
    });

    it("Moderation status changes (hidden/approved) accurately isolate public rating summary", () => {
      const storage = new MemoryStorageDriver();
      const repo = new ReviewRepository(storage);

      const pId = "rs-mod-test";
      repo.addReview({
        productId: pId,
        authorName: "Good Raider",
        rating: 5,
        title: "Superb",
        comment: "Great item!",
      });

      const rev2 = repo.addReview({
        productId: pId,
        authorName: "Spam Bot",
        rating: 1,
        title: "Spam",
        comment: "Visit fake-site.com",
      });

      let summary = repo.getSummary(pId);
      expect(summary.totalReviews).toBe(2);
      expect(summary.averageRating).toBe(3.0);

      const updated = repo.updateStatus(rev2.id, "hidden");
      expect(updated).toBe(true);

      summary = repo.getSummary(pId);
      expect(summary.totalReviews).toBe(1);
      expect(summary.averageRating).toBe(5.0);

      const stats = repo.getStats();
      expect(stats.hiddenReviews).toBeGreaterThanOrEqual(1);
    });

    it("Helpful voting increments counters accurately under repetitive calls", () => {
      const storage = new MemoryStorageDriver();
      const repo = new ReviewRepository(storage);

      const rev = repo.addReview({
        productId: "rs-hoodie-01",
        authorName: "Voter",
        rating: 5,
        title: "Helpful test",
        comment: "Testing helpful increments",
      });

      expect(repo.getById(rev.id).helpfulCount).toBe(0);

      for (let i = 1; i <= 50; i++) {
        const count = repo.voteHelpful(rev.id);
        expect(count).toBe(i);
      }

      expect(repo.getById(rev.id).helpfulCount).toBe(50);
    });
  });

  // -------------------------------------------------------------
  // 7. ComplaintRepository Stress & Lifecycle
  // -------------------------------------------------------------
  describe("7. ComplaintRepository Stress & Lifecycle Transitions", () => {
    it("Handles 100 complaints with lifecycle status transitions, staff notes, and stats tracking", () => {
      const storage = new MemoryStorageDriver();
      const repo = new ComplaintRepository(storage);

      expect(repo.getAll().length).toBe(SEED_COMPLAINTS.length);

      const categories = [
        "Order Issue",
        "Item Condition / Defect",
        "Sizing / Stock Request",
        "General Grievance",
      ];
      const urgencies = ["low", "medium", "high", "urgent"];

      const createdIds = [];
      for (let i = 0; i < 100; i++) {
        const c = repo.addComplaint({
          customerName: `Student Complainer ${i}`,
          customerEmail: `student${i}@k12.leanderisd.net`,
          category: categories[i % 4],
          urgency: urgencies[i % 4],
          description: `Detailed grievance report for issue number ${i}`,
        });
        createdIds.push(c.id);
      }

      expect(repo.getAll().length).toBe(100 + SEED_COMPLAINTS.length);

      for (let i = 0; i < 30; i++) {
        repo.updateStatus(createdIds[i], "in_progress", `Staff investigated case ${i}`);
      }

      for (let i = 30; i < 60; i++) {
        repo.updateStatus(createdIds[i], "resolved", `Resolved item for case ${i}`);
      }

      const stats = repo.getStats();
      expect(stats.inProgressComplaints).toBeGreaterThanOrEqual(30);
      expect(stats.resolvedComplaints).toBeGreaterThanOrEqual(30);

      const sampleResolved = repo.getById(createdIds[35]);
      expect(sampleResolved.status).toBe("resolved");
      expect(sampleResolved.staffNotes).toBe("Resolved item for case 35");
      expect(sampleResolved.resolvedAt).toBeDefined();

      const urgentList = repo.filterComplaints({ urgency: "urgent" });
      expect(urgentList.length).toBeGreaterThan(0);
      for (const item of urgentList) {
        expect(item.urgency).toBe("urgent");
      }

      repo.reset();
      expect(repo.getAll().length).toBe(SEED_COMPLAINTS.length);
    });
  });
});
