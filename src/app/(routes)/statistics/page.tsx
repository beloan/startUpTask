// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import SellerStatisticsPage from "./StatisticsPageContent";

export const metadata: Metadata = {
  title: "Статистика продавца",
  description: "Аналитика и показатели работы продавца в сервисе быстроИточка.",
  alternates: {
    canonical: "/statistics",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Статистика продавца | быстроИточка",
    description: "Аналитика и показатели работы продавца в сервисе быстроИточка.",
    url: "https://bystroi.ru/statistics",
    images: ["/favicon.ico"],
  },
  twitter: {
    title: "Статистика продавца",
    description: "Аналитика и показатели работы продавца в сервисе быстроИточка.",
    images: ["/favicon.ico"],
  },
};

export default function Page() {
  return <SellerStatisticsPage />;
}