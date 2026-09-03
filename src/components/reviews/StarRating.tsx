"use client";

import React, { useState, useId, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./reviews.module.css";

export interface StarRatingProps {
  value: number; // 0 to 5, fractional supported in display mode
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg" | number;
  interactive?: boolean;
  showLabel?: boolean;
  readOnly?: boolean;
  precision?: "full" | "half" | "fractional";
  className?: string;
  id?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "1 - Poor",
  2: "2 - Fair",
  3: "3 - Good",
  4: "4 - Very Good",
  5: "5 - Excellent / Raider Pride!",
};

export default function StarRating({
  value = 0,
  onChange,
  size = "md",
  interactive = false,
  showLabel = false,
  readOnly = false,
  precision = "fractional",
  className = "",
  id: customId,
}: StarRatingProps) {
  const isInteractive = interactive && !readOnly && typeof onChange === "function";
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const baseId = useId();
  const componentId = customId || baseId;
  const reducedMotion = useReducedMotion();

  // Pixel dimensions for stars
  const starPixelSize = useMemo(() => {
    if (typeof size === "number") return size;
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 26;
      case "md":
      default:
        return 18;
    }
  }, [size]);

  // Determine current displayed score (hover takes precedence during interaction)
  const currentRating = isInteractive && hoverValue !== null ? hoverValue : value;

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (!isInteractive || !onChange) return;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, (value || 0) + 1);
      onChange(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (value || 1) - 1);
      onChange(prev);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(starIndex);
    } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      onChange(parseInt(e.key, 10));
    }
  };

  return (
    <div
      className={`${styles.starRatingContainer} ${className}`}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={
        isInteractive
          ? "Rating out of 5 stars"
          : `${value.toFixed(1)} out of 5 stars`
      }
      onMouseLeave={() => isInteractive && setHoverValue(null)}
    >
      <div className={styles.starGroup}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isHovered = isInteractive && hoverValue === starIndex;
          const isSelected = Math.round(value) === starIndex;

          // Calculate fill fraction (0.0 to 1.0) for this star
          let fillFraction = 0;
          if (isInteractive && hoverValue !== null) {
            fillFraction = hoverValue >= starIndex ? 1 : 0;
          } else if (precision === "full") {
            fillFraction = Math.round(value) >= starIndex ? 1 : 0;
          } else if (precision === "half") {
            const diff = value - (starIndex - 1);
            if (diff >= 0.75) fillFraction = 1;
            else if (diff >= 0.25) fillFraction = 0.5;
            else fillFraction = 0;
          } else {
            // Fractional
            const diff = value - (starIndex - 1);
            fillFraction = Math.max(0, Math.min(1, diff));
          }

          const gradId = `star-grad-${componentId}-${starIndex}`;

          const starContent = (
            <svg
              viewBox="0 0 24 24"
              width={starPixelSize}
              height={starPixelSize}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{
                display: "block",
                overflow: "visible",
                // Keep SSR markup stable; the CSS media query disables motion.
                transition: "transform 180ms cubic-bezier(0.76, 0, 0.24, 1)",
                transform:
                  isInteractive && isHovered && !reducedMotion
                    ? "scale(1.22) rotate(4deg)"
                    : "scale(1)",
              }}
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${fillFraction * 100}%`} stopColor="var(--gold, #cf9b44)" />
                  <stop offset={`${fillFraction * 100}%`} stopColor="var(--line, #ded8cc)" stopOpacity="0.45" />
                </linearGradient>
              </defs>
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={`url(#${gradId})`}
                stroke={fillFraction > 0 ? "var(--gold, #cf9b44)" : "var(--line, #ded8cc)"}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );

          if (isInteractive) {
            const isTabTarget =
              value === starIndex || (value === 0 && starIndex === 1);

            return (
              <button
                key={starIndex}
                type="button"
                className={`${styles.starButton} ${styles.starButtonInteractive}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
                tabIndex={isTabTarget ? 0 : -1}
                onClick={() => onChange && onChange(starIndex)}
                onMouseEnter={() => setHoverValue(starIndex)}
                onFocus={() => setHoverValue(starIndex)}
                onBlur={() => setHoverValue(null)}
                onKeyDown={(e) => handleKeyDown(e, starIndex)}
              >
                {starContent}
              </button>
            );
          }

          return (
            <span key={starIndex} className={styles.starButton}>
              {starContent}
            </span>
          );
        })}
      </div>

      {showLabel && (
        <span className={styles.starLabel} aria-live="polite">
          {currentRating > 0
            ? RATING_LABELS[Math.round(currentRating)] || `${currentRating.toFixed(1)} Stars`
            : "Select a Rating"}
        </span>
      )}
    </div>
  );
}
