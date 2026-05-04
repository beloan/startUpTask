"use client";

import { Headset, Heart, PhoneCall, User, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import React, { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { LoginPopup } from "@/feature/auth";
import { CartPopup } from "@/feature/cart";
import { CategoryMenu } from "@/feature/category";
import { ChangeLocationModal } from "@/feature/change-location";
import { MobileSheet } from "@/feature/navigation/ui";
import { SearchBar } from "../search/search";

import { Button } from "@/shared/ui/kit/button";

export const Header = () => {
  const supportPhone = "+79377799906";
  const supportPhoneLabel = "+7 937 779-99-06";
  const supportEmail = "newgis@yandex.ru";
  const workingHours = "пн-пт 09:00-21:00, сб-вс 10:00-20:00";
  const chatUrl = "https://t.me/bystroi_tochka"; // Placeholder chat link
  const searchParams = useSearchParams();
  const queryString = useMemo(() => searchParams.toString(), [searchParams]);
  const withQuery = (path: string) => (queryString ? `${path}?${queryString}` : path);

  return (
    <header className="fixed w-full top-0 z-50 border-b border-gray-100 bg-white">
      <div className="bg-gray-100">
        <div className="container">
          <div className="flex justify-between items-center py-1">
            <div className="flex gap-4 min-w-0 flex-1 overflow-hidden">
              <Suspense fallback={null}>
                <ChangeLocationModal />
              </Suspense>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden lg:flex items-center gap-1 text-xs text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{workingHours}</span>
              </div>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1 text-sm font-normal tracking-tight text-gray-600 hover:text-blue-600"
              >
                <Headset className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{supportEmail}</span>
                <span className="sm:hidden">Email</span>
              </a>
              <a
                href={`tel:${supportPhone}`}
                className="inline-flex items-center gap-1 text-sm font-medium tracking-tight text-gray-700 hover:text-blue-600"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{supportPhoneLabel}</span>
                <span className="sm:hidden">Позвонить</span>
              </a>
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-normal tracking-tight text-gray-600 hover:text-blue-600"
                title="Чат поддержки в Telegram"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Чат</span>
              </a>
              <LoginPopup
                trigger={
                  <Button
                    variant="link"
                    className="text-sm font-normal p-0 h-auto tracking-tight text-gray-600 cursor-pointer"
                  >
                    Вход в систему
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="flex gap-2 lg:gap-6 py-3 items-center justify-between">
          <Link
            href={withQuery("/")}
            className="flex-shrink-0 gap-2 tracking-tight text-blue-600 text-2xl font-medium"
          >
            #быстроИточка
          </Link>

          <div className="flex-1 hidden md:flex items-center max-w-3xl">
            <div className="flex-shrink-0">
              <CategoryMenu />
            </div>
            <div className="flex-1 relative">
              <div className="hidden md:block pr-30">
                <SearchBar />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Link href={withQuery("/favorites")} className="hidden md:flex relative">
              <Button size="icon" variant="ghost" className="cursor-pointer">
                <Heart width={20} height={20} />
              </Button>
            </Link>
            <CartPopup />
            <LoginPopup
              trigger={
                <Button size="icon" variant="ghost" className="cursor-pointer">
                  <User width={20} height={20} />
                </Button>
              }
            />
            <MobileSheet />
          </div>
        </div>
      </div>
    </header>
  );
};