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
