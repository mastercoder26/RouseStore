"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Minus, Plus, X } from "lucide-react";
import type { CartItem, Product } from "@/lib/store";
import { formatPrice } from "@/lib/store";
import ProductVisual from "@/components/ProductVisual";
import styles from "./ShopDialogs.module.css";

function useDialogLifecycle(dialogRef: React.RefObject<HTMLDialogElement | null>) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!dialog.open) dialog.showModal();

    const firstControl = dialog.querySelector<HTMLElement>("[data-dialog-autofocus]") ?? dialog;
    requestAnimationFrame(() => firstControl.focus({ preventScroll: true }));

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      requestAnimationFrame(() => {
        if (previousFocus.current && document.contains(previousFocus.current)) {
          previousFocus.current.focus({ preventScroll: true });
        }
      });
    };
  }, [dialogRef]);
}

function DialogCloseButton({ onClose, label = "Close", autoFocus = false }: { onClose: () => void; label?: string; autoFocus?: boolean }) {
  return (
    <button type="button" className={styles.closeButton} onClick={onClose} aria-label={label} autoFocus={autoFocus} data-dialog-autofocus={autoFocus ? "true" : undefined}>
      <X size={20} strokeWidth={1.6} aria-hidden="true" />
    </button>
  );
}

export function ProductDialog({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, size?: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  useDialogLifecycle(dialogRef);

  const close = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  }, [onClose]);

  const handleAdd = () => {
    onAdd(product, selectedSize || undefined);
    close();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles.productDialog}`}
      aria-labelledby="product-dialog-title"
      aria-describedby="product-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={handleBackdropClick}
    >
      <div className={styles.productLayout}>
        <div className={styles.productImageFrame}>
          <div className={styles.productVisual}>
            <ProductVisual product={product} sizes="(max-width: 640px) 100vw, 50vw" priority />
          </div>
        </div>

        <div className={styles.productDetails}>
          <div className={styles.dialogHeader}>
            <p className={styles.eyebrow}>{product.tag}</p>
            <DialogCloseButton onClose={close} label={`Close ${product.name}`} autoFocus />
          </div>
          <h2 id="product-dialog-title" className={styles.productTitle}>
            {product.name}
          </h2>
          <div className={styles.priceLine}>
            <span>{formatPrice(product.price)}</span>
            {product.originalPrice && <del>{formatPrice(product.originalPrice)}</del>}
          </div>
          <p id="product-dialog-description" className={styles.description}>
            {product.description}
          </p>

          {product.sizes && product.sizes.length > 0 && (
            <fieldset className={styles.sizeFieldset}>
              <legend className={styles.fieldLabel}>Select a size</legend>
              <div className={styles.sizeOptions}>
                {product.sizes.map((size) => (
                  <label key={size} className={`${styles.sizeOption} ${selectedSize === size ? styles.sizeOptionSelected : ""}`}>
                    <input
                      type="radio"
                      name={`size-${product.id}`}
                      value={size}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleAdd}
            disabled={Boolean(product.sizes?.length) && !selectedSize}
          >
            Add to bag <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;

export function CartDrawer({
  cart,
  onClose,
  onUpdateQuantity,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, size: string | undefined, delta: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "summary">("cart");
  const [promoCode, setPromoCode] = useState("");
  const [discountRate, setDiscountRate] = useState<number | null>(null);
  const [promoError, setPromoError] = useState("");
  useDialogLifecycle(dialogRef);

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>("[data-dialog-autofocus]")?.focus({ preventScroll: true });
  }, [checkoutStep]);

  const close = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  }, [onClose]);

  const itemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  const rawSubtotal = useMemo(
    () => roundMoney(cart.reduce((total, item) => total + item.price * item.quantity, 0)),
    [cart],
  );

  const discountAmount = useMemo(
    () => (discountRate ? roundMoney(rawSubtotal * discountRate) : 0),
    [rawSubtotal, discountRate],
  );

  const finalTotal = useMemo(() => roundMoney(Math.max(0, rawSubtotal - discountAmount)), [rawSubtotal, discountAmount]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === "RAIDERS") {
      setDiscountRate(0.1);
      setPromoError("");
    } else if (clean === "ROUSE" || clean === "GOLD") {
      setDiscountRate(0.15);
      setPromoError("");
    } else {
      setPromoError("Invalid code. Try 'RAIDERS' for 10% off!");
    }
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  const perkThreshold = 50;
  const perkPercent = Math.min(100, Math.round((rawSubtotal / perkThreshold) * 100));

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles.cartDialog}`}
      aria-labelledby="cart-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={handleBackdropClick}
    >
      {checkoutStep === "summary" ? (
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <button type="button" className={styles.backButton} onClick={() => setCheckoutStep("cart")} data-dialog-autofocus>
              <ArrowLeft size={17} aria-hidden="true" /> Back to bag
            </button>
            <DialogCloseButton onClose={close} label="Close bag" />
          </div>
          <div className={styles.summaryIntro}>
            <h2 id="cart-dialog-title" className={styles.drawerTitle}>Bag summary</h2>
            <p className={styles.summaryNotice}>
              Online checkout demo. Your order is reserved for pickup at Room 1104 (Raider Station Kiosk) during morning & lunch hours.
            </p>
          </div>
          <div className={styles.summaryItems} role="list" aria-label="Bag summary">
            {cart.map((item) => (
              <div className={styles.summaryItem} role="listitem" key={`${item.id}-${item.selectedSize ?? ""}`}>
                <span>{item.name}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</span>
                <span>{item.quantity} × {formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
          <div className={styles.totals}>
            <div className={styles.summaryItem}>
              <span>Subtotal</span>
              <span>{formatPrice(rawSubtotal)}</span>
            </div>
            {discountRate && (
              <div className={styles.summaryItem} style={{ color: "var(--maroon)" }}>
                <span>Promo Discount ({Math.round(discountRate * 100)}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className={styles.totalLine}>
              <strong>Total Due at Counter</strong>
              <strong>{formatPrice(finalTotal)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <div>
              <h2 id="cart-dialog-title" className={styles.drawerTitle}>Your bag <span>({itemCount})</span></h2>
            </div>
            <DialogCloseButton onClose={close} label="Close bag" autoFocus />
          </div>

          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>Your bag is empty</h3>
              <button type="button" className={styles.secondaryButton} onClick={close} data-dialog-autofocus>
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              {/* Free Campus Sticker Pack / Delivery Progress Meter */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  margin: "16px 0 12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>
                  <span>
                    {rawSubtotal >= perkThreshold
                      ? "✓ Qualified for Free Raider Sticker Pack!"
                      : `Add ${formatPrice(perkThreshold - rawSubtotal)} for free sticker pack`}
                  </span>
                  <span style={{ color: "var(--maroon)", fontVariantNumeric: "tabular-nums" }}>
                    {perkPercent}%
                  </span>
                </div>
                <div style={{ height: "4px", background: "var(--line)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${perkPercent}%`,
                      height: "100%",
                      background: "var(--maroon)",
                      transition: "width 300ms ease",
                    }}
                  />
                </div>
              </div>

              <div className={styles.cartItems} role="list" aria-label="Items in your bag">
                {cart.map((item) => (
                  <div className={styles.cartItem} role="listitem" key={`${item.id}-${item.selectedSize ?? ""}`}>
                    <div className={styles.cartImageFrame}>
                      <div className={styles.cartVisual}>
                        <ProductVisual product={item} sizes="72px" />
                      </div>
                    </div>
                    <div className={styles.cartItemInfo}>
                      <div className={styles.cartItemTopline}>
                        <div>
                          <h3>{item.name}</h3>
                          {item.selectedSize && <p>Size {item.selectedSize}</p>}
                        </div>
                        <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                      <div className={styles.quantityControl} role="group" aria-label={`Quantity for ${item.name}`}>
                        <button type="button" onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)} aria-label={`Decrease ${item.name} quantity`}>
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)} aria-label={`Increase ${item.name} quantity`}>
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code input */}
              <form
                onSubmit={handleApplyPromo}
                style={{
                  display: "flex",
                  gap: "6px",
                  margin: "18px 0 10px",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Promo code (e.g. RAIDERS)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{
                    flex: 1,
                    height: "36px",
                    padding: "0 10px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--line)",
                    background: "var(--bg-surface)",
                    color: "var(--ink)",
                    fontSize: "11px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--line)",
                    background: "var(--bg-surface)",
                    color: "var(--maroon)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </form>
              {promoError && (
                <p style={{ color: "#ef4444", fontSize: "10px", margin: "0 0 10px" }}>{promoError}</p>
              )}
              {discountRate && (
                <p style={{ color: "var(--maroon)", fontSize: "11px", fontWeight: 600, margin: "0 0 10px" }}>
                  ✓ {Math.round(discountRate * 100)}% discount applied!
                </p>
              )}

              <div className={styles.totals}>
                {discountRate && (
                  <div className={styles.summaryItem}>
                    <span>Subtotal</span>
                    <span>{formatPrice(rawSubtotal)}</span>
                  </div>
                )}
                {discountRate && (
                  <div className={styles.summaryItem} style={{ color: "var(--maroon)" }}>
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className={styles.totalLine}>
                  <strong>Total</strong>
                  <strong>{formatPrice(finalTotal)}</strong>
                </div>
              </div>
              <button type="button" className={styles.primaryButton} onClick={() => setCheckoutStep("summary")}>
                Review bag <span aria-hidden="true">↗</span>
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
