"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Magnetic from "@/components/Magnetic";
import RoundedButton from "@/components/RoundedButton";
import RaiderMarquee from "@/components/RaiderMarquee";
import {
  ShoppingBag,
  Search,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  HeartHandshake,
  Truck,
  RotateCcw,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Tag,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: "Spirit Wear" | "School Supplies" | "Campus Fuel & Snacks" | "Accessories";
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  tag: string;
  description: string;
  image: string;
  inStock: boolean;
  sizes?: string[];
}

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

const PRODUCTS: Product[] = [
  {
    id: "rs-hoodie-01",
    name: "Rouse Raiders Heavyweight Sideline Hoodie",
    category: "Spirit Wear",
    price: 54,
    originalPrice: 65,
    rating: 5.0,
    reviewsCount: 184,
    tag: "Raider Classic",
    description: "Official Rouse Maroon heavyweight fleece with athletic gold arch lettering and gold lined hood. Made for Friday Night Lights and crisp school mornings.",
    image: "/images/raider_hoodie.jpg",
    inStock: true,
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "rs-jacket-02",
    name: "Rouse Raiders Varsity Letterman Jacket",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    rating: 4.9,
    reviewsCount: 68,
    tag: "Varsity Heritage",
    description: "Authentic varsity letterman in deep maroon wool with genuine black leather sleeves, snap front, and handcrafted chenille gold 'R' chest crest.",
    image: "/images/raider_jacket.jpg",
    inStock: true,
    sizes: ["M", "L", "XL", "2XL"],
  },
  {
    id: "rs-cap-03",
    name: "Rouse Raider FlexFit Athletic Cap",
    category: "Spirit Wear",
    price: 32,
    originalPrice: 38,
    rating: 4.8,
    reviewsCount: 92,
    tag: "Athletics",
    description: "Low-profile structured black twill cap with 3D metallic gold and maroon embroidered 'R' insignia. Moisture-wicking inner headband.",
    image: "/images/raider_cap.jpg",
    inStock: true,
    sizes: ["S/M", "L/XL"],
  },
  {
    id: "rs-notebook-04",
    name: "Raider Gridlock Hardcover Spiral Notebook",
    category: "School Supplies",
    price: 14,
    rating: 4.9,
    reviewsCount: 115,
    tag: "Classroom Essential",
    description: "200-page college-ruled notebook with durable matte black and maroon hardcover, embossed gold foil Raider emblem, and micro-perforated pages.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-bottle-05",
    name: "Raider 32oz Insulated Hydro Flask Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    rating: 5.0,
    reviewsCount: 230,
    tag: "Student Favorite",
    description: "Double-walled vacuum insulated stainless steel flask in matte black with laser-engraved gold varsity R logo. Keeps campus drinks ice-cold for 24 hours.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-bomber-06",
    name: "Raider Nation Tactical Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    rating: 4.8,
    reviewsCount: 54,
    tag: "All-Weather",
    description: "Waterproof lightweight nylon shell with ventilation eyelets, storm collar, and tonal Rouse Raider spirit graphics on back.",
    image: "/images/jacket.jpg",
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Lights Sherpa Stadium Blanket",
    category: "Accessories",
    price: 48,
    rating: 4.9,
    reviewsCount: 88,
    tag: "Game Day",
    description: "Ultra-plush oversized fleece blanket in Rouse Maroon with gold varsity border. Perfect for the student section bleachers.",
    image: "/images/hero.jpg",
    inStock: true,
  },
  {
    id: "rs-pen-08",
    name: "Raider Precision Gel Pen 3-Pack",
    category: "School Supplies",
    price: 9,
    rating: 4.7,
    reviewsCount: 76,
    tag: "Everyday",
    description: "0.5mm smooth-glide quick-dry black gel ink pens with matte soft-touch barrel and gold-foil Rouse High School imprint.",
    image: "/images/raider_notebook.jpg",
    inStock: true,
  },
  {
    id: "rs-coldbrew-09",
    name: "Raider Station Nitro Cold Brew (12oz)",
    category: "Campus Fuel & Snacks",
    price: 4.5,
    rating: 4.9,
    reviewsCount: 142,
    tag: "Campus Fuel",
    description: "Smooth craft organic cold brew coffee infused with nitrogen for an ultra-velvety texture. Ready for first period.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
  {
    id: "rs-protein-10",
    name: "Dark Chocolate Almond Raider Crunch Bar",
    category: "Campus Fuel & Snacks",
    price: 3.5,
    rating: 4.8,
    reviewsCount: 96,
    tag: "Athlete Snack",
    description: "15g plant-based protein bar with fair-trade dark chocolate and roasted Texas almonds. Non-GMO and gluten-free.",
    image: "/images/raider_bottle.jpg",
    inStock: true,
  },
];

const CATEGORIES = [
  "All Essentials",
  "Spirit Wear",
  "School Supplies",
  "Campus Fuel & Snacks",
  "Accessories",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All Essentials");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedModalSize, setSelectedModalSize] = useState<string>("L");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "success">("cart");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      const matchesCat =
        selectedCategory === "All Essentials" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product, size?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemSize = size || (product.sizes ? product.sizes[0] : undefined);
    
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.id === product.id && item.selectedSize === itemSize
      );
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id && item.selectedSize === itemSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            selectedSize: itemSize,
          },
        ];
      }
    });
    showToast(`Added ${product.name} to your bag`);
  };

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id && item.selectedSize === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const rawSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = rawSubtotal * appliedDiscount;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  
  const deliveryFee = fulfillmentType === "pickup" ? 0 : subtotal >= 60 ? 0 : 6;
  const finalTotal = subtotal + deliveryFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = discountCode.trim().toUpperCase();
    if (trimmed === "RAIDERS26" || trimmed === "ROUSE10") {
      setAppliedDiscount(0.1);
      showToast("10% Raider Spirit Discount applied!");
    } else {
      showToast("Invalid promo code. Try 'RAIDERS26'");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Campus Notice Bar */}
      <div className="top-notice-bar" id="campus-status-bar">
        <span className="campus-pill">Campus Store</span>
        <span>
          The Raider Station is OPEN in Room 1104 (Athletic Hallway) • Mon–Fri 8:00 AM – 4:30 PM • Use code <strong>RAIDERS26</strong> for 10% off
        </span>
      </div>

      {/* Header */}
      <header className="header-sticky" id="main-header">
        <div className="nav-inner">
          <a href="#" className="brand-badge" id="brand-link">
            <div className="raider-crest-icon">
              <span className="raider-letter-r">R</span>
            </div>
            <div className="brand-titles">
              <span className="brand-main-title">
                RAIDER <span className="brand-gold-text">STATION</span>
              </span>
              <span className="brand-sub-title">Rouse High School • Leander ISD</span>
            </div>
          </a>

          {/* Search bar */}
          <div className="search-container">
            <Search className="search-field-icon" size={17} />
            <input
              id="search-store-input"
              type="text"
              className="search-input-field"
              placeholder="Search spirit wear, supplies, hoodies, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-right-actions">
            <div className="campus-location-tag">
              <span className="online-pulse-dot" />
              <MapPin size={14} style={{ color: "var(--rouse-gold)" }} />
              <span>Room 1104</span>
            </div>

            <Magnetic strength={0.25}>
              <button
                id="open-bag-btn"
                className="cart-toggle-btn"
                onClick={() => {
                  setIsCartOpen(true);
                  setCheckoutStep("cart");
                }}
                aria-label="Open Cart Bag"
              >
                <ShoppingBag size={18} />
                <span>Bag</span>
                <span className="cart-bubble-count" id="cart-item-count">
                  {totalItemsCount}
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Infinite Spirit Marquee */}
      <RaiderMarquee />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="hero-wrapper" id="hero-section">
          <div className="hero-grid-layout">
            <div>
              <div className="raider-tag-badge">
                <Sparkles size={14} />
                <span>Made By Raiders, For Raiders</span>
              </div>
              <h1 className="hero-main-heading">
                Creating Traditions That Others Can <span className="hero-highlight-gold">Live Up To.</span>
              </h1>
              <p className="hero-subtext">
                Rouse High School’s student-centered campus store. Modern varsity apparel, essential classroom supplies, and gameday snacks built around authentic maroon, gold, and black Raider pride.
              </p>

              <div className="hero-cta-row">
                <RoundedButton
                  variant="primary"
                  onClick={() => {
                    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <ShoppingBag size={17} />
                  <span>Shop Raider Gear</span>
                </RoundedButton>

                <RoundedButton
                  variant="maroon"
                  onClick={() => {
                    const hoodie = PRODUCTS.find((p) => p.id === "rs-hoodie-01");
                    if (hoodie) {
                      setSelectedProduct(hoodie);
                    }
                  }}
                >
                  <Tag size={17} />
                  <span>Featured: Sideline Hoodie</span>
                </RoundedButton>
              </div>

              <div className="hero-stats-row">
                <div className="stat-box">
                  <h4>ROOM 1104</h4>
                  <p>Athletic Hallway Station</p>
                </div>
                <div className="stat-box">
                  <h4>100%</h4>
                  <p>Student Leadership Run</p>
                </div>
                <div className="stat-box">
                  <h4>LISD</h4>
                  <p>Officially Licensed</p>
                </div>
              </div>
            </div>

            <div className="hero-media-wrapper">
              <div className="hero-card-frame">
                <Image
                  src="/images/raider_hero.jpg"
                  alt="Rouse High School Raider Station"
                  width={800}
                  height={450}
                  className="hero-media-img"
                  priority
                />
                <div className="hero-corner-overlay">
                  <div className="overlay-crest">R</div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>
                      The Raider Station Hub
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Campus Retail & Spirit Headquarters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="catalog-container" id="catalog-section">
          <div className="catalog-heading-wrap">
            <div className="catalog-kicker">Rouse High School Merch</div>
            <h2 className="catalog-title">Campus Catalog & Essentials</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="category-tab-bar" id="category-filter-bar">
            {CATEGORIES.map((category) => (
              <Magnetic key={category} strength={0.2}>
                <button
                  id={`cat-btn-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`category-tab-btn ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span>{category}</span>
                </button>
              </Magnetic>
            ))}
          </div>

          {/* Product Grid */}
          <div className="products-grid-layout" id="products-grid">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="raider-product-card"
                id={`card-${product.id}`}
                onClick={() => {
                  setSelectedProduct(product);
                  if (product.sizes) setSelectedModalSize(product.sizes[0]);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="card-image-box">
                  <span className="card-badge-pill">{product.tag}</span>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="card-product-img"
                  />
                </div>

                <div className="card-body">
                  <div className="card-meta-line">
                    <span className="card-category-label">{product.category}</span>
                    <div className="card-star-rating">
                      <span>★</span>
                      <span>{product.rating.toFixed(1)}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        ({product.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <h3 className="card-title-text">{product.name}</h3>
                  <p className="card-desc-text">{product.description}</p>

                  <div className="card-bottom-row">
                    <div>
                      <div className="card-price-display">${product.price.toFixed(2)}</div>
                      {product.originalPrice && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            textDecoration: "line-through",
                          }}
                        >
                          ${product.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button
                      id={`add-btn-${product.id}`}
                      className="card-add-btn"
                      onClick={(e) => addToCart(product, undefined, e)}
                    >
                      <Plus size={15} />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
              <h3>No items match your search.</h3>
              <p style={{ marginTop: "0.5rem" }}>Try searching for &quot;hoodie&quot;, &quot;jacket&quot;, or &quot;supplies&quot;.</p>
              <button
                className="raider-rounded-btn primary"
                style={{ marginTop: "1.5rem" }}
                onClick={() => {
                  setSelectedCategory("All Essentials");
                  setSearchQuery("");
                }}
              >
                Reset Catalog Filters
              </button>
            </div>
          )}
        </section>

        {/* Campus Fulfillment Values */}
        <section className="campus-fulfillment-bar">
          <div className="fulfillment-grid">
            <div className="fulfillment-card">
              <div className="fulfillment-icon-wrap">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="fulfillment-title">Free Campus Pickup</h4>
                <p className="fulfillment-desc">
                  Collect your items from Room 1104 during passing periods, lunch waves, or after school.
                </p>
              </div>
            </div>

            <div className="fulfillment-card">
              <div className="fulfillment-icon-wrap">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h4 className="fulfillment-title">100% Student Benefiting</h4>
                <p className="fulfillment-desc">
                  All store proceeds fund Rouse High School student programs, clubs, and athletic teams.
                </p>
              </div>
            </div>

            <div className="fulfillment-card">
              <div className="fulfillment-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="fulfillment-title">Official LISD Licensing</h4>
                <p className="fulfillment-desc">
                  Guaranteed authentic Rouse Maroon, Athletic Gold, and Black colors with authorized trademarks.
                </p>
              </div>
            </div>

            <div className="fulfillment-card">
              <div className="fulfillment-icon-wrap">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4 className="fulfillment-title">Hassle-Free Size Swaps</h4>
                <p className="fulfillment-desc">
                  Need a different size? Bring unworn gear directly to Raider Station for immediate exchange.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Cart Bag Drawer */}
      <div
        className={`cart-overlay ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />
      <aside className={`cart-panel ${isCartOpen ? "open" : ""}`} id="cart-drawer-panel">
        <div className="cart-panel-header">
          <div className="cart-heading-title">
            <ShoppingBag size={20} style={{ color: "var(--rouse-gold)" }} />
            <span>Raider Bag ({totalItemsCount})</span>
          </div>
          <button
            id="close-drawer-btn"
            className="cart-dismiss-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag"
          >
            <X size={24} />
          </button>
        </div>

        {checkoutStep === "cart" ? (
          <>
            {/* Fulfillment Toggle */}
            <div style={{ padding: "1rem 1.6rem", borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                Delivery Preference:
              </div>
              <div className="pickup-selector-box">
                <button
                  type="button"
                  className={`pickup-option-btn ${fulfillmentType === "pickup" ? "selected" : ""}`}
                  onClick={() => setFulfillmentType("pickup")}
                >
                  Campus Pickup (Free)
                </button>
                <button
                  type="button"
                  className={`pickup-option-btn ${fulfillmentType === "delivery" ? "selected" : ""}`}
                  onClick={() => setFulfillmentType("delivery")}
                >
                  Home Shipping ({subtotal >= 60 ? "Free" : "$6"})
                </button>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {fulfillmentType === "pickup"
                  ? "Pick up at The Raider Station (Room 1104) during school hours."
                  : "Ships to your home in Leander / Travis / Williamson County."}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="cart-scroll-items" id="cart-items-container">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "var(--text-secondary)" }}>
                  <ShoppingBag size={48} style={{ color: "var(--border-gold)", margin: "0 auto 1rem" }} />
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                    Your bag is currently empty.
                  </p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>
                    Browse our hoodies, supplies, or snacks to add items.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize || ""}-${idx}`} className="cart-entry-card">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={72}
                      height={72}
                      className="cart-entry-thumb"
                    />
                    <div className="cart-entry-details">
                      <div>
                        <div className="cart-entry-title">{item.name}</div>
                        {item.selectedSize && (
                          <div style={{ fontSize: "0.75rem", color: "var(--rouse-gold)" }}>
                            Size: {item.selectedSize}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div className="cart-entry-price">${(item.price * item.quantity).toFixed(2)}</div>
                        <div className="cart-stepper">
                          <button
                            className="stepper-btn"
                            onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, minWidth: "18px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="stepper-btn"
                            onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-panel-footer">
                {/* Promo code form */}
                <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Promo code (e.g. RAIDERS26)"
                    className="search-input-field"
                    style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem", borderRadius: "8px" }}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="card-add-btn"
                    style={{ borderRadius: "8px", fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                  >
                    Apply
                  </button>
                </form>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  <span>Subtotal</span>
                  <span>${rawSubtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#22c55e", marginBottom: "0.4rem" }}>
                    <span>Raider Spirit Discount (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  <span>Fulfillment ({fulfillmentType === "pickup" ? "Room 1104" : "Standard"})</span>
                  <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 900, color: "#fff", marginBottom: "1.25rem" }}>
                  <span>Total</span>
                  <span style={{ color: "var(--rouse-gold-bright)" }}>${finalTotal.toFixed(2)}</span>
                </div>

                <button
                  id="checkout-order-btn"
                  className="checkout-action-btn"
                  onClick={() => setCheckoutStep("success")}
                >
                  <span>Place Campus Order</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "3rem 2rem", textAlign: "center", margin: "auto" }}>
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.15)",
                border: "2px solid #22c55e",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
              Order Confirmed!
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Thank you for supporting Rouse High School! Order reference: <strong>#RS-ROUSE-2681</strong>.
              {fulfillmentType === "pickup"
                ? " Show this screen or your student ID at Room 1104 to collect your gear."
                : " Your package will be dispatched via priority shipping to your address."}
            </p>
            <RoundedButton
              variant="primary"
              onClick={() => {
                setCart([]);
                setCheckoutStep("cart");
                setIsCartOpen(false);
              }}
            >
              Back to Raider Station
            </RoundedButton>
          </div>
        )}
      </aside>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              background: "#15171f",
              border: "1.5px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "var(--radius-lg)",
              maxWidth: "680px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 30px 70px rgba(0,0,0,0.9), 0 0 35px rgba(110, 26, 39, 0.4)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
              }}
              onClick={() => setSelectedProduct(null)}
            >
              <X size={18} />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr" }}>
              <div style={{ position: "relative", minHeight: "340px", background: "#0d0e13" }}>
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--rouse-gold-bright)", fontWeight: 800, textTransform: "uppercase" }}>
                    {selectedProduct.category}
                  </span>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", margin: "0.4rem 0 0.6rem" }}>
                    {selectedProduct.name}
                  </h3>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", marginBottom: "0.85rem" }}>
                    ${selectedProduct.price.toFixed(2)}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {selectedProduct.description}
                  </p>

                  {selectedProduct.sizes && (
                    <div style={{ marginBottom: "1.25rem" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                        Select Size:
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              border: selectedModalSize === size ? "1.5px solid var(--rouse-gold)" : "1px solid var(--border-subtle)",
                              background: selectedModalSize === size ? "var(--maroon-gradient)" : "rgba(255,255,255,0.05)",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: "0.8rem",
                              cursor: "pointer",
                            }}
                            onClick={() => setSelectedModalSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <RoundedButton
                  variant="primary"
                  onClick={() => {
                    addToCart(selectedProduct, selectedProduct.sizes ? selectedModalSize : undefined);
                    setSelectedProduct(null);
                  }}
                >
                  <Plus size={16} />
                  <span>Add to Bag (${selectedProduct.price.toFixed(2)})</span>
                </RoundedButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastMessage && (
        <div className="raider-toast-box" id="toast-message">
          <Sparkles size={18} style={{ color: "var(--rouse-gold-bright)" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="raider-footer-section" id="footer">
        <div className="footer-inner-grid">
          <div className="footer-about-block">
            <div className="brand-badge">
              <div className="raider-crest-icon">
                <span className="raider-letter-r">R</span>
              </div>
              <div className="brand-titles">
                <span className="brand-main-title">
                  RAIDER <span className="brand-gold-text">STATION</span>
                </span>
                <span className="brand-sub-title">Rouse High School • Leander ISD</span>
              </div>
            </div>
            <p>
              Student-centered campus store. Official varsity spirit wear, high school supplies, athletic gear, and student essentials. <em>Made by Raiders, for Raiders.</em>
            </p>
          </div>

          <div className="footer-nav-col">
            <h4>Campus Store</h4>
            <ul>
              <li><a href="#catalog-section">Spirit Wear & Hoodies</a></li>
              <li><a href="#catalog-section">Varsity Letterman Jackets</a></li>
              <li><a href="#catalog-section">Classroom Supplies</a></li>
              <li><a href="#catalog-section">Game Day Accessories</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Raider Nation</h4>
            <ul>
              <li><a href="#catalog-section">Room 1104 Store Hours</a></li>
              <li><a href="#catalog-section">Campus Pickup Guidelines</a></li>
              <li><a href="#catalog-section">Rouse Booster Clubs</a></li>
              <li><a href="#catalog-section">LISD Licensing Program</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Location & Hours</h4>
            <ul style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.7 }}>
              <li><strong>Rouse High School</strong></li>
              <li>1222 Raider Way</li>
              <li>Leander, TX 78641</li>
              <li>Room 1104 • Mon–Fri 8am–4:30pm</li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright-bar">
          <div>
            © {new Date().getFullYear()} Raider Station — Rouse High School (Leander ISD). All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Campus Status: <strong style={{ color: "#22c55e" }}>Open</strong></span>
            <span>Motto: <em>Creating Traditions</em></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
