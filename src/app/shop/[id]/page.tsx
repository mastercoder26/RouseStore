import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import { PRODUCTS } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map(product => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) notFound();
  return { title: `${product.name} | Raider Station`, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) notFound();
  return <ProductDetails key={product.id} product={product} />;
}
