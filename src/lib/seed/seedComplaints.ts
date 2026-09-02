/**
 * src/lib/seed/seedComplaints.ts
 * 6 structured grievances across all categories, varying urgency, statuses, and staff notes.
 */

import type { Complaint } from "@/types/complaint";

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "cmp-001",
    category: "Order Issue",
    urgency: "high",
    customerName: "Lucas Hernandez",
    customerEmail: "lhernandez94@leanderisd.org",
    contactInfo: "lhernandez94@leanderisd.org",
    studentId: "RHS-10492",
    orderId: "RS-78210",
    productId: "rs-hoodie-01",
    description:
      "Ordered a Sideline Hoodie in Large for Friday's pep rally, but received a Small in the package instead. Need to exchange before 6 PM kickoff.",
    status: "in_progress",
    staffNotes:
      "Located size Large hoodie in kiosk backroom inventory. Emailed student to pick up during 4th period lunch.",
    createdAt: "2026-09-01T14:15:00Z",
    updatedAt: "2026-09-01T15:30:00Z",
  },
  {
    id: "cmp-002",
    category: "Item Condition / Defect",
    urgency: "medium",
    customerName: "Samantha Reed",
    customerEmail: "sreed312@leanderisd.org",
    contactInfo: "sreed312@leanderisd.org",
    studentId: "RHS-11208",
    orderId: "RS-81044",
    productId: "rs-bottle-05",
    description:
      "The twist cap on the stainless water bottle seems to have a minor threading defect causing slight leakage when tilted in a backpack.",
    status: "new",
    staffNotes: "",
    createdAt: "2026-09-02T09:30:00Z",
    updatedAt: "2026-09-02T09:30:00Z",
  },
  {
    id: "cmp-003",
    category: "Sizing / Stock Request",
    urgency: "low",
    customerName: "David Zhao",
    customerEmail: "dzhao551@leanderisd.org",
    contactInfo: "dzhao551@leanderisd.org",
    studentId: "RHS-09831",
    productId: "rs-jacket-02",
    description:
      "Will the Varsity Letterman Jacket be restocked in size 3XL before homecoming week? Several band members are looking to order.",
    status: "resolved",
    staffNotes:
      "Spoke with supplier on 9/1; 15 units of 3XL arriving on 9/10. Sent confirmation email to student.",
    createdAt: "2026-08-29T11:00:00Z",
    updatedAt: "2026-09-01T16:20:00Z",
    resolvedAt: "2026-09-01T16:20:00Z",
  },
  {
    id: "cmp-004",
    category: "Campus Kiosk Suggestion",
    urgency: "low",
    customerName: "Hannah Scott",
    customerEmail: "hscott889@leanderisd.org",
    contactInfo: "hscott889@leanderisd.org",
    studentId: "RHS-12044",
    description:
      "Can the Raider Station pickup kiosk in the cafeteria courtyard open 15 minutes earlier (at 7:45 AM) on Tuesdays and Thursdays? The line gets long right before first bell.",
    status: "in_progress",
    staffNotes:
      "Discussed with student council retail committee; evaluating volunteer schedule for early opening.",
    createdAt: "2026-08-30T16:40:00Z",
    updatedAt: "2026-08-31T09:15:00Z",
  },
  {
    id: "cmp-005",
    category: "General Grievance",
    urgency: "high",
    customerName: "Ethan Walker",
    customerEmail: "ewalker104@leanderisd.org",
    contactInfo: "ewalker104@leanderisd.org",
    studentId: "RHS-08722",
    orderId: "RS-74199",
    productId: "rs-blanket-07",
    description:
      "Charged twice on card during campus kiosk checkout due to wifi reconnection glitch on the POS terminal.",
    status: "resolved",
    staffNotes:
      "Duplicate charge refunded through campus finance office on 8/28. Receipt emailed to student.",
    createdAt: "2026-08-27T17:05:00Z",
    updatedAt: "2026-08-28T10:15:00Z",
    resolvedAt: "2026-08-28T10:15:00Z",
  },
  {
    id: "cmp-006",
    category: "Item Condition / Defect",
    urgency: "medium",
    customerName: "Olivia Jenkins",
    customerEmail: "ojenkins207@leanderisd.org",
    contactInfo: "ojenkins207@leanderisd.org",
    studentId: "RHS-10955",
    orderId: "RS-82190",
    productId: "rs-sneaker-11",
    description:
      "Slight scuff mark on the right toe box out of the box. Would love an exchange for a clean pair.",
    status: "new",
    staffNotes: "",
    createdAt: "2026-09-02T13:20:00Z",
    updatedAt: "2026-09-02T13:20:00Z",
  },
];
