/**
 * src/lib/seed/seedProducts.ts
 * Illustrative demo catalog of 11 Rouse-themed products across 4 categories.
 */

import type { Product, PresetImage } from "@/types/product";

export const PRESET_IMAGES: PresetImage[] = [
  { label: "Sideline Maroon Hoodie", src: "/images/raider_hoodie.jpg" },
  { label: "Classic Black Hoodie", src: "/images/hoodie.jpg" },
  { label: "Varsity Letterman Jacket", src: "/images/raider_jacket.jpg" },
  { label: "Stadium Windbreaker", src: "/images/jacket.jpg" },
  { label: "Raider FlexFit Cap", src: "/images/raider_cap.jpg" },
  { label: "Raider Court Sneaker", src: "/images/sneaker.jpg" },
  { label: "Insulated Water Bottle", src: "/images/raider_bottle.jpg" },
  { label: "Everyday Hardcover Notebook", src: "/images/raider_notebook.jpg" },
  { label: "Friday Night Stadium Blanket (mockup)", src: "/images/campaign/rouse-blanket.webp" },
  { label: "Precision Gel Pens (mockup)", src: "/images/campaign/rouse-pens.webp" },
  { label: "Nitro Cold Brew (mockup)", src: "/images/campaign/rouse-coldbrew.webp" },
  { label: "Chocolate Almond Bar (mockup)", src: "/images/campaign/rouse-chocolate.webp" },
  { label: "Raider Spirit Banner", src: "/images/raider_hero.jpg" },
];

export const CATEGORIES: string[] = [
  "All items",
  "Spirit Wear",
  "School Supplies",
  "Snacks & Drinks",
  "Accessories",
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "rs-hoodie-01",
    name: "Sideline Hoodie",
    category: "Spirit Wear",
    price: 54,
    originalPrice: 65,
    tag: "Athletics",
    description: "Heavyweight maroon fleece hoodie with double-lined hood and gold embroidered Rouse lettering.",
    image: "/images/raider_hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    inStock: true,
  },
  {
    id: "rs-jacket-02",
    name: "Varsity Letterman",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    tag: "Heritage",
    description: "Traditional maroon melton wool body with matte black leather-touch sleeves and gold chenille R crest.",
    image: "/images/raider_jacket.jpg",
    sizes: ["M", "L", "XL", "2XL"],
    inStock: true,
  },
  {
    id: "rs-cap-03",
    name: "Raider Cap",
    category: "Spirit Wear",
    price: 32,
    originalPrice: 38,
    tag: "Sideline",
    description: "Structured six-panel black performance cap with raised gold R embroidery and flex-stretch headband.",
    image: "/images/raider_cap.jpg",
    sizes: ["S/M", "L/XL"],
    inStock: true,
  },
  {
    id: "rs-bomber-06",
    name: "Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    tag: "Outerwear",
    description: "Water-resistant matte nylon shell with breathable mesh lining and storm-flap snap closure.",
    image: "/images/jacket.jpg",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: "rs-sneaker-11",
    name: "Raider Court Low",
    category: "Spirit Wear",
    price: 95,
    originalPrice: 110,
    tag: "Limited Drop",
    description: "Low-profile court sneakers with premium leather uppers, cushioned insole, and gold heel accents.",
    image: "/images/sneaker.jpg",
    sizes: ["8", "9", "10", "11", "12"],
    inStock: true,
  },
  {
    id: "rs-notebook-04",
    name: "Everyday Notebook",
    category: "School Supplies",
    price: 14,
    tag: "College-ruled",
    description: "Durable hardcover journal with 160 college-ruled pages, ribbon placeholder, and gold foil Rouse emblem.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-bottle-05",
    name: "Raider Water Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    tag: "32 oz",
    description: "Double-walled vacuum insulated stainless steel bottle. Keeps drinks cold for 24 hours with spill-proof lid.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Blanket",
    category: "Accessories",
    price: 48,
    tag: "Game Day",
    description: "Plush 50x60 inch maroon sherpa fleece blanket with gold braided edge trim. Perfect for bleacher nights.",
    image: "/images/campaign/rouse-blanket.webp",
    inStock: true,
  },
  {
    id: "rs-pen-08",
    name: "Precision Gel Pens · 3pk",
    category: "School Supplies",
    price: 9,
    tag: "Black ink",
    description: "Triple pack of 0.5mm smooth-glide archival black gel pens with matte comfort grip barrels.",
    image: "/images/campaign/rouse-pens.webp",
    inStock: true,
  },
  {
    id: "rs-coldbrew-09",
    name: "Nitro Cold Brew",
    category: "Snacks & Drinks",
    price: 4.5,
    tag: "12 oz Chilled",
    description: "Locally roasted 12 oz canned nitro cold brew coffee with notes of dark chocolate and caramel.",
    image: "/images/campaign/rouse-coldbrew.webp",
    inStock: true,
  },
  {
    id: "rs-protein-10",
    name: "Chocolate Almond Bar",
    category: "Snacks & Drinks",
    price: 3.5,
    tag: "All-natural",
    description: "Handcrafted dark chocolate bar packed with whole roasted almonds and 12g wholesome protein.",
    image: "/images/campaign/rouse-chocolate.webp",
    inStock: true,
  },
];

export const PRODUCTS: Product[] = SEED_PRODUCTS;

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
