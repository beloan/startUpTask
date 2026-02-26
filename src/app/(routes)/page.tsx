import React, { Suspense } from "react";

import SubscribeNewsletter from "@/feature/subscribe-newsletter/ui/subscribe-newsletter";
import { Metadata } from 'next';

import Categories from "@/widgets/categories";
import Deals from "@/widgets/deals";
import Poster from "@/widgets/poster";
import Recommendation from "@/widgets/recommendations";

export const metadata: Metadata = {
  title: "Быстро и точка – маркетплейс с быстрой доставкой",
  description: "Широкий выбор товаров, ежедневные скидки, быстрая доставка по вашему адресу. Покупайте с комфортом!",
  openGraph: {
    title: "Быстро и точка",
    description: "Маркетплейс с быстрой доставкой",
    url: "https://bystroi.ru",
  },
};

const Main = () => {
  return (
    <div className="flex flex-col">
      <Poster />
      <Suspense fallback={<div>Загрузка категорий...</div>}>
        <Categories />
      </Suspense>
      <Suspense fallback={<div>Загрузка рекомендаций...</div>}>
        <Recommendation />
      </Suspense>
      <SubscribeNewsletter />
      <Suspense fallback={<div>Загрузка предложений...</div>}>
        <Deals />
      </Suspense>
    </div>
  );
};

export default Main;