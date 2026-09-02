"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  ThumbsUp,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useStore, useReviews } from "@/components/StoreProvider";
import styles from "./AdminReviewsTab.module.css";

export function AdminReviewsTab() {
  const { products } = useStore();
  const {
    allReviews,
    updateReviewStatus,
    deleteReview,
    resetReviews,
    reviewStats,
  } = useReviews();

  const prefersReducedMotion = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "hidden">("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const productsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(p.id, p.name);
    }
    return map;
  }, [products]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allReviews.filter((r) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && (r.status === "approved" || !r.status)) ||
        (statusFilter === "hidden" && r.status === "hidden");

      const matchProduct = productFilter === "all" || r.productId === productFilter;

      const matchRating =
        ratingFilter === "all" || Math.round(r.rating) === parseInt(ratingFilter, 10);

      const productName = productsMap.get(r.productId) || "";
      const author = r.authorName || r.author || "";
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        author.toLowerCase().includes(q) ||
        productName.toLowerCase().includes(q);

      return matchStatus && matchProduct && matchRating && matchQuery;
    });
  }, [allReviews, statusFilter, productFilter, ratingFilter, searchQuery, productsMap]);

  const handleToggleStatus = (id: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "hidden" ? "approved" : "hidden";
    updateReviewStatus(id, nextStatus);
  };

  const handleDelete = (id: string, authorName?: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete this review by "${authorName || "student"}"?`
      )
    ) {
      deleteReview(id);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all student reviews to the authentic initial seed dataset? Any newly submitted or moderated reviews will be restored."
      )
    ) {
      resetReviews();
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.tabContainer}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionHeading}>
          <h2 className={styles.tabTitle}>Reviews Moderation</h2>
          <p className={styles.tabSubtitle}>
            Moderate student product ratings, verify student credentials, toggle public visibility, and inspect feedback metrics.
          </p>
        </div>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleReset}
          title="Restore authentic seed reviews"
        >
          <RotateCcw size={14} />
          <span>Reset Reviews</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Reviews</span>
          <span className={styles.metricValue}>{reviewStats.totalReviews}</span>
          <span className={styles.metricHint}>Submitted entries</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Average Rating</span>
          <span className={styles.metricValue}>
            <Star size={20} className={styles.starIcon} fill="currentColor" />
            {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "0.0"}
          </span>
          <span className={styles.metricHint}>Approved public score</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Approved</span>
          <span className={styles.metricValue}>{reviewStats.approvedReviews}</span>
          <span className={styles.metricHint}>Visible on storefront</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Hidden / Pending</span>
          <span className={styles.metricValue}>{reviewStats.hiddenReviews}</span>
          <span className={styles.metricHint}>Excluded from rating</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Helpful Votes</span>
          <span className={styles.metricValue}>{reviewStats.totalHelpfulVotes}</span>
          <span className={styles.metricHint}>Community upvotes</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.statusPills} role="group" aria-label="Review status filters">
          <button
            type="button"
            className={`${styles.statusPill} ${statusFilter === "all" ? styles.statusPillActive : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Reviews ({allReviews.length})
          </button>
          <button
            type="button"
            className={`${styles.statusPill} ${
              statusFilter === "approved" ? styles.statusPillActive : ""
            }`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved ({reviewStats.approvedReviews})
          </button>
          <button
            type="button"
            className={`${styles.statusPill} ${
              statusFilter === "hidden" ? styles.statusPillActive : ""
            }`}
            onClick={() => setStatusFilter("hidden")}
          >
            Hidden ({reviewStats.hiddenReviews})
          </button>
        </div>

        <div className={styles.filterControlsRight}>
          <select
            className={styles.selectDropdown}
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            aria-label="Filter by product"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className={styles.selectDropdown}
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            aria-label="Filter by star rating"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <label className={styles.searchWrapper}>
            <Search size={14} />
            <input
              type="search"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search reviews"
            />
          </label>
        </div>
      </div>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((r) => {
            const isHidden = r.status === "hidden";
            const productName = productsMap.get(r.productId) || r.productId;
            const author = r.authorName || r.author || "Raider Student";
            const grade = r.authorGrade || r.gradeLevel;
            const isVerified = r.isVerifiedStudent || r.verifiedStudent;

            return (
              <motion.article
                key={r.id}
                className={`${styles.reviewCard} ${isHidden ? styles.reviewCardHidden : ""}`}
                layout
                initial={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.25, ease: [0.76, 0, 0.24, 1] }
                }
              >
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.productInfoGroup}>
                    <Link
                      href={`/shop/${r.productId}`}
                      className={styles.productLink}
                      target="_blank"
                    >
                      <span>{productName}</span>
                      <ExternalLink size={12} />
                    </Link>

                    <div className={styles.metaRow}>
                      {isVerified && (
                        <span className={styles.verifiedBadge}>
                          <ShieldCheck size={11} /> Verified Student
                        </span>
                      )}
                      {grade && <span className={styles.gradeBadge}>{grade}</span>}
                    </div>
                  </div>

                  <div className={styles.statusBadgesGroup}>
                    <div className={styles.starsRow} aria-label={`Rating: ${r.rating} of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= Math.round(r.rating)
                              ? styles.reviewStarFill
                              : styles.reviewStarEmpty
                          }
                          fill={star <= Math.round(r.rating) ? "currentColor" : "none"}
                        />
                      ))}
                      <span className={styles.ratingValueText}>{r.rating}.0</span>
                    </div>

                    {isHidden ? (
                      <span className={styles.statusHiddenBadge}>Hidden</span>
                    ) : (
                      <span className={styles.statusApprovedBadge}>Approved</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={styles.reviewContent}>
                  {r.title && <h3 className={styles.reviewTitle}>{r.title}</h3>}
                  <p className={styles.reviewComment}>{r.comment}</p>
                  {r.recommend && (
                    <span className={styles.recommendTag}>
                      <CheckCircle2 size={13} /> Recommends this gear
                    </span>
                  )}
                </div>

                {/* Footer / Controls */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerLeft}>
                    <span className={styles.authorText}>By {author}</span>
                    <span>·</span>
                    <span>{formatDate(r.createdAt)}</span>
                    <span>·</span>
                    <span className={styles.helpfulBadge}>
                      <ThumbsUp size={12} /> {r.helpfulCount || 0} helpful votes
                    </span>
                  </div>

                  <div className={styles.footerActions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${
                        isHidden ? styles.actionBtnApprove : styles.actionBtnHide
                      }`}
                      onClick={() => handleToggleStatus(r.id, r.status)}
                      title={isHidden ? "Approve review for public display" : "Hide review from storefront"}
                    >
                      {isHidden ? (
                        <>
                          <Eye size={13} /> Approve
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} /> Hide
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      onClick={() => handleDelete(r.id, author)}
                      title="Permanently delete review"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredReviews.length === 0 && (
        <div className={styles.emptyState}>
          <MessageSquareQuote size={32} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No reviews match your filters</h3>
          <p className={styles.emptyDesc}>
            Try clearing your search query, changing status filters, or selecting all products.
          </p>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              setStatusFilter("all");
              setProductFilter("all");
              setRatingFilter("all");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminReviewsTab;
