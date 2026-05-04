// app/(routes)/favorites/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import FavoritesPageContent from "./FavoritesPageContent";

export const metadata: Metadata = {
  title: "Избранное",
  description:
    "Сохраняйте понравившиеся товары и возвращайтесь к ним позже. Управляйте списком избранного в быстроИточка.",
  alternates: {
    canonical: "/favorites",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Избранное",
    description: "Сохраняйте понравившиеся товары и возвращайтесь к ним позже.",
    url: "https://bystroi.ru/favorites",
    images: ["/favicon.ico"],
  },

  twitter: {
    title: "Избранное",
    description: "Сохраняйте понравившиеся товары и возвращайтесь к ним позже.",
    images: ["/favicon.ico"],
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="container py-8">Загрузка...</div>}>
      <FavoritesPageContent />
    </Suspense>
  );
}