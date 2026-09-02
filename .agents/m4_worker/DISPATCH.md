## 2026-09-02T22:43:17Z

<USER_REQUEST>
You are Milestone 4 & 5 Worker (Admin Console, Navigation Sanitation, Motion & A11y Specialist).
Your working directory is: /Users/akhilkonduru/vsc/RouseStore/.agents/m4_worker
Workspace root: /Users/akhilkonduru/vsc/RouseStore
Parent conversation ID: c4e20483-932c-4198-951e-a1eeef046665

Read ORIGINAL_REQUEST.md at /Users/akhilkonduru/vsc/RouseStore/.agents/ORIGINAL_REQUEST.md, PROJECT.md at /Users/akhilkonduru/vsc/RouseStore/PROJECT.md, and spec inventory at /Users/akhilkonduru/vsc/RouseStore/.agents/survey_spec_miner_3/spec_inventory.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Exclusively Owned Files:
- `src/components/SiteShell.tsx` & `src/components/SiteShell.module.css`:
  - Clean primary header navigation: Remove "Admin" link; leave only customer links ("Home", "Shop").
  - Retain and refine signature sliding wordmark in header.
  - Add discreet "Staff Admin" link in footer (navigates to `/admin` or opens admin PIN modal).
  - Integrate "Feedback / Complaints" drawer trigger button in footer.
  - Mount `FeedbackDrawer` and `ToastNotification` from `@/components/feedback`.
- `src/components/admin/AdminPinModal.tsx`:
  - Restrained PIN / passcode modal guard. Default passcode: `raider2026`.
  - Check `sessionStorage.getItem("raider_admin_session_auth")`. If valid, unlock console; otherwise prompt PIN with error feedback on incorrect entry.
- `src/components/admin/AdminCatalogTab.tsx`:
  - Catalog inventory manager: search, category/stock filter, inline price edit, stock toggle, product CRUD modal, JSON backup/restore, reset to defaults.
- `src/components/admin/AdminReviewsTab.tsx`:
  - Reviews moderation console: metrics summary cards (total reviews, avg rating, hidden count), table of submitted reviews with product info, verified student tags, Approve / Hide status toggle, delete action.
- `src/components/admin/AdminComplaintsTab.tsx`:
  - Complaints inbox console: filter by status (All, New, In Progress, Resolved) and urgency, table of student grievances with category badges and urgency tags, status update dropdown/buttons, expandable staff notes editor with save capability.
- `src/components/admin/index.ts`: Re-export all admin components.
- `src/app/admin/page.tsx`:
  - Refactor to 3-tab layout: Catalog Inventory, Reviews Moderation, Complaints Inbox, protected by `AdminPinModal` and session state.
- Motion & A11y Standards:
  - GPU-accelerated transforms (`cubic-bezier(0.76, 0, 0.24, 1)`), zero layout shift, `prefers-reduced-motion: reduce` compliance, and keyboard navigation (`Tab`, `Escape`, `Enter`, `Space`) with visible focus outlines.

Verification:
- Run `npm run lint`, `npm run build`, and `npm test` and ensure 0 errors.
- Document all changes in `/Users/akhilkonduru/vsc/RouseStore/.agents/m4_worker/handoff.md` and message parent when complete.
</USER_REQUEST>
