/**
 * src/lib/repositories/ComplaintRepository.ts
 * Concrete ComplaintRepository with category badges, status transitions, and staff notes.
 */

import type { IStorageDriver } from "@/lib/storage/IStorageDriver";
import { getStorageDriver } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import type {
  Complaint,
  CreateComplaintInput,
  ComplaintStatus,
  ComplaintFilterOptions,
  ComplaintStats,
} from "@/types/complaint";
import { SEED_COMPLAINTS } from "@/lib/seed/seedComplaints";
import type { IComplaintRepository } from "./IComplaintRepository";

export class ComplaintRepository implements IComplaintRepository {
  private driver: IStorageDriver;
  private key: string;
  private initialComplaints: Complaint[];

  constructor(
    driver?: IStorageDriver,
    initialComplaints: Complaint[] = SEED_COMPLAINTS,
    key: string = STORAGE_KEYS.COMPLAINTS
  ) {
    this.driver = driver || getStorageDriver();
    this.initialComplaints = initialComplaints;
    this.key = key;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    const existing = this.driver.getItem<Complaint[]>(this.key);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      if (this.initialComplaints.length > 0) {
        this.driver.setItem(this.key, this.initialComplaints);
      }
    }
  }

  public getAll(): Complaint[] {
    const items = this.driver.getItem<Complaint[]>(this.key);
    const all = Array.isArray(items) && items.length > 0 ? items : [...this.initialComplaints];
    return [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): Complaint | undefined {
    return this.getAll().find((c) => c.id === id);
  }

  public getByStatus(status: ComplaintStatus): Complaint[] {
    return this.getAll().filter((c) => c.status === status);
  }

  public addComplaint(input: CreateComplaintInput): Complaint {
    const id = `cmp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const email = (input.customerEmail || input.contactInfo || "").trim();

    const newComplaint: Complaint = {
      id,
      customerName: input.customerName.trim(),
      customerEmail: email,
      contactInfo: email,
      studentId: input.studentId?.trim() || undefined,
      orderId: input.orderId?.trim() || undefined,
      category: input.category,
      urgency: input.urgency || "medium",
      description: input.description.trim(),
      status: "new",
      staffNotes: "",
      productId: input.productId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.getAll();
    const updated = [newComplaint, ...current];
    this.driver.setItem(this.key, updated);
    return newComplaint;
  }

  public updateStatus(id: string, status: ComplaintStatus, staffNotes?: string): boolean {
    const current = this.getAll();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return false;

    const existing = current[index];
    const resolvedAt =
      status === "resolved"
        ? existing.resolvedAt || new Date().toISOString()
        : undefined;

    current[index] = {
      ...existing,
      status,
      staffNotes: staffNotes !== undefined ? staffNotes : existing.staffNotes,
      updatedAt: new Date().toISOString(),
      resolvedAt,
    };

    this.driver.setItem(this.key, current);
    return true;
  }

  public updateStaffNotes(id: string, notes: string): boolean {
    const current = this.getAll();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return false;

    current[index] = {
      ...current[index],
      staffNotes: notes,
      updatedAt: new Date().toISOString(),
    };

    this.driver.setItem(this.key, current);
    return true;
  }

  public deleteComplaint(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter((c) => c.id !== id);
    if (filtered.length === current.length) return false;

    this.driver.setItem(this.key, filtered);
    return true;
  }

  public filterComplaints(options: ComplaintFilterOptions): Complaint[] {
    let list = this.getAll();

    if (options.status && options.status !== "all") {
      list = list.filter((c) => c.status === options.status);
    }

    if (options.category && options.category !== "all") {
      list = list.filter((c) => c.category === options.category);
    }

    if (options.urgency && options.urgency !== "all") {
      list = list.filter((c) => c.urgency === options.urgency);
    }

    if (options.searchQuery?.trim()) {
      const q = options.searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.customerEmail.toLowerCase().includes(q) ||
          (c.contactInfo && c.contactInfo.toLowerCase().includes(q)) ||
          (c.studentId && c.studentId.toLowerCase().includes(q)) ||
          (c.orderId && c.orderId.toLowerCase().includes(q)) ||
          c.description.toLowerCase().includes(q) ||
          (c.staffNotes && c.staffNotes.toLowerCase().includes(q))
      );
    }

    if (options.sortBy === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (options.sortBy === "urgency") {
      const urgencyRank: Record<string, number> = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      list = [...list].sort(
        (a, b) => (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0)
      );
    }

    return list;
  }

  public reset(defaultComplaints?: Complaint[]): void {
    const listToSet = defaultComplaints || this.initialComplaints;
    this.driver.setItem(this.key, listToSet);
  }

  public getStats(): ComplaintStats {
    const all = this.getAll();
    return {
      totalComplaints: all.length,
      newComplaints: all.filter((c) => c.status === "new").length,
      inProgressComplaints: all.filter((c) => c.status === "in_progress").length,
      resolvedComplaints: all.filter((c) => c.status === "resolved").length,
      urgentComplaints: all.filter((c) => c.urgency === "urgent" || c.urgency === "high").length,
    };
  }
}
