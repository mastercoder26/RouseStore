"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  tag: string;
  description: string;
  image: string;
  colors: string[];
}

interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
}

const PRODUCTS: Product[] = [
  {
    id: "rs-bomber-01",
    name: "RS-01 Tactical Flight Bomber",
    category: "Outerwear",
    price: 220,
    originalPrice: 260,
    rating: 4.9,
    reviewsCount: 128,
    tag: "Best Seller",
    description: "Water-repellent technical nylon weave with modular sleeve utility pockets and custom matte hardware.",
    image: "/images/jacket.jpg",
    colors: ["#3b4938", "#1e2129", "#525252"],
  },
  {
    id: "rs-hoodie-02",
    name: "RS-02 Heavyweight Luxe Hoodie",
    category: "Heavyweight Hoodies",
    price: 145,
    originalPrice: 170,
    rating: 5.0,
    reviewsCount: 214,
    tag: "Essential Drop",
    description: "550 GSM double-faced French Terry cotton. Drop-shoulder relaxed boxy silhouette with reinforced seams.",
    image: "/images/hoodie.jpg",
    colors: ["#141416", "#2c303d", "#8c827a"],
  },
  {
    id: "rs-sneaker-03",
    name: "RS-03 Kinetic Aerotrek Runner",
    category: "Footwear",
    price: 195,
    originalPrice: 230,
    rating: 4.8,
    reviewsCount: 94,
    tag: "Limited Release",
    description: "Architectural dual-density EVA midsole, high-tensile engineered knit, and Italian suede accents.",
    image: "/images/sneaker.jpg",
    colors: ["#171717", "#e5e5e5", "#334155"],
  },
  {
    id: "rs-shell-04",
    name: "RS-04 Stormshield Stealth Parka",
    category: "Outerwear",
    price: 285,
    originalPrice: 320,
    rating: 4.9,
    reviewsCount: 76,
    tag: "New Capsule",
    description: "3-layer seam-sealed breathable membrane with magnetic storm flap and ergonomic storm collar.",
    image: "/images/hero.jpg",
    colors: ["#181a20", "#333b47"],
  },
];

const CATEGORIES = ["All Pieces", "Outerwear", "Heavyweight Hoodies", "Footwear"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All Pieces");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "success">("cart");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      const matchesCat =
        selectedCategory === "All Pieces" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          { ...product, quantity: 1, selectedColor: product.colors[0] },
        ];
      }
    });
    showToast(`Added ${product.name} to your bag`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 200;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast(`Welcome to VIP Access! Look out for exclusive drop codes.`);
    setNewsletterEmail("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Announcement Bar */}
      <div className="announcement-bar" id="announcement-bar">
        <span className="announcement-pill">Drop 04</span>
        <span>Fall / Winter 2026 Architectural Essentials — Complimentary Worldwide Express on Orders $200+</span>
      </div>

      {/* Header */}
      <header className="header-sticky" id="main-header">
        <div className="nav-container">
          <a href="#" className="logo-brand" id="brand-logo">
            <div className="logo-icon">R</div>
            <span className="logo-text">ROUSE STORE</span>
          </a>

          <div className="nav-search-wrapper">
            <svg
              className="search-icon-svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="search-input"
              type="text"
              className="nav-search-input"
              placeholder="Search garments, hoodies, silhouettes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="nav-actions">
            <a href="#catalog" className="nav-link" id="nav-catalog-link">
              Collection
            </a>
            <a href="#about" className="nav-link" id="nav-manifesto-link">
              Manifesto
            </a>
            <button
              id="cart-toggle-btn"
              className="cart-button"
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep("cart");
              }}
              aria-label="Open Shopping Bag"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Bag</span>
              <span className="cart-count-badge" id="cart-badge-count">
                {totalItemsCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="hero-section" id="hero-banner">
          <div className="hero-grid">
            <div>
              <div className="hero-tag">
                <span className="hero-tag-pulse"></span>
                <span>SEASONAL CAPSULE · NOW AVAILABLE</span>
              </div>
              <h1 className="hero-title">
                Engineered Silhouettes for the <span className="hero-title-highlight">Modern Epoch</span>
              </h1>
              <p className="hero-description">
                Rouse Store merges high-density technical textile innovation with timeless urban minimalism. Built for all-weather utility and refined everyday presence.
              </p>
              <div className="hero-buttons">
                <a href="#catalog" className="btn-primary" id="hero-explore-btn">
                  <span>Explore Capsule 04</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <button
                  className="btn-secondary"
                  id="hero-quick-hoodie-btn"
                  onClick={() => {
                    const hoodie = PRODUCTS.find((p) => p.id === "rs-hoodie-02");
                    if (hoodie) setSelectedProduct(hoodie);
                  }}
                >
                  Featured: Heavy Hoodie
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <h3>550 GSM</h3>
                  <p>Custom Heavy Cotton</p>
                </div>
                <div className="stat-item">
                  <h3>100%</h3>
                  <p>Sustainable Fabric</p>
                </div>
                <div className="stat-item">
                  <h3>4.9 ★</h3>
                  <p>Client Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card">
                <Image
                  src="/images/hero.jpg"
                  alt="Rouse Store Winter Capsule Model"
                  width={900}
                  height={506}
                  className="hero-image"
                  priority
                />
                <div className="hero-floating-badge">
                  <div className="floating-icon">✦</div>
                  <div>
                    <div className="floating-title">RS-04 Stealth Parka</div>
                    <div className="floating-subtitle">Architectural Utility Shell · Limited to 300 units</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="catalog-section" id="catalog">
          <div className="section-header">
            <span className="section-subtitle">CURATED APPAREL</span>
            <h2 className="section-title">The Seasonal Roster</h2>
          </div>

          {/* Filter Pills */}
          <div className="filter-bar" id="category-filter-bar">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                id={`filter-${category.toLowerCase().replace(/\s+/g, "-")}`}
                className={`filter-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="product-grid" id="product-grid">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="product-card"
                id={`product-card-${product.id}`}
                onClick={() => setSelectedProduct(product)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-thumb-wrapper">
                  <span className="product-badge">{product.tag}</span>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="product-thumb"
                  />
                </div>
                <div className="product-content">
                  <div className="product-category-row">
                    <span className="product-cat">{product.category}</span>
                    <div className="product-rating">
                      <span>★</span>
                      <span>{product.rating}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        ({product.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-footer">
                    <div className="product-price-box">
                      <span className="product-price">${product.price}</span>
                      {product.originalPrice && (
                        <span className="product-original-price">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      id={`add-btn-${product.id}`}
                      className="add-cart-btn"
                      onClick={(e) => addToCart(product, e)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
              <h3>No pieces match your search criteria.</h3>
              <p style={{ marginTop: "0.5rem" }}>Try resetting your filters or search keywords.</p>
              <button
                style={{
                  marginTop: "1.5rem",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "999px",
                  background: "var(--accent-gradient)",
                  color: "#000",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedCategory("All Pieces");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Value Propositions */}
        <section className="values-banner" id="about">
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">◈</div>
              <div>
                <h4 className="value-title">Precision Tailoring</h4>
                <p className="value-desc">Custom patterns laser cut and assembled with reinforced industrial micro-stitching.</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon">⚡</div>
              <div>
                <h4 className="value-title">Express Global Freight</h4>
                <p className="value-desc">Dispatched via climate-neutral air transit directly from our state-of-the-art hub.</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon">✦</div>
              <div>
                <h4 className="value-title">30-Day Effortless Trial</h4>
                <p className="value-desc">Complimentary size exchanges and hassle-free returns with prepaid return postage.</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon">◆</div>
              <div>
                <h4 className="value-title">Architectural Longevity</h4>
                <p className="value-desc">Heirloom grade textiles tested through 200+ wash cycles without color degradation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* VIP Access Newsletter */}
        <section className="vip-section">
          <div className="vip-card">
            <h2 className="vip-title">Join The Rouse Syndicate</h2>
            <p className="vip-subtitle">
              Receive secret archive invitations, 24-hour priority access to seasonal drops, and limited edition capsule previews.
            </p>
            <form className="vip-form" onSubmit={handleNewsletterSubmit}>
              <input
                id="vip-email-input"
                type="email"
                className="vip-input"
                placeholder="Enter your personal email..."
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" id="vip-submit-btn" className="btn-primary">
                Unlock Access
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />
      <aside className={`cart-drawer ${isCartOpen ? "open" : ""}`} id="cart-drawer">
        <div className="cart-header">
          <h3 className="cart-title">Your Bag ({totalItemsCount})</h3>
          <button
            id="close-cart-btn"
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {checkoutStep === "cart" ? (
          <>
            {/* Free shipping banner */}
            <div style={{ padding: "0.85rem 1.5rem", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                <span>{subtotal >= freeShippingThreshold ? "Unlocked Free Worldwide Express!" : `$${freeShippingThreshold - subtotal} away from Free Express`}</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{progressToFreeShipping}%</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${progressToFreeShipping}%`, height: "100%", background: "var(--accent-gradient)", transition: "width 0.4s ease" }} />
              </div>
            </div>

            <div className="cart-items-list" id="cart-items-container">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>Your bag is currently empty.</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>Explore our seasonal drop to add items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={70}
                      height={70}
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">${item.price * item.quantity}</div>
                      <div className="cart-qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-subtotal-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-subtotal-row">
                  <span>Estimated Shipping</span>
                  <span>{subtotal >= freeShippingThreshold ? "FREE" : "$15.00"}</span>
                </div>
                <div className="cart-total-row">
                  <span>Total</span>
                  <span>${(subtotal + (subtotal >= freeShippingThreshold ? 0 : 15)).toFixed(2)}</span>
                </div>
                <button
                  id="checkout-btn"
                  className="checkout-btn"
                  onClick={() => setCheckoutStep("success")}
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "3rem 2rem", textAlign: "center", margin: "auto" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2rem" }}>
              ✓
            </div>
            <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "0.5rem" }}>Order Confirmed</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Thank you for supporting Rouse Store. Your confirmation number is <strong>#RS-98242</strong>. Tracking will be dispatched to your inbox.
            </p>
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                setCart([]);
                setCheckoutStep("cart");
                setIsCartOpen(false);
              }}
            >
              Continue Browsing
            </button>
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
              background: "var(--bg-secondary)",
              border: "1px solid var(--surface-glass-border)",
              borderRadius: "var(--radius-lg)",
              maxWidth: "680px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
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
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                zIndex: 10,
                fontSize: "1.2rem",
              }}
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ position: "relative", height: "100%", minHeight: "320px", background: "#0a0c10" }}>
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "2rem 2rem 2rem 0.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: 700, letterSpacing: "0.08em" }}>
                    {selectedProduct.category.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: "1.4rem", color: "#fff", margin: "0.4rem 0 0.75rem" }}>
                    {selectedProduct.name}
                  </h3>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>
                    ${selectedProduct.price}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    {selectedProduct.description}
                  </p>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                      Curated Colorways:
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {selectedProduct.colors.map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            border: "2px solid rgba(255,255,255,0.4)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Add to Bag (${selectedProduct.price})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice" id="toast-notification">
          <span style={{ color: "var(--accent-gold)", fontSize: "1.1rem" }}>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="store-footer" id="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-brand">
              <div className="logo-icon">R</div>
              <span className="logo-text">ROUSE STORE</span>
            </div>
            <p>
              Contemporary engineered garments and minimalist architectural wardrobe staples. Designed with industrial precision.
            </p>
          </div>

          <div className="footer-col">
            <h4>Collection</h4>
            <ul>
              <li><a href="#catalog">Outerwear Shells</a></li>
              <li><a href="#catalog">Heavyweight Knitwear</a></li>
              <li><a href="#catalog">Engineered Footwear</a></li>
              <li><a href="#catalog">Capsule 04 Drops</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Client Care</h4>
            <ul>
              <li><a href="#about">Freight & Delivery</a></li>
              <li><a href="#about">Exchanges & Trial</a></li>
              <li><a href="#about">Textile Sustainability</a></li>
              <li><a href="#about">Verify Authenticity</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Studio</h4>
            <ul>
              <li><a href="#about">Dallas Design Lab</a></li>
              <li><a href="#about">Press Inquiries</a></li>
              <li><a href="#about">Stockists</a></li>
              <li><a href="#about">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Rouse Store Inc. All Rights Reserved.</div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>System Status: <strong style={{ color: "#22c55e" }}>Optimal</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
