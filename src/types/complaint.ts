/**
 * src/types/complaint.ts
 * Domain models for customer complaints, feedback drawer submissions, and admin moderation inbox.
 */

export type ComplaintCategory =
  | "Order Issue"
  | "Item Condition / Defect"
  | "Sizing / Stock Request"
  | "Campus Kiosk Suggestion"
  | "General Grievance"
  | string;

export type ComplaintUrgency =
  | "low"
  | "medium"
  | "high"
  | "urgent"
  | "Low"
  | "Medium"
  | "High"
  | "Urgent"
  | string;

export type ComplaintStatus = "new" | "in_progress" | "resolved";

export interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  contactInfo?: string; // Optional compatibility alias for customerEmail
  studentId?: string; // Optional Rouse student ID (e.g. "RHS-10492")
  orderId?: string; // Optional order reference (e.g. "RS-78210")
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  description: string;
  status: ComplaintStatus;
  staffNotes?: string;
  productId?: string; // Optional related product ID
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
}

export interface CreateComplaintInput {
  customerName: string;
  customerEmail?: string;
  contactInfo?: string; // Compatibility alias
  studentId?: string;
  orderId?: string;
  category: ComplaintCategory;
  urgency?: ComplaintUrgency; // Defaults to "medium"
  description: string;
  productId?: string;
}

export type ComplaintSubmissionInput = CreateComplaintInput;

export interface ComplaintFilterOptions {
  status?: ComplaintStatus | "all";
  category?: ComplaintCategory | "all";
  urgency?: ComplaintUrgency | "all";
  searchQuery?: string;
  sortBy?: "newest" | "oldest" | "urgency";
}

export interface ComplaintStats {
  totalComplaints: number;
  newComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  urgentComplaints: number;
}
