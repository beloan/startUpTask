// app/(routes)/account/page.tsx
import { Metadata } from "next";
import AccountPageContent from "./AccountPageContent";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description:
    "Управляйте своими заказами, персональными данными и настройками в личном кабинете магазина «Быстро и точка».",
};

export default function Page() {
  return <AccountPageContent />;
}