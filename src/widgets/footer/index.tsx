"use client";

import Link from "next/link";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useCategoryTree } from "@/shared/hooks/useCategory";
import { Skeleton } from "@/shared/ui/kit/skeleton";

const Footer = () => {
  const searchParams = useSearchParams();
  const { data: categoriesData, isLoading } = useCategoryTree(true);

  // Функция для проверки наличия товаров в дереве категорий (как в Categories)
  const hasProductsInTree = React.useCallback((cat: any): boolean => {
    if (cat.has_products === true) return true;
    if (cat.children && cat.children.length > 0) {
      return cat.children.some((child: any) => {
        if (!child.is_active) return false;
        return hasProductsInTree(child);
      });
    }
    return false;
  }, []);

  // Получаем главные категории с товарами (как в Categories)
  const mainCategories = React.useMemo(() => {
    if (!categoriesData?.result) return [];
    return categoriesData.result.filter((cat: any) => {
      if (!cat.is_active || cat.parent_id) return false;
      if (cat.has_products === true) return true;
      if (!cat.children || cat.children.length === 0) return false;
      const hasActiveChildrenWithProducts = cat.children.some((child: any) => {
        if (!child.is_active) return false;
        return hasProductsInTree(child);
      });
      return hasActiveChildrenWithProducts;
    });
  }, [categoriesData, hasProductsInTree]);

  const displayedCategories = mainCategories.slice(0, 7);

  const getCategoryUrl = (categoryId: number) => {
    const params = new URLSearchParams();
    params.set("global_category_id", categoryId.toString());

    const address = searchParams.get("address");
    const city = searchParams.get("city");
    const sellerId = searchParams.get("seller_id");

    if (address) params.set("address", address);
    else if (city) params.set("city", city);
    if (sellerId) params.set("seller_id", sellerId);

    return `/products?${params.toString()}`;
  };

  return (
    <footer className="pt-4 md:pt-12 w-full text-gray-500 border-t border-t-gray-300">
      <div className="container">
        <div className="flex flex-col lg:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">
          <div className="md:max-w-96">
            <Link
              href="/"
              className="tracking-tight text-blue-600 text-2xl font-medium"
            >
              #быстроИточка
            </Link>
            <p className="pt-2 text-sm tracking-tight">
              Интернет-магазин с быстрой доставкой. У нас вы найдёте тысячи
              товаров для дома, семьи и отдыха по доступным ценам. Работаем для
              вас каждый день.
            </p>
          </div>

          <div className="flex-1 flex items-start flex-col md:flex-row lg:justify-end gap-6 md:gap-12 lg:gap-20">
            <div>
              <h2 className="font-medium mb-5 text-gray-800">
                Популярные категории
              </h2>
              <ul className="text-sm space-y-2">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <li key={i}>
                      <Skeleton className="h-4 w-32" />
                    </li>
                  ))
                ) : (
                  displayedCategories.map((cat: any) => (
                    <li key={cat.id}>
                      <Link href={getCategoryUrl(cat.id)}>{cat.name}</Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div>
              <h2 className="font-medium mb-5 text-gray-800">Компания</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <Link href="/">Главная</Link>
                </li>
                <li>
                  <Link href="/about">О нас</Link>
                </li>
                <li>
                  <Link href="/contacts">Контакты</Link>
                </li>
                <li>
                  <Link href="/terms">Политика конфиденциальности</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-medium mb-5 text-gray-800">
                Свяжитесь с нами
              </h2>
              <div className="text-sm space-y-2">
                <p>
                  <a href="tel:+79377799906" className="hover:text-blue-600">
                    +7 937 779-99-06
                  </a>
                </p>
                <p>
                  <a href="mailto:newgis@yandex.ru" className="hover:text-blue-600">
                    newgis@yandex.ru
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="pt-4 text-center text-xs pb-5">
          © {new Date().getFullYear()} #быстроИточка. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;