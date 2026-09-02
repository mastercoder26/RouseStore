"use client";

import React from "react";

interface RaiderMarqueeProps {
  items?: string[];
  speed?: number;
}

const DEFAULT_ITEMS = [
  "MADE BY RAIDERS, FOR RAIDERS",
  "CREATING TRADITIONS THAT OTHERS CAN LIVE UP TO",
  "ROUSE HIGH SCHOOL • LEANDER, TEXAS",
  "HOME OF THE RAIDERS",
  "VARSITY SPIRIT WEAR • CAMPUS ESSENTIALS",
  "THE RAIDER STATION • ROOM 1104",
];

export default function RaiderMarquee({
  items = DEFAULT_ITEMS,
}: RaiderMarqueeProps) {
  return (
    <div className="raider-marquee-container" aria-hidden="true">
      <div className="raider-marquee-track">
        {[...items, ...items].map((text, idx) => (
          <div key={idx} className="raider-marquee-item">
            <span className="marquee-text">{text}</span>
            <span className="marquee-star">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
