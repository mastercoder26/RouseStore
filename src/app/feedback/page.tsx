"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageSquareHeart,
  Package,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import type { ComplaintCategory, ComplaintUrgency } from "@/types";
import styles from "./feedback.module.css";

const CATEGORIES: { id: ComplaintCategory; label: string; icon: typeof Package; desc: string }[] = [
  {
    id: "Order Issue",
    label: "Order Issue",
    icon: Package,
    desc: "Missing item, bag discrepancy, or pickup question",
  },
  {
    id: "Item Condition / Defect",
    label: "Item Defect",
    icon: AlertTriangle,
    desc: "Stitching, print quality, or damaged merchandise",
  },
  {
    id: "Sizing / Stock Request",
    label: "Sizing & Stock",
    icon: Sparkles,
    desc: "Request out-of-stock sizes or new gear restocks",
  },
  {
    id: "General Grievance",
    label: "General Feedback",
    icon: HelpCircle,
    desc: "Store suggestions, compliments, or general campus notes",
  },
];

const URGENCIES: { id: ComplaintUrgency; label: string; badge: string }[] = [
  { id: "low", label: "Low", badge: "Whenever" },
  { id: "medium", label: "Normal", badge: "This Week" },
  { id: "high", label: "High", badge: "Prompt Review" },
  { id: "urgent", label: "Urgent", badge: "Immediate Attention" },
];

export default function FeedbackPage() {
  const { addComplaint, showToast } = useStore();
  const prefersReducedMotion = useReducedMotion();

  const [category, setCategory] = useState<ComplaintCategory>("Order Issue");
  const [urgency, setUrgency] = useState<ComplaintUrgency>("medium");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [description, setDescription] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!studentName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!studentEmail.trim() || !studentEmail.includes("@")) {
      setErrorMessage("Please enter a valid student email address.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Please provide a description of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = addComplaint({
        category,
        urgency,
        customerName: studentName.trim(),
        customerEmail: studentEmail.trim(),
        orderId: orderNumber.trim() || undefined,
        description: description.trim(),
      });

      setSubmittedId(created.id);
      showToast("Your demo feedback has been saved on this device.", "success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedId(null);
    setCategory("Order Issue");
    setUrgency("medium");
    setStudentName("");
    setStudentEmail("");
    setOrderNumber("");
    setDescription("");
    setErrorMessage("");
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Breadcrumb Header */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Store
        </Link>
      </nav>

      <div className={styles.contentWrap}>
        <header className={styles.pageHeader}>
          <div className={styles.headerPill}>
            <MessageSquareHeart size={14} /> Your say
          </div>
          <h1 className={styles.heading}>What’s on<br />your mind?</h1>
          <p className={styles.subheading}>
            A size you’re missing? An idea for the store? We’re all ears. Share feedback or a grievance below.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {submittedId ? (
            <motion.div
              key="success"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
              className={styles.successCard}
            >
              <div className={styles.successIconWrap}>
                <CheckCircle2 size={42} className={styles.successCheck} />
              </div>
              <h2>Feedback Received!</h2>
              <p>
                Reference ticket: <strong>#{submittedId}</strong>
              </p>
              <p className={styles.successNotice}>
                Your feedback is saved on this device for this demo. It has not been sent to school staff.
              </p>
              <div className={styles.successActions}>
                <button type="button" onClick={handleReset} className={styles.submitAnotherBtn}>
                  Submit Another Note
                </button>
                <Link href="/shop" className={styles.shopReturnBtn}>
                  Return to Raider Shop <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
              onSubmit={handleSubmit}
              className={styles.formCard}
            >
              {/* Category Selector */}
              <div className={styles.fieldSection}>
                <label className={styles.sectionLabel}>
                  1. What can we help you with? <span className={styles.required}>*</span>
                </label>
                <div className={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setCategory(cat.id)}
                        className={`${styles.categoryCard} ${isSelected ? styles.categoryCardActive : ""}`}
                      >
                        <div className={styles.categoryIconRow}>
                          <Icon size={18} />
                          <span className={styles.categoryLabel}>{cat.label}</span>
                        </div>
                        <span className={styles.categoryDesc}>{cat.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Contact Info */}
              <div className={styles.fieldRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="studentName" className={styles.inputLabel}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    required
                    placeholder="e.g. Jordan Rivera"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="studentEmail" className={styles.inputLabel}>
                    Student Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="studentEmail"
                    type="email"
                    required
                    placeholder="student@leanderisd.net"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className={styles.textInput}
                  />
                </div>
              </div>

              {/* Order Number (Optional) */}
              <div className={styles.fieldRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="orderNumber" className={styles.inputLabel}>
                    Order Number <span className={styles.optional}>(Optional)</span>
                  </label>
                  <input
                    id="orderNumber"
                    type="text"
                    placeholder="e.g. RS-9482 or in-person bag"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Urgency</label>
                  <div className={styles.urgencyPills}>
                    {URGENCIES.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        aria-pressed={urgency === u.id}
                        onClick={() => setUrgency(u.id)}
                        className={`${styles.urgencyPill} ${urgency === u.id ? styles.urgencyPillActive : ""}`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.inputLabel}>
                  Details <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="Explain what happened or describe the item you're looking for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textareaInput}
                />
              </div>

              {errorMessage && (
                <div className={styles.errorAlert} role="alert">
                  <AlertTriangle size={16} /> {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <div className={styles.formFooter}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? "Saving…" : "Save feedback"}
                </button>
                <p className={styles.privacyNote}>
                  Demo only. Saved on this device, not sent to school staff. Don’t include sensitive information.
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
