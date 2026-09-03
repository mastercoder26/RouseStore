"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, THEMES } from "@/components/StoreProvider";

const subscribeToHydration = () => () => {};
const serverTheme = () => THEMES[0].id;

export default function ThemeSelector() {
  const { theme, setTheme } = useStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the server markup stable while the head script applies the saved
  // palette. Once hydrated, the control reflects the provider's actual theme.
  const displayTheme = useSyncExternalStore(subscribeToHydration, () => theme, serverTheme);
  const activeTheme = THEMES.find((t) => t.id === displayTheme) || THEMES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Current colorway: ${activeTheme.name}. Click to change theme.`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "44px",
          padding: "0 14px",
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--line)",
          background: "var(--bg-surface)",
          color: "var(--ink)",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "border-color 180ms ease, background-color 180ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--line-focus)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--line)";
        }}
      >
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: activeTheme.colors.accent,
            boxShadow: `0 0 0 2px ${activeTheme.colors.surface}, 0 0 0 3px ${activeTheme.colors.accent}`,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span className="theme-btn-label" style={{ letterSpacing: "-0.01em" }}>
          {activeTheme.name.split(" ")[0]}
        </span>
        <Palette size={14} style={{ opacity: 0.6, marginLeft: "2px" }} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "280px",
              backgroundColor: "var(--bg-elevated)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-md)",
              padding: "8px",
              zIndex: 500,
            }}
            role="menu"
            aria-label="Theme Selection"
          >
            <div
              style={{
                padding: "8px 10px 6px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                borderBottom: "1px solid var(--line)",
                marginBottom: "6px",
              }}
            >
              Select Colorway
            </div>

            {THEMES.map((opt) => {
              const isSelected = opt.id === theme;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 10px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isSelected ? "var(--maroon-subtle)" : "transparent",
                    color: isSelected ? "var(--maroon)" : "var(--ink)",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: opt.colors.bg,
                          border: "1px solid rgba(128,128,128,0.25)",
                        }}
                      />
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: opt.colors.accent,
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: isSelected ? 600 : 500 }}>
                        {opt.name}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--muted)", lineHeight: 1.2 }}>
                        {opt.description.slice(0, 36)}...
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
