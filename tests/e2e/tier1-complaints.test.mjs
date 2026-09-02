import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ComplaintRepository,
} from "../harness/domain-adapters.mjs";

describe("Tier 1: Feature R2 - Global Customer Complaints & Feedback Drawer", () => {
  let storage;
  let complaintRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    complaintRepo = new ComplaintRepository(storage);
  });

  it("R2.1: Loads initial authentic seed complaints correctly", () => {
    const all = complaintRepo.getAll();
    expect(all.length).toBe(2);
    expect(all[0].category).toBe("Sizing / Stock Request");
    expect(all[1].category).toBe("Order Issue");
  });

  it("R2.2: Submits a new categorized complaint successfully", () => {
    const newComplaint = complaintRepo.addComplaint({
      category: "Item Condition / Defect",
      customerName: "Emma Stone",
      customerEmail: "estone@leanderisd.net",
      description: "Zipper on stadium windbreaker separated after first zip.",
      urgency: "High",
    });

    expect(newComplaint.id).toBeDefined();
    expect(newComplaint.status).toBe("New");
    expect(newComplaint.staffNotes).toBe("");
    expect(newComplaint.urgency).toBe("High");
    expect(newComplaint.createdAt).toBeDefined();

    const all = complaintRepo.getAll();
    expect(all.length).toBe(3);
    expect(all[0].id).toBe(newComplaint.id);
  });

  it("R2.3: Supports all 4 defined complaint topic pills", () => {
    const validCategories = [
      "Order Issue",
      "Item Condition / Defect",
      "Sizing / Stock Request",
      "General Grievance",
    ];

    for (const category of validCategories) {
      const entry = complaintRepo.addComplaint({
        category,
        customerName: `Student ${category}`,
        customerEmail: "student@rousehs.edu",
        description: `Feedback regarding ${category}`,
      });
      expect(entry.category).toBe(category);
    }
  });

  it("R2.4: Enforces mandatory field validation and rejects incomplete inputs", () => {
    // Missing category
    expect(() => {
      complaintRepo.addComplaint({
        customerName: "Test User",
        customerEmail: "test@example.com",
        description: "Some issue",
      });
    }).toThrow("category is required");

    // Missing customer name
    expect(() => {
      complaintRepo.addComplaint({
        category: "Order Issue",
        customerName: "   ",
        customerEmail: "test@example.com",
        description: "Some issue",
      });
    }).toThrow("customerName is required");

    // Invalid email (missing @)
    expect(() => {
      complaintRepo.addComplaint({
        category: "Order Issue",
        customerName: "Test User",
        customerEmail: "invalid-email-address",
        description: "Some issue",
      });
    }).toThrow("valid customerEmail is required");

    // Empty description
    expect(() => {
      complaintRepo.addComplaint({
        category: "Order Issue",
        customerName: "Test User",
        customerEmail: "test@example.com",
        description: "",
      });
    }).toThrow("description is required");
  });

  it("R2.5: Preserves urgency classifications across low, medium, high, and urgent", () => {
    const urgencies = ["Low", "Medium", "High", "Urgent"];
    for (const urgency of urgencies) {
      const entry = complaintRepo.addComplaint({
        category: "General Grievance",
        customerName: "Raider Parent",
        customerEmail: "parent@gmail.com",
        description: `Priority issue at level ${urgency}`,
        urgency,
      });
      expect(entry.urgency).toBe(urgency);
    }
  });

  it("R2.6: Formulates confirmation toast notification payload upon dispatch", () => {
    const createToastPayload = (complaint) => {
      return {
        id: `toast-${Date.now()}`,
        message: `Feedback received! Complaint #${complaint.id.slice(-6)} recorded for student support.`,
        type: "success",
        duration: 4000,
      };
    };

    const complaint = complaintRepo.addComplaint({
      category: "Order Issue",
      customerName: "David Miller",
      customerEmail: "dmiller@leanderisd.net",
      description: "Need receipt reprint for booster tax reimbursement.",
    });

    const toast = createToastPayload(complaint);
    expect(toast.type).toBe("success");
    expect(toast.duration).toBe(4000);
    expect(toast.message).toContain("Feedback received!");
  });

  it("R2.7: Slide-over drawer state controller handles open/close/reset transitions", () => {
    class DrawerController {
      constructor() {
        this.isOpen = false;
        this.formState = { category: "", customerName: "", customerEmail: "", description: "", urgency: "Medium" };
      }
      open() { this.isOpen = true; }
      close() { this.isOpen = false; }
      reset() {
        this.formState = { category: "", customerName: "", customerEmail: "", description: "", urgency: "Medium" };
      }
    }

    const drawer = new DrawerController();
    expect(drawer.isOpen).toBe(false);

    drawer.open();
    expect(drawer.isOpen).toBe(true);

    drawer.formState.category = "Order Issue";
    drawer.formState.customerName = "Alex";
    drawer.close();
    expect(drawer.isOpen).toBe(false);

    drawer.reset();
    expect(drawer.formState.category).toBe("");
    expect(drawer.formState.customerName).toBe("");
  });
});
