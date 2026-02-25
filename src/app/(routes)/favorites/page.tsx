"use client";

import { Heart } from "lucide-react";
import { Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

import { fetchProduct } from "@/entities/product/api";
import { ProductCard } from "@/entities/product/ui/product-card";
import { ProductCardSkeleton } from "@/entities/product/ui/product-card-skeleton";

import { LoginPopup } from "@/feature/auth";

import { useContragentPhone } from "@/shared/hooks/useContragentPhone";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { Button } from "@/shared/ui/kit/button";

const FavoritesPageContent = () => {
  const contragentPhone = useContragentPhone();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: favorites, isLoading: isFavoritesLoading } = useFavorites({
    page: currentPage,
  });
  const [productsData, setProductsData] = useState<Record<number, any>>({});
  const [loadingProducts, setLoadingProducts] = useState<
    Record<number, boolean>
  >({});
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);

  // Получаем координаты и адрес из URL
  const lat = searchParams.get("lat")
    ? Number(searchParams.get("lat"))
    : undefined;
  const lon = searchParams.get("lon")
    ? Number(searchParams.get("lon"))
    : undefined;
  const address = searchParams.get("address") || undefined;
  const city = searchParams.get("city") || undefined;

  const isAuthenticated = !!contragentPhone;
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    if (
      favorites?.result &&
      favorites.result.length > 0 &&
      !allProductsLoaded
    ) {
      const loadAllProducts = async () => {
        const newProductsData: Record<number, any> = {};
        const newLoadingProducts: Record<number, boolean> = {};

        favorites.result.forEach((favorite) => {
          newLoadingProducts[favorite.nomenclature_id] = true;
        });

        setLoadingProducts(newLoadingProducts);

        try {
          const productPromises = favorites.result.map(async (favorite) => {
            try {
              const product = await fetchProduct({
                product_id: favorite.nomenclature_id,
                lat,
                lon,
                address,
                city,
              });
              return { id: favorite.nomenclature_id, data: product };
            } catch (error) {
              console.error(
                `Ошибка при загрузке товара ${favorite.nomenclature_id}:`,
                error,
              );
              return { id: favorite.nomenclature_id, data: null };
            }
          });

          const productsResults = await Promise.all(productPromises);

          productsResults.forEach((result) => {
            if (result.data) {
              newProductsData[result.id] = result.data;
            }
          });

          setProductsData(newProductsData);
          setAllProductsLoaded(true);
        } catch (error) {
          console.error("Ошибка при загрузке всех продуктов:", error);
        } finally {
          setLoadingProducts({});
        }
      };

      loadAllProducts();
    }
  }, [favorites, allProductsLoaded]);

  const isLoading = isFavoritesLoading || !allProductsLoaded;
  const hasItems = favorites?.result && favorites.result.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="container flex flex-col h-screen">
        <div className="flex flex-col gap-1 py-8">
          <h1 className="text-lg font-medium tracking-tight">Избранное</h1>
          <p className="text-gray-500 tracking-tight leading-5">
            Сохраняйте товары, которые вам понравились, и возвращайтесь к ним в
            любое время. <br />В избранном собраны все ваши выбранные позиции
            для удобного и быстрого оформления заказа.
          </p>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center text-center py-12 mb-30">
          <div className="space-y-4">
            <p className="text-gray-600 max-w-md">
              Войдите в аккаунт, чтобы сохранять товары в избранное и
              возвращаться к ним позже
            </p>

            <div className="flex gap-2 justify-center">
              <Link href="/">
                <Button variant="outline">Продолжить покупки</Button>
              </Link>
              <LoginPopup
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Войти в аккаунт
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-185 flex flex-col">
      <div className="container py-8 flex-grow">
        <div className="flex items-center justify-between mb-6 mt-3">
          <h1 className="flex gap-2 tracking-tight text-blue-600 text-2xl font-medium">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            Избранное
          </h1>
          {hasItems && (
            <span className="text-gray-500 text-sm md:text-base">
              {favorites?.count || 0} товаров
            </span>
          )}
        </div>

        {!hasItems ? (
          <div className="text-center py-12 md:py-24  flex flex-col justify-center">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              В избранном пока ничего нет
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Добавляйте товары в избранное, нажимая на иконку ♡ на карточке
              товара
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Перейти к покупкам
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="pt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {favorites?.result?.map((favorite, index) => {
                const product = productsData[favorite.nomenclature_id];
                const isLoadingProduct =
                  loadingProducts[favorite.nomenclature_id];

                if (isLoadingProduct) {
                  return (
                    <ProductCardSkeleton key={`skeleton-${favorite.id}`} />
                  );
                }

                if (!product) {
                  return null;
                }

                return (
                  <ProductCard
                    key={`product-${favorite.id}`}
                    {...product}
                    listing_pos={index + 1}
                    listing_page={currentPage}
                    hideFavoriteButton={true}
                  />
                );
              })}
            </div>

            {favorites && favorites.count > 20 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentPage((prev) => prev - 1);
                      setAllProductsLoaded(false);
                    }}
                    disabled={currentPage === 1}
                  >
                    Назад
                  </Button>
                )}

                <span className="text-gray-600 text-sm">
                  Страница {currentPage} из {Math.ceil(favorites.count / 20)}
                </span>

                {currentPage < Math.ceil(favorites.count / 20) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentPage((prev) => prev + 1);
                      setAllProductsLoaded(false);
                    }}
                  >
                    Вперед
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const FavoritesPage = () => {
  return (
    <Suspense
      fallback={
        <div className="container py-8 min-h-185 flex flex-col">
          <div className="flex items-center justify-between mb-6 mt-3">
            <h1 className="flex gap-2 tracking-tight text-blue-600 text-2xl font-medium">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              Избранное
            </h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Загрузка...</p>
          </div>
        </div>
      }
    >
      <FavoritesPageContent />
    </Suspense>
  );
};

export default FavoritesPage;
