"use client";

import React, { useState, useMemo, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Package,
  MessageSquareQuote,
  Inbox,
  Lock,
  ExternalLink,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  useStore,
  subscribeToAdminSession,
  checkAdminSession,
  serverAdminAuth,
} from "@/components/StoreProvider";
import {
  AdminPinModal,
  AdminCatalogTab,
  AdminReviewsTab,
  AdminComplaintsTab,
} from "@/components/admin";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import type { AdminTab } from "@/types/admin";
import styles from "./admin.module.css";

export default function AdminPage() {
  const {
    isAdminAuthenticated,
    logoutAdmin,
    products,
    reviews,
    complaints,
    complaintStats,
    reviewStats,
  } = useStore();

  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<AdminTab>("catalog");
  const isStoredAdmin = useSyncExternalStore(subscribeToAdminSession, checkAdminSession, serverAdminAuth);
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);

  const isUnlocked = isSessionUnlocked || isStoredAdmin || isAdminAuthenticated;

  const tabs = useMemo(
    () => [
      {
        id: "catalog" as AdminTab,
        label: "Catalog Inventory",
        icon: Package,
        count: products.length,
      },
      {
        id: "reviews" as AdminTab,
        label: "Reviews Moderation",
        icon: MessageSquareQuote,
        count: reviews.length,
        alertCount: reviewStats.hiddenReviews,
      },
      {
        id: "complaints" as AdminTab,
        label: "Complaints Inbox",
        icon: Inbox,
        count: complaints.length,
        alertCount: complaintStats.newComplaints,
      },
    ],
    [products.length, reviews.length, reviewStats.hiddenReviews, complaints.length, complaintStats.newComplaints]
  );

  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let targetIndex = index;
      if (e.key === "ArrowRight") {
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        targetIndex = 0;
      } else if (e.key === "End") {
        targetIndex = tabs.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      const targetTab = tabs[targetIndex];
      setActiveTab(targetTab.id);

      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      if (buttons && buttons[targetIndex]) {
        buttons[targetIndex].focus();
      }
    },
    [tabs]
  );

  const handleLockConsole = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch {
      // storage unavailable
    }
    logoutAdmin();
    setIsSessionUnlocked(false);
  };

  // If unauthenticated, show PIN Modal Guard
  if (!isUnlocked) {
    return <AdminPinModal onSuccess={() => setIsSessionUnlocked(true)} />;
  }

  return (
    <div className={styles.adminPage}>
      {/* Admin Header */}
      <div className={styles.adminHeader}>
        <div>
          <span className={styles.kicker}>Behind the counter</span>
          <h1 className={styles.adminTitle}>The staff room.</h1>
          <p className={styles.adminSubtitle}>
            Administrative portal for Rouse High School student store. Manage merchandise inventory, moderate student reviews, and triage incoming grievances.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.lockBtn}
            onClick={handleLockConsole}
            title="Lock administrative console and clear session"
          >
            <Lock size={14} />
            <span>Lock Console</span>
          </button>
          <Link href="/shop" className={styles.viewStoreBtn} target="_blank">
            <span>View Live Shop</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Staff console navigation"
        className={styles.tabNavList}
      >
        {tabs.map((t, idx) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tabNavButton} ${isActive ? styles.tabNavButtonActive : ""}`}
              onClick={() => setActiveTab(t.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
            >
              {isActive && (
                <motion.span
                  layoutId="active-admin-tab"
                  className={styles.tabActiveIndicator}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 450, damping: 35 }
                  }
                />
              )}
              <Icon size={15} className={styles.tabIcon} />
              <span className={styles.tabLabel}>{t.label}</span>
              <span
                className={`${styles.tabCountBadge} ${
                  isActive ? styles.tabCountBadgeActive : ""
                } ${t.alertCount && t.alertCount > 0 ? styles.tabCountBadgeAlert : ""}`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className={styles.tabPanel}
        tabIndex={0}
      >
        {activeTab === "catalog" && <AdminCatalogTab />}
        {activeTab === "reviews" && <AdminReviewsTab />}
        {activeTab === "complaints" && <AdminComplaintsTab />}
      </div>
    </div>
  );
}
