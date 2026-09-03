"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Check, AlertCircle, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";
import { useStore } from "@/components/StoreProvider";
import StarRating from "./StarRating";
import styles from "./reviews.module.css";

export interface ReviewSubmissionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (review: Review) => void;
}

const GRADE_LEVEL_OPTIONS = [
  "Senior · Class of '26",
  "Junior · Class of '27",
  "Sophomore · Class of '28",
  "Freshman · Class of '29",
  "Faculty / Staff",
  "Alumni / Raider Fan",
];

export default function ReviewSubmissionModal({
  product,
  isOpen,
  onClose,
  onSubmitted,
}: ReviewSubmissionModalProps) {
  const { addReview } = useStore();

  const [rating, setRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>("");
  const [authorGrade, setAuthorGrade] = useState<string>(GRADE_LEVEL_OPTIONS[0]);
  const [isVerifiedStudent, setIsVerifiedStudent] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [recommend, setRecommend] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store trigger element focus before opening and restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      // Lock scroll without shift
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus first input
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        } else if (dialogRef.current) {
          dialogRef.current.focus();
        }
      }, 50);

      return () => {
        document.body.style.overflow = prevOverflow;
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Keyboard navigation & Focus trapping
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    [onClose]
  );

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = "Please select a star rating (1 to 5 stars).";
    }

    if (!authorName.trim()) {
      newErrors.authorName = "Your name or handle is required.";
    } else if (authorName.trim().length < 2) {
      newErrors.authorName = "Name must be at least 2 characters.";
    }

    if (!title.trim()) {
      newErrors.title = "Review headline / summary is required.";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please write a detailed review.";
    } else if (comment.trim().length < 10) {
      newErrors.comment = "Review must be at least 10 characters long.";
    } else if (comment.trim().length > 1000) {
      newErrors.comment = "Review cannot exceed 1,000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      // Focus first error element
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = dialogRef.current?.querySelector<HTMLElement>(`[name="${firstErrorKey}"]`);
        if (el) el.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const created = addReview({
        productId: product.id,
        authorName: authorName.trim(),
        authorGrade: authorGrade.trim(),
        isVerifiedStudent,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        recommend,
        status: "approved",
      });

      if (onSubmitted) {
        onSubmitted(created);
      }

      // Reset form
      setRating(5);
      setAuthorName("");
      setTitle("");
      setComment("");
      setRecommend(true);
      setErrors({});
      onClose();
    } catch (err) {
      console.error("Failed to submit review", err);
      setErrors({ form: "An unexpected error occurred while saving your review. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.modalDialog}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalEyebrow}>
              <Sparkles size={12} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
              Raider Reviews
            </div>
            <h3 id="review-modal-title" className={styles.modalTitle}>
              Write a Review
            </h3>
          </div>

          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="Close review submission dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Product Mini Preview */}
        <div className={styles.productMiniPreview}>
          <div className={styles.productMiniImage}>
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="48px"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <div className={styles.productMiniInfo}>
            <div className={styles.productMiniCategory}>{product.category}</div>
            <div className={styles.productMiniName}>{product.name}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className={styles.formGrid}>
          {errors.form && (
            <div className={styles.formErrorMessage} role="alert">
              <AlertCircle size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
              {errors.form}
            </div>
          )}

          {/* Overall Rating Star Selector */}
          <div className={styles.formField}>
            <label className={styles.formFieldLabel} id="rating-label">
              Overall Score *
            </label>
            <div style={{ marginTop: "4px" }}>
              <StarRating
                value={rating}
                onChange={(val) => {
                  setRating(val);
                  if (errors.rating) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.rating;
                      return copy;
                    });
                  }
                }}
                interactive
                showLabel
                size="lg"
              />
            </div>
            {errors.rating && (
              <span className={styles.formErrorMessage} role="alert">
                {errors.rating}
              </span>
            )}
          </div>

          {/* Author Name */}
          <div className={styles.formField}>
            <label htmlFor="review-author" className={styles.formFieldLabel}>
              Your Name / Handle *
            </label>
            <input
              ref={firstInputRef}
              id="review-author"
              name="authorName"
              type="text"
              className={`${styles.formInput} ${errors.authorName ? styles.formInputError : ""}`}
              placeholder="e.g. Maya T. or Coach Raider"
              value={authorName}
              onChange={(e) => {
                setAuthorName(e.target.value);
                if (errors.authorName) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.authorName;
                    return copy;
                  });
                }
              }}
              aria-invalid={Boolean(errors.authorName)}
              required
            />
            {errors.authorName && (
              <span className={styles.formErrorMessage} role="alert">
                {errors.authorName}
              </span>
            )}
          </div>

          {/* Grade / Role Picker */}
          <div className={styles.formField}>
            <label htmlFor="review-grade" className={styles.formFieldLabel}>
              Grade / School Role <span className={styles.fieldOptional}>(Optional)</span>
            </label>
            <select
              id="review-grade"
              name="authorGrade"
              className={styles.formSelect}
              value={authorGrade}
              onChange={(e) => setAuthorGrade(e.target.value)}
            >
              {GRADE_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Verified Student Toggle */}
          <div className={styles.formField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isVerifiedStudent"
                className={styles.checkboxInput}
                checked={isVerifiedStudent}
                onChange={(e) => setIsVerifiedStudent(e.target.checked)}
              />
              <span>I am currently a Rouse High School student or staff member</span>
            </label>
          </div>

          {/* Review Title */}
          <div className={styles.formField}>
            <label htmlFor="review-headline" className={styles.formFieldLabel}>
              Review Headline *
            </label>
            <input
              id="review-headline"
              name="title"
              type="text"
              className={`${styles.formInput} ${errors.title ? styles.formInputError : ""}`}
              placeholder="e.g. Unreal fleece quality & warm for playoff games!"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.title;
                    return copy;
                  });
                }
              }}
              aria-invalid={Boolean(errors.title)}
              required
            />
            {errors.title && (
              <span className={styles.formErrorMessage} role="alert">
                {errors.title}
              </span>
            )}
          </div>

          {/* Review Comment */}
          <div className={styles.formField}>
            <label htmlFor="review-comment" className={styles.formFieldLabel}>
              Detailed Feedback *
            </label>
            <textarea
              id="review-comment"
              name="comment"
              className={`${styles.formTextarea} ${errors.comment ? styles.formInputError : ""}`}
              placeholder="Tell other students about sizing fit, fabric comfort, durability, or matchday feel..."
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.comment;
                    return copy;
                  });
                }
              }}
              aria-invalid={Boolean(errors.comment)}
              maxLength={1000}
              required
            />
            <div className={styles.charCounter}>
              {comment.length} / 1000 characters (min 10)
            </div>
            {errors.comment && (
              <span className={styles.formErrorMessage} role="alert">
                {errors.comment}
              </span>
            )}
          </div>

          {/* Recommendation Toggle */}
          <div className={styles.formField}>
            <label className={styles.formFieldLabel}>
              Would you recommend this gear to other Raiders?
            </label>
            <div className={styles.radioGroup} role="radiogroup" aria-label="Recommend gear">
              <label
                className={`${styles.radioButtonLabel} ${
                  recommend ? styles.radioButtonSelected : ""
                }`}
              >
                <input
                  type="radio"
                  name="recommend"
                  className={styles.radioButtonInput}
                  checked={recommend === true}
                  onChange={() => setRecommend(true)}
                />
                <Check size={14} /> Yes, I recommend this
              </label>
              <label
                className={`${styles.radioButtonLabel} ${
                  !recommend ? styles.radioButtonSelected : ""
                }`}
              >
                <input
                  type="radio"
                  name="recommend"
                  className={styles.radioButtonInput}
                  checked={recommend === false}
                  onChange={() => setRecommend(false)}
                />
                <X size={14} /> No, not right now
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
