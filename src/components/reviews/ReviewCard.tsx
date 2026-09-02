"use client";

import React, { useState } from "react";
import { ShieldCheck, ThumbsUp, Check } from "lucide-react";
import type { Review } from "@/types/review";
import { useStore } from "@/components/StoreProvider";
import StarRating from "./StarRating";
import styles from "./reviews.module.css";

export interface ReviewCardProps {
  review: Review;
  className?: string;
}

export default function ReviewCard({ review, className = "" }: ReviewCardProps) {
  const { voteReviewHelpful, hasUserVotedReview } = useStore();
  const [justVoted, setJustVoted] = useState(false);

  const author = review.authorName || review.author || "Anonymous Raider";
  const grade = review.authorGrade || review.gradeLevel;
  const isVerified = review.isVerifiedStudent ?? review.verifiedStudent ?? false;
  const isVoted = hasUserVotedReview(review.id) || justVoted;

  const formattedDate = (() => {
    try {
      if (!review.createdAt) return "";
      const d = new Date(review.createdAt);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const handleHelpfulClick = () => {
    if (isVoted) return;
    const success = voteReviewHelpful(review.id);
    if (success) {
      setJustVoted(true);
    }
  };

  return (
    <article className={`${styles.reviewCard} ${className}`} aria-labelledby={`review-title-${review.id}`}>
      <div className={styles.reviewCardTop}>
        <div className={styles.reviewerMeta}>
          <span className={styles.authorName}>{author}</span>
          {isVerified && (
            <span className={styles.verifiedBadge} title="Verified Rouse High School student or staff">
              <ShieldCheck size={11} strokeWidth={2.2} /> Verified Student
            </span>
          )}
          {grade && <span className={styles.gradePill}>{grade}</span>}
        </div>

        {formattedDate && <time className={styles.reviewDate} dateTime={review.createdAt}>{formattedDate}</time>}
      </div>

      <div className={styles.reviewRatingRow}>
        <StarRating value={review.rating} size="sm" readOnly />
      </div>

      {review.title && (
        <h4 id={`review-title-${review.id}`} className={styles.reviewTitle}>
          {review.title}
        </h4>
      )}

      <p className={styles.reviewComment}>{review.comment}</p>

      <div className={styles.reviewFooter}>
        {review.recommend ? (
          <div className={styles.recommendTag}>
            <Check size={14} strokeWidth={2.5} /> Recommends this gear
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          className={`${styles.helpfulButton} ${isVoted ? styles.helpfulButtonVoted : ""}`}
          onClick={handleHelpfulClick}
          disabled={isVoted}
          aria-label={`Mark review as helpful. Currently ${review.helpfulCount || 0} helpful votes.`}
          title={isVoted ? "You found this review helpful" : "Helpful review"}
        >
          <ThumbsUp size={13} strokeWidth={isVoted ? 2.5 : 1.8} />
          <span>
            {isVoted ? "Helpful" : "Helpful"} ({review.helpfulCount || 0})
          </span>
        </button>
      </div>
    </article>
  );
}
