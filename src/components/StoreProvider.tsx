"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CartDrawer } from "@/components/ShopDialogs";
import { type CartItem, type Product } from "@/lib/store";

type StoreContextValue = {
  totalItems: number;
  openBag: () => void;
  addToCart: (product: Product, size?: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}

// The root layout preserves the bag between catalog and item pages.
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
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

  return (
    <StoreContext.Provider value={{ totalItems: cart.reduce((total, item) => total + item.quantity, 0), openBag: () => setCartOpen(true), addToCart }}>
      {children}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdateQuantity={updateQuantity} />}
      <div className={`toast ${message ? "toast-visible" : ""}`} role="status" aria-live="polite">
        <ShoppingBag size={18} />
        <span>{message}</span>
        <button onClick={() => setMessage("")} aria-label="Dismiss notification" tabIndex={message ? 0 : -1}><X size={16} /></button>
      </div>
    </StoreContext.Provider>
  );
}
