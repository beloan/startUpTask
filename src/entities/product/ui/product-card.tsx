"use client";

import { ShoppingCart, Star, Plus, Minus, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";

import { FavoriteButton } from "@/shared/ui/kit/favorite-button";
import { useAddToCart, useRemoveFromCart, useCart } from "@/entities/cart/model/hooks";
import { transformImageUrl } from "@/shared/lib/image-utils";
import { Product } from "../model/types";
import { useTrackEvent } from "@/entities/statistics/model/hooks";
import { Button } from "@/shared/ui/kit/button";
import { useDataUser } from "@/shared/hooks/useDataUser";
import { getDetectedCityCoords, getLocationParams, getLocationParamsString } from "@/shared/lib/city-utils";
import { fetchProduct } from "@/entities/product/api";
import { PhoneAuthSheet } from "@/feature/auth/phone-auth-sheet";

type ProductCardProps = Product & {
  position?: number;
  page?: number;
  isRecommendation?: boolean;
  priority?: boolean;
};

export const ProductCard = ({
  id,
  name,
  price,
  current_amount,
  category_name,
  images,
  total_sold,
  sales_count,
  rating,
  avg_rating,
  old_price,
  previous_price,
  price_change_percent,
  view_count,
  views_count,
  total_views,
  position,
  page,
  isRecommendation = false,
  priority = false,
  ...product
}: ProductCardProps) => {
  const { data: cartData } = useCart();
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const { trackView, trackClick } = useTrackEvent();
  const [localQuantity, setLocalQuantity] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shouldUpdateServer, setShouldUpdateServer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);
  const hasLoadedDetails = useRef(false);
  const dataUser = useDataUser();
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ id: number; quantity: number } | null>(null);
  const [detailMetrics, setDetailMetrics] = useState<{ views?: number; currentAmount?: number } | null>(null);

  useEffect(() => {
    if (cartData?.goods) {
      const cartItem = cartData.goods.find(item => item.nomenclature_id === id);
      setLocalQuantity(cartItem?.quantity || 0);
    }
  }, [cartData, id]);

  useEffect(() => {
    if (priority) {
      if (!hasTrackedView.current) {
        hasTrackedView.current = true;
        trackView(id, position, page);
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView.current) {
          hasTrackedView.current = true;
          trackView(id, position, page);
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [id, position, page, trackView, priority]);

  useEffect(() => {
    if (!id || hasLoadedDetails.current) return;
    if (current_amount != null && (view_count != null || views_count != null || total_views != null)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        hasLoadedDetails.current = true;
        observer.disconnect();

        const location = getLocationParams();
        const detected = getDetectedCityCoords();
        const lat = location.lat ?? detected?.lat;
        const lon = location.lon ?? detected?.lon;
        const address = location.address;

        fetchProduct({
          product_id: id,
          lat,
          lon,
          address,
        })
          .then((data: any) => {
            if (!data) return;
            const views = data.view_count ?? data.views_count ?? data.total_views;
            const currentAmount = data.current_amount;
            if (views == null && currentAmount == null) return;
            setDetailMetrics({ views, currentAmount });
          })
          .catch(() => {});
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [id, current_amount, view_count, views_count, total_views]);

  useEffect(() => {
    if (dataUser && pendingAdd) {
      const { id, quantity } = pendingAdd;
      addToCartMutation.mutate({ nomenclature_id: id, quantity });
      setPendingAdd(null);
    }
  }, [dataUser, pendingAdd, addToCartMutation]);

  const updateServerQuantity = useCallback(async (targetQuantity: number) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const currentQuantity = cartData?.goods?.find(item => item.nomenclature_id === id)?.quantity || 0;
      const difference = targetQuantity - currentQuantity;
      if (difference > 0) {
        await addToCartMutation.mutateAsync({ nomenclature_id: id, quantity: difference });
      } else if (difference < 0) {
        await removeFromCartMutation.mutateAsync({ nomenclature_id: id });
      }
    } catch (error) {
      console.error("Ошибка обновления корзины:", error);
      const cartItem = cartData?.goods?.find(item => item.nomenclature_id === id);
      setLocalQuantity(cartItem?.quantity || 0);
    } finally {
      setIsUpdating(false);
      setShouldUpdateServer(false);
    }
  }, [id, cartData, addToCartMutation, removeFromCartMutation]);

  const scheduleUpdate = useCallback((qty: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateServerQuantity(qty), 800);
  }, [updateServerQuantity]);

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    const newQty = localQuantity + 1;
    setLocalQuantity(newQty);
    setShouldUpdateServer(true);
    scheduleUpdate(newQty);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id || localQuantity <= 0) return;
    const newQty = localQuantity - 1;
    setLocalQuantity(newQty);
    setShouldUpdateServer(true);
    scheduleUpdate(newQty);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dataUser) {
      setPendingAdd({ id, quantity: 1 });
      setIsAuthSheetOpen(true);
      return;
    }
    if (!id) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateServerQuantity(1), 800);
  };

  const handleCardClick = () => {
    trackClick(id, position, page);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const displayPrice = price != null ? `${price.toLocaleString('ru-RU')}₽` : "Цена не указана";
  const metricSales = sales_count ?? total_sold ?? 0;
  const metricViews = view_count ?? views_count ?? total_views ?? detailMetrics?.views;
  const metricRating = avg_rating ?? rating ?? 0;
  const metricCurrentAmount = current_amount ?? detailMetrics?.currentAmount;
  const previousPrice = previous_price ?? old_price;
  const hasPriceTrend =
    typeof previousPrice === "number" &&
    previousPrice > 0 &&
    typeof price === "number" &&
    price > 0 &&
    previousPrice !== price;
  const computedPriceChangePercent = hasPriceTrend
    ? ((price - previousPrice) / previousPrice) * 100
    : 0;
  const effectivePriceChangePercent =
    typeof price_change_percent === "number" && !Number.isNaN(price_change_percent)
      ? price_change_percent
      : computedPriceChangePercent;
  const isPriceUp = effectivePriceChangePercent > 0;
  const displayRating = metricRating > 0;
  const displayTotalSold = sales_count != null || total_sold != null;
  const displayViews = metricViews != null;
  const displayCurrentAmount = metricCurrentAmount != null;
  const transformedImageUrl = images?.[0] ? transformImageUrl(images[0]) : null;

  const locationParams = getLocationParamsString();
  const productUrl = `/product/${id}${locationParams}`;

  return (
    <div ref={cardRef}>
      <Link
        href={productUrl}
        className="group relative overflow-hidden h-72 rounded-lg border border-gray-100 shadow-sm hover:ring-2 ring-gray-200 flex items-end transition-all duration-300 hover:scale-[1.02]"
        onClick={handleCardClick}
        prefetch={priority} // PERF: prefetch product page for above-fold cards
      >
        <div className="absolute top-3 left-3 z-30">
          <FavoriteButton productId={id} size="md" isInitiallyActive={false} />
        </div>
        <div className="absolute inset-0">
          {transformedImageUrl ? (
            <Image
              src={transformedImageUrl}
              alt={name}
              fill
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={priority}
              placeholder="empty"
              onError={(e) => {
                if (images?.[0] && images[0] !== transformedImageUrl) {
                  (e.target as HTMLImageElement).src = images[0];
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gray-300" />
                <p className="text-sm">Нет изображения</p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="flex flex-col p-3 relative z-20 mt-auto flex-1 w-full">
          <div>
            <p className="tracking-tight inline font-medium leading-4 text-white line-clamp-2">
              {name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
              {displayTotalSold && <span>{metricSales} прод.</span>}
              {displayViews ? (
                <span>{metricViews} просмотров</span>
              ) : (
                <span>просмотры —</span>
              )}
              {displayCurrentAmount ? (
                <span>в наличии {metricCurrentAmount}</span>
              ) : (
                <span>в наличии —</span>
              )}
            </div>
            <span className="text-gray-300 text-sm block">{category_name}</span>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-lg text-white">{displayPrice}</span>
                {hasPriceTrend && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${
                      isPriceUp ? "text-red-200" : "text-emerald-200"
                    }`}
                  >
                    {isPriceUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(effectivePriceChangePercent).toFixed(1)}%
                  </span>
                )}
              </div>
              {displayRating && (
                <span className="flex text-xs font-medium text-white justify-center items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 inline mr-1" />
                  {metricRating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {localQuantity > 0 ? (
                <div className="flex items-center justify-between w-full bg-white/90 rounded-md overflow-hidden h-9">
                  <Button
                    onClick={handleDecrease}
                    className="flex-1 bg-transparent hover:bg-gray-100 text-gray-800 border-0 rounded-none cursor-pointer transition-colors duration-200"
                    size="sm"
                    disabled={isUpdating}
                  >
                    <Minus width={16} height={16} />
                  </Button>
                  <div className="flex items-center justify-center min-w-[60px]">
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    ) : (
                      <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                        <ShoppingCart width={14} height={14} />
                        {localQuantity}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleIncrease}
                    className="flex-1 bg-transparent hover:bg-gray-100 text-gray-800 border-0 rounded-none cursor-pointer transition-colors duration-200"
                    size="sm"
                    disabled={isUpdating}
                  >
                    <Plus width={16} height={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-white/90 hover:bg-white text-gray-800 border-0 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart width={16} height={16} />
                  )}
                  <span className="ml-2">{isUpdating ? "" : "В корзину"}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {shouldUpdateServer && !isUpdating && (
          <div className="absolute bottom-1 right-1">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        )}
      </Link>

      <PhoneAuthSheet
        isOpen={isAuthSheetOpen}
        onClose={() => setIsAuthSheetOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};