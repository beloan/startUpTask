// app/(routes)/categories/page.tsx
import { Metadata } from "next";
import SellerStatisticsPage from "./StatisticsPageContent";

export const metadata: Metadata = {
  title: "Статистика продавца | Быстро и точка",
};

export default function Page() {
  return <SellerStatisticsPage />;
}