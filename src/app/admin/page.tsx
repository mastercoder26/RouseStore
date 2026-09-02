"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RotateCcw,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Tag,
  Download,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/components/StoreProvider";
import { formatPrice, type Product } from "@/lib/store";
import ProductVisual from "@/components/ProductVisual";
import AdminProductModal from "@/components/AdminProductModal";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All items");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "soldOut">("all");
  const [sortBy, setSortBy] = useState<"default" | "priceAsc" | "priceDesc" | "name">("default");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All items", ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchCat = activeCategory === "All items" || p.category === activeCategory;
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && p.inStock !== false) ||
        (stockFilter === "soldOut" && p.inStock === false);
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchCat && matchStock && matchQuery;
    });

    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, activeCategory, stockFilter, query, sortBy]);

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const spiritCount = products.filter((p) => p.category === "Spirit Wear").length;
    const otherCount = total - spiritCount;
    const avgPrice = total > 0 ? products.reduce((acc, p) => acc + p.price, 0) / total : 0;
    const saleCount = products.filter((p) => p.originalPrice && p.originalPrice > p.price).length;

    return { total, spiritCount, otherCount, avgPrice, saleCount };
  }, [products]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleDuplicate = (p: Product) => {
    addProduct({
      name: `${p.name} (Copy)`,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      tag: p.tag,
      description: p.description,
      image: p.image,
      sizes: p.sizes ? [...p.sizes] : undefined,
      inStock: p.inStock,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from store listings?`)) {
      deleteProduct(id);
    }
  };

  const handleToggleStock = (p: Product) => {
    const nextState = p.inStock === false;
    updateProduct(p.id, { inStock: nextState });
  };

  const handleStartInlinePrice = (p: Product) => {
    setInlinePriceId(p.id);
    setInlinePriceValue(p.price.toString());
  };

  const handleSaveInlinePrice = (id: string) => {
    const num = parseFloat(inlinePriceValue);
    if (!isNaN(num) && num >= 0) {
      updateProduct(id, { price: num });
    }
    setInlinePriceId(null);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset store catalog to standard Rouse Station defaults? Any customized or new items will be reverted.",
      )
    ) {
      resetProducts();
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rouse_station_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0 && json[0].name && typeof json[0].price === "number") {
          localStorage.setItem("raider_station_products_v2", JSON.stringify(json));
          window.location.reload();
        } else {
          alert("Invalid catalog JSON format. Please upload a valid exported catalog file.");
        }
      } catch {
        alert("Could not parse file as JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveProduct = (productData: Omit<Product, "id"> & { id?: string }) => {
    if (editingProduct && productData.id) {
      updateProduct(productData.id, productData);
    } else {
      addProduct(productData);
    }
  };

  return (
    <div className={styles.adminPage}>
      {/* Hidden file input for catalog import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleImportJson}
      />

      {/* Header */}
      <div className={styles.adminHeader}>
        <div>
          <span className={styles.kicker}>Station Operations & Kiosk Control</span>
          <h1 className={styles.adminTitle}>Inventory & Listings</h1>
          <p className={styles.adminSubtitle}>
            Live catalog manager for Rouse High School student store. Create new spirit gear, adjust pricing,
            toggle live stock status, and manage student offerings in real-time.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.primaryBtn} onClick={handleOpenAdd}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Add New Listing</span>
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleExportJson}
            title="Export catalog as JSON backup"
          >
            <Download size={14} />
            <span>Export Backup</span>
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Import catalog from JSON file"
          >
            <Upload size={14} />
            <span>Import JSON</span>
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleReset}
            title="Restore default catalog"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
          <Link href="/shop" className={styles.secondaryBtn} target="_blank">
            <span>View Live Shop</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Listings</span>
          <span className={styles.metricValue}>{metrics.total}</span>
          <span className={styles.metricHint}>Active in catalog</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Spirit Wear</span>
          <span className={styles.metricValue}>{metrics.spiritCount}</span>
          <span className={styles.metricHint}>Hoodies, caps, jackets</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Supplies & Gear</span>
          <span className={styles.metricValue}>{metrics.otherCount}</span>
          <span className={styles.metricHint}>Accessories & snacks</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Average Price</span>
          <span className={styles.metricValue}>{formatPrice(metrics.avgPrice)}</span>
          <span className={styles.metricHint}>Across all categories</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Promotions / Sale</span>
          <span className={styles.metricValue}>{metrics.saleCount}</span>
          <span className={styles.metricHint}>Discounted items</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.categoryPills}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.categoryPill} ${activeCategory === cat ? styles.categoryPillActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.filterControlsRight}>
          <select
            className={styles.selectDropdown}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as "all" | "inStock" | "soldOut")}
            aria-label="Filter by inventory status"
          >
            <option value="all">All Inventory</option>
            <option value="inStock">In Stock Only</option>
            <option value="soldOut">Sold Out Only</option>
          </select>

          <select
            className={styles.selectDropdown}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "default" | "priceAsc" | "priceDesc" | "name")}
            aria-label="Sort listings"
          >
            <option value="default">Sort: Default</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>

          <label className={styles.searchWrapper}>
            <Search size={15} />
            <input
              type="search"
              placeholder="Filter listings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Product Listings Grid */}
      <div className={styles.listingsGrid}>
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((p) => {
            const isSoldOut = p.inStock === false;
            return (
              <motion.article
                key={p.id}
                className={styles.listingCard}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.cardVisualFrame}>
                  <div className={styles.cardBadges}>
                    {p.tag ? <span className={styles.tagBadge}>{p.tag}</span> : <span />}
                    <button
                      type="button"
                      className={`${styles.stockSwitchBtn} ${isSoldOut ? styles.stockSwitchBtnOut : ""}`}
                      onClick={() => handleToggleStock(p)}
                      title={`Click to toggle: currently ${isSoldOut ? "Sold Out" : "In Stock"}`}
                    >
                      {isSoldOut ? (
                        <>
                          <XCircle size={12} /> Sold Out
                        </>
                      ) : (
                        <>
                          <CheckCircle size={12} /> In Stock
                        </>
                      )}
                    </button>
                  </div>
                  <ProductVisual product={p} sizes="320px" />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.cardName}>{p.name}</h3>
                      <span className={styles.cardCategory}>{p.category}</span>
                    </div>
                    <div className={styles.cardPriceGroup}>
                      {inlinePriceId === p.id ? (
                        <input
                          type="number"
                          step="0.5"
                          autoFocus
                          value={inlinePriceValue}
                          onChange={(e) => setInlinePriceValue(e.target.value)}
                          onBlur={() => handleSaveInlinePrice(p.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveInlinePrice(p.id);
                            if (e.key === "Escape") setInlinePriceId(null);
                          }}
                          style={{
                            width: "70px",
                            height: "28px",
                            padding: "2px 6px",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--maroon)",
                            border: "1px solid var(--maroon)",
                            borderRadius: "4px",
                            background: "var(--bg-surface)",
                            outline: "none",
                            textAlign: "right",
                          }}
                        />
                      ) : (
                        <span
                          className={styles.cardPrice}
                          onClick={() => handleStartInlinePrice(p)}
                          title="Click to quick-edit price"
                        >
                          {formatPrice(p.price)}
                        </span>
                      )}

                      {p.originalPrice && (
                        <span className={styles.cardOriginalPrice}>{formatPrice(p.originalPrice)}</span>
                      )}
                    </div>
                  </div>

                  <p className={styles.cardDesc}>{p.description}</p>

                  {p.sizes && p.sizes.length > 0 && (
                    <div className={styles.sizesList}>
                      {p.sizes.map((s) => (
                        <span key={s} className={styles.sizeChip}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <Link href={`/shop/${p.id}`} className={styles.viewStoreLink} target="_blank">
                      <span>Store page</span>
                      <ExternalLink size={12} />
                    </Link>

                    <div className={styles.cardActionsGroup}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => handleDuplicate(p)}
                        title="Duplicate listing"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => handleOpenEdit(p)}
                        title="Edit listing details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Tag size={32} style={{ color: "var(--muted)", margin: "0 auto 12px", opacity: 0.6 }} />
          <h2 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 8px" }}>No listings match your filters</h2>
          <p style={{ color: "var(--muted)", fontSize: "13px", maxWidth: "360px", margin: "0 auto 20px" }}>
            Try resetting your search, clearing the status filter, or creating a new listing.
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleOpenAdd}
            style={{ margin: "0 auto" }}
          >
            <Plus size={16} /> Create Listing
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      <AdminProductModal
        isOpen={modalOpen}
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
