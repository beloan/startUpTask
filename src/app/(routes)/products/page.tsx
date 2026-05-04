// app/(routes)/products/page.tsx
import { Metadata } from "next";
import { StructuredData } from "@/feature/structured-data/structured-data";
import ProductsPage from "./ProductsPageContent";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category as string | undefined;
  const q = params.q as string | undefined;
  const sellerId = params.seller_id as string | undefined;
  const section = params.section as string | undefined;
  const address = params.address as string | undefined;

  const cityFromAddress = address
    ? decodeURIComponent(address).split(",")[0].trim()
    : undefined;

  let title = "Каталог товаров с доставкой";
  let description = "Широкий ассортимент товаров в маркетплейсе БыстроИточка с быстрой доставкой.";
  let url = "https://bystroi.ru/products";
  const keywords = ["товары", "маркетплейс", "купить", "доставка"];

  if (q) {
    title = `Поиск: ${q}`;
    description = `Результаты поиска по запросу «${q}». Найдите нужные товары в каталоге БыстроИточка.`;
    url = `https://bystroi.ru/products?q=${encodeURIComponent(q)}`;
    keywords.push(q);
  } else if (category) {
    title = `Товары в категории ${category}`;
    description = `Купить товары в категории ${category} по выгодным ценам с быстрой доставкой в БыстроИточка.`;
    url = `https://bystroi.ru/products?category=${encodeURIComponent(category)}`;
    keywords.push(category);
  } else if (sellerId) {
    title = `Товары продавца ID: ${sellerId}`;
    description = `Товары от продавца в маркетплейсе БыстроИточка.`;
    url = `https://bystroi.ru/products?seller_id=${encodeURIComponent(sellerId)}`;
  }

  if (section === "realty") {
    title = cityFromAddress
      ? `Недвижимость в ${cityFromAddress}`
      : "Недвижимость: покупка и аренда";
    description = cityFromAddress
      ? `Объявления по недвижимости в ${cityFromAddress}: квартиры, дома, коммерческие объекты. Фильтры по типу сделки и комнатности.`
      : "Объявления по недвижимости: квартиры, дома, коммерческие объекты. Удобные фильтры и актуальная выдача в БыстроИточка.";
    keywords.push("недвижимость", "квартиры", "дома", "аренда", "продажа");
  }

  if (cityFromAddress) {
    keywords.push(cityFromAddress);
    if (!q && !category && section !== "realty") {
      title = `Товары в ${cityFromAddress}`;
      description = `Каталог товаров с доставкой по адресу в ${cityFromAddress}. Актуальные предложения и цены в БыстроИточка.`;
    }
  }

  const hasValue = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
      return value.some(Boolean);
    }
    return Boolean(value);
  };

  const stableSeoKeys = new Set([
    "category",
    "section",
    "address",
    "realty_type",
    "deal_type",
    "rooms_count",
  ]);

  const hasUnstableFilters = Object.entries(params).some(([key, value]) => {
    if (!hasValue(value)) return false;
    return !stableSeoKeys.has(key);
  });

  const shouldIndex = !q && !sellerId && !hasUnstableFilters;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/products",
    },
    robots: {
      index: shouldIndex,
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

export default function Page() {
  return (
    <>
      <StructuredData
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Главная", url: "https://bystroi.ru" },
            { name: "Товары", url: "https://bystroi.ru/products" },
          ],
        }}
      />
      <ProductsPage />
    </>
  );
}