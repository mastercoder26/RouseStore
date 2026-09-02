"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Minus, Plus, Tag, X } from "lucide-react";
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
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [promoCode, setPromoCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  useDialogLifecycle(dialogRef);

  const close = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  }, [onClose]);

  const itemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  const rawSubtotal = useMemo(
    () => roundMoney(cart.reduce((total, item) => total + item.price * item.quantity, 0)),
    [cart],
  );
  const discountAmount = roundMoney(rawSubtotal * discountRate);
  const subtotal = roundMoney(Math.max(0, rawSubtotal - discountAmount));
  const shipping = fulfillment === "pickup" ? 0 : subtotal >= 60 ? 0 : 6;
  const total = roundMoney(subtotal + shipping);

  const applyPromo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = promoCode.trim().toUpperCase();
    if (normalized === "RAIDERS26" || normalized === "ROUSE10") {
      setDiscountRate(0.1);
      setPromoCode(normalized);
      setPromoMessage("10% discount applied.");
      return;
    }
    setDiscountRate(0);
    setPromoMessage("That code is not valid. Try RAIDERS26 or ROUSE10.");
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

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
            <p className={styles.eyebrow}>Review</p>
            <h2 id="cart-dialog-title" className={styles.drawerTitle}>Your bag is ready</h2>
            <p className={styles.summaryNotice}>
              Online checkout is not available yet. No order has been placed.
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
            <div><span>Subtotal</span><span>{formatPrice(rawSubtotal)}</span></div>
            {discountAmount > 0 && <div><span>Discount</span><span>−{formatPrice(discountAmount)}</span></div>}
            <div><span>{fulfillment === "pickup" ? "Pickup" : "Shipping"}</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className={styles.totalLine}><strong>Total</strong><strong>{formatPrice(total)}</strong></div>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => setCheckoutStep("cart")}>
            Keep bag
          </button>
        </div>
      ) : (
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <div>
              <p className={styles.eyebrow}>Raider Station</p>
              <h2 id="cart-dialog-title" className={styles.drawerTitle}>Your bag <span>({itemCount})</span></h2>
            </div>
            <DialogCloseButton onClose={close} label="Close bag" autoFocus />
          </div>

          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyMark} aria-hidden="true">—</p>
              <h3>Your bag is empty</h3>
              <p>Browse the essentials and add something made for Raider days.</p>
              <button type="button" className={styles.secondaryButton} onClick={close} data-dialog-autofocus>
                Continue shopping
              </button>
            </div>
          ) : (
            <>
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

              <div className={styles.optionsSection}>
                <p className={styles.fieldLabel}>How would you like to receive it?</p>
                <div className={styles.fulfillmentOptions} role="group" aria-label="Fulfillment method">
                  <button type="button" className={fulfillment === "pickup" ? styles.fulfillmentSelected : ""} onClick={() => setFulfillment("pickup")} aria-pressed={fulfillment === "pickup"}>
                    <span>Pickup</span><small>Free</small>
                  </button>
                  <button type="button" className={fulfillment === "delivery" ? styles.fulfillmentSelected : ""} onClick={() => setFulfillment("delivery")} aria-pressed={fulfillment === "delivery"}>
                    <span>Shipping</span><small>{subtotal >= 60 ? "Free over $60" : "$6"}</small>
                  </button>
                </div>
              </div>

              <form className={styles.promoForm} onSubmit={applyPromo}>
                <label htmlFor="promo-code"><Tag size={15} aria-hidden="true" /> Promo code</label>
                <div className={styles.promoInputRow}>
                  <input id="promo-code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Enter code" autoComplete="off" />
                  <button type="submit">Apply</button>
                </div>
                <p className={styles.promoMessage} aria-live="polite">{promoMessage}</p>
              </form>

              <div className={styles.totals}>
                <div><span>Subtotal</span><span>{formatPrice(rawSubtotal)}</span></div>
                {discountAmount > 0 && <div><span>10% discount</span><span>−{formatPrice(discountAmount)}</span></div>}
                <div><span>{fulfillment === "pickup" ? "Pickup" : "Shipping"}</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className={styles.totalLine}><strong>Total</strong><strong>{formatPrice(total)}</strong></div>
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
