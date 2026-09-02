"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PRESET_IMAGES, formatPrice, type Product } from "@/lib/store";
import ProductVisual from "@/components/ProductVisual";

const STANDARD_CATEGORIES = [
  "Spirit Wear",
  "School Supplies",
  "Snacks & Drinks",
  "Accessories",
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "One Size"];

interface ModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, "id"> & { id?: string }) => void;
}

export default function AdminProductModal({ product, isOpen, onClose, onSave }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <AdminProductForm
        key={product?.id ?? "create-new"}
        product={product}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}

function AdminProductForm({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, "id"> & { id?: string }) => void;
}) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(() => {
    if (!product) return "Spirit Wear";
    return STANDARD_CATEGORIES.includes(product.category) ? product.category : "Other";
  });
  const [customCategory, setCustomCategory] = useState(() => {
    if (!product) return "";
    return STANDARD_CATEGORIES.includes(product.category) ? "" : product.category;
  });
  const [price, setPrice] = useState(product ? product.price.toString() : "45");
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ? product.originalPrice.toString() : "");
  const [tag, setTag] = useState(product?.tag ?? "New Drop");
  const [description, setDescription] = useState(
    product?.description ?? "Official Rouse Raiders campus gear crafted for durability and school spirit.",
  );
  const [image, setImage] = useState(product?.image ?? PRESET_IMAGES[0].src);
  const [customImage, setCustomImage] = useState(() => {
    if (!product) return "";
    return PRESET_IMAGES.some((p) => p.src === product.image) ? "" : product.image;
  });
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M", "L", "XL"]);
  const [inStock, setInStock] = useState(product?.inStock ?? true);

  const toggleSize = (s: string) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handlePresetSelect = (src: string) => {
    setImage(src);
    setCustomImage("");
  };

  const handleCustomImageChange = (val: string) => {
    setCustomImage(val);
    if (val.trim()) setImage(val.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;
    const finalPrice = parseFloat(price) || 0;
    const finalOrigPrice = originalPrice ? parseFloat(originalPrice) : undefined;

    onSave({
      id: product?.id,
      name: name.trim() || "Untitled Item",
      category: finalCategory,
      price: finalPrice,
      originalPrice: finalOrigPrice,
      tag: tag.trim(),
      description: description.trim(),
      image: image || PRESET_IMAGES[0].src,
      sizes: sizes.length > 0 ? sizes : undefined,
      inStock,
    });
    onClose();
  };

  const previewProduct: Product = {
    id: product?.id || "preview-id",
    name: name || "Product Name Preview",
    category: category === "Other" && customCategory.trim() ? customCategory.trim() : category,
    price: parseFloat(price) || 0,
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    tag: tag || "Tag",
    description: description || "Description preview text...",
    image: image || PRESET_IMAGES[0].src,
    sizes: sizes.length > 0 ? sizes : undefined,
    inStock,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: "100%",
        maxWidth: "960px",
        maxHeight: "90vh",
        backgroundColor: "var(--bg-elevated)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "var(--ink)",
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 28px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--maroon)",
            }}
          >
            Raider Station Catalog Admin
          </span>
          <h2
            style={{
              fontSize: "22px",
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              margin: "4px 0 0",
            }}
          >
            {isEditing ? `Edit Listing: ${name || product?.name}` : "Create New Product Listing"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "var(--bg-surface)",
            color: "var(--ink)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Modal Content Split */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr minmax(280px, 340px)",
          gap: "28px",
          padding: "28px",
          overflowY: "auto",
        }}
        className="admin-modal-layout"
      >
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
              }}
            >
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sideline Fleece Hoodie"
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--bg-surface)",
                color: "var(--ink)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--bg-surface)",
                  color: "var(--ink)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {STANDARD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Custom Category...</option>
              </select>
              {category === "Other" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category name"
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 10px",
                    marginTop: "6px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--line)",
                    background: "var(--bg-surface)",
                    color: "var(--ink)",
                    fontSize: "12px",
                  }}
                />
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                Tag / Badge
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Athletics, Heritage, Sale"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--bg-surface)",
                  color: "var(--ink)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--bg-surface)",
                  color: "var(--ink)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                Compare-at / Original Price ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Optional (shows discount)"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--bg-surface)",
                  color: "var(--ink)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
              }}
            >
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product materials, fit, design specifications..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--bg-surface)",
                color: "var(--ink)",
                fontSize: "13px",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {/* Sizes */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
              }}
            >
              Available Sizes
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {STANDARD_SIZES.map((s) => {
                const active = sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--line)",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: active ? "var(--maroon)" : "var(--bg-surface)",
                      color: active ? "#fff" : "var(--muted)",
                      transition: "all 140ms ease",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "8px",
              }}
            >
              Product Imagery (Preset or Custom URL)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {PRESET_IMAGES.map((preset) => {
                const isSelected = image === preset.src && !customImage;
                return (
                  <button
                    key={preset.src}
                    type="button"
                    onClick={() => handlePresetSelect(preset.src)}
                    title={preset.label}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: isSelected ? "2px solid var(--maroon)" : "1px solid var(--line)",
                      cursor: "pointer",
                      padding: 0,
                      background: "var(--bg-surface)",
                    }}
                  >
                    <Image src={preset.src} alt={preset.label} fill sizes="60px" style={{ objectFit: "cover" }} />
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(88, 24, 37, 0.35)",
                          display: "grid",
                          placeItems: "center",
                          color: "#fff",
                        }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customImage}
              onChange={(e) => handleCustomImageChange(e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--bg-surface)",
                color: "var(--ink)",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          {/* In Stock toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="inStockCheck"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--maroon)" }}
            />
            <label htmlFor="inStockCheck" style={{ fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
              Item is actively in stock and ready for campus pickup
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0 18px",
                height: "44px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--ink)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "0 24px",
                height: "44px",
                borderRadius: "var(--radius-pill)",
                border: "none",
                background: "var(--maroon)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {isEditing ? "Save Changes" : "Create Listing"}
            </button>
          </div>
        </form>

        {/* Real-time Preview Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--line)",
            alignSelf: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--maroon)",
            }}
          >
            <Sparkles size={13} /> Live Store Preview
          </div>

          <div
            style={{
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              border: "1px solid var(--line)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 4.9", overflow: "hidden" }}>
              {previewProduct.tag && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 7px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--badge-bg)",
                    color: "var(--badge-text)",
                    zIndex: 2,
                  }}
                >
                  {previewProduct.tag}
                </span>
              )}
              <ProductVisual product={previewProduct} />
            </div>
            <div style={{ padding: "14px" }}>
              <span
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: "3px",
                }}
              >
                {previewProduct.category}
              </span>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.2 }}>
                {previewProduct.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--maroon)" }}>
                  {formatPrice(previewProduct.price)}
                </span>
                {previewProduct.originalPrice && (
                  <span style={{ fontSize: "11px", textDecoration: "line-through", color: "var(--muted)" }}>
                    {formatPrice(previewProduct.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
            Changes will instantly update on the live catalog and product detail pages across all themes.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
