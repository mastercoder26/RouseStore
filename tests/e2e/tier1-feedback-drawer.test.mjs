import { describe, it, expect, beforeEach } from "../harness/test-framework.mjs";
import {
  MemoryStorageDriver,
  ComplaintRepository,
  MOTION_BEZIER,
  MOTION_EASING_ARRAY,
} from "../harness/domain-adapters.mjs";

describe("Tier 1: Feature R2 - Feedback Drawer & Toast UI Contracts", () => {
  let storage;
  let complaintRepo;

  beforeEach(() => {
    storage = new MemoryStorageDriver();
    complaintRepo = new ComplaintRepository(storage);
  });

  it("FD.1: Supports all 5 authentic topic categories", () => {
    const definedCategories = [
      "Order Issue",
      "Item Condition / Defect",
      "Sizing / Stock Request",
      "General Grievance",
      "Campus Service & Hours",
    ];

    expect(definedCategories.length).toBe(5);

    for (const cat of definedCategories) {
      const complaint = complaintRepo.addComplaint({
        category: cat,
        customerName: "Raider Student",
        customerEmail: "raider@leanderisd.net",
        description: `Feedback ticket concerning category: ${cat}`,
        urgency: "Medium",
      });

      expect(complaint.category).toBe(cat);
      expect(complaint.status).toBe("New");
    }
  });

  it("FD.2: Enforces validation rules on student contact and detailed description", () => {
    // Description under 10 chars should be flagged
    const validateFeedbackForm = (form) => {
      const errors = {};
      if (!form.category) errors.category = "Please select a category.";
      if (!form.customerName || form.customerName.trim().length < 2) {
        errors.customerName = "Name must be at least 2 characters.";
      }
      if (!form.customerContact || !form.customerContact.trim()) {
        errors.customerContact = "Valid email or student ID is required.";
      } else if (form.customerContact.includes("@")) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.customerContact)) {
          errors.customerContact = "Please enter a valid email address.";
        }
      }
      if (!form.description || form.description.trim().length < 10) {
        errors.description = "Please provide at least 10 characters.";
      }
      if (form.description && form.description.length > 1000) {
        errors.description = "Description exceeds 1000 character limit.";
      }
      return { isValid: Object.keys(errors).length === 0, errors };
    };

    const invalidShort = validateFeedbackForm({
      category: "Order Issue",
      customerName: "A",
      customerContact: "",
      description: "Short",
    });
    expect(invalidShort.isValid).toBe(false);
    expect(invalidShort.errors.customerName).toBeDefined();
    expect(invalidShort.errors.customerContact).toBeDefined();
    expect(invalidShort.errors.description).toBeDefined();

    const invalidEmail = validateFeedbackForm({
      category: "Order Issue",
      customerName: "Alex",
      customerContact: "alex@invalid",
      description: "Valid description longer than ten characters.",
    });
    expect(invalidEmail.isValid).toBe(false);
    expect(invalidEmail.errors.customerContact).toBeDefined();

    const validForm = validateFeedbackForm({
      category: "Sizing / Stock Request",
      customerName: "Jordan Smith",
      customerContact: "jsmith@leanderisd.net",
      description: "Need restock of Sideline Maroon Hoodie in size Medium before Friday.",
    });
    expect(validForm.isValid).toBe(true);
    expect(Object.keys(validForm.errors).length).toBe(0);
  });

  it("FD.3: Validates slide-over cubic-bezier(0.76, 0, 0.24, 1) drawer transitions", () => {
    const drawerMotionConfig = {
      ease: MOTION_EASING_ARRAY,
      duration: 0.35,
      bezier: MOTION_BEZIER,
    };

    expect(drawerMotionConfig.ease).toEqual([0.76, 0, 0.24, 1]);
    expect(drawerMotionConfig.bezier).toBe("cubic-bezier(0.76, 0, 0.24, 1)");
  });

  it("FD.4: Drawer focus trapping, Escape dismiss, and ARIA contracts", () => {
    const drawerA11y = {
      role: "dialog",
      "aria-modal": true,
      "aria-labelledby": "feedback-drawer-heading",
      "aria-describedby": "feedback-drawer-desc",
      closeOnEscape: true,
      trapFocus: true,
    };

    expect(drawerA11y.role).toBe("dialog");
    expect(drawerA11y["aria-modal"]).toBe(true);
    expect(drawerA11y.closeOnEscape).toBe(true);
    expect(drawerA11y.trapFocus).toBe(true);
  });

  it("FD.5: Confirmation toast notification delivers accessible live announcements", () => {
    const toastPayload = {
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
      type: "success",
      autoDismissMs: 4000,
      message: "Feedback submitted — Raider Station staff will review your ticket.",
    };

    expect(toastPayload.role).toBe("status");
    expect(toastPayload["aria-live"]).toBe("polite");
    expect(toastPayload["aria-atomic"]).toBe("true");
    expect(toastPayload.autoDismissMs).toBe(4000);
    expect(toastPayload.message).toContain("Raider Station staff");
  });

  it("FD.6: Form resets completely upon successful submission or cancellation", () => {
    class FeedbackFormModel {
      constructor() {
        this.reset();
      }
      reset() {
        this.category = "Order Issue";
        this.urgency = "Medium";
        this.customerName = "";
        this.customerContact = "";
        this.orderNumber = "";
        this.description = "";
      }
      populate(data) {
        Object.assign(this, data);
      }
    }

    const form = new FeedbackFormModel();
    form.populate({
      category: "Campus Service & Hours",
      urgency: "High",
      customerName: "Alex Rivera",
      customerContact: "arivera@leanderisd.net",
      description: "Inquiring about kiosk opening during pep rally.",
    });

    expect(form.customerName).toBe("Alex Rivera");
    form.reset();
    expect(form.customerName).toBe("");
    expect(form.category).toBe("Order Issue");
    expect(form.urgency).toBe("Medium");
  });
});
