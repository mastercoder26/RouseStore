"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import type { ProductRatingSummary } from "@/types/review";
import styles from "./reviews.module.css";

export interface ProductRatingBadgeProps {
  productId?: string;
  summary?: ProductRatingSummary | null;
  rating?: number;
  totalReviews?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  linkToReviews?: boolean;
  hideIfZero?: boolean;
  className?: string;
}

export default function ProductRatingBadge({
  productId,
  summary: propSummary,
  rating: propRating,
  totalReviews: propTotalReviews,
  size = "sm",
  showCount = true,
  linkToReviews = false,
  hideIfZero = false,
  className = "",
}: ProductRatingBadgeProps) {
  const { allRatingSummaries, getRatingSummary } = useStore();

  // Resolve rating and review count from direct props, propSummary, or store
  let avgRating = 0;
  let count = 0;

  if (typeof propRating === "number") {
    avgRating = propRating;
    count = propTotalReviews ?? 0;
  } else if (propSummary) {
    avgRating = propSummary.averageRating;
    count = propSummary.totalReviews;
  } else if (productId) {
    const storeSummary = allRatingSummaries[productId] || getRatingSummary(productId);
    if (storeSummary) {
      avgRating = storeSummary.averageRating;
      count = storeSummary.totalReviews;
    }
  }

  const hasReviews = count > 0;
  const sizeClass = size === "md" ? styles.ratingBadgeMd : styles.ratingBadgeSm;
  const iconSize = size === "md" ? 14 : 11;

  if (!hasReviews && hideIfZero) {
    // Preserve layout container height to prevent CLS
    return <div className={`${styles.ratingBadge} ${sizeClass} ${className}`} aria-hidden="true" />;
  }

  const badgeContent = (
    <div
      className={`${styles.ratingBadge} ${sizeClass} ${
        linkToReviews && productId ? styles.ratingBadgeClickable : ""
      } ${className}`}
      aria-label={
        hasReviews
          ? `Rated ${avgRating.toFixed(1)} out of 5 stars from ${count} reviews`
          : "No reviews yet"
      }
    >
      <span className={styles.ratingBadgeStar} aria-hidden="true">
        <Star
          size={iconSize}
          fill={hasReviews ? "var(--gold, #cf9b44)" : "none"}
          color={hasReviews ? "var(--gold, #cf9b44)" : "var(--muted, #6b645b)"}
          strokeWidth={1.8}
        />
      </span>

      {hasReviews ? (
        <>
          <span className={styles.ratingBadgeScore}>{avgRating.toFixed(1)}</span>
          {showCount && <span className={styles.ratingBadgeCount}>({count})</span>}
        </>
      ) : (
        <span className={styles.ratingBadgeEmpty}>No reviews yet</span>
      )}
    </div>
  );

  if (linkToReviews && productId) {
    return (
      <Link
        href={`/shop/${productId}#reviews`}
        className={styles.ratingBadgeClickable}
        title="Jump to customer reviews"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
