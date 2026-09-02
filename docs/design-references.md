# RouseStore design references

Research date: 2026-09-02

## Visual reference

- [Superpower section on Mobbin](https://mobbin.com/sites/sections/57a1e1f4-c526-4fcf-be1d-6ec3bbec1753) — reference for a restrained editorial commerce layout: large type, generous paper-colored space, simple rules, and product imagery with clear utility.
- The portfolio reference contributes selective motion ideas: clipped text reveals and pointer effects that run only for fine pointers and respect reduced motion. Keep the store calm enough that these interactions support shopping.
- The user’s 8.5-second Superpower screen recording was inspected as 18 timestamped frames with the watch skill. Around 1s, 4s, and 6.5s the headline resolves from staggered individual letters; the central portrait changes while small product shapes float beside it. These inform the letter reveals, crossfading hero products, and floating accessory illustrations. Autoplay has pause and manual controls, stops during interaction, and is disabled with reduced motion.
- The second, 6.1-second recording was inspected as 13 timestamped frames. Its large scrolling gallery, sticky purchase panel, compact size controls, full-width bag action, and ruled accordions inform the dedicated `/shop/[id]` pages. Mobile galleries use horizontal scroll snapping. Close-ups are labeled detail crops of the existing product photos; no extra product views or variants are invented.
- The shared footer ends with oversized, slightly cropped “GO RAIDERS” lettering across the full width, as requested.
- The final copy pass removes repeated student-store labels, supporting slogans, catalog category captions, duplicate item details, and extra bag instructions. Home keeps its headline and Shop action; item pages emphasize name, price, sizes, and the bag action.
- [Glossier on Mobbin](https://mobbin.com/sites/sections/9912097d-5d6a-4046-8c0d-6ac555885561) and [KÖPPEN on Mobbin](https://mobbin.com/sites/sections/32e27c57-1beb-458c-8409-dc03af32f610) — reference for restrained e-commerce product reviews: bold aggregate ratings, horizontal breakdown percentage bars, verified tags, and concise submission cards.
- [Brilliant on Mobbin](https://mobbin.com/screens/99fea2d8-5783-43ca-b4bd-5fe033b6c490) and [Uxcel on Mobbin](https://mobbin.com/screens/ba6f533f-2102-462a-bc04-30ee06df0515) — reference for clean feedback and grievance slide-over drawer: categorized pills, single-view form with clear urgency/topic tags, and instant feedback toast.
- [Shopify on Mobbin](https://mobbin.com/screens/c1f2d4fb-b258-45d0-b345-1bb356118be3) and [Squarespace on Mobbin](https://mobbin.com/screens/73a6fc00-421e-4c71-8d6a-e1f43b2f78ed) — reference for discrete administrative console: clean metric badges, tabular moderation list with approve/dismiss toggles, and compact inventory controls.
- [Airwallex on Mobbin](https://mobbin.com/screens/46ff1614-b773-43c7-abfd-5e949a89cbd9) and [Peec AI on Mobbin](https://mobbin.com/screens/64329409-eafa-4327-b1f8-7917b6bef1f1) — reference for smooth right-anchored slide-over drawer motion with backdrop blur and fluid dismiss gesture.
- [Whop on Mobbin](https://mobbin.com/screens/6cc10d46-2f15-48e3-9bb3-2ca63e561ced) and [DoorDash on Mobbin](https://mobbin.com/screens/edbae552-d10a-4e66-81f1-252028138900) — reference for micro-animated star rating selection with bouncy fill states and active feedback labels.
- [Maze on Mobbin](https://mobbin.com/screens/30545233-1c08-436f-959b-253654674e61) and [Lovable on Mobbin](https://mobbin.com/screens/3d6804ac-999b-446c-ba5c-ce03fc3803cc) — reference for pill-shaped toast confirmations that float up from bottom with spring physics and auto-dismiss timers.

## Store audience and structure

The user identifies this as an internal store for current Rouse students. Copy assumes students already know Rouse. Home and Shop focus on school supplies, snacks, and Raider gear; there is no school introduction or campus-resource hub. The old `/school` URL redirects to `/shop`. This audience direction does not add authentication or access restrictions.

## Verified Rouse High School facts

- [Rouse High School](https://rhs.leanderisd.org/) — official campus site; the homepage identifies the Raider community and exposes an RHS logo image.
- [Leander ISD 2025–26 high school course catalog](https://www.leanderisd.org/wp-content/uploads/2024/09/Leander-ISD-HS-Course-Catalog-2025-2026.pdf) — Rouse High School is at 1222 Raider Way, Leander, TX 78641; phone 512-570-2000; mascot Raiders; established 2008.
- [Rouse campus information](https://rhs.leanderisd.org/campus_information) — school hours are 8:15 a.m.–3:35 p.m.; student doors open at 7:45 a.m. and close at 4:00 p.m.
- [Rouse Raider Choir school songs](https://sites.google.com/a/leanderisd.org/rouseraiderchoir/schoolsongs) — school-hosted page listing the alma mater “Hearts in Unity,” fight song “Onward Raiders!,” and lyrics naming “Maroon and Gold.”
- [Leander ISD Logos & Licensing](https://www.leanderisd.org/logoslicensing/) — Rouse is covered by the district trademark/licensing program. Vendors require K12 approval; approved booster clubs, PTAs, and other internal district programs are exempt. Do not describe merchandise as officially licensed without confirmation.
- [Leander ISD Photos & Videos archive](https://photos.leanderisd.org/) and [Rouse `rhs` photo keyword](https://photos.leanderisd.org/keyword/rhs/) — public archive source for possible campus imagery. Obtain permission before reusing student photos.

## Store and catalog status

The official Rouse and Leander ISD sources reviewed did not confirm a store named Raider Station, a Room 1104 location, store hours, home shipping, delivery fees, promo codes, or proceeds benefiting clubs or athletics. Keep those details out of factual copy until confirmed.

The current product catalog and prices are demo content. The checkout flow is also a demo: it supports local bag state, size selection, quantities, and a review screen, but it does not place orders or process payment. Shipping, pickup promises, and demo discounts have been removed. The UI should continue to say “Online checkout is not available yet. No order has been placed.”
