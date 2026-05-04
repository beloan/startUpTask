import type { Metadata } from "next";

import { StructuredData } from "@/feature/structured-data/structured-data";

import HomePageClient from "./page.client";

export const metadata: Metadata = {
  title: "БыстроИточка - маркетплейс с быстрой доставкой",
  description:
    "БыстроИточка - маркетплейс с быстрой доставкой. Категории товаров, рекомендации и выгодные предложения в одном месте.",
  alternates: {
    canonical: "/",
  },
  keywords: ["маркетплейс", "быстрая доставка", "товары", "категории", "рекомендации"],
  openGraph: {
    title: "БыстроИточка - маркетплейс с быстрой доставкой",
    description:
      "БыстроИточка - маркетплейс с быстрой доставкой. Категории товаров, рекомендации и выгодные предложения в одном месте.",
    url: "https://bystroi.ru",
    siteName: "БыстроИточка",
    images: ["/favicon.ico"],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "БыстроИточка - маркетплейс с быстрой доставкой",
    description:
      "БыстроИточка - маркетплейс с быстрой доставкой. Категории товаров, рекомендации и выгодные предложения в одном месте.",
    images: ["/favicon.ico"],
  },
};

export default function MainPage() {
  return (
    <>
      <StructuredData
        type="Organization"
        data={{
          name: "быстроИточка",
          url: "https://bystroi.ru",
          logo: "https://bystroi.ru/favicon.ico",
        }}
      />
      <StructuredData
        type="WebSite"
        data={{
          name: "быстроИточка",
          url: "https://bystroi.ru",
        }}
      />
      <h1 className="sr-only">БыстроИточка - маркетплейс с быстрой доставкой</h1>
      <HomePageClient />
    </>
  );
}