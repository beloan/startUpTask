import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import Footer from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { Providers } from "./providers";
import { ReduxProvider } from "./ReduxProvider";
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Магазин",
  description: "Темплейт",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`bg-white text-gray-800 ${inter.className}`} >
      <body className="h-screen mt-25 relative z-10">
        <ReduxProvider>
          <Providers>
            <Suspense fallback={null}>
              <Header />
            </Suspense>
              <main>{children}</main>
            <Footer />
            <Toaster closeButton />
          </Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}
