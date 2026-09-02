"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  X,
  Send,
  AlertCircle,
  HelpCircle,
  Package,
  Sparkles,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import type {
  ComplaintCategory,
  ComplaintUrgency,
  CreateComplaintInput,
} from "@/types/complaint";
import styles from "./FeedbackDrawer.module.css";

export const FEEDBACK_CATEGORIES: {
  id: ComplaintCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}[] = [
  {
    id: "Order Issue",
    label: "Order Issue",
    icon: Package,
    description: "Missing items, wrong sizes in bag, pickup delays at Room 1104",
  },
  {
    id: "Item Condition / Defect",
    label: "Item Condition / Defect",
    icon: Sparkles,
    description: "Apparel seams, zippers, water bottle seals, print defects",
  },
  {
    id: "Sizing / Stock Request",
    label: "Sizing / Stock Request",
    icon: HelpCircle,
    description: "Restock requests for hoodies, varsity jackets, or sold-out sizes",
  },
  {
    id: "General Grievance",
    label: "General Grievance",
    icon: MessageSquare,
    description: "General school store feedback, student pricing suggestions",
  },
  {
    id: "Campus Service & Hours",
    label: "Campus Service & Hours",
    icon: Clock,
    description: "Kiosk counter operating hours, pep rally schedule pickup",
  },
];

export const URGENCY_OPTIONS: {
  id: ComplaintUrgency;
  label: string;
  sublabel: string;
  className: string;
}[] = [
  {
    id: "Low",
    label: "Low",
    sublabel: "Suggestion / Non-urgent",
    className: styles.urgencyLow,
  },
  {
    id: "Medium",
    label: "Medium",
    sublabel: "Standard Inquiry",
    className: styles.urgencyMedium,
  },
  {
    id: "High",
    label: "High",
    sublabel: "Urgent / Blocker",
    className: styles.urgencyHigh,
  },
];

export interface FeedbackDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: CreateComplaintInput) => void | Promise<void>;
  defaultCategory?: ComplaintCategory;
  defaultUrgency?: ComplaintUrgency;
  productId?: string;
  productName?: string;
}

interface FormState {
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  customerName: string;
  customerContact: string;
  orderNumber: string;
  productId: string;
  description: string;
}

interface ValidationErrors {
  category?: string;
  customerName?: string;
  customerContact?: string;
  description?: string;
}

const INITIAL_FORM_STATE: FormState = {
  category: "Order Issue",
  urgency: "Medium",
  customerName: "",
  customerContact: "",
  orderNumber: "",
  productId: "",
  description: "",
};

export function FeedbackDrawer({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSubmit: propOnSubmit,
  defaultCategory,
  defaultUrgency,
  productId: propProductId,
  productName: propProductName,
}: FeedbackDrawerProps = {}) {
  let storeIsOpen = false;
  let storeCloseDrawer = () => {};
  let storeAddComplaint: ((input: CreateComplaintInput) => unknown) | undefined;
  let storeProducts: { id: string; name: string }[] = [];
  let storeShowToast: ((msg: string, type?: "success" | "info" | "error") => void) | undefined;

  try {
    const store = useStore();
    storeIsOpen = store.isFeedbackDrawerOpen;
    storeCloseDrawer = store.closeFeedbackDrawer;
    storeAddComplaint = store.addComplaint;
    storeProducts = store.products || [];
    storeShowToast = store.showToast;
  } catch {
    // Rendered outside StoreProvider
  }

  const isDrawerOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleCloseCallback = propOnClose || storeCloseDrawer;

  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM_STATE,
    category: defaultCategory || "Order Issue",
    urgency: defaultUrgency || "Medium",
    productId: propProductId || "",
  }));

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const headingId = useId();
  const descId = useId();
  const errorAlertId = useId();

  const reducedMotion = useReducedMotion();

  const resetForm = useCallback(() => {
    setForm({
      ...INITIAL_FORM_STATE,
      category: defaultCategory || "Order Issue",
      urgency: defaultUrgency || "Medium",
      productId: propProductId || "",
    });
    setErrors({});
    setHasSubmitted(false);
    setIsSubmitting(false);
  }, [defaultCategory, defaultUrgency, propProductId]);

  const handleClose = useCallback(() => {
    resetForm();
    handleCloseCallback();
  }, [resetForm, handleCloseCallback]);

  // Body scroll lock and focus management
  useEffect(() => {
    if (!isDrawerOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus({ preventScroll: true });
      }
    };
  }, [isDrawerOpen]);

  // Focus trap inside drawer
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        const drawer = drawerRef.current;
        if (!drawer) return;

        const focusableElements = drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [handleClose]
  );

  // Form field validation
  const validate = useCallback((): boolean => {
    const nextErrors: ValidationErrors = {};

    if (!form.category || !form.category.trim()) {
      nextErrors.category = "Please select a feedback category.";
    }

    if (!form.customerName.trim()) {
      nextErrors.customerName = "Your full name is required.";
    } else if (form.customerName.trim().length < 2) {
      nextErrors.customerName = "Name must be at least 2 characters.";
    }

    const contact = form.customerContact.trim();
    if (!contact) {
      nextErrors.customerContact = "Student email or student ID is required.";
    } else if (contact.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        nextErrors.customerContact = "Please enter a valid email address.";
      }
    } else if (contact.length < 4) {
      nextErrors.customerContact = "Please enter a valid student ID or email.";
    }

    const desc = form.description.trim();
    if (!desc) {
      nextErrors.description = "Detailed description is required.";
    } else if (desc.length < 10) {
      nextErrors.description = `Please provide at least 10 characters (currently ${desc.length}).`;
    } else if (desc.length > 1000) {
      nextErrors.description = `Description exceeds 1000 character limit (currently ${desc.length}).`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  // Handle Input Changes
  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (hasSubmitted) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validate()) {
      setTimeout(() => {
        const drawer = drawerRef.current;
        const firstErrorInput = drawer?.querySelector<HTMLElement>("[aria-invalid='true']");
        firstErrorInput?.focus({ preventScroll: true });
      }, 50);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateComplaintInput = {
        category: form.category,
        urgency: form.urgency,
        customerName: form.customerName.trim(),
        customerEmail: form.customerContact.trim(),
        contactInfo: form.customerContact.trim(),
        orderId: form.orderNumber.trim() || undefined,
        productId: form.productId || undefined,
        description: form.description.trim(),
      };

      if (propOnSubmit) {
        await propOnSubmit(payload);
      } else if (storeAddComplaint) {
        const created = storeAddComplaint(payload) as { id?: string } | undefined;
        if (storeShowToast) {
          const refId = created?.id ? String(created.id) : "";
          const shortRef = refId ? ` #${refId.slice(-6)}` : "";
          storeShowToast(
            `Feedback submitted${shortRef} — Raider Station staff will review your ticket.`,
            "success"
          );
        }
      }

      handleClose();
    } catch (err) {
      setErrors({
        description:
          err instanceof Error
            ? err.message
            : "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drawer Animation Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const drawerVariants = {
    hidden: { x: "100%", opacity: reducedMotion ? 0 : 0.8 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: reducedMotion ? 0 : 0.8 },
  };

  const motionTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.76, 0, 0.24, 1] as const };

  const charCount = form.description.length;
  const isCharCountWarn = charCount > 900 && charCount <= 1000;
  const isCharCountMax = charCount > 1000;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          aria-hidden={!isDrawerOpen}
        >
          <motion.div
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={descId}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={motionTransition}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerText}>
                <div className={styles.eyebrow}>
                  <span className={styles.eyebrowBadge} aria-hidden="true" />
                  Student Support & Feedback
                </div>
                <h2 id={headingId} className={styles.title}>
                  Raider Station Support Desk
                </h2>
                <p id={descId} className={styles.subtitle}>
                  Have an order issue, item defect, sizing request, or campus suggestion?
                  Submit your grievance directly to student staff.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close feedback drawer"
              >
                <X size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className={styles.body} noValidate>
              {/* Error Alert Banner */}
              {Object.keys(errors).length > 0 && (
                <div
                  id={errorAlertId}
                  className={styles.errorBanner}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle size={18} aria-hidden="true" />
                  <div>
                    <strong>Please complete all required fields:</strong>
                    <ul className={styles.errorList}>
                      {Object.values(errors)
                        .filter(Boolean)
                        .map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Topic Category Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label} id="feedback-topic-label">
                  <span>
                    Topic / Category
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>

                <div
                  className={styles.pillGrid}
                  role="radiogroup"
                  aria-labelledby="feedback-topic-label"
                >
                  {FEEDBACK_CATEGORIES.map((cat) => {
                    const isSelected = form.category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`${styles.topicPill} ${
                          isSelected ? styles.topicPillActive : ""
                        }`}
                        onClick={() => updateField("category", cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            updateField("category", cat.id);
                          }
                        }}
                      >
                        <Icon size={14} aria-hidden="true" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <p className={styles.fieldError}>
                    <AlertCircle size={12} /> {errors.category}
                  </p>
                )}
              </div>

              {/* Urgency Level Selector */}
              <div className={styles.formGroup}>
                <label className={styles.label} id="feedback-urgency-label">
                  <span>Urgency Level</span>
                </label>

                <div
                  className={styles.urgencyControl}
                  role="radiogroup"
                  aria-labelledby="feedback-urgency-label"
                >
                  {URGENCY_OPTIONS.map((opt) => {
                    const isSelected = form.urgency === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`${styles.urgencyOption} ${opt.className} ${
                          isSelected ? styles.urgencyOptionActive : ""
                        }`}
                        onClick={() => updateField("urgency", opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            updateField("urgency", opt.id);
                          }
                        }}
                      >
                        <span className={styles.urgencyDot} aria-hidden="true" />
                        <span className={styles.urgencyTitle}>{opt.label}</span>
                        <span className={styles.urgencyDesc}>{opt.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Contact Info Row */}
              <div className={styles.fieldRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="feedback-customer-name" className={styles.label}>
                    <span>
                      Full Name
                      <span className={styles.requiredMark} aria-hidden="true">
                        *
                      </span>
                    </span>
                  </label>
                  <input
                    id="feedback-customer-name"
                    type="text"
                    className={`${styles.input} ${
                      errors.customerName ? styles.inputError : ""
                    }`}
                    placeholder="e.g. Alex Morgan"
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.customerName)}
                    autoComplete="name"
                  />
                  {errors.customerName && (
                    <p className={styles.fieldError}>
                      <AlertCircle size={12} /> {errors.customerName}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="feedback-customer-contact" className={styles.label}>
                    <span>
                      Email or Student ID
                      <span className={styles.requiredMark} aria-hidden="true">
                        *
                      </span>
                    </span>
                  </label>
                  <input
                    id="feedback-customer-contact"
                    type="text"
                    className={`${styles.input} ${
                      errors.customerContact ? styles.inputError : ""
                    }`}
                    placeholder="e.g. student@leanderisd.org"
                    value={form.customerContact}
                    onChange={(e) => updateField("customerContact", e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.customerContact)}
                    autoComplete="email"
                  />
                  {errors.customerContact && (
                    <p className={styles.fieldError}>
                      <AlertCircle size={12} /> {errors.customerContact}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Reference Fields Row */}
              <div className={styles.fieldRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="feedback-order-number" className={styles.label}>
                    <span>Order #</span>
                    <span className={styles.optionalTag}>(Optional)</span>
                  </label>
                  <input
                    id="feedback-order-number"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. RS-98214"
                    value={form.orderNumber}
                    onChange={(e) => updateField("orderNumber", e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="feedback-product-id" className={styles.label}>
                    <span>Related Item</span>
                    <span className={styles.optionalTag}>(Optional)</span>
                  </label>
                  <select
                    id="feedback-product-id"
                    className={styles.select}
                    value={form.productId}
                    onChange={(e) => updateField("productId", e.target.value)}
                  >
                    <option value="">-- Select affected item --</option>
                    {propProductName && propProductId && (
                      <option value={propProductId}>{propProductName}</option>
                    )}
                    {storeProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Description Textarea */}
              <div className={styles.formGroup}>
                <label htmlFor="feedback-description" className={styles.label}>
                  <span>
                    Detailed Description
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </span>
                  <span className={styles.optionalTag}>Min 10 characters</span>
                </label>
                <textarea
                  id="feedback-description"
                  className={`${styles.textarea} ${
                    errors.description ? styles.textareaError : ""
                  }`}
                  placeholder="Please describe what happened, what item/size you need, or your feedback in detail..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(errors.description)}
                />
                <div className={styles.textareaFooter}>
                  <span>
                    {errors.description ? (
                      <span className={styles.fieldError}>
                        <AlertCircle size={12} /> {errors.description}
                      </span>
                    ) : (
                      "Clear descriptions help us resolve tickets faster."
                    )}
                  </span>
                  <span
                    className={`${styles.charCount} ${
                      isCharCountMax
                        ? styles.charCountMax
                        : isCharCountWarn
                        ? styles.charCountWarn
                        : ""
                    }`}
                  >
                    {charCount} / 1000
                  </span>
                </div>
              </div>
            </form>

            {/* Footer / Actions */}
            <div className={styles.footer}>
              <div className={styles.footerButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting ticket..."
                  ) : (
                    <>
                      <span>Submit Grievance</span>
                      <Send size={15} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
              <p className={styles.guaranteeNote}>
                Submitted tickets are routed directly to Raider Station student staff &
                faculty sponsor for review.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackDrawer;
