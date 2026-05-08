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
  let description = "Широкий ассортимент товаров в маркетплейсе «Быстро и точка».";
  let url = "https://bystroi.ru/products";

  if (q) {
    title = `Поиск: ${q}`;
    description = `Результаты поиска по запросу «${q}». Найдите нужные товары в нашем каталоге.`;
    url = `https://bystroi.ru/products?q=${encodeURIComponent(q)}`;
  } else if (category) {
    title = `Товары в категории ${category}`;
    description = `Купить товары в категории ${category} по выгодным ценам с быстрой доставкой.`;
    url = `https://bystroi.ru/products?category=${encodeURIComponent(category)}`;
  } else if (sellerId) {
    title = `Товары продавца ID: ${sellerId}`;
    description = `Товары от продавца в маркетплейсе «Быстро и точка».`;
    url = `https://bystroi.ru/products?seller_id=${encodeURIComponent(sellerId)}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: "/favicon.ico",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default function Page() {
  return (
    <ProductsPage />
  );
}