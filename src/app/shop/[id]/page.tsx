import type { Metadata } from "next";
import ProductDetailWrapper from "@/components/ProductDetailWrapper";
import { PRODUCTS } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return PRODUCTS.map(product => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) {
    return { title: "Listing Details | Raider Station", description: "Rouse High School Student Store" };
  }
  return { title: `${product.name} | Raider Station`, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const initialProduct = PRODUCTS.find(item => item.id === id);
  return <ProductDetailWrapper id={id} initialProduct={initialProduct} />;
}

