// app/(routes)/search/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { StructuredData } from "@/feature/structured-data/structured-data";
import SearchPageContent from "./SearchPageContent";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    section?: string;
    address?: string;
    realty_type?: string;
    deal_type?: string;
    rooms_count?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category, section, address, realty_type, deal_type, rooms_count } = await searchParams;
  const cityFromAddress = address
    ? decodeURIComponent(address).split(",")[0].trim()
    : undefined;

  let title = "Поиск товаров";
  let description = "Ищите товары по названию, категории или производителю в быстроИточка";
  let url = "https://bystroi.ru/search";
  const keywords = ["поиск", "товары", "маркетплейс", "доставка"];

  if (q) {
    title = `Поиск: ${q}`;
    description = `Результаты поиска по запросу «${q}» в быстроИточка.`;
    url = `https://bystroi.ru/search?q=${encodeURIComponent(q)}`;
    keywords.push(q);
  } else if (category) {
    title = `Товары в категории ${category}`;
    description = `Купить товары в категории ${category}.`;
    url = `https://bystroi.ru/search?category=${encodeURIComponent(category)}`;
    keywords.push(category);
  }

  if (section === "realty") {
    title = cityFromAddress
      ? `Поиск недвижимости в ${cityFromAddress}`
      : "Поиск недвижимости";
    description = cityFromAddress
      ? `Подбор недвижимости в ${cityFromAddress}: ${deal_type === "rent" ? "аренда" : deal_type === "sale" ? "продажа" : "аренда и продажа"}, ${realty_type || "разные типы"}, комнаты: ${rooms_count || "любое"}.`
      : "Поиск недвижимости по типу объекта, сделке и количеству комнат.";
    keywords.push("недвижимость", "аренда", "продажа", "квартиры", "дома");
    if (realty_type) keywords.push(realty_type);
    if (deal_type) keywords.push(deal_type);
  }

  if (cityFromAddress) {
    keywords.push(cityFromAddress);
    if (!q && !category && section !== "realty") {
      title = `Поиск товаров в ${cityFromAddress}`;
      description = `Ищите товары с доставкой по адресу в ${cityFromAddress}.`;
    }
  }

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
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

export default function SearchPage() {
  return (
    <>
      <StructuredData
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Главная", url: "https://bystroi.ru" },
            { name: "Поиск", url: "https://bystroi.ru/search" },
          ],
        }}
      />
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
    </>
  );
}