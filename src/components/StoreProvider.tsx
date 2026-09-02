"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CartDrawer, ProductDialog } from "@/components/ShopDialogs";
import { PRODUCTS, type CartItem, type Product } from "@/lib/store";

type StoreContextValue = {
  totalItems: number;
  openBag: () => void;
  openProduct: (id: string) => void;
  addToCart: (product: Product, size?: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}

// The root layout keeps the bag and dialogs mounted between page visits.
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function addToCart(item: Product, size?: string) {
    const selectedSize = item.sizes?.includes(size ?? "") ? size : item.sizes?.[0];
    setCart(current => {
      const exists = current.some(entry => entry.id === item.id && entry.selectedSize === selectedSize);
      return exists
        ? current.map(entry => entry.id === item.id && entry.selectedSize === selectedSize ? { ...entry, quantity: entry.quantity + 1 } : entry)
        : [...current, { ...item, selectedSize, quantity: 1 }];
    });
    setMessage(`${item.name}${selectedSize ? ` / ${selectedSize}` : ""} added to your bag.`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 3600);
  }

  function updateQuantity(id: string, size: string | undefined, delta: number) {
    setCart(current => current
      .map(item => item.id === id && item.selectedSize === size ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0));
  }

  function openProduct(id: string) {
    const selected = PRODUCTS.find(item => item.id === id);
    if (selected) setProduct(selected);
  }

  return (
    <StoreContext.Provider value={{ totalItems: cart.reduce((total, item) => total + item.quantity, 0), openBag: () => setCartOpen(true), openProduct, addToCart }}>
      {children}
      {product && <ProductDialog product={product} onClose={() => setProduct(null)} onAdd={addToCart} />}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdateQuantity={updateQuantity} />}
      <div className={`toast ${message ? "toast-visible" : ""}`} role="status" aria-live="polite">
        <ShoppingBag size={18} />
        <span>{message}</span>
        <button onClick={() => setMessage("")} aria-label="Dismiss notification" tabIndex={message ? 0 : -1}><X size={16} /></button>
      </div>
    </StoreContext.Provider>
  );
}
