export interface Product {
  id: string;
  name: string;
  category: "Spirit Wear" | "School Supplies" | "Snacks & Drinks" | "Accessories";
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
    description: "Maroon fleece hoodie with a double-lined hood and gold Rouse lettering.",
    image: "/images/raider_hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "rs-notebook-04",
    name: "Everyday Notebook",
    category: "School Supplies",
    price: 14,
    tag: "College-ruled",
    description: "Hardcover notebook with college-ruled pages.",
    image: "/images/raider_notebook.jpg",
  },
  {
    id: "rs-protein-10",
    name: "Chocolate Almond Bar",
    category: "Snacks & Drinks",
    price: 3.5,
    tag: "Contains nuts",
    description: "Dark chocolate and almond bar. Contains nuts.",
    image: "/images/raider_bottle.jpg",
  },
  {
    id: "rs-bottle-05",
    name: "Raider Water Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    tag: "32 oz",
    description: "32 oz insulated stainless steel bottle with a gold R.",
    image: "/images/raider_bottle.jpg",
  },
  {
    id: "rs-pen-08",
    name: "Gel Pens · Set of 3",
    category: "School Supplies",
    price: 9,
    tag: "Black ink",
    description: "Set of three black gel pens.",
    image: "/images/raider_notebook.jpg",
  },
  {
    id: "rs-coldbrew-09",
    name: "Nitro Cold Brew",
    category: "Snacks & Drinks",
    price: 4.5,
    tag: "12 oz",
    description: "Chilled 12 oz nitro cold brew.",
    image: "/images/raider_bottle.jpg",
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
    id: "rs-bomber-06",
    name: "Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    tag: "Outerwear",
    description: "Lightweight, water-resistant windbreaker.",
    image: "/images/jacket.jpg",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Blanket",
    category: "Accessories",
    price: 48,
    tag: "Game Day",
    description: "Maroon fleece blanket with a gold border.",
    image: "/images/hero.jpg",
  },
  {
    id: "rs-jacket-02",
    name: "Varsity Letterman",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    tag: "Heritage",
    description: "Maroon wool jacket with black sleeves, a gold chenille R, and snap closure.",
    image: "/images/raider_jacket.jpg",
    sizes: ["M", "L", "XL", "2XL"],
  },
];

export const CATEGORIES = [
  "All items",
  "Spirit Wear",
  "School Supplies",
  "Snacks & Drinks",
  "Accessories",
];

export const formatPrice = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: price % 1 === 0 ? 0 : 2 }).format(price);
