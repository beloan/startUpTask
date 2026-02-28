// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import SellerStatisticsPage from "./StatisticsPageContent";

export const metadata: Metadata = {
  title: "Статистика продавца ",
  openGraph: {
    title: "Статистика продавца | быстроИточка",
    description: "Статистика продавца.",
    url: "https://bystroi.ru/statistics",
    images: ["/favicon.ico"],
  },
  twitter: {
    title: "Статистика продавца",
    description: "Статистика продавца.",
    images: ["/favicon.ico"],
  },
};

export default function Page() {
  return <SellerStatisticsPage />;
}