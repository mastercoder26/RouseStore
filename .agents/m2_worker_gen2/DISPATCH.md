## 2026-09-02T22:56:53Z

You are the Milestone 2 Implementation Worker (teamwork_preview_worker) for Raider Station Storefront.

Your working directory: /Users/akhilkonduru/vsc/RouseStore/.agents/m2_worker_gen2
Original User Request: /Users/akhilkonduru/vsc/RouseStore/.agents/ORIGINAL_REQUEST.md
Master Project Plan: /Users/akhilkonduru/vsc/RouseStore/PROJECT.md

MANDATORY INSTRUCTIONS:
1. You MUST read /Users/akhilkonduru/vsc/RouseStore/.agents/ORIGINAL_REQUEST.md and /Users/akhilkonduru/vsc/RouseStore/PROJECT.md before writing any code.
2. MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your scope: Milestone 2 — Product Reviews & 5-Star Rating System (Requirement R1)
File ownership (exclusive):
- `src/components/reviews/StarRating.tsx`
- `src/components/reviews/ProductRatingBadge.tsx`
- `src/components/reviews/RatingBreakdownBars.tsx`
- `src/components/reviews/ReviewCard.tsx`
- `src/components/reviews/ReviewSubmissionModal.tsx`
- `src/components/reviews/ProductReviewsSection.tsx`
- `src/components/reviews/index.ts`
- `src/components/ProductDetails.tsx` (integrate ProductReviewsSection, wire rating summary)
- `src/components/ShopCatalog.tsx` (display ProductRatingBadge on catalog cards with zero CLS)
- `src/components/HomeCover.tsx` (display ProductRatingBadge on featured products with zero CLS)
- Any review-related tests under `tests/`
