// app/(routes)/payment/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import PaymentPageContent from "./PaymentPageContent";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description:
    "Заполните данные для доставки и оплатите заказ удобным способом. Быстрое оформление в магазине «Быстро и точка».",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}