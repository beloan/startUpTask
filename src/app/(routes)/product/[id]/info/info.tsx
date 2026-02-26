"use client";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Warehouse } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Product, useProduct } from "@/entities/product";
import { ProductImages } from "@/entities/product/ui/product-images";

import { useReviews } from "@/shared/hooks/useReviews";
import { BreadcrumbsDemo } from "@/shared/ui/breadcrumbs";
import { Avatar, AvatarImage } from "@/shared/ui/kit/avatar";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { Separator } from "@/shared/ui/kit/separator";
import { Rating } from "@/shared/ui/rating";

type Props = Product;

const ProductInfo = ({
  id,
  name,
  seller_name,
  seller_photo,
  seller_description,
  rating: productRating,
  reviews_count: productReviewsCount,
  price: initialPrice,
  description_short,
  description_long,
  manufacturer_name,
  category_name,
  tags = [],
  nomenclatures,
  available_warehouses = [],
  unit_name = "шт.",
  ...product
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchParams = useSearchParams();

  
  const latFromUrl = searchParams.get("lat")
    ? Number(searchParams.get("lat"))
    : undefined;
  const lonFromUrl = searchParams.get("lon")
    ? Number(searchParams.get("lon"))
    : undefined;
  const addressFromUrl = searchParams.get("address") || undefined;
  const cityFromUrl = searchParams.get("city") || undefined;

  
  const [detectedCoords, setDetectedCoords] = useState<{
    lat?: number;
    lon?: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !latFromUrl && !lonFromUrl) {
      try {
        const detected = sessionStorage.getItem("detected_city");
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null && parsed.lon != null) {
            setDetectedCoords({ lat: parsed.lat, lon: parsed.lon });
          }
        }
      } catch (e) {
        
      }
    }

    
    const handleDetectedCityUpdated = () => {
      try {
        const detected = sessionStorage.getItem("detected_city");
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null && parsed.lon != null) {
            setDetectedCoords({ lat: parsed.lat, lon: parsed.lon });
          }
        }
      } catch (e) {
        
      }
    };

    window.addEventListener(
      "detectedCityUpdated",
      handleDetectedCityUpdated as EventListener,
    );
    return () => {
      window.removeEventListener(
        "detectedCityUpdated",
        handleDetectedCityUpdated as EventListener,
      );
    };
  }, [latFromUrl, lonFromUrl]);

  
  const lat = latFromUrl ?? detectedCoords?.lat;
  const lon = lonFromUrl ?? detectedCoords?.lon;

  
  const { data: updatedProduct } = useProduct({
    product_id: id,
    lat,
    lon,
    address: addressFromUrl,
    city: cityFromUrl,
  });

  
  const price = updatedProduct?.price ?? initialPrice;

  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({
    entity_type: "nomenclature",
    entity_id: id,
    page: 1,
    size: 10,
  });

  const avgRating = reviewsData?.avg_rating ?? productRating ?? 0;
  const reviewsCount = reviewsData?.count ?? productReviewsCount ?? 0;
  const hasReviews = reviewsCount > 0;

  const shortDescription =
    description_short ||
    (description_long
      ? description_long.substring(0, 200) + "..."
      : "Описание товара отсутствует");

  const description =
    description_short || description_long || "Описание товара отсутствует";
  const shouldShowExpand = description_long && description_long.length > 200;

  const formatPrice = (price: number) => {
    return `${price?.toLocaleString("ru-RU")}₽/${unit_name === null ? "шт." : unit_name}`;
  };

  const getReviewWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "отзывов";
    }

    if (lastDigit === 1) {
      return "отзыв";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return "отзыва";
    }

    return "отзывов";
  };

  return (
    <section>
      <BreadcrumbsDemo
        isProduct={true}
        productName={name}
        categoryName={category_name}
      />
      <div className="flex gap-4 flex-col lg:flex-row">
        <ProductImages {...product} />
        <div className="flex-1">
          <h1 className="text-xl font-medium tracking-tight">{name}</h1>

          <div className="flex pt-2 items-center gap-2">
            {reviewsCount > 0 && (
              <div className="flex">
                <div className="flex items-center gap-0.5">
                  <Rating size={16} rating={avgRating ?? 0} />
                </div>
                <span className="text-xs text-gray-600 ml-2">
                  {reviewsCount + " " + getReviewWord(reviewsCount)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xl font-normal">
              {price ? formatPrice(price) : "Цена не указана"}
            </span>
          </div>

          <Separator className="w-full my-4" />

          {nomenclatures && nomenclatures.length > 0 && (
            <div className="mb-4">
              <div className="space-y-4">
                {nomenclatures.map((group: any, index: number) => (
                  <div key={index}>
                    <h4 className="text-sm mb-2 text-gray-500">
                      {group.group_name}:{" "}
                      <span className="text-black">{name}</span>
                    </h4>
                    <div className="mt-2 pb-1">
                      {group.items.map((item: any) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.id}`}
                          className="cursor-pointer mr-1 mb-1 mt-1"
                        >
                          <Badge
                            variant="outline"
                            className={`transition-all duration-200 py-0.5 ${
                              item.id === id
                                ? "border-blue-500 bg-blue-50 text-blue-500"
                                : "border-gray-200"
                            }`}
                          >
                            <span className="px-1 py-0.5">{item.name}</span>
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="w-full my-3" />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {manufacturer_name && (
              <div className="flex flex-col text-sm">
                <div className="flex gap-0.5">
                  <span className="text-gray-500">Производитель: </span>
                  <p>{manufacturer_name}</p>
                </div>
              </div>
            )}

            {category_name && (
              <div className="flex flex-col text-sm">
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">Категория</span>
                  <Badge variant="outline">
                    <p>{category_name}</p>
                  </Badge>
                </div>
                <Separator className="w-full my-4" />
              </div>
            )}
          </div>

          {seller_name && (
            <>
              <p className="text-sm text-gray-500 mb-2">Продавец</p>
              <div className="flex items-center gap-2 pt-2">
                <Avatar className="size-10">
                  <AvatarImage src={seller_photo} alt={seller_name} />
                  <AvatarFallback>{seller_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{seller_name}</p>
                  <div className="flex items-center gap-0.5">
                    <Rating size={12} rating={avgRating} />
                    <span className="text-xs text-gray-600 ml-1">
                      ({reviewsCount})
                    </span>
                  </div>
                </div>
              </div>

              {seller_description && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="p-0 text-blue-600 mt-2 text-sm cursor-pointer inline"
                    >
                      Подробнее о продавце
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Информация о продавце</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-16">
                          <AvatarImage src={seller_photo} alt={seller_name} />
                          <AvatarFallback>
                            {seller_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {seller_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Rating size={16} rating={avgRating} />
                            <span className="text-sm text-gray-600">
                              {avgRating.toFixed(1)} ({reviewsCount} отзывов)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Описание:</h4>
                        <p className="text-gray-700">{seller_description}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {available_warehouses && available_warehouses.length > 0 && (
                <div className="mb-4 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        <Warehouse className="mr-2 h-4 w-4" />
                        Наличие на складах ({available_warehouses.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Наличие на складах</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 overflow-y-auto max-h-130">
                        {available_warehouses.map((warehouse: any) => (
                          <div
                            key={warehouse.warehouse_id}
                            className="border rounded-lg p-3"
                          >
                            <p className="font-medium">
                              {warehouse.warehouse_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {warehouse.warehouse_address}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm">В наличии:</span>
                              <span className="font-medium ml-1">
                                {warehouse.current_amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              <Separator className="w-full my-4" />
            </>
          )}

          <div className="overflow-hidden relative">
            <h3 className="font-medium text-lg mb-3">Описание</h3>
            <p className="text-sm tracking-tight">
              {isExpanded ? description : shortDescription}
            </p>
            {shouldShowExpand && (
              <Button
                variant="link"
                className="p-0 text-blue-600 mt-2 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Свернуть" : "Развернуть"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductInfo;
