"use client";

import React from "react";

interface RaiderMarqueeProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  "MADE BY RAIDERS, FOR RAIDERS",
  "ROUSE HIGH SCHOOL · LEANDER, TX",
  "MAROON AND GOLD TRADITION",
  "THE RAIDER STATION · ROOM 1104",
  "CAMPUS GEAR & ESSENTIALS",
  "EST. 2008 · HOME OF THE RAIDERS",
];

export default function RaiderMarquee({ items = DEFAULT_ITEMS }: RaiderMarqueeProps) {
  const repeated = [...items, ...items, ...items];

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        padding: "16px 0",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        backgroundColor: "var(--bg-surface)",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "marqueeGlide 28s linear infinite",
          gap: "28px",
        }}
        className="marquee-track"
      >
        {repeated.map((text, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--maroon)",
              whiteSpace: "nowrap",
            }}
          >
            <span>{text}</span>
            <span style={{ opacity: 0.35, color: "var(--gold)", fontSize: "14px" }}>✦</span>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marqueeGlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
