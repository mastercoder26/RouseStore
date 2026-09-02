"use client";

import React from "react";
import Image from "next/image";

interface SlidingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface SlidingProductsProps {
  items: SlidingItem[];
  onSelect: (item: SlidingItem) => void;
}

export default function SlidingProducts({ items, onSelect }: SlidingProductsProps) {
  const displayItems = [...items, ...items];

  return (
    <div className="sliding-strip-container">
      <div className="sliding-strip-track">
        {displayItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="strip-item-card"
            onClick={() => onSelect(item)}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={52}
              height={52}
              className="strip-thumb"
            />
            <div className="strip-info">
              <h5>{item.name}</h5>
              <span>{item.category} • ${item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
