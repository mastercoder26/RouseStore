"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import styles from "./ToastNotification.module.css";

export interface ToastNotificationProps {
  message?: string | null;
  type?: "success" | "info" | "error";
  subMessage?: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function ToastNotification({
  message: propMessage,
  type: propType,
  subMessage: propSubMessage,
  onDismiss: propOnDismiss,
  autoDismissMs = 4000,
}: ToastNotificationProps = {}) {
  let storeToast: ReturnType<typeof useStore>["toast"] = null;
  let storeDismissToast: (() => void) | undefined;

  try {
    const store = useStore();
    storeToast = store.toast;
    storeDismissToast = store.dismissToast;
  } catch {
    // Fallback if rendered outside StoreProvider (e.g., in unit tests)
  }

  const activeMessage = propMessage !== undefined ? propMessage : storeToast?.message || null;
  const activeType = propType || storeToast?.type || "info";

  const onDismissRef = useRef(propOnDismiss || storeDismissToast);
  useEffect(() => {
    onDismissRef.current = propOnDismiss || storeDismissToast;
  });

  const handleDismiss = useCallback(() => {
    if (onDismissRef.current) {
      onDismissRef.current();
    }
  }, []);

  const reducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeMessage && autoDismissMs > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeMessage, autoDismissMs, handleDismiss]);

  const typeClass =
    activeType === "success"
      ? styles.toastSuccess
      : activeType === "error"
      ? styles.toastError
      : styles.toastInfo;

  const IconComponent =
    activeType === "success"
      ? CheckCircle2
      : activeType === "error"
      ? AlertCircle
      : Info;

  const springTransition: Transition = reducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 450, damping: 30, mass: 0.8 };

  return (
    <div className={styles.toastContainer} aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        {activeMessage && (
          <motion.div
            key={activeMessage}
            role="status"
            className={`${styles.toast} ${typeClass}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 25, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 15, scale: 0.95 }}
            transition={springTransition}
          >
            <div className={styles.iconWrapper} aria-hidden="true">
              <IconComponent size={18} strokeWidth={2.2} />
            </div>

            <div className={styles.content}>
              <span className={styles.message}>{activeMessage}</span>
              {propSubMessage && (
                <span className={styles.subMessage}>{propSubMessage}</span>
              )}
            </div>

            <button
              type="button"
              className={styles.dismissButton}
              onClick={handleDismiss}
              aria-label="Dismiss notification"
            >
              <X size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ToastNotification;
