/**
 * src/lib/repositories/IComplaintRepository.ts
 * Repository contract for complaints inbox and customer feedback management.
 */

import type {
  Complaint,
  CreateComplaintInput,
  ComplaintStatus,
  ComplaintFilterOptions,
  ComplaintStats,
} from "@/types/complaint";

export interface IComplaintRepository {
  getAll(): Complaint[];
  getById(id: string): Complaint | undefined;
  getByStatus(status: ComplaintStatus): Complaint[];
  addComplaint(input: CreateComplaintInput): Complaint;
  updateStatus(id: string, status: ComplaintStatus, staffNotes?: string): boolean;
  updateStaffNotes(id: string, notes: string): boolean;
  deleteComplaint(id: string): boolean;
  filterComplaints(options: ComplaintFilterOptions): Complaint[];
  reset(defaultComplaints?: Complaint[]): void;
  getStats(): ComplaintStats;
}
