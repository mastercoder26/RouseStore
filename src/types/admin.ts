/**
 * src/types/admin.ts
 * Domain models for discreet admin portal, PIN authentication, and moderation console.
 */

export type AdminTab = "catalog" | "reviews" | "complaints";

export interface AdminSession {
  isAuthenticated: boolean;
  authenticatedAt?: string;
  expiresAt?: string;
}

export interface AdminCatalogMetrics {
  totalListings: number;
  inStockCount: number;
  soldOutCount: number;
  averagePrice: number;
  saleCount: number;
}

export interface AdminReviewsMetrics {
  totalReviews: number;
  approvedReviews: number;
  hiddenReviews: number;
  averageRating: number;
  totalHelpfulVotes: number;
}

export interface AdminComplaintsMetrics {
  totalComplaints: number;
  newComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  urgentComplaints: number;
}

export interface AdminOverviewMetrics {
  catalog: AdminCatalogMetrics;
  reviews: AdminReviewsMetrics;
  complaints: AdminComplaintsMetrics;
}

export interface AdminPinVerificationResult {
  success: boolean;
  error?: string;
}
