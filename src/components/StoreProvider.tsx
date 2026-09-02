"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CartDrawer } from "@/components/ShopDialogs";
import { type CartItem, type Product, PRODUCTS } from "@/lib/store";

export type Theme = "heritage" | "obsidian" | "studio" | "gold";

export interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
    gold: string;
  };
}

export const THEMES: ThemeOption[] = [
  {
    id: "heritage",
    name: "Heritage Parchment",
    description: "Classic Rouse collegiate aesthetic on warm tactile parchment",
    colors: { bg: "#f4f1ea", surface: "#eae5da", accent: "#581825", gold: "#cf9b44" },
  },
  {
    id: "obsidian",
    name: "Obsidian Raider",
    description: "Stealth dark mode with crimson maroon and luminous gold accents",
    colors: { bg: "#0c0b0b", surface: "#171616", accent: "#9e2842", gold: "#dfb256" },
  },
  {
    id: "studio",
    name: "Studio Cream",
    description: "Minimalist modern gallery aesthetic with crisp contrast",
    colors: { bg: "#fbfbf9", surface: "#f1efe9", accent: "#681b2a", gold: "#c49138" },
  },
  {
    id: "gold",
    name: "Championship Gold",
    description: "Warm sandstone palette infused with championship gold",
    colors: { bg: "#f3ece0", surface: "#e7dfcf", accent: "#4e1320", gold: "#b38025" },
  },
];

type StoreContextValue = {
  // Cart
  cart: CartItem[];
  totalItems: number;
  openBag: () => void;
  addToCart: (product: Product, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, delta: number) => void;
  clearCart: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Products / Listings
  products: Product[];
  addProduct: (product: Omit<Product, "id"> & { id?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  getProductById: (id: string) => Product | undefined;

  // Notifications
  notify: (msg: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}

const STORAGE_KEY_PRODUCTS = "raider_station_products_v2";
const STORAGE_KEY_THEME = "raider_theme";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTheme = window.localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
        if (storedTheme && THEMES.some((t) => t.id === storedTheme)) {
          return storedTheme;
        }
      } catch {
        // Storage unavailable
      }
    }
    return "heritage";
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProducts = window.localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (storedProducts) {
          const parsed = JSON.parse(storedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Storage unavailable
      }
    }
    return PRODUCTS;
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync data-theme attribute whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    } catch {
      // Storage unavailable
    }
  }, []);

  // Save products when modified
  const persistProducts = useCallback((nextProducts: Product[]) => {
    setProducts(nextProducts);
    try {
      window.localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(nextProducts));
    } catch {
      // Storage unavailable
    }
  }, []);

  const notify = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 3800);
  }, []);

  const addProduct = useCallback(
    (newProdData: Omit<Product, "id"> & { id?: string }) => {
      const id = newProdData.id?.trim() || `rs-item-${Date.now().toString(36)}`;
      const created: Product = {
        ...newProdData,
        id,
        inStock: newProdData.inStock ?? true,
      };
      const updated = [created, ...products];
      persistProducts(updated);
      notify(`"${created.name}" has been added to the store catalog.`);
      return created;
    },
    [products, persistProducts, notify],
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const updated = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
      persistProducts(updated);
      notify(`Listing updated.`);
    },
    [products, persistProducts, notify],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const target = products.find((p) => p.id === id);
      const updated = products.filter((item) => item.id !== id);
      persistProducts(updated);
      // Also remove from cart if present
      setCart((current) => current.filter((item) => item.id !== id));
      notify(`Listing "${target?.name || id}" removed.`);
    },
    [products, persistProducts, notify],
  );

  const resetProducts = useCallback(() => {
    persistProducts(PRODUCTS);
    notify("Store catalog restored to default Rouse Station items.");
  }, [persistProducts, notify]);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const addToCart = useCallback(
    (item: Product, size?: string) => {
      const selectedSize = item.sizes?.includes(size ?? "") ? size : item.sizes?.[0];
      setCart((current) => {
        const exists = current.some((entry) => entry.id === item.id && entry.selectedSize === selectedSize);
        return exists
          ? current.map((entry) =>
              entry.id === item.id && entry.selectedSize === selectedSize
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry,
            )
          : [...current, { ...item, selectedSize, quantity: 1 }];
      });
      notify(`${item.name}${selectedSize ? ` (${selectedSize})` : ""} added to your bag.`);
    },
    [notify],
  );

  const updateQuantity = useCallback((id: string, size: string | undefined, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id && item.selectedSize === size ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        totalItems: cart.reduce((total, item) => total + item.quantity, 0),
        openBag: () => setCartOpen(true),
        addToCart,
        updateQuantity,
        clearCart,
        theme,
        setTheme,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        getProductById,
        notify,
      }}
    >
      {children}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
        />
      )}
      <div className={`toast ${message ? "toast-visible" : ""}`} role="status" aria-live="polite">
        <ShoppingBag size={17} />
        <span>{message}</span>
        <button onClick={() => setMessage("")} aria-label="Dismiss notification" tabIndex={message ? 0 : -1}>
          <X size={15} />
        </button>
      </div>
    </StoreContext.Provider>
  );
}
