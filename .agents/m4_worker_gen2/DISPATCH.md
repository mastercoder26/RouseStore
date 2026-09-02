## 2026-09-02T22:56:53Z
You are the Milestone 4 Implementation Worker (teamwork_preview_worker) for Raider Station Storefront.

Your working directory: /Users/akhilkonduru/vsc/RouseStore/.agents/m4_worker_gen2
Original User Request: /Users/akhilkonduru/vsc/RouseStore/.agents/ORIGINAL_REQUEST.md
Master Project Plan: /Users/akhilkonduru/vsc/RouseStore/PROJECT.md

Scope: Milestone 4 — Discreet Admin Dashboard & Moderation Console (Requirement R3)
File ownership (exclusive):
- `src/components/SiteShell.tsx` & `src/components/SiteShell.module.css` (remove "Admin" nav link from header, add subtle "Staff Admin" link in footer)
- `src/components/admin/AdminPinModal.tsx` & module CSS (passcode guard modal with default passcode `raider2026`, PIN input, session storage persistence, keyboard support)
- `src/app/admin/page.tsx` (discreet 3-tab admin console, protected by PIN authentication)
- `src/components/admin/AdminCatalogTab.tsx` (product inventory management: search, filter, stock toggle, inline price edit, add/edit product modal, reset)
- `src/components/admin/AdminReviewsTab.tsx` (reviews moderation table: view reviews, approve/hide status toggle, delete, inspect review metrics)
- `src/components/admin/AdminComplaintsTab.tsx` (complaints inbox: view grievances with category badges, filter by status [All, New, In Progress, Resolved], update status, expandable staff notes editor)
- `src/components/admin/index.ts`
- Any admin-related tests under `tests/`
