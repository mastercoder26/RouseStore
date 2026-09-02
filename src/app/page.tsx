"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Magnetic from "@/components/Magnetic";
import RoundedButton from "@/components/RoundedButton";
import RaiderMarquee from "@/components/RaiderMarquee";
import SlidingProducts from "@/components/SlidingProducts";
import PreLoader from "@/components/animations/PreLoader";
import TextSlideUp from "@/components/animations/TextSlideUp";
import ContrastCursor from "@/components/animations/ContrastCursor";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  X,
  Plus,
  Minus,
  ArrowUpRight,
} from "lucide-react";

interface Product {
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
    tag: "Athletics",
    description: "500 GSM heavy-fleece hoodie in official Rouse Maroon with varsity gold collegiate arch lettering and double-lined hood.",
    image: "/images/raider_hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "rs-jacket-02",
    name: "Rouse Raiders Varsity Letterman Jacket",
    category: "Spirit Wear",
    price: 185,
    originalPrice: 220,
    tag: "Heritage",
    description: "Traditional varsity letterman featuring deep maroon melton wool, black leather sleeves, snap front, and handcrafted chenille gold 'R' patch.",
    image: "/images/raider_jacket.jpg",
    sizes: ["M", "L", "XL", "2XL"],
  },
  {
    id: "rs-cap-03",
    name: "Rouse Raider FlexFit Athletic Cap",
    category: "Spirit Wear",
    price: 32,
    originalPrice: 38,
    tag: "Sideline",
    description: "Structured matte black performance twill cap with 3D gold-trimmed maroon embroidered 'R' insignia and moisture-wicking sweatband.",
    image: "/images/raider_cap.jpg",
    sizes: ["S/M", "L/XL"],
  },
  {
    id: "rs-notebook-04",
    name: "Raider Gridlock Hardcover Spiral Notebook",
    category: "School Supplies",
    price: 14,
    tag: "Academic",
    description: "200-page college-ruled student notebook with durable matte black and maroon hardcover, embossed gold foil emblem, and perforated pages.",
    image: "/images/raider_notebook.jpg",
  },
  {
    id: "rs-bottle-05",
    name: "Raider 32oz Insulated Hydro Flask Bottle",
    category: "Accessories",
    price: 36,
    originalPrice: 42,
    tag: "Hydration",
    description: "Double-walled vacuum insulated stainless steel bottle in matte black with laser-etched gold varsity R emblem. 24hr cold retention.",
    image: "/images/raider_bottle.jpg",
  },
  {
    id: "rs-bomber-06",
    name: "Raider Nation Tactical Stadium Windbreaker",
    category: "Spirit Wear",
    price: 88,
    originalPrice: 105,
    tag: "Outerwear",
    description: "Water-resistant lightweight shell with ventilation grommets, storm collar, and tonal Rouse Raider spirit typography on the rear.",
    image: "/images/jacket.jpg",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "rs-blanket-07",
    name: "Friday Night Lights Sherpa Stadium Blanket",
    category: "Accessories",
    price: 48,
    tag: "Game Day",
    description: "Ultra-plush oversized fleece blanket in Rouse Maroon with gold varsity edge border. Tailored for bleachers and Friday night kickoffs.",
    image: "/images/hero.jpg",
  },
  {
    id: "rs-pen-08",
    name: "Raider Precision Gel Pen 3-Pack",
    category: "School Supplies",
    price: 9,
    tag: "Stationery",
    description: "0.5mm smooth-glide quick-dry black gel ink pens with matte soft-touch barrel and subtle gold Rouse High School lettering.",
    image: "/images/raider_notebook.jpg",
  },
  {
    id: "rs-coldbrew-09",
    name: "Raider Station Nitro Cold Brew (12oz)",
    category: "Campus Fuel",
    price: 4.5,
    tag: "Morning Fuel",
    description: "Smooth organic craft cold brew coffee infused with nitrogen for an ultra-velvety texture. Chilled and ready before first period.",
    image: "/images/raider_bottle.jpg",
  },
  {
    id: "rs-protein-10",
    name: "Dark Chocolate Almond Raider Crunch Bar",
    category: "Campus Fuel",
    price: 3.5,
    tag: "Fuel",
    description: "15g plant protein energy bar with fair-trade dark chocolate and roasted Texas almonds. Non-GMO and gluten-free.",
    image: "/images/raider_bottle.jpg",
  },
];

const CATEGORIES = [
  "All Essentials",
  "Spirit Wear",
  "School Supplies",
  "Campus Fuel",
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
    }, 2800);
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
    showToast(`Added ${product.name} to bag`);
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
      showToast("10% Student Spirit Discount applied");
    } else {
      showToast("Invalid code. Try 'RAIDERS26'");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Portfolio Smooth PreLoader */}
      <PreLoader />

      {/* Portfolio Contrast Spring Cursor */}
      <ContrastCursor />

      {/* Minimal Top Bar */}
      <div className="minimal-top-bar" id="top-bar">
        <div className="top-bar-inner">
          <div className="campus-location-pill">
            <span className="dot-indicator" />
            <span>Room 1104 • The Raider Station • Mon–Fri 8:00 AM – 4:30 PM</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Rouse High School • Leander ISD • Code: <strong>RAIDERS26</strong>
          </div>
        </div>
      </div>

      {/* Minimal Header */}
      <header className="minimal-header" id="main-header">
        <div className="minimal-nav-container">
          <a href="#" className="brand-minimal" id="brand-logo">
            <div className="brand-crest-minimal">R</div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span className="brand-name-minimal">RAIDER STATION</span>
              <span className="brand-tag-minimal">Rouse High School</span>
            </div>
          </a>

          {/* Search bar */}
          <div className="minimal-search-box">
            <Search className="minimal-search-icon" size={15} />
            <input
              id="search-input"
              type="text"
              className="minimal-search-input"
              placeholder="Search spirit wear, hoodies, supplies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="minimal-nav-actions">
            <Magnetic strength={0.25}>
              <button
                id="cart-trigger-btn"
                className="minimal-bag-btn"
                onClick={() => {
                  setIsCartOpen(true);
                  setCheckoutStep("cart");
                }}
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag size={16} />
                <span>Bag</span>
                <span className="bag-count-pill" id="bag-count">
                  {totalItemsCount}
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Marquee Ticker */}
      <RaiderMarquee />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Dennis Snellenberg Editorial Hero Section with Text Slide-Up */}
        <section className="editorial-hero-section" id="hero-section">
          <div className="hero-editorial-grid">
            <div>
              <div className="editorial-kicker">
                <span className="kicker-dot" />
                <span>Rouse High School • Leander, Texas</span>
              </div>

              {/* Text Slide-Up Animation from Portfolio */}
              <TextSlideUp
                text="Creating traditions that others can live up to."
                className="editorial-headline"
                element="h1"
              />

              <p className="editorial-lead">
                The official student-centered retail studio for Rouse High School. Minimalist varsity outerwear, essential classroom supplies, and gameday gear designed with understated maroon, gold, and black pride.
              </p>

              <div className="editorial-buttons">
                <RoundedButton
                  variant="primary"
                  onClick={() => {
                    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span>Explore Collection</span>
                  <ArrowUpRight size={16} />
                </RoundedButton>

                <RoundedButton
                  variant="outline"
                  onClick={() => {
                    const hoodie = PRODUCTS.find((p) => p.id === "rs-hoodie-01");
                    if (hoodie) setSelectedProduct(hoodie);
                  }}
                >
                  <span>Sideline Hoodie</span>
                </RoundedButton>
              </div>

              <div className="editorial-specs-row">
                <div className="spec-block">
                  <h4>Room 1104</h4>
                  <p>Athletic Hallway Station</p>
                </div>
                <div className="spec-block">
                  <h4>100% Student</h4>
                  <p>DECA & Student Led</p>
                </div>
                <div className="spec-block">
                  <h4>LISD</h4>
                  <p>Officially Licensed</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="editorial-visual-box"
            >
              <Image
                src="/images/raider_hero.jpg"
                alt="Rouse High School Student Store"
                width={800}
                height={500}
                className="editorial-visual-img"
                priority
              />
              <div className="visual-floating-caption">
                <div className="caption-bold">The Raider Station Hub</div>
                <div className="caption-sub">1222 Raider Way • Leander, TX</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sliding Product Strip (Inspired by SlidingImages in portfolio) */}
        <SlidingProducts
          items={PRODUCTS.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image,
          }))}
          onSelect={(item) => {
            const product = PRODUCTS.find((p) => p.id === item.id);
            if (product) setSelectedProduct(product);
          }}
        />

        {/* Catalog Section */}
        <section className="catalog-section-wrap" id="catalog-section">
          <div className="catalog-header-minimal">
            <div>
              <h2 className="section-h2-minimal">Campus Essentials</h2>
              <p className="section-sub-minimal">
                Official spirit apparel, stationery supplies, and student gear.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="category-filter-row" id="filter-pills">
              {CATEGORIES.map((category) => (
                <Magnetic key={category} strength={0.2}>
                  <button
                    id={`filter-${category.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`filter-pill-minimal ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Product Grid: Framer Motion Cards exactly like ProjectCard.tsx in Portfolio */}
          <div className="cards-grid-minimal" id="products-grid">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{
                  y: -5,
                  transition: { type: "spring", stiffness: 350, damping: 25 },
                }}
                className="product-card-minimal"
                id={`card-${product.id}`}
                onClick={() => {
                  setSelectedProduct(product);
                  if (product.sizes) setSelectedModalSize(product.sizes[0]);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="card-img-wrap-minimal">
                  <span className="card-pill-tag">{product.tag}</span>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="card-img-element"
                  />
                </div>

                <div className="card-content-minimal">
                  <span className="card-cat-label">{product.category}</span>
                  <h3 className="card-title-minimal">{product.name}</h3>
                  <p className="card-desc-minimal">{product.description}</p>

                  <div className="card-footer-minimal">
                    <span className="price-minimal">${product.price.toFixed(2)}</span>
                    <button
                      id={`add-btn-${product.id}`}
                      className="add-btn-minimal"
                      onClick={(e) => addToCart(product, undefined, e)}
                    >
                      <Plus size={14} />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>
                No items match your criteria.
              </p>
              <button
                className="raider-rounded-btn outline"
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  setSelectedCategory("All Essentials");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Minimalist Value Pillars */}
        <section className="pillars-section">
          <div className="pillars-grid">
            <div className="pillar-card">
              <h4>Free Campus Pickup</h4>
              <p>Pick up directly at Room 1104 during passing periods, lunch, or after school hours.</p>
            </div>
            <div className="pillar-card">
              <h4>Student Benefiting</h4>
              <p>100% of proceeds fund Rouse student leadership initiatives, clubs, and athletic teams.</p>
            </div>
            <div className="pillar-card">
              <h4>LISD Official Licensing</h4>
              <p>Authentic school colors: Rouse Maroon, Athletic Gold, and Black with official trademarks.</p>
            </div>
            <div className="pillar-card">
              <h4>Direct Exchanges</h4>
              <p>Need a different size? Bring unworn gear directly to Raider Station for immediate swap.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Cart Drawer */}
      <div
        className={`drawer-backdrop ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />
      <aside className={`drawer-sidebar ${isCartOpen ? "open" : ""}`} id="cart-drawer">
        <div className="drawer-top">
          <h3 className="drawer-title">Bag ({totalItemsCount})</h3>
          <button
            id="close-cart-btn"
            className="drawer-close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag"
          >
            <X size={20} />
          </button>
        </div>

        {checkoutStep === "cart" ? (
          <>
            {/* Fulfillment Selector */}
            <div style={{ padding: "1.2rem 1.8rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Fulfillment Method
              </div>
              <div style={{ display: "flex", gap: "0.4rem", background: "var(--bg-main)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                    border: "none",
                    background: fulfillmentType === "pickup" ? "#fff" : "transparent",
                    color: fulfillmentType === "pickup" ? "#000" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setFulfillmentType("pickup")}
                >
                  Room 1104 Pickup (Free)
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                    border: "none",
                    background: fulfillmentType === "delivery" ? "#fff" : "transparent",
                    color: fulfillmentType === "delivery" ? "#000" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setFulfillmentType("delivery")}
                >
                  Home Shipping ({subtotal >= 60 ? "Free" : "$6"})
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="drawer-items" id="drawer-items-list">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                    Your bag is empty.
                  </p>
                  <p style={{ fontSize: "0.825rem", marginTop: "0.3rem", color: "var(--text-muted)" }}>
                    Select items from the catalog to get started.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize || ""}-${idx}`} className="drawer-item-row">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={68}
                      height={68}
                      className="drawer-thumb"
                    />
                    <div className="drawer-item-details">
                      <div>
                        <div className="drawer-item-title">{item.name}</div>
                        {item.selectedSize && (
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Size: {item.selectedSize}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="drawer-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        <div className="stepper-minimal">
                          <button
                            className="stepper-btn-minimal"
                            onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                            aria-label="Decrease"
                          >
                            <Minus size={11} />
                          </button>
                          <span style={{ fontSize: "0.825rem", fontWeight: 700, minWidth: "16px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="stepper-btn-minimal"
                            onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                            aria-label="Increase"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-bottom">
                <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Code: RAIDERS26"
                    className="minimal-search-input"
                    style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem", borderRadius: "6px" }}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="add-btn-minimal"
                    style={{ borderRadius: "6px", fontSize: "0.8rem" }}
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
                    <span>10% Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  <span>Fulfillment</span>
                  <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: 800, color: "#fff", marginBottom: "1.25rem" }}>
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>

                <button
                  id="checkout-btn"
                  className="raider-rounded-btn primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setCheckoutStep("success")}
                >
                  <span>Place Order</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "3rem 2rem", textAlign: "center", margin: "auto" }}>
            <CheckCircle2 size={44} style={{ color: "#22c55e", margin: "0 auto 1.25rem" }} />
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
              Order Confirmed
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Reference number: <strong>#RS-ROUSE-2681</strong>.
              {fulfillmentType === "pickup"
                ? " Please present your student ID at Room 1104 to collect your items."
                : " Your package will be shipped to your address."}
            </p>
            <RoundedButton
              variant="outline"
              onClick={() => {
                setCart([]);
                setCheckoutStep("cart");
                setIsCartOpen(false);
              }}
            >
              Continue Browsing
            </RoundedButton>
          </div>
        )}
      </aside>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
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
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              maxWidth: "640px",
              width: "100%",
              overflow: "hidden",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border-subtle)",
                color: "#fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
              }}
              onClick={() => setSelectedProduct(null)}
            >
              <X size={16} />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ position: "relative", minHeight: "320px", background: "#000" }}>
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    {selectedProduct.category}
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: "0.35rem 0 0.5rem" }}>
                    {selectedProduct.name}
                  </h3>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", marginBottom: "0.85rem" }}>
                    ${selectedProduct.price.toFixed(2)}
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {selectedProduct.description}
                  </p>

                  {selectedProduct.sizes && (
                    <div style={{ marginBottom: "1.25rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                        Select Size:
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: "4px",
                              border: selectedModalSize === size ? "1px solid #fff" : "1px solid var(--border-subtle)",
                              background: selectedModalSize === size ? "#fff" : "var(--bg-main)",
                              color: selectedModalSize === size ? "#000" : "#fff",
                              fontWeight: 700,
                              fontSize: "0.78rem",
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

                <button
                  className="raider-rounded-btn primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    addToCart(selectedProduct, selectedProduct.sizes ? selectedModalSize : undefined);
                    setSelectedProduct(null);
                  }}
                >
                  <Plus size={15} />
                  <span>Add to Bag (${selectedProduct.price.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="minimal-toast" id="toast-box">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="minimal-footer" id="footer">
        <div className="footer-grid-minimal">
          <div>
            <div className="brand-minimal">
              <div className="brand-crest-minimal">R</div>
              <span className="brand-name-minimal">RAIDER STATION</span>
            </div>
            <p className="footer-brand-p">
              The student-run campus store of Rouse High School. Built around authentic Raider pride and minimalist athletic design. Made by Raiders, for Raiders.
            </p>
          </div>

          <div className="footer-col-minimal">
            <h4>Collection</h4>
            <ul>
              <li><a href="#catalog-section">Spirit Wear & Hoodies</a></li>
              <li><a href="#catalog-section">Varsity Letterman Jackets</a></li>
              <li><a href="#catalog-section">Classroom Supplies</a></li>
              <li><a href="#catalog-section">Game Day Accessories</a></li>
            </ul>
          </div>

          <div className="footer-col-minimal">
            <h4>Campus Hub</h4>
            <ul>
              <li><a href="#catalog-section">Room 1104 Guidelines</a></li>
              <li><a href="#catalog-section">Campus Pickup Hours</a></li>
              <li><a href="#catalog-section">Rouse Booster Clubs</a></li>
              <li><a href="#catalog-section">Leander ISD Licensing</a></li>
            </ul>
          </div>

          <div className="footer-col-minimal">
            <h4>Location</h4>
            <ul style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7 }}>
              <li>Rouse High School</li>
              <li>1222 Raider Way</li>
              <li>Leander, TX 78641</li>
              <li>Mon–Fri 8:00 AM – 4:30 PM</li>
            </ul>
          </div>
        </div>

        <div className="footer-sub-bar">
          <div>© {new Date().getFullYear()} Raider Station — Rouse High School. All rights reserved.</div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Campus Status: Open</span>
            <span>Leander ISD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
