"use client";

import React, { useMemo, useState } from "react";
import {
  Inbox,
  Search,
  RotateCcw,
  User,
  Mail,
  Receipt,
  Tag,
  Check,
  Trash2,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useComplaints, useStore } from "@/components/StoreProvider";
import type { ComplaintStatus, ComplaintCategory } from "@/types/complaint";
import styles from "./AdminComplaintsTab.module.css";

const CATEGORY_OPTIONS: ComplaintCategory[] = [
  "Order Issue",
  "Item Condition / Defect",
  "Sizing / Stock Request",
  "Campus Kiosk Suggestion",
  "General Grievance",
];

export function AdminComplaintsTab() {
  const { products } = useStore();
  const {
    complaints,
    updateComplaintStatus,
    updateStaffNotes,
    deleteComplaint,
    resetComplaints,
    complaintStats,
  } = useComplaints();

  const prefersReducedMotion = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Local draft state for staff notes per complaint ID
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});
  const [savedNoteFeedback, setSavedNoteFeedback] = useState<Record<string, boolean>>({});

  const productsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(p.id, p.name);
    }
    return map;
  }, [products]);

  // Normalize status for comparisons (supports both "new" and "New", "in_progress" and "In Progress", "resolved" and "Resolved")
  const normalizeStatus = (status: string): "new" | "in_progress" | "resolved" => {
    const s = (status || "").toLowerCase().replace(/\s+/g, "_");
    if (s.includes("prog")) return "in_progress";
    if (s.includes("resolv")) return "resolved";
    return "new";
  };

  const normalizeUrgency = (urgency: string): "low" | "medium" | "high" => {
    const u = (urgency || "").toLowerCase();
    if (u === "urgent" || u === "high") return "high";
    if (u === "low") return "low";
    return "medium";
  };

  const filteredComplaints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return complaints.filter((c) => {
      const cStatus = normalizeStatus(c.status);
      const matchStatus =
        statusFilter === "all" || cStatus === normalizeStatus(statusFilter);

      const matchCategory =
        categoryFilter === "all" || c.category === categoryFilter;

      const cUrgency = normalizeUrgency(c.urgency);
      const matchUrgency =
        urgencyFilter === "all" || cUrgency === normalizeUrgency(urgencyFilter);

      const customer = c.customerName || "";
      const email = c.customerEmail || c.contactInfo || "";
      const order = c.orderId || "";
      const desc = c.description || "";
      const notes = c.staffNotes || "";

      const matchQuery =
        !q ||
        customer.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        order.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q);

      return matchStatus && matchCategory && matchUrgency && matchQuery;
    });
  }, [complaints, statusFilter, categoryFilter, urgencyFilter, searchQuery]);

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    updateComplaintStatus(id, newStatus);
  };

  const handleNoteChange = (id: string, val: string) => {
    setNotesDrafts((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveNotes = (id: string, currentSavedNotes?: string) => {
    const noteToSave = notesDrafts[id] !== undefined ? notesDrafts[id] : currentSavedNotes || "";
    updateStaffNotes(id, noteToSave);
    setSavedNoteFeedback((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedNoteFeedback((prev) => ({ ...prev, [id]: false }));
    }, 2500);
  };

  const handleDelete = (id: string, name?: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently remove the grievance submitted by "${name || "student"}"?`
      )
    ) {
      deleteComplaint(id);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset complaints inbox to authentic seed dataset? All newly submitted student grievances will be restored."
      )
    ) {
      resetComplaints();
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.tabContainer}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionHeading}>
          <h2 className={styles.tabTitle}>Complaints & Support Inbox</h2>
          <p className={styles.tabSubtitle}>
            Triage student grievances, track item exchanges, coordinate kiosk resolution, and maintain internal staff notes.
          </p>
        </div>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleReset}
          title="Restore authentic seed complaints"
        >
          <RotateCcw size={14} />
          <span>Reset Inbox</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Grievances</span>
          <span className={styles.metricValue}>{complaintStats.totalComplaints}</span>
          <span className={styles.metricHint}>Recorded inquiries</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>New / Triage</span>
          <span className={styles.metricValue}>{complaintStats.newComplaints}</span>
          <span className={styles.metricHint}>Needs initial review</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>In Progress</span>
          <span className={styles.metricValue}>{complaintStats.inProgressComplaints}</span>
          <span className={styles.metricHint}>Being resolved</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Resolved</span>
          <span className={styles.metricValue}>{complaintStats.resolvedComplaints}</span>
          <span className={styles.metricHint}>Closed grievances</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Urgent Blockers</span>
          <span className={styles.metricValue}>{complaintStats.urgentComplaints}</span>
          <span className={styles.metricHint}>High-priority items</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.statusPills} role="group" aria-label="Complaint status filters">
          <button
            type="button"
            className={`${styles.statusPill} ${statusFilter === "all" ? styles.statusPillActive : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({complaints.length})
          </button>
          <button
            type="button"
            className={`${styles.statusPill} ${statusFilter === "new" ? styles.statusPillActive : ""}`}
            onClick={() => setStatusFilter("new")}
          >
            New ({complaintStats.newComplaints})
          </button>
          <button
            type="button"
            className={`${styles.statusPill} ${
              statusFilter === "in_progress" ? styles.statusPillActive : ""
            }`}
            onClick={() => setStatusFilter("in_progress")}
          >
            In Progress ({complaintStats.inProgressComplaints})
          </button>
          <button
            type="button"
            className={`${styles.statusPill} ${
              statusFilter === "resolved" ? styles.statusPillActive : ""
            }`}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved ({complaintStats.resolvedComplaints})
          </button>
        </div>

        <div className={styles.filterControlsRight}>
          <select
            className={styles.selectDropdown}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by grievance category"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={styles.selectDropdown}
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            aria-label="Filter by urgency level"
          >
            <option value="all">All Urgencies</option>
            <option value="high">High / Urgent</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label className={styles.searchWrapper}>
            <Search size={14} />
            <input
              type="search"
              placeholder="Search grievances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search complaints"
            />
          </label>
        </div>
      </div>

      {/* Complaints List */}
      <div className={styles.complaintsList}>
        <AnimatePresence mode="popLayout">
          {filteredComplaints.map((c) => {
            const urgencyNorm = normalizeUrgency(c.urgency);
            const statusNorm = normalizeStatus(c.status);
            const email = c.customerEmail || c.contactInfo || "";
            const currentDraft =
              notesDrafts[c.id] !== undefined ? notesDrafts[c.id] : c.staffNotes || "";
            const isSaved = savedNoteFeedback[c.id];
            const relatedProduct = c.productId ? productsMap.get(c.productId) || c.productId : null;

            return (
              <motion.article
                key={c.id}
                className={styles.complaintCard}
                layout
                initial={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.25, ease: [0.76, 0, 0.24, 1] }
                }
              >
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeftTags}>
                    <span className={styles.categoryBadge}>{c.category}</span>
                    <span
                      className={
                        urgencyNorm === "high"
                          ? styles.urgencyBadgeHigh
                          : urgencyNorm === "medium"
                          ? styles.urgencyBadgeMedium
                          : styles.urgencyBadgeLow
                      }
                    >
                      {urgencyNorm === "high" ? "Urgent" : urgencyNorm === "medium" ? "Medium" : "Low"}
                    </span>
                  </div>

                  <div className={styles.headerRightMeta}>
                    <span className={styles.referenceId}>#{c.id.slice(-7).toUpperCase()}</span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className={styles.customerDetailsRow}>
                  <div className={styles.customerItem}>
                    <User size={13} />
                    <span className={styles.customerName}>{c.customerName}</span>
                  </div>

                  {email && (
                    <div className={styles.customerItem}>
                      <Mail size={13} />
                      <span>{email}</span>
                    </div>
                  )}

                  {c.orderId && (
                    <div className={styles.customerItem}>
                      <Receipt size={13} />
                      <span>Ref: {c.orderId}</span>
                    </div>
                  )}

                  {relatedProduct && (
                    <div className={styles.customerItem}>
                      <Tag size={13} />
                      <span>Item: {relatedProduct}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className={styles.descriptionBox}>{c.description}</div>

                {/* Status & Staff Notes */}
                <div className={styles.statusAndNotesSection}>
                  <div className={styles.statusRow}>
                    <div className={styles.statusLabel}>
                      <Clock size={13} />
                      <span>Resolution Status:</span>
                    </div>

                    <div className={styles.statusSegmented} role="group" aria-label="Resolution status">
                      <button
                        type="button"
                        className={`${styles.statusSegmentBtn} ${
                          statusNorm === "new" ? styles.statusSegmentBtnActiveNew : ""
                        }`}
                        onClick={() => handleStatusChange(c.id, "New" as ComplaintStatus)}
                      >
                        New
                      </button>
                      <button
                        type="button"
                        className={`${styles.statusSegmentBtn} ${
                          statusNorm === "in_progress"
                            ? styles.statusSegmentBtnActiveInProgress
                            : ""
                        }`}
                        onClick={() => handleStatusChange(c.id, "In Progress" as ComplaintStatus)}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        className={`${styles.statusSegmentBtn} ${
                          statusNorm === "resolved"
                            ? styles.statusSegmentBtnActiveResolved
                            : ""
                        }`}
                        onClick={() => handleStatusChange(c.id, "Resolved" as ComplaintStatus)}
                      >
                        Resolved
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(c.id, c.customerName)}
                      title="Delete grievance record"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Staff Notes Box */}
                  <div className={styles.notesContainer}>
                    <div className={styles.notesHeader}>
                      <span className={styles.notesLabel}>
                        <FileText size={12} /> Internal Staff Investigation Notes
                      </span>
                      {isSaved && (
                        <span className={styles.savedConfirmHint}>
                          <Check size={12} /> Notes saved
                        </span>
                      )}
                    </div>

                    <textarea
                      className={styles.notesInput}
                      placeholder="Add internal remarks (e.g. 'Spoke with student; replacement size M issued at kiosk 9/2')..."
                      value={currentDraft}
                      onChange={(e) => handleNoteChange(c.id, e.target.value)}
                      aria-label="Staff notes"
                    />

                    <div className={styles.notesActions}>
                      <button
                        type="button"
                        className={styles.saveNotesBtn}
                        onClick={() => handleSaveNotes(c.id, c.staffNotes)}
                      >
                        <CheckCircle2 size={12} />
                        <span>Save Notes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredComplaints.length === 0 && (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No complaints match your filters</h3>
          <p className={styles.emptyDesc}>
            Try changing the status tabs, selecting all categories, or clearing search keywords.
          </p>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              setStatusFilter("all");
              setCategoryFilter("all");
              setUrgencyFilter("all");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminComplaintsTab;
