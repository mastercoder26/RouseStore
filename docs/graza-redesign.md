# Rouse storefront — Graza-inspired redesign

Research and implementation: September 2–3, 2026.

## Direction

Graza-inspired independent retail: warm cream, deep maroon, butter-yellow actions, large expressive Fraunces wordmarks, Instrument Serif editorial headings, quiet monospace labels, rounded photography, outlined ovals, and gently offset button shadows. Preserve Rouse's identity; no Graza logos or product assets are reused.

The frontend-design skill guided the cohesive visual system. The browser-qa skill guided responsive checks, reduced-motion testing, keyboard interaction checks, and automated accessibility testing.

## Mobbin references inspected

- [Graza masthead](https://mobbin.com/sites/sections/64e41fb0-c4fa-4f69-a03a-707d52b26b9c): oversized wordmark, short editorial statement, compact navigation.
- [Graza product lineup](https://mobbin.com/sites/sections/e1617357-c934-4edb-a549-dde7bf356c30): three generous rounded photographs, oval labels and a full-width shopping action.
- [Graza campaign callout](https://mobbin.com/sites/sections/9739cf34-8152-4901-89d7-b8ae0124d6db): a single bright rounded panel with a clear shopping action.
- [Graza brand principles](https://mobbin.com/sites/sections/1aa65984-1092-4a1a-b6a3-cae3fd813d04): playful organic outlines.
- [Graza editorial story](https://mobbin.com/sites/sections/2eff73a5-3e21-4a2c-a7b4-fe9100a464b9): tactile imagery, whitespace, asymmetric composition.
- [Graza FAQ](https://mobbin.com/sites/sections/23598922-81c2-498a-adec-f31cae869289): simple ruled accordions and clear question hierarchy.
- [Graza letter](https://mobbin.com/sites/sections/c0551959-279d-4c6f-ad77-0998844fd5c3): editorial typography and warm photography.
- [Graza journal](https://mobbin.com/sites/sections/f3df16e9-45e3-4bc1-bf4e-1c599982ab76): large color fields and simple category controls.
- [Graza editorial cards](https://mobbin.com/sites/sections/9af1f750-1e20-4776-ae94-9ad2f4d96011): consistent corner treatment and serif captions.
- [Graza related stories](https://mobbin.com/sites/sections/1b36d57a-b72c-4982-9cc4-83f3f6857e56): concise section heading and clear cards.
- [Graza photo hero](https://mobbin.com/sites/sections/4061cf39-c105-4846-9a9f-999478042329) and [alternate frame](https://mobbin.com/sites/sections/3b407af7-3a06-49e3-b727-b3063e67f768): art direction and restrained overlays.

## Scope and invariants

- Rebuilt homepage, shared header/footer, product cards and catalog.
- Restyled product details, reviews, bag, feedback and staff surfaces.
- Added linked category filters and price/name sorting; preserved local catalog, cart, size, review and feedback behavior.
- The original five-logo intro, its assets, timing, bootstrap and replay logic are preserved. The original body and display fonts used by the intro are unchanged; Fraunces is an additional brand font.
- Theme preferences remain available in the footer.
- Homepage refinement: one Shop header link, one primary Browse the collection action, quieter Spirit Wear link and explicit category labels. Footer branding is now an oversized, non-interactive RAIDERS wordmark cropped along its bottom edge; utility details sit above it.
- Header ROUSE/STATION uses matching display typography. STATION slides right-to-left over 500ms, adapting the portfolio header's translate-x-full entrance and timing, with a small overshoot added on hover. The exit uses the portfolio's cubic-bezier(.76, 0, .24, 1). Space is reserved; keyboard focus reveals it immediately; reduced motion removes movement; touch layouts show it without requiring hover. Portfolio reference: `/Users/akhilkonduru/VSC/portfolio/src/components/layout/header.tsx` and `tailwind.config.ts`; neither was modified.
- Store remains a local demo. Unverified pickup locations/hours, free-gift promotions and demo coupon suggestions were removed from the redesigned shopping flow. Nothing is ordered, reserved or charged.
- Existing prices and specifications remain demo data. Four mismatched placeholder images (blanket, pens, cold brew, chocolate bar) were replaced with generated product mockups; remaining product photographs are unchanged. Known old image paths in saved bags/catalogs resolve to the new mockups without rewriting storage or replacing custom uploads. No generated asset claims to depict a real campus or verified stock.

## Generated campaign assets

Generated using the built-in image-generation tool, then optimized to WebP (quality 86) without visual edits. Both are 1536×1024. Source PNGs remain in the Codex generated-images directory. Combined web payload is approximately 394 KB.

- `public/images/campaign/rouse-gear.webp` — campaign still life (227,182 bytes).
- `public/images/campaign/rouse-everyday.webp` — school-supplies still life (166,616 bytes).

These are generated illustrative campaign scenes, not documentary photos or exact product specifications.

Additional square product mockups, also built-in generation and WebP quality 86, each 1254×1254:

- `public/images/campaign/rouse-blanket.webp` — 316,238 bytes.
- `public/images/campaign/rouse-pens.webp` — 170,410 bytes.
- `public/images/campaign/rouse-coldbrew.webp` — 183,820 bytes.
- `public/images/campaign/rouse-chocolate.webp` — 224,296 bytes.

### Gear prompt

Use case: ads-marketing. Asset type: Rouse student-store campaign photograph, landscape 3:2. Create a photorealistic editorial still life of a folded deep burgundy varsity sweatshirt with arched butter-gold collegiate lettering reading exactly 'ROUSE', a black cotton baseball cap with a single gold embroidered 'R', and a gold-and-maroon felt pennant, casually placed on a pale butter-yellow painted metal gym bench. Backdrop warm peach-cream plaster wall. Direction: tactile, playful independent retail campaign, bold natural direct sunlight from upper left, long crisp shadows, analog film texture, human art direction, small natural wrinkles, close composition filling frame with the gear. Limited maroon, cream, butter yellow, black palette. No people, no UI, no added slogans, no watermark. This is a mood/campaign image, not a product listing photograph.

### Everyday prompt

Use case: ads-marketing. Asset type: Rouse student-store everyday essentials campaign photograph, landscape 3:2. Create a photorealistic overhead editorial still life: one deep burgundy cloth hardcover notebook with small gold foil word 'ROUSE' (R-O-U-S-E), two black gel pens, a matte maroon reusable water bottle, all arranged loosely on a warm cream school desk, with a folded pale yellow sheet of paper at one corner. Warm direct late-afternoon sun and crisp diagonal window shadows. Deliberate asymmetric composition, generous breathing room, rich real fabric and paper texture, lightly grainy 35mm film aesthetic. Charming, simple, graphic independent brand art direction. Palette restricted to cream, burgundy, butter yellow and black. No people, no computer, no UI, no extra lettering, no watermark. This is a campaign still life, not an exact product listing photograph.

## Product mockup prompts

### Blanket prompt

Use case: product-mockup. Asset type: square demo student-store product photograph. Photorealistic independent retailer art direction, warm cream plaster backdrop and surface, natural sunlight upper left with crisp soft-edged shadow, tactile detail, restrained film grain. Single centered product, generous margin for a tall product-card crop. Rich burgundy, cream, butter-yellow palette. No watermark, no UI, no people. Illustrative merchandise concept, not a photo of real stock. Subject: a neatly folded thick deep burgundy sherpa fleece stadium blanket with butter-gold braided edge trim. Fold exposes plush cream underside, fabric pile visibly tactile, angled three-quarter overhead tabletop composition. Tiny sewn maroon tag reading ROUSE. No clothing, no hoodie.

### Pens prompt

Use case: product-mockup. Asset type: square demo student-store product photograph. Photorealistic independent retailer art direction, warm cream plaster backdrop and surface, natural sunlight upper left with crisp soft-edged shadow, tactile detail, restrained film grain. Single centered product, generous margin for a tall product-card crop. Rich burgundy, cream, butter-yellow palette. No watermark, no UI, no people. Illustrative merchandise concept, not a photo of real stock. Subject: exactly three matte black fine-tip gel pens arranged diagonally parallel on warm cream paper, beautiful simple black barrels, black clips, one cap removed exposing fine pen tip. A narrow burgundy paper belly band gathers two pens, tiny gold R on band. Overhead still life. No notebook, no extra stationery, no extra pens.

### Cold brew prompt

Use case: product-mockup. Asset type: square demo student-store product photograph. Photorealistic independent retailer art direction, warm cream plaster backdrop and surface, natural sunlight upper left with crisp soft-edged shadow, tactile detail, restrained film grain. Single centered product, generous margin for a tall product-card crop. Rich burgundy, cream, butter-yellow palette. No watermark, no UI, no people. Illustrative merchandise concept, not a photo of real stock. Subject: a single chilled 12-ounce aluminum coffee can, standing upright in three-quarter front view. Elegant burgundy matte wrap label, large cream expressive serif text exactly 'COLD BREW', smaller 'ROUSE' near top, small butter-yellow oval reading 'NITRO'. Silver lid, subtle realistic condensation, cast shadow. No water bottle, no nutrition or health claims, no extra can.

### Chocolate prompt

Use case: product-mockup. Asset type: square demo student-store product photograph. Photorealistic independent retailer art direction, warm cream plaster backdrop and surface, natural sunlight upper left with crisp soft-edged shadow, tactile detail, restrained film grain. Single centered product, generous margin for a tall product-card crop. Rich burgundy, cream, butter-yellow palette. No watermark, no UI, no people. Illustrative merchandise concept, not a photo of real stock. Subject: one dark chocolate almond snack bar partly unwrapped from a burgundy and cream paper wrapper revealing textured chocolate and a few whole roasted almonds. Wrapper reads exactly 'CHOCOLATE ALMOND' in large cream serif letters and small 'ROUSE'. Diagonal tabletop composition, one or two loose almonds next to it, appetizing tactile chocolate. No health or nutrition claims, no other products.

## Verification results

- Production build and TypeScript check: pass; lint: pass.
- Existing domain/contract test suite: 94/94 pass.
- Image-resolution tests: 5/5 pass, including legacy saved catalogs and preserving custom uploads. Run with `node --experimental-strip-types --test tests/product-image.test.mjs`.
- Production storefront checks: 18 viewport/page/theme combinations, no horizontal overflow, failed images, runtime errors, or automated WCAG A/AA findings. Three additional mobile staff-tab checks pass after fixing wrapping and badge contrast.
- Eight interaction suites passed: catalog search/filter/sort; quick-add and persisted bag; product sizes and accordions; consolidated homepage links and all category destinations; local feedback submission; staff sign-in/tab navigation; matching-font header hover/focus/reduced-motion behavior; original five-logo intro and replay. Footer clipping checks preserve all seven letters horizontally at 375, 768 and 1440 pixels.
- No previous visual baseline was available; these checks validate the new layouts directly.

Run the existing suite with `npm test`, lint with `npm run lint`, and production compilation/typecheck with `npm run build`.

The browser script `scripts/qa-storefront.mjs` uses an isolated local Chromium context. Set `PLAYWRIGHT_MODULE` and `AXE_MODULE` to installed package paths when the packages are not local. It refuses non-local targets. Screenshots and the detailed report are written to `output/storefront-qa/`.

Visual regression comparison is inconclusive because no previous baseline was provided. Current responsive layouts and interactions are checked directly; an automated accessibility pass is not a complete WCAG certification.
