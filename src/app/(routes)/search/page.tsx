// app/(routes)/search/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPageContent from "./SearchPageContent";

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category } = await searchParams;

  if (q) {
    return {
      title: `Поиск: ${q}`,
      description: `Результаты поиска по запросу «${q}» в Быстро и точка.`,
    };
  }
  if (category) {
    return {
      title: `Товары в категории ${category}`,
      description: `Купить товары в категории ${category}.`,
    };
  }
  return {
    title: "Поиск товаров",
    description: "Ищите товары по названию, категории или производителю в Быстро и точка.",
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}