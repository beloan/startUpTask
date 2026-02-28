// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import CategoriesPage from "./CategoriesPageContent";

export const metadata: Metadata = {
  title: "Все категории",
  description: "Просматривайте товары по категориям в магазине «Быстро и точка». Удобный каталог для быстрого поиска.",
  openGraph: {
    title: "Все категории | быстроИточка",
    description: "Просматривайте товары по категориям в быстроИточка.",
    url: "https://bystroi.ru/categories",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <CategoriesPage />;
}