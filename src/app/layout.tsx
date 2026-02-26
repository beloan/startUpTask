// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";

import Footer from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { Providers } from "./providers";
import { ReduxProvider } from "./ReduxProvider";
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Быстро и точка",
    template: "%s | Быстро и точка"
  },
  description: "Интернет-магазин с быстрой доставкой. Широкий ассортимент товаров по доступным ценам.",
  keywords: ["интернет-магазин", "быстрая доставка", "покупки онлайн", "товары"],
  authors: [{ name: "Быстро и точка" }],
  openGraph: {
    title: "Быстро и точка",
    description: "Интернет-магазин с быстрой доставкой. Широкий ассортимент товаров по доступным ценам.",
    url: "https://bystroi.ru",
    siteName: "bystroi.ru",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Быстро и точка",
    description: "Интернет-магазин с быстрой доставкой. Широкий ассортимент товаров по доступным ценам.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://bystroi.ru"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`bg-white text-gray-800 ${inter.className}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=107009951', 'ym');

              ym(107009951, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
      </head>
      <body className="h-screen mt-25 relative z-10">
        <ReduxProvider>
          <Providers>
            <Suspense fallback={null}>
              <Header />
              <main>{children}</main>
              <Footer />
              <Toaster closeButton />
            </Suspense>
          </Providers>
        </ReduxProvider>
        
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/107009951" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}