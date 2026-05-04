import type { Metadata } from "next";

import { StructuredData } from "@/feature/structured-data/structured-data";
import { ThankYouTracker } from "./thank-you-tracker";

export const metadata: Metadata = {
  title: "Спасибо за заказ",
  description: "Заказ успешно оформлен. Мы свяжемся с вами для подтверждения.",
  alternates: {
    canonical: "/thank-you",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <section className="py-16">
      <ThankYouTracker />
      <StructuredData
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Главная", url: "https://bystroi.ru" },
            { name: "Спасибо за заказ", url: "https://bystroi.ru/thank-you" },
          ],
        }}
      />
      <div className="container mx-auto max-w-2xl text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Спасибо за заказ</h1>
        <p className="text-gray-600">
          Мы получили ваш заказ и скоро свяжемся с вами для подтверждения.
        </p>
      </div>
    </section>
  );
}