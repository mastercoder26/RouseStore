"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import styles from "./AdminPinModal.module.css";

interface AdminPinModalProps {
  onSuccess?: () => void;
}

export function AdminPinModal({ onSuccess }: AdminPinModalProps) {
  const router = useRouter();
  const { loginAdmin } = useStore();
  const prefersReducedMotion = useReducedMotion();

  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/shop");
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = pin.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg("Please enter the staff passcode.");
      return;
    }

    setIsSubmitting(true);

    if (trimmed === "raider2026") {
      try {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, "authenticated");
      } catch {
        // storage unavailable
      }
      loginAdmin("raider2026");
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setErrorMsg("Incorrect passcode. Please verify staff credentials.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setIsSubmitting(false);
      setPin("");
      inputRef.current?.focus();
    }
  };

  return (
    <div
      ref={modalRef}
      className={styles.backdrop}
      data-lenis-prevent
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
      aria-describedby="pin-modal-description"
    >
      <motion.div
        className={styles.modal}
        initial={false}
        animate={
          isShaking && !prefersReducedMotion
            ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1, scale: 1, y: 0 }
            : { opacity: 1, scale: 1, y: 0, x: 0 }
        }
        transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className={styles.shieldIconWrapper}>
          <ShieldCheck size={28} strokeWidth={1.75} />
        </div>

        <span className={styles.kicker}>Staff Verification</span>
        <h2 id="pin-modal-title" className={styles.title}>
          Raider Station Staff Access
        </h2>
        <p id="pin-modal-description" className={styles.subtitle}>
          Enter the administrative passcode to access inventory controls, student review moderation, and complaints triage.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="password"
              className={`${styles.pinInput} ${errorMsg ? styles.pinInputError : ""}`}
              placeholder="Enter passcode..."
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              autoComplete="current-password"
              aria-label="Staff passcode"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            <Lock size={15} />
            <span>Unlock Console</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <button
          type="button"
          className={styles.returnLink}
          onClick={() => router.push("/shop")}
        >
          Cancel & Return to Store
        </button>
      </motion.div>
    </div>
  );
}

export default AdminPinModal;
