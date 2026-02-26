// app/(routes)/favorites/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import FavoritesPageContent from "./FavoritesPageContent";

export const metadata: Metadata = {
  title: "Избранное",
  description:
    "Сохраняйте понравившиеся товары и возвращайтесь к ним позже. Управляйте списком избранного в магазине «Быстро и точка».",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="container py-8">Загрузка...</div>}>
      <FavoritesPageContent />
    </Suspense>
  );
}