// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import SellerStatisticsPage from "./StatisticsPageContent";

export const metadata: Metadata = {
  title: "Статистика продавца | быстроИточка",
  openGraph: {
    title: "Статистика продавца | быстроИточка",
    description: "Статистика продавца.",
    url: "https://bystroi.ru/statistics",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <SellerStatisticsPage />;
}