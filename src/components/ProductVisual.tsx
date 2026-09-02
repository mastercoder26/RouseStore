import Image from "next/image";
import type { Product } from "@/lib/store";

export default function ProductVisual({ product, sizes = "(max-width: 600px) 50vw, 25vw", priority = false }: { product: Product; sizes?: string; priority?: boolean }) {
  if (product.id === "rs-hoodie-01" || product.id === "rs-cap-03") {
    return <Image src={product.image} alt={product.name} fill sizes={sizes} preload={priority} className="product-photo" />;
  }
  const kind = product.id.includes("notebook") ? "notebook" : product.id.includes("bottle") ? "bottle" : product.id.includes("pen") ? "pens" : product.id.includes("coldbrew") ? "coffee" : product.id.includes("protein") ? "bar" : product.id.includes("blanket") ? "blanket" : "apparel";
  return (
    <div className={`product-illustration illustration-${kind}`} role="img" aria-label={`${product.name} illustration; product photograph not yet available`}>
      <div className="illustrated-object" aria-hidden="true">
        <span className="illustration-school">ROUSE</span>
        <span className="illustration-r">R</span>
        <span className="illustration-caption">{kind === "coffee" ? "COLD BREW" : kind === "bar" ? "CHOCOLATE / ALMOND" : "RAIDERS"}</span>
      </div>
      <span className="illustration-note">Illustration</span>
    </div>
  );
}
