"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, MessageSquare } from "lucide-react";
import type { Product } from "@/types/product";
import { useReviews } from "@/components/StoreProvider";
import RatingBreakdownBars from "./RatingBreakdownBars";
import ReviewCard from "./ReviewCard";
import ReviewSubmissionModal from "./ReviewSubmissionModal";
import styles from "./reviews.module.css";

export interface ProductReviewsSectionProps {
  product: Product;
  className?: string;
}

type SortOption = "newest" | "highest" | "lowest" | "helpful";

export default function ProductReviewsSection({
  product,
  className = "",
}: ProductReviewsSectionProps) {
  const { reviews, ratingSummary } = useReviews(product.id);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Filter and sort reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by star level
    if (selectedRating !== null) {
      result = result.filter((r) => Math.round(r.rating) === selectedRating);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          (r.authorName && r.authorName.toLowerCase().includes(q)) ||
          (r.author && r.author.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.comment && r.comment.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [reviews, selectedRating, searchQuery, sortBy]);

  // Fallback summary if not computed yet
  const summary = ratingSummary || {
    productId: product.id,
    averageRating: 0,
    totalReviews: 0,
    recommendPercentage: 0,
    distribution: {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    },
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  return (
    <section
      id="reviews"
      className={`${styles.reviewsSection} ${className}`}
      aria-labelledby="reviews-section-heading"
    >
      {/* Section Header */}
      <div className={styles.reviewsHeader}>
        <div>
          <div className={styles.reviewsEyebrow}>
            Customer reviews
          </div>
          <h2 id="reviews-section-heading" className={styles.reviewsTitle}>
            Ratings & Reviews
          </h2>
        </div>

        <button
          type="button"
          className={styles.writeReviewButton}
          onClick={() => setIsModalOpen(true)}
          aria-label="Open review submission dialog"
        >
          <Plus size={16} strokeWidth={2.2} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className={styles.reviewsLayout}>
        {/* Left Column: Rating Breakdown Card */}
        <aside aria-label="Ratings summary">
          <RatingBreakdownBars
            summary={summary}
            selectedRating={selectedRating}
            onSelectRating={setSelectedRating}
          />
        </aside>

        {/* Right Column: Filter Toolbar & Review Cards */}
        <div style={{ minWidth: 0 }}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search reviews for keywords"
              />
            </div>

            <div className={styles.sortGroup}>
              <label htmlFor="review-sort-select">Sort by:</label>
              <select
                id="review-sort-select"
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Review Stream */}
          {displayedReviews.length > 0 ? (
            <div className={styles.reviewList}>
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyReviews}>
              <MessageSquare size={32} style={{ color: "var(--maroon)", margin: "0 auto 12px" }} />
              <div className={styles.emptyReviewsTitle}>
                {selectedRating !== null || searchQuery
                  ? "No matching reviews found"
                  : "No reviews yet"}
              </div>
              <p className={styles.emptyReviewsText}>
                {selectedRating !== null || searchQuery
                  ? "Try searching for a different keyword or resetting your star filter."
                  : "Write the first review for this product."}
              </p>

              {selectedRating !== null || searchQuery ? (
                <button
                  type="button"
                  className={styles.clearFilterButton}
                  style={{ maxWidth: "200px", margin: "0 auto" }}
                  onClick={() => {
                    setSelectedRating(null);
                    setSearchQuery("");
                  }}
                >
                  Reset filters
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.writeReviewButton}
                  style={{ margin: "0 auto" }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={16} /> Write the First Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal Dialog */}
      <ReviewSubmissionModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
