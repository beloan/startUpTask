// app/(routes)/products/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import ProductsPage from "./ProductsPageContent";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category as string | undefined;
  const q = params.q as string | undefined;
  const sellerId = params.seller_id as string | undefined;

  let title = "Все товары";
  let description = "Широкий ассортимент товаров в магазине «Быстро и точка».";

  if (q) {
    title = `Поиск: ${q}`;
    description = `Результаты поиска по запросу «${q}». Найдите нужные товары в нашем каталоге.`;
  } else if (category) {
    title = `Товары в категории ${category}`;
    description = `Купить товары в категории ${category} по выгодным ценам с быстрой доставкой.`;
  } else if (sellerId) {
    title = `Товары продавца ID: ${sellerId}`;
    description = `Товары от продавца в магазине «Быстро и точка».`;
  }

  return {
    title,
    description,
  };
}

export default function Page() {
  return (
    <ProductsPage />
  );
}