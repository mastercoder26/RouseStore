"use client";

import React from "react";
import { ThumbsUp, X } from "lucide-react";
import type { ProductRatingSummary } from "@/types/review";
import StarRating from "./StarRating";
import styles from "./reviews.module.css";

export interface RatingBreakdownBarsProps {
  summary: ProductRatingSummary;
  selectedRating?: number | null;
  onSelectRating?: (rating: number | null) => void;
  className?: string;
}

export default function RatingBreakdownBars({
  summary,
  selectedRating = null,
  onSelectRating,
  className = "",
}: RatingBreakdownBarsProps) {
  const {
    averageRating = 0,
    totalReviews = 0,
    recommendPercentage = 0,
    distribution,
    ratingCounts,
  } = summary;

  const starLevels: Array<5 | 4 | 3 | 2 | 1> = [5, 4, 3, 2, 1];

  const handleStarClick = (star: number) => {
    if (!onSelectRating) return;
    if (selectedRating === star) {
      onSelectRating(null);
    } else {
      onSelectRating(star);
    }
  };

  return (
    <div className={`${styles.breakdownCard} ${className}`}>
      {/* Big Score & Rating Summary */}
      <div className={styles.summaryScoreBlock}>
        <span className={styles.summaryBigScore}>
          {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
        </span>
        <span className={styles.summaryScoreMax}>/ 5.0</span>
      </div>

      <div className={styles.summaryStarsRow}>
        <StarRating value={averageRating} size="md" readOnly />
      </div>

      <div className={styles.summaryReviewCount}>
        {totalReviews === 0
          ? "No student reviews yet"
          : `Based on ${totalReviews} verified ${
              totalReviews === 1 ? "review" : "reviews"
            }`}
      </div>

      {/* Recommendation Banner */}
      {totalReviews > 0 && recommendPercentage > 0 && (
        <div className={styles.recommendBanner}>
          <ThumbsUp size={15} />
          <span>
            <strong>{recommendPercentage}%</strong> of Raider students recommend this gear
          </span>
        </div>
      )}

      {/* 5-to-1 Star Distribution Breakdown */}
      <div className={styles.barsList} role="region" aria-label="Rating breakdown by star level">
        {starLevels.map((star) => {
          const item = distribution?.[star];
          const count = item?.count ?? ratingCounts?.[star] ?? 0;
          const percentage =
            item?.percentage ??
            (totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0);
          const isSelected = selectedRating === star;

          return (
            <button
              key={star}
              type="button"
              className={`${styles.barRow} ${isSelected ? styles.barRowActive : ""}`}
              onClick={() => handleStarClick(star)}
              aria-label={`Filter by ${star} star reviews: ${count} reviews (${percentage}%)`}
              aria-pressed={isSelected}
            >
              <span className={styles.barLabel}>
                {star} <span style={{ color: "var(--gold)" }}>★</span>
              </span>

              <div className={styles.barTrack} aria-hidden="true">
                <div
                  className={styles.barFill}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className={styles.barStats}>
                {count} <span style={{ color: "var(--muted)", fontSize: "10px" }}>({percentage}%)</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Clear Filter Prompt */}
      {selectedRating !== null && onSelectRating && (
        <button
          type="button"
          className={styles.clearFilterButton}
          onClick={() => onSelectRating(null)}
        >
          <X size={12} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
          Showing {selectedRating}★ reviews only · Clear filter
        </button>
      )}
    </div>
  );
}
