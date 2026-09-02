"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import { CartDrawer } from "@/components/ShopDialogs";
import { FeedbackDrawer, ToastNotification } from "@/components/feedback";
import type {
  CartItem,
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";
import type {
  Review,
  CreateReviewInput,
  ProductRatingSummary,
  ReviewStatus,
  ReviewModerationStats,
} from "@/types/review";
import type {
  Complaint,
  CreateComplaintInput,
  ComplaintStatus,
  ComplaintStats,
} from "@/types/complaint";
import { ProductRepository } from "@/lib/repositories/ProductRepository";
import { ReviewRepository } from "@/lib/repositories/ReviewRepository";
import { ComplaintRepository } from "@/lib/repositories/ComplaintRepository";
import { LocalStorageDriver } from "@/lib/storage/LocalStorageDriver";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { SEED_PRODUCTS } from "@/lib/seed/seedProducts";
import { SEED_REVIEWS } from "@/lib/seed/seedReviews";
import { SEED_COMPLAINTS } from "@/lib/seed/seedComplaints";

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

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export interface StoreContextValue {
  // Cart
  cart: CartItem[];
  totalItems: number;
  openBag: () => void;
  closeBag: () => void;
  isBagOpen: boolean;
  addToCart: (product: Product, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, delta: number) => void;
  clearCart: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Products / Listings
  products: Product[];
  addProduct: (product: CreateProductInput) => Product;
  updateProduct: (id: string, updates: UpdateProductInput) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  getProductById: (id: string) => Product | undefined;
  importCatalog: (products: Product[]) => void;
  exportCatalog: () => string;

  // Reviews & Ratings
  reviews: Review[];
  getReviewsByProductId: (productId: string, options?: { approvedOnly?: boolean }) => Review[];
  getRatingSummary: (productId: string) => ProductRatingSummary;
  allRatingSummaries: Record<string, ProductRatingSummary>;
  addReview: (input: CreateReviewInput) => Review;
  voteReviewHelpful: (reviewId: string) => boolean;
  hasUserVotedReview: (reviewId: string) => boolean;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;
  resetReviews: () => void;
  reviewStats: ReviewModerationStats;

  // Complaints & Feedback
  complaints: Complaint[];
  addComplaint: (input: CreateComplaintInput) => Complaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, staffNotes?: string) => void;
  updateStaffNotes: (id: string, notes: string) => void;
  updateComplaintStaffNotes: (id: string, notes: string) => void;
  deleteComplaint: (id: string) => void;
  resetComplaints: () => void;
  complaintStats: ComplaintStats;
  isFeedbackDrawerOpen: boolean;
  openFeedbackDrawer: () => void;
  closeFeedbackDrawer: () => void;

  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

  // Notifications
  notify: (msg: string, type?: "success" | "info" | "error") => void;
  toast: ToastMessage | null;
  showToast: (msg: string, type?: "success" | "info" | "error") => void;
  dismissToast: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// Shared driver and repositories
const storageDriver = new LocalStorageDriver();
const productRepo = new ProductRepository(storageDriver, SEED_PRODUCTS);
const reviewRepo = new ReviewRepository(storageDriver, SEED_REVIEWS);
const complaintRepo = new ComplaintRepository(storageDriver, SEED_COMPLAINTS);

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = storageDriver.getItem<CartItem[]>(STORAGE_KEYS.CART);
      if (stored && Array.isArray(stored)) return stored;
    } catch {
      // Storage unavailable
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Feedback Drawer state
  const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false);

  // Enhanced Toast / Notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = storageDriver.getItem<Theme>(STORAGE_KEYS.THEME);
      if (stored && THEMES.some((t) => t.id === stored)) {
        return stored;
      }
    } catch {
      // Storage unavailable
    }
    return "heritage";
  });

  // Repositories state
  const [products, setProducts] = useState<Product[]>(() => productRepo.getAll());
  const [reviews, setReviews] = useState<Review[]>(() => reviewRepo.getAll(true));
  const [complaints, setComplaints] = useState<Complaint[]>(() => complaintRepo.getAll());

  // Voted reviews tracking
  const [votedReviews, setVotedReviews] = useState<Set<string>>(() => {
    try {
      const data = storageDriver.getItem<string[]>(STORAGE_KEYS.VOTED_REVIEWS);
      if (Array.isArray(data)) return new Set(data);
    } catch {
      // Storage unavailable
    }
    return new Set<string>();
  });

  // Admin Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
        if (session === "authenticated") return true;
        const stored = storageDriver.getItem<string>(STORAGE_KEYS.ADMIN_SESSION);
        if (stored === "authenticated") return true;
      } catch {
        // Storage unavailable
      }
    }
    return false;
  });

  // Sync theme attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Sync cart to storage
  useEffect(() => {
    try {
      storageDriver.setItem(STORAGE_KEYS.CART, cart);
    } catch {
      // Storage unavailable
    }
  }, [cart]);

  // Theme switcher
  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      storageDriver.setItem(STORAGE_KEYS.THEME, nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    } catch {
      // Storage unavailable
    }
  }, []);

  // Enhanced Toast & Notification dispatchers
  const showToast = useCallback(
    (msg: string, type: "success" | "info" | "error" = "info") => {
      const id = `toast-${Date.now().toString(36)}`;
      setToast({ id, message: msg, type });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        setToast(null);
      }, 3800);
    },
    []
  );

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const notify = useCallback(
    (msg: string, type: "success" | "info" | "error" = "info") => {
      showToast(msg, type);
    },
    [showToast]
  );

  // --- Cart Operations ---
  const openBag = useCallback(() => setCartOpen(true), []);
  const closeBag = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback(
    (item: Product, size?: string) => {
      const selectedSize = item.sizes?.includes(size ?? "") ? size : item.sizes?.[0];
      setCart((current) => {
        const exists = current.some(
          (entry) => entry.id === item.id && entry.selectedSize === selectedSize
        );
        return exists
          ? current.map((entry) =>
              entry.id === item.id && entry.selectedSize === selectedSize
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry
            )
          : [...current, { ...item, selectedSize, quantity: 1 }];
      });
      notify(`${item.name}${selectedSize ? ` (${selectedSize})` : ""} added to your bag.`, "success");
    },
    [notify]
  );

  const updateQuantity = useCallback((id: string, size: string | undefined, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // --- Product Operations ---
  const addProduct = useCallback(
    (newProdData: CreateProductInput): Product => {
      const created = productRepo.add(newProdData);
      setProducts(productRepo.getAll());
      notify(`"${created.name}" has been added to the store catalog.`, "success");
      return created;
    },
    [notify]
  );

  const updateProduct = useCallback(
    (id: string, updates: UpdateProductInput) => {
      productRepo.update(id, updates);
      setProducts(productRepo.getAll());
      notify("Listing updated.", "success");
    },
    [notify]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const target = productRepo.getById(id);
      productRepo.delete(id);
      setProducts(productRepo.getAll());
      setCart((current) => current.filter((item) => item.id !== id));
      notify(`Listing "${target?.name || id}" removed.`, "info");
    },
    [notify]
  );

  const resetProducts = useCallback(() => {
    productRepo.reset(SEED_PRODUCTS);
    setProducts(productRepo.getAll());
    notify("Store catalog restored to standard Rouse Station items.", "info");
  }, [notify]);

  const getProductById = useCallback(
    (id: string) => productRepo.getById(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products]
  );

  const importCatalog = useCallback(
    (newProducts: Product[]) => {
      productRepo.importCatalog(newProducts);
      setProducts(productRepo.getAll());
      notify("Store catalog successfully imported.", "success");
    },
    [notify]
  );

  const exportCatalog = useCallback(() => {
    return productRepo.exportCatalog();
  }, []);

  // --- Review & Rating Operations ---
  const getReviewsByProductId = useCallback(
    (productId: string, options: { approvedOnly?: boolean } = { approvedOnly: true }) => {
      return reviewRepo.getByProductId(productId, !options.approvedOnly);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviews]
  );

  const getRatingSummary = useCallback(
    (productId: string) => {
      return reviewRepo.getSummary(productId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviews]
  );

  const allRatingSummaries = useMemo(() => {
    const summaryMap: Record<string, ProductRatingSummary> = {};
    for (const p of products) {
      summaryMap[p.id] = reviewRepo.getSummary(p.id);
    }
    return summaryMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, reviews]);

  const addReview = useCallback(
    (input: CreateReviewInput): Review => {
      const created = reviewRepo.addReview(input);
      setReviews(reviewRepo.getAll(true));
      notify("Thank you! Your review has been submitted.", "success");
      return created;
    },
    [notify]
  );

  const hasUserVotedReview = useCallback(
    (reviewId: string) => {
      return votedReviews.has(reviewId);
    },
    [votedReviews]
  );

  const voteReviewHelpful = useCallback(
    (reviewId: string): boolean => {
      if (votedReviews.has(reviewId)) {
        notify("You have already voted on this review.", "info");
        return false;
      }
      reviewRepo.voteHelpful(reviewId);
      const updatedSet = new Set(votedReviews);
      updatedSet.add(reviewId);
      setVotedReviews(updatedSet);
      try {
        storageDriver.setItem(STORAGE_KEYS.VOTED_REVIEWS, Array.from(updatedSet));
      } catch {
        // Storage unavailable
      }
      setReviews(reviewRepo.getAll(true));
      notify("Thank you for your feedback!", "success");
      return true;
    },
    [votedReviews, notify]
  );

  const updateReviewStatus = useCallback(
    (reviewId: string, status: ReviewStatus) => {
      reviewRepo.updateStatus(reviewId, status);
      setReviews(reviewRepo.getAll(true));
      notify(`Review status updated to ${status}.`, "info");
    },
    [notify]
  );

  const deleteReview = useCallback(
    (reviewId: string) => {
      reviewRepo.deleteReview(reviewId);
      setReviews(reviewRepo.getAll(true));
      notify("Review permanently deleted.", "info");
    },
    [notify]
  );

  const resetReviews = useCallback(() => {
    reviewRepo.reset(SEED_REVIEWS);
    setReviews(reviewRepo.getAll(true));
    notify("Reviews reset to authentic seed data.", "info");
  }, [notify]);

  const reviewStats = useMemo(() => {
    return reviewRepo.getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  // --- Complaint & Feedback Drawer Operations ---
  const openFeedbackDrawer = useCallback(() => setFeedbackDrawerOpen(true), []);
  const closeFeedbackDrawer = useCallback(() => setFeedbackDrawerOpen(false), []);

  const addComplaint = useCallback(
    (input: CreateComplaintInput): Complaint => {
      const created = complaintRepo.addComplaint(input);
      setComplaints(complaintRepo.getAll());
      notify("Your feedback has been received. Raider Station staff will review it shortly.", "success");
      return created;
    },
    [notify]
  );

  const updateComplaintStatus = useCallback(
    (id: string, status: ComplaintStatus, staffNotes?: string) => {
      complaintRepo.updateStatus(id, status, staffNotes);
      setComplaints(complaintRepo.getAll());
      notify(`Grievance status updated to "${status}".`, "info");
    },
    [notify]
  );

  const updateStaffNotes = useCallback(
    (id: string, notes: string) => {
      complaintRepo.updateStaffNotes(id, notes);
      setComplaints(complaintRepo.getAll());
      notify("Staff notes saved.", "success");
    },
    [notify]
  );

  const deleteComplaint = useCallback(
    (id: string) => {
      complaintRepo.deleteComplaint(id);
      setComplaints(complaintRepo.getAll());
      notify("Complaint entry removed.", "info");
    },
    [notify]
  );

  const resetComplaints = useCallback(() => {
    complaintRepo.reset(SEED_COMPLAINTS);
    setComplaints(complaintRepo.getAll());
    notify("Complaints inbox reset to authentic seed dataset.", "info");
  }, [notify]);

  const complaintStats = useMemo(() => {
    return complaintRepo.getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaints]);

  // --- Admin Authentication Operations ---
  const loginAdmin = useCallback(
    (pin: string): boolean => {
      if (pin.trim() === "raider2026") {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, "authenticated");
          storageDriver.setItem(STORAGE_KEYS.ADMIN_SESSION, "authenticated");
        } catch {
          // Storage unavailable
        }
        notify("Admin console unlocked.", "success");
        return true;
      }
      notify("Incorrect passcode. Access denied.", "error");
      return false;
    },
    [notify]
  );

  const logoutAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      storageDriver.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch {
      // Storage unavailable
    }
    notify("Admin session ended.", "info");
  }, [notify]);

  const contextValue: StoreContextValue = useMemo(
    () => ({
      // Cart
      cart,
      totalItems: cart.reduce((total, item) => total + item.quantity, 0),
      openBag,
      closeBag,
      isBagOpen: cartOpen,
      addToCart,
      updateQuantity,
      clearCart,

      // Theme
      theme,
      setTheme,

      // Products / Listings
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      resetProducts,
      getProductById,
      importCatalog,
      exportCatalog,

      // Reviews & Ratings
      reviews,
      getReviewsByProductId,
      getRatingSummary,
      allRatingSummaries,
      addReview,
      voteReviewHelpful,
      hasUserVotedReview,
      updateReviewStatus,
      deleteReview,
      resetReviews,
      reviewStats,

      // Complaints & Feedback
      complaints,
      addComplaint,
      updateComplaintStatus,
      updateStaffNotes,
      updateComplaintStaffNotes: updateStaffNotes,
      deleteComplaint,
      resetComplaints,
      complaintStats,
      isFeedbackDrawerOpen: feedbackDrawerOpen,
      openFeedbackDrawer,
      closeFeedbackDrawer,

      // Admin Auth
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin,

      // Notifications
      notify,
      toast,
      showToast,
      dismissToast,
    }),
    [
      cart,
      cartOpen,
      openBag,
      closeBag,
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
      importCatalog,
      exportCatalog,
      reviews,
      getReviewsByProductId,
      getRatingSummary,
      allRatingSummaries,
      addReview,
      voteReviewHelpful,
      hasUserVotedReview,
      updateReviewStatus,
      deleteReview,
      resetReviews,
      reviewStats,
      complaints,
      addComplaint,
      updateComplaintStatus,
      updateStaffNotes,
      deleteComplaint,
      resetComplaints,
      complaintStats,
      feedbackDrawerOpen,
      openFeedbackDrawer,
      closeFeedbackDrawer,
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin,
      notify,
      toast,
      showToast,
      dismissToast,
    ]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
        />
      )}
      <FeedbackDrawer />
      <ToastNotification />
    </StoreContext.Provider>
  );
}

// --- Custom Domain Hooks ---

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}

export function useReviews(productId?: string) {
  const {
    reviews,
    getReviewsByProductId,
    getRatingSummary,
    allRatingSummaries,
    addReview,
    voteReviewHelpful,
    hasUserVotedReview,
    updateReviewStatus,
    deleteReview,
    resetReviews,
    reviewStats,
  } = useStore();

  const productReviews = useMemo(() => {
    if (!productId) return reviews;
    return getReviewsByProductId(productId, { approvedOnly: true });
  }, [productId, reviews, getReviewsByProductId]);

  const ratingSummary = useMemo(() => {
    if (!productId) return null;
    return getRatingSummary(productId);
  }, [productId, getRatingSummary]);

  return {
    reviews: productReviews,
    allReviews: reviews,
    ratingSummary,
    allRatingSummaries,
    getRatingSummary,
    addReview,
    voteReviewHelpful,
    hasUserVotedReview,
    updateReviewStatus,
    deleteReview,
    resetReviews,
    reviewStats,
  };
}

export function useComplaints() {
  const {
    complaints,
    addComplaint,
    updateComplaintStatus,
    updateStaffNotes,
    updateComplaintStaffNotes,
    deleteComplaint,
    resetComplaints,
    complaintStats,
  } = useStore();

  return {
    complaints,
    addComplaint,
    updateComplaintStatus,
    updateStaffNotes,
    updateComplaintStaffNotes,
    deleteComplaint,
    resetComplaints,
    complaintStats,
  };
}

export function useFeedback() {
  const {
    isFeedbackDrawerOpen,
    openFeedbackDrawer,
    closeFeedbackDrawer,
    addComplaint,
    showToast,
  } = useStore();

  return {
    isOpen: isFeedbackDrawerOpen,
    openDrawer: openFeedbackDrawer,
    closeDrawer: closeFeedbackDrawer,
    submitFeedback: addComplaint,
    showToast,
  };
}

export function useProducts() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    getProductById,
    importCatalog,
    exportCatalog,
  } = useStore();

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    getProductById,
    importCatalog,
    exportCatalog,
  };
}

export function useCart() {
  const {
    cart,
    totalItems,
    openBag,
    closeBag,
    isBagOpen,
    addToCart,
    updateQuantity,
    clearCart,
  } = useStore();

  return {
    cart,
    totalItems,
    openBag,
    closeBag,
    isBagOpen,
    addToCart,
    updateQuantity,
    clearCart,
  };
}

export function useTheme() {
  const { theme, setTheme } = useStore();
  return {
    theme,
    setTheme,
    themes: THEMES,
  };
}

export function useAdmin() {
  const {
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    reviewStats,
    complaintStats,
  } = useStore();

  return {
    isAuthenticated: isAdminAuthenticated,
    login: loginAdmin,
    logout: logoutAdmin,
    reviewStats,
    complaintStats,
  };
}
