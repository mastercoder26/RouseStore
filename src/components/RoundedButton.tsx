"use client";

import React, { useState } from "react";
import Magnetic from "./Magnetic";

interface RoundedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "maroon" | "outline";
  strength?: number;
}

export default function RoundedButton({
  children,
  variant = "primary",
  strength = 0.3,
  className = "",
  ...props
}: RoundedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  let bgClasses = "";
  if (variant === "primary") {
    bgClasses = "bg-gradient-to-r from-amber-500 to-amber-600 text-black";
  } else if (variant === "maroon") {
    bgClasses = "bg-[#6e1a27] text-white border border-[#f59e0b]/30";
  } else if (variant === "outline") {
    bgClasses = "bg-transparent text-white border border-white/20";
  }

  return (
    <Magnetic strength={strength}>
      <button
        className={`raider-rounded-btn ${variant} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <span className="btn-content">{children}</span>
        <span className={`btn-circle-fill ${isHovered ? "active" : ""}`} />
      </button>
    </Magnetic>
  );
}
