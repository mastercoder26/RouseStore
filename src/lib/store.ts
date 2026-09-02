export interface Product {
  id: string;
  name: string;
  category: "Spirit Wear" | "School Supplies" | "Campus Fuel" | "Accessories";
  price: number;
  originalPrice?: number;
  tag: string;
  description: string;
  image: string;
  sizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "rs-hoodie-01",
    name: "Sideline Hoodie",
    category: "Spirit Wear",
    price: 54,
    originalPrice: 65,
    tag: "Athletics",
    description: "Heavy fleece, a double-lined hood, and Rouse lettering in gold. The layer you’ll keep reaching for.",
    image: "/images/raider_hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "rs-jacket-02",
    name: "Varsity Letterman",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    tag: "Heritage",
    description: "Maroon wool, black sleeves, and a gold chenille R. A classic, right down to the snap front.",
    image: "/images/raider_jacket.jpg",
    sizes: ["M", "L", "XL", "2XL"],
  },
  {
    id: "rs-cap-03",
    name: "Raider Cap",
    category: "Spirit Wear",
    price: 32,
    originalPrice: 38,
    tag: "Sideline",
    description: "A structured black cap with an embroidered R and a comfortable stretch fit.",
    image: "/images/raider_cap.jpg",
    sizes: ["S/M", "L/XL"],
  },
  {
    id: "rs-notebook-04",
    name: "Everyday Notebook",
    category: "School Supplies",
    price: 14,
    tag: "Academic",
    description: "A sturdy hardcover, college-ruled pages, and room for your next good idea.",
    image: "/images/raider_notebook.jpg",
  },
  {
    id: "rs-bottle-05",
    name: "Raider Water Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    tag: "Hydration",
    description: "32 ounces, insulated stainless steel, and a gold R. From first period to the final whistle.",
    image: "/images/raider_bottle.jpg",
  },
  {
    id: "rs-bomber-06",
    name: "Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    tag: "Outerwear",
    description: "A lightweight, water-resistant layer for breezy bleachers and the walk between classes.",
    image: "/images/jacket.jpg",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Blanket",
    category: "Accessories",
    price: 48,
    tag: "Game Day",
    description: "Soft maroon fleece with a gold border. Bring a little extra warmth to the bleachers.",
    image: "/images/hero.jpg",
  },
  {
    id: "rs-pen-08",
    name: "Gel Pens · Set of 3",
    category: "School Supplies",
    price: 9,
    tag: "Stationery",
    description: "Three smooth-writing black gel pens. One for your bag, one for your desk, one to lend.",
    image: "/images/raider_notebook.jpg",
  },
  {
    id: "rs-coldbrew-09",
    name: "Nitro Cold Brew",
    category: "Campus Fuel",
    price: 4.5,
    tag: "Morning Fuel",
    description: "A smooth, chilled 12 oz cold brew for an early start.",
    image: "/images/raider_bottle.jpg",
  },
  {
    id: "rs-protein-10",
    name: "Chocolate Almond Bar",
    category: "Campus Fuel",
    price: 3.5,
    tag: "Fuel",
    description: "Dark chocolate and almonds for the gap between lunch and practice. Contains nuts.",
    image: "/images/raider_bottle.jpg",
  },
];

export const CATEGORIES = [
  "All goods",
  "Spirit Wear",
  "School Supplies",
  "Campus Fuel",
  "Accessories",
];

export const formatPrice = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: price % 1 === 0 ? 0 : 2 }).format(price);
