// app/(routes)/payment/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import PaymentPageContent from "./PaymentPageContent";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description:
    "Заполните данные для доставки и оплатите заказ удобным способом. Быстрое оформление в быстроИточка.",
  alternates: {
    canonical: "/payment",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Оформление заказа | быстроИточка",
    description: "Заполните данные для доставки и оплатите заказ удобным способом.",
    url: "https://bystroi.ru/payment",
    images: ["/favicon.ico"],
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}