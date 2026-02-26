// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import CategoriesPage from "./CategoriesPageContent";

export const metadata: Metadata = {
  title: "Все категории",
  description: "Просматривайте товары по категориям в магазине «Быстро и точка». Удобный каталог для быстрого поиска.",
};

export default function Page() {
  return <CategoriesPage />;
}