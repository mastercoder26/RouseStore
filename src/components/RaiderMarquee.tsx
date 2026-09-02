"use client";

import React from "react";

interface RaiderMarqueeProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  "MADE BY RAIDERS, FOR RAIDERS",
  "ONWARD RAIDERS",
  "ROUSE HIGH SCHOOL • LEANDER, TEXAS",
  "THE RAIDER STATION",
  "MAROON AND GOLD",
];

export default function RaiderMarquee({
  items = DEFAULT_ITEMS,
}: RaiderMarqueeProps) {
  return (
    <div className="minimal-marquee-wrap" aria-hidden="true">
      <div className="minimal-marquee-track">
        {[...items, ...items].map((text, idx) => (
          <div key={idx} className="marquee-pill-item">
            <span className="marquee-copy">{text}</span>
            <span className="marquee-bullet">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
