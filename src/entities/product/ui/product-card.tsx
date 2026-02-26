"use client";

import { ShoppingCart, Star, Plus, Minus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

import { FavoriteButton } from "@/shared/ui/kit/favorite-button";
import { useAddToCart, useRemoveFromCart, useCart } from "@/entities/cart/model/hooks";
import { transformImageUrl } from "@/shared/lib/image-utils";
import { Product } from "../model/types";
import { useTrackEvent } from "@/entities/statistics/model/hooks";
import { Button } from "@/shared/ui/kit/button";
import { useDataUser } from "@/shared/hooks/useDataUser";
import { toast } from "sonner";
import { getLocationParamsString } from "@/shared/lib/city-utils";
import { PhoneAuthSheet } from "@/feature/auth/phone-auth-sheet";

type ProductCardProps = Product & {
  position?: number;
  page?: number;
  isRecommendation?: boolean;
};

export const ProductCard = ({
  id,
  name,
  price,
  category_name,
  images,
  seller_name,
  total_sold,
  rating,
  position,
  page,
  isRecommendation = false,
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
  const dataUser = useDataUser();
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ id: number; quantity: number } | null>(null);


  useEffect(() => {
    if (cartData?.goods) {
      const cartItem = cartData.goods.find(item => item.nomenclature_id === id);
      setLocalQuantity(cartItem?.quantity || 0);
    }
  }, [cartData, id]);

  useEffect(() => {
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
  }, [id, position, page, trackView]);

    useEffect(() => {
      if (dataUser && pendingAdd) {
        const { id, quantity } = pendingAdd;
        addToCartMutation.mutate({ nomenclature_id: id, quantity });
        setPendingAdd(null);
      }
    }, [dataUser, pendingAdd, addToCartMutation]);

  const updateServerQuantity = async (targetQuantity: number) => {
    if (!id) return;
    setIsUpdating(true);
   
    try {
      const currentQuantity = cartData?.goods?.find(item => item.nomenclature_id === id)?.quantity || 0;
      const difference = targetQuantity - currentQuantity;
      if (difference > 0) {
        await addToCartMutation.mutateAsync({
          nomenclature_id: id,
          quantity: difference,
        });
      } else if (difference < 0) {
        await removeFromCartMutation.mutateAsync({
          nomenclature_id: id,
        });
      }
    } catch (error) {
      console.error("Ошибка обновления корзины:", error);
      const cartItem = cartData?.goods?.find(item => item.nomenclature_id === id);
      setLocalQuantity(cartItem?.quantity || 0);
    } finally {
      setIsUpdating(false);
      setShouldUpdateServer(false);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
   
    if (!id) return;
   
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setShouldUpdateServer(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
   
    timerRef.current = setTimeout(() => {
      updateServerQuantity(newQuantity);
    }, 1000);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
   
    if (!id || localQuantity <= 0) return;
   
    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setShouldUpdateServer(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      updateServerQuantity(newQuantity);
    }, 1000);
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
   
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
   
    timerRef.current = setTimeout(() => {
      updateServerQuantity(1);
    }, 1000);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    trackClick(id, position, page);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const displayPrice = price != null ? `${price.toLocaleString('ru-RU')}₽` : "Цена не указана";
  const displayRating = rating != null && rating > 0;
  const displayTotalSold = total_sold != null && total_sold > 0;
  const displaySeller = seller_name != null && seller_name.trim() !== "";
  const transformedImageUrl = images?.[0] ? transformImageUrl(images[0]) : null;

  const locationParams = getLocationParamsString();
  const productUrl = `/product/${id}${locationParams}`;

  return (
    <div ref={cardRef}>
      <Link
        href={productUrl}
        className="group relative overflow-hidden h-72 rounded-lg border border-gray-100 shadow-sm hover:ring-2 ring-gray-200 flex items-end transition-all duration-300 hover:scale-[1.02]"
        onClick={handleCardClick}
      >
        <div className="absolute top-3 left-3 z-30">
          <FavoriteButton
            productId={id}
            size="md"
            isInitiallyActive={false}
          />
        </div>
        <div className="absolute inset-0">
          {transformedImageUrl ? (
            <Image
              src={transformedImageUrl}
              alt={name}
              fill
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
          <div className="">
            <div>
              <p className="tracking-tight inline font-medium leading-4 text-white line-clamp-2">
                {name}
              </p>
              {displayTotalSold && (
                <span className="text-xs text-gray-300 ml-1 inline-block">
                  • {total_sold} прод.
                </span>
              )}
             
              <span className="text-gray-300 text-sm block">{category_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg text-white">{displayPrice}</span>
              {displayRating && (
                <span className="flex text-xs font-medium text-white justify-center items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 inline mr-1" />
                  {rating?.toFixed(1)}
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
                  <span className="ml-2">
                    {isUpdating ? "" : "В корзину"}
                  </span>
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