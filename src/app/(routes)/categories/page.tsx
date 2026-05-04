// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import { StructuredData } from "@/feature/structured-data/structured-data";
import CategoriesPage from "./CategoriesPageContent";

export const metadata: Metadata = {
  title: "Каталог категорий товаров",
  description: "Просматривайте все категории и подкатегории товаров в магазине БыстроИточка. Удобный каталог для быстрого поиска.",
  alternates: {
    canonical: "/categories",
  },
  keywords: ["категории товаров", "каталог", "подкатегории", "быстроИточка"],
  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Каталог категорий товаров | БыстроИточка",
    description: "Просматривайте все категории и подкатегории товаров в магазине БыстроИточка.",
    url: "https://bystroi.ru/categories",
    images: [{ url: "/favicon.ico", width: 1200, height: 630 }],
    type: "website",
    locale: "ru_RU",
  },

  twitter: {
    title: "Каталог категорий товаров | БыстроИточка",
    description: "Просматривайте все категории и подкатегории товаров в магазине БыстроИточка.",
    images: ["/favicon.ico"],
  },
};

export default function Page() {
  return (
    <>
      <StructuredData
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Главная", url: "https://bystroi.ru" },
            { name: "Категории", url: "https://bystroi.ru/categories" },
          ],
        }}
      />
      <CategoriesPage />
    </>
  );
}