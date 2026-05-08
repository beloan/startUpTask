// app/(routes)/account/page.tsx
import { Metadata } from "next";
import AccountPageContent from "./AccountPageContent";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description:
    "Управляйте своими заказами, персональными данными и настройками в личном кабинете быстроИточка",
  openGraph: {
    title: "Личный кабинет",
    description: "Управляйте своими заказами, персональными данными и настройками в личном кабинете.",
    url: "https://bystroi.ru/account",
    images: ["/favicon.ico"],
  },
  twitter: {
    title: "Личный кабинет",
    description: "Управляйте своими заказами, персональными данными и настройками в личном кабинете.",
    images: ["/favicon.ico"],
  },
};

export default function Page() {
  return <AccountPageContent />;
}