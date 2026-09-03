import type { Product } from "../types/product";

const replacements: Record<string, { previous: string; current: string }> = {
  "rs-blanket-07": { previous: "/images/hero.jpg", current: "/images/campaign/rouse-blanket.webp" },
  "rs-pen-08": { previous: "/images/raider_notebook.jpg", current: "/images/campaign/rouse-pens.webp" },
  "rs-coldbrew-09": { previous: "/images/raider_bottle.jpg", current: "/images/campaign/rouse-coldbrew.webp" },
  "rs-protein-10": { previous: "/images/raider_bottle.jpg", current: "/images/campaign/rouse-chocolate.webp" },
};

// Upgrade only the known demo placeholders, including older saved bags/catalogs.
// Never rewrite storage or replace a staff-uploaded custom product image.
export function getProductImage(product: Pick<Product, "id" | "image">): string {
  const replacement = replacements[product.id];
  return replacement && product.image === replacement.previous
    ? replacement.current
    : product.image;
}
