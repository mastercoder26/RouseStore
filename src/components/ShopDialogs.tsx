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
  cart, onClose, onUpdateQuantity,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, size: string | undefined, delta: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "summary">("cart");
  useDialogLifecycle(dialogRef);
  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>("[data-dialog-autofocus]")?.focus({ preventScroll: true });
  }, [checkoutStep]);
  const close = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  }, [onClose]);
  const itemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => roundMoney(cart.reduce((total, item) => total + item.price * item.quantity, 0)), [cart]);

  return (
    <dialog ref={dialogRef} className={`${styles.dialog} ${styles.cartDialog}`} aria-labelledby="cart-dialog-title"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.drawerContent}>
        <div className={styles.drawerHeader}>
          <div><span className={styles.eyebrow}>A few good choices</span><h2 id="cart-dialog-title" className={styles.drawerTitle}>{checkoutStep === "summary" ? "The roundup." : "Your bag."} <span>({itemCount})</span></h2></div>
          <DialogCloseButton onClose={close} label="Close bag" autoFocus />
        </div>
        {cart.length === 0 ? (
          <div className={styles.emptyState}><span className={styles.emptyMark} aria-hidden="true">✳</span><h3>Room for something good.</h3><p>Your bag is empty. Let’s change that.</p><button type="button" className={styles.secondaryButton} onClick={close}>Keep exploring <span aria-hidden="true">↗</span></button></div>
        ) : checkoutStep === "summary" ? (
          <>
            <button type="button" className={styles.backButton} onClick={() => setCheckoutStep("cart")} data-dialog-autofocus><ArrowLeft size={16} /> Back to bag</button>
            <p className={styles.summaryNotice}>Online checkout is not available yet. No order has been placed.</p>
            <div className={styles.summaryItems} role="list" aria-label="Bag summary">{cart.map(item => <div className={styles.summaryItem} role="listitem" key={`${item.id}-${item.selectedSize ?? ""}`}><span>{item.name}{item.selectedSize ? ` · ${item.selectedSize}` : ""}</span><span>{item.quantity} × {formatPrice(item.price)}</span></div>)}</div>
            <div className={styles.totals}><div className={styles.totalLine}><strong>Bag total</strong><strong>{formatPrice(subtotal)}</strong></div></div>
            <button type="button" className={styles.primaryButton} onClick={close}>Keep exploring <span aria-hidden="true">↗</span></button>
          </>
        ) : (
          <>
            <div className={styles.cartItems} role="list" aria-label="Items in your bag">{cart.map(item => (
              <div className={styles.cartItem} role="listitem" key={`${item.id}-${item.selectedSize ?? ""}`}>
                <div className={styles.cartImageFrame}><div className={styles.cartVisual}><ProductVisual product={item} sizes="100px" /></div></div>
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemTopline}><div><h3>{item.name}</h3>{item.selectedSize && <p>Size {item.selectedSize}</p>}</div><span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span></div>
                  <div className={styles.quantityControl} role="group" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={14} /></button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button type="button" onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))}</div>
            <div className={styles.totals}><div className={styles.totalLine}><strong>Subtotal</strong><strong>{formatPrice(subtotal)}</strong></div><p className={styles.cartNote}>Just browsing? Your bag is saved on this device.</p></div>
            <button type="button" className={styles.primaryButton} onClick={() => setCheckoutStep("summary")}>Review bag <span aria-hidden="true">↗</span></button>
            <p className={styles.cartNote}>Demo store. No payment or order will be placed.</p>
          </>
        )}
      </div>
    </dialog>
  );
}
