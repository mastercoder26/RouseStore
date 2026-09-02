# Raider Station: Test Infrastructure & Verification Architecture

## 1. Opaque-Box Testing Philosophy
The Raider Station test architecture is designed around strict **opaque-box principles**:
- **Contract & Behavior Focused**: Tests interact with domain models, typed repository interfaces (`IProductRepository`, `IReviewRepository`, `IComplaintRepository`, `IStorageDriver`), state controllers, and DOM/UI contracts without relying on internal private state or monkey-patching.
- **Progressive Testability**: Tests are runnable across standalone Node.js environments and CI/CD pipelines without requiring headless browser overhead, while accurately exercising real business logic, mathematical transformations, data persistence, and accessibility contracts.
- **Idempotence & Independence**: Each test suite creates isolated in-memory or mock storage instances, ensuring zero test pollution and order-independent execution.
- **Authoritative Expected Output Derivation**: All calculations (rating averages, recommend percentages, distribution shares), validation boundaries, and status transitions are derived strictly from specifications in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

---

## 2. Four-Tier Test Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│             TIER 4: Real-World User Journey Tests                     │
│  - Student Shopping & Reviewing Experience                            │
│  - Sizing Grievance & Slide-Over Drawer Submission Flow               │
│  - Staff Admin PIN Authentication & Moderation Lifecycle               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│             TIER 3: Cross-Feature State Integration Tests              │
│  - Review Submission ──► Aggregate Recalculation ──► Catalog Badge    │
│  - Complaint Submission ──► Admin Inbox ──► Staff Notes & Status Flow  │
│  - Admin Review Moderation (Hide/Show) ──► Storefront Summary Updates  │
│  - Admin Inventory Toggle ──► Shop Availability Updates               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│             TIER 2: Boundary, Corner & Adversarial Cases               │
│  - Zero Reviews / Unrated Products (NaN prevention & empty breakdown)  │
│  - Extreme Ratings (100% 5-Star, 100% 1-Star, mixed edge weights)     │
│  - Special Characters, Unicode, Emoji, Long Strings, XSS Escaping      │
│  - Invalid PIN Authentication & Lockout Guarantees                     │
│  - Duplicate Helpful Voting Idempotency                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│             TIER 1: Feature Contract Verification                      │
│  - R1: Product Reviews & 5-Star Rating System                          │
│  - R2: Global Customer Complaints & Feedback Drawer                    │
│  - R3: Discreet Admin Dashboard & Moderation                           │
│  - R4: Animation Polish, Cubic-Bezier Easing & Accessibility           │
│  - R5: Storage Repositories, In-Memory Fallback & Domain Drivers       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Inventory to Test Suite Mapping

| Feature ID | Feature Description | Milestone | Test File(s) | Tier |
|---|---|---|---|---|
| **F1** | Typed Storage Driver & LocalStorage with Memory Fallback | M1 | `tests/e2e/tier1-storage-repositories.test.mjs` | Tier 1 |
| **F2** | Typed Repositories & Domain Models | M1 | `tests/e2e/tier1-storage-repositories.test.mjs` | Tier 1 |
| **F3** | Unified Context Store & State Hooks Contract | M1 | `tests/e2e/tier1-storage-repositories.test.mjs` | Tier 1 |
| **F4** | Authentic Seed Data for Reviews & Complaints | M1 | `tests/e2e/tier1-storage-repositories.test.mjs`, `tests/e2e/tier1-reviews.test.mjs` | Tier 1 |
| **F5** | 5-Star Aggregate Rating & Distribution Breakdown | M2 | `tests/e2e/tier1-reviews.test.mjs`, `tests/e2e/tier2-boundary-corner.test.mjs` | Tier 1, 2 |
| **F6** | Product Detail Editorial Reviews List & Badges | M2 | `tests/e2e/tier1-reviews.test.mjs` | Tier 1 |
| **F7** | Interactive Review Submission Modal | M2 | `tests/e2e/tier1-reviews.test.mjs`, `tests/e2e/tier3-cross-feature.test.mjs` | Tier 1, 3 |
| **F8** | Catalog & Home Compact Rating Badges | M2 | `tests/e2e/tier1-reviews.test.mjs`, `tests/e2e/tier3-cross-feature.test.mjs` | Tier 1, 3 |
| **F9** | Global Slide-Over Feedback / Complaints Drawer | M3 | `tests/e2e/tier1-complaints.test.mjs` | Tier 1 |
| **F10** | Categorized Feedback Form with Topic Pills & Urgency | M3 | `tests/e2e/tier1-complaints.test.mjs`, `tests/e2e/tier2-boundary-corner.test.mjs` | Tier 1, 2 |
| **F11** | Animated Confirmation Toast Notifications | M3 | `tests/e2e/tier1-complaints.test.mjs` | Tier 1 |
| **F12** | Navigation Header Sanitation (No Admin Link) | M4 | `tests/e2e/tier1-admin.test.mjs` | Tier 1 |
| **F13** | Discreet Staff Admin Footer Entry & PIN Modal Gate (`raider2026`) | M4 | `tests/e2e/tier1-admin.test.mjs`, `tests/e2e/tier2-boundary-corner.test.mjs` | Tier 1, 2 |
| **F14** | Admin Catalog Inventory Console | M4 | `tests/e2e/tier1-admin.test.mjs`, `tests/e2e/tier3-cross-feature.test.mjs` | Tier 1, 3 |
| **F15** | Admin Reviews Moderation Console | M4 | `tests/e2e/tier1-admin.test.mjs`, `tests/e2e/tier3-cross-feature.test.mjs` | Tier 1, 3 |
| **F16** | Admin Complaints Inbox Console | M4 | `tests/e2e/tier1-admin.test.mjs`, `tests/e2e/tier3-cross-feature.test.mjs` | Tier 1, 3 |
| **F17** | Sliding Wordmark & Editorial Motion Polish | M5 | `tests/e2e/tier1-motion-a11y.test.mjs` | Tier 1 |
| **F18** | Star Rating Interactive Physics & Micro-interactions | M5 | `tests/e2e/tier1-motion-a11y.test.mjs` | Tier 1 |
| **F19** | Zero Layout Shift & Reduced Motion Compliance | M5 | `tests/e2e/tier1-motion-a11y.test.mjs` | Tier 1 |
| **F20** | Comprehensive Keyboard Accessibility & ARIA | M5 | `tests/e2e/tier1-motion-a11y.test.mjs` | Tier 1 |
| **F21** | Full E2E Test Suite Validation & Real-World User Journeys | M6 | `tests/e2e/tier4-user-journeys.test.mjs` | Tier 4 |

---

## 4. Test Suite Structure & Files

```
tests/
├── harness/
│   ├── test-framework.mjs       # Zero-dependency, color-coded assertion and runner harness
│   └── domain-adapters.mjs      # Opaque test adapters for storage, math, repositories, and UI contracts
├── e2e/
│   ├── tier1-reviews.test.mjs             # Tier 1: R1 Product Reviews & 5-Star Ratings (>= 6 tests)
│   ├── tier1-complaints.test.mjs          # Tier 1: R2 Feedback & Complaints Drawer (>= 6 tests)
│   ├── tier1-admin.test.mjs               # Tier 1: R3 Discreet Admin & Moderation (>= 6 tests)
│   ├── tier1-motion-a11y.test.mjs         # Tier 1: R4 Motion & Accessibility (>= 6 tests)
│   ├── tier1-storage-repositories.test.mjs# Tier 1: R5 Storage Drivers & Repositories (>= 6 tests)
│   ├── tier2-boundary-corner.test.mjs     # Tier 2: Boundary, extremes & corner cases (>= 8 tests)
│   ├── tier3-cross-feature.test.mjs       # Tier 3: Cross-feature integrations & state sync (>= 6 tests)
│   └── tier4-user-journeys.test.mjs       # Tier 4: Real-world multi-step user journeys (>= 3 journeys)
└── run-e2e-tests.mjs                      # Main executable entry point with summary reporting
```

---

## 5. Execution & Verification

### Running All Tests
```bash
node tests/run-e2e-tests.mjs
```

### Running Specific Tiers
```bash
node tests/run-e2e-tests.mjs --tier=1
node tests/run-e2e-tests.mjs --tier=2
node tests/run-e2e-tests.mjs --tier=3
node tests/run-e2e-tests.mjs --tier=4
```

### Success Criteria & Thresholds
- **Tier 1 (Feature Coverage)**: 100% pass across all R1-R5 features (minimum 5 tests per feature, totaling ≥30 tests).
- **Tier 2 (Boundary & Corner Cases)**: 100% pass on empty states, boundary values, extreme ratings, special characters, and PIN locks (≥8 tests).
- **Tier 3 (Cross-Feature Integrations)**: 100% pass on end-to-end multi-module state mutations (≥6 tests).
- **Tier 4 (Real-World User Journeys)**: 100% pass on full student and staff workflows (≥3 comprehensive journeys).
- **Total Test Cases**: ≥ 50 comprehensive test assertions.
