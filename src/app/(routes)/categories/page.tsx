// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import CategoriesPage from "./CategoriesPageContent";

export const metadata: Metadata = {
  title: "Все категории | быстроИточка",
  description: "Просматривайте товары по категориям в магазине «Быстро и точка». Удобный каталог для быстрого поиска.",

  openGraph: {
    title: "Все категории | быстроИточка",
    description: "Просматривайте товары по категориям в быстроИточка.",
    url: "https://bystroi.ru/categories",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
    locale: "ru_RU",
  },

  twitter: {
    title: "Все категории | быстроИточка",
    description: "Просматривайте товары по категориям в быстроИточка.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <CategoriesPage />;
}