"use client";

import { Heart, Minus, Plus, Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAddToCart } from "@/entities/cart/model/hooks";
import { fetchProduct } from "@/entities/product/api";

import QuickBuyModal from "@/widgets/quickbuymodal/quickbuymodal";

import { useDataUser } from "@/shared/hooks/useDataUser";
import { Button } from "@/shared/ui/kit/button";
import { FavoriteButton } from "@/shared/ui/kit/favorite-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/kit/input-group";
import { PhoneAuthSheet } from "@/feature/auth/phone-auth-sheet";
import { Separator } from "@/shared/ui/kit/separator";

type Props = {
  productId: number;
  quantity?: number;
  unitName: string;
  initialPrice?: number;
  initialName?: string;
  initialImages?: string[];
};

export const AddToCart = ({
  productId,
  unitName = "шт.",
  initialPrice = 0,
  initialName = "",
  initialImages,
}: Props) => {
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productData, setProductData] = useState<{
    price: number;
    name: string;
    images?: string[];
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const addToCartMutation = useAddToCart();
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const dataUser = useDataUser();
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ id: number; quantity: number } | null>(null);

  // Получаем координаты из URL или sessionStorage
  const latFromUrl = searchParams.get("lat")
    ? Number(searchParams.get("lat"))
    : undefined;
  const lonFromUrl = searchParams.get("lon")
    ? Number(searchParams.get("lon"))
    : undefined;
  const addressFromUrl = searchParams.get("address") || undefined;
  const cityFromUrl = searchParams.get("city") || undefined;

  // Получаем координаты из sessionStorage, если их нет в URL
  const [detectedCoords, setDetectedCoords] = useState<{
    lat?: number;
    lon?: number;
  } | null>(null);

   useEffect(() => {
    if (dataUser && pendingAdd) {
      addToCartMutation.mutate(
        { nomenclature_id: pendingAdd.id, quantity: pendingAdd.quantity },
        {
          onSuccess: () => {
            setSuccessMessage(`Товар добавлен в корзину!`);
          },
          onError: (error) => {
            setErrorMessage("Не удалось добавить товар.");
          },
        }
      );
      setPendingAdd(null);
    }
  }, [dataUser, pendingAdd, addToCartMutation]);

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
        // Игнорируем ошибки
      }
    }

    // Слушаем обновления detected_city
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
        // Игнорируем ошибки
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

  // Используем координаты из URL или из sessionStorage
  const lat = latFromUrl ?? detectedCoords?.lat;
  const lon = lonFromUrl ?? detectedCoords?.lon;

  const formatPrice = (price: number) => {
    return `${price?.toLocaleString("ru-RU")}₽/${unitName === null ? "шт." : unitName}`;
  };

  const loadProductDetails = React.useCallback(async () => {
    setIsLoadingProduct(true);
    try {
      const product = await fetchProduct({
        product_id: productId,
        lat,
        lon,
        address: addressFromUrl,
        city: cityFromUrl,
      });
      setProductData({
        price: product.price,
        name: product.name,
        images: product.images || [],
      });
    } catch (error) {
      console.error("Ошибка при загрузке товара:", error);
      setProductData({
        price: initialPrice,
        name: initialName,
        images: initialImages,
      });
    } finally {
      setIsLoadingProduct(false);
    }
  }, [
    productId,
    lat,
    lon,
    addressFromUrl,
    cityFromUrl,
    initialPrice,
    initialName,
    initialImages,
  ]);

  // Автоматически загружаем товар при изменении координат
  useEffect(() => {
    if (lat != null && lon != null && !productData) {
      loadProductDetails();
    }
  }, [lat, lon, productData, loadProductDetails]);

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleAddToCart = async () => {
     if (!dataUser) {
      setPendingAdd({ id: productId, quantity });
      setIsAuthSheetOpen(true);
      return;
    }
    clearMessages();

    if (!productData) {
      await loadProductDetails();
    }

    if (!productId) {
      console.error("ID товара отсутствует");
      setErrorMessage("ID товара отсутствует");
      return;
    }

    addToCartMutation.mutate(
      {
        nomenclature_id: productId,
        quantity: quantity,
      },
      {
        onSuccess: () => {
          setSuccessMessage(
            `Товар "${productData?.name || initialName}" добавлен в корзину!`,
          );

          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        },
        onError: (error) => {
          console.error("Ошибка при добавлении в корзину:", error);
          setErrorMessage(
            "Не удалось добавить товар в корзину. Попробуйте еще раз.",
          );
        },
      },
    );
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
    clearMessages();
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      clearMessages();
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
      clearMessages();
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
      }
      toast.success("Ссылка скопирована в буфер обмена");
    } catch (err) {
      toast.error("Не удалось скопировать ссылку");
      console.error("Не удалось скопировать ссылку:", err);
    }
  };

  const price = productData?.price || initialPrice;
  const name = productData?.name || initialName;
  const totalPrice = price * quantity;

  const isLoading = isLoadingProduct || addToCartMutation.isPending;

  return (
    <div className="xl:max-w-full min-w-[280px] mx-auto max-w-lg w-full border border-gray-200 rounded-lg p-4 h-fit">
      <p className="font-medium tracking-tight">Оформить заказ</p>

      {successMessage && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600 text-center">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 text-center">{errorMessage}</p>
        </div>
      )}

      <div className="flex pt-1 justify-between items-center gap-2">
        <div className="max-w-32">
          <p className="text-sm text-gray-500 inline-block">Количество:</p>{" "}
          <InputGroup>
            <InputGroupAddon
              className="pr-3 cursor-pointer hover:bg-gray-50"
              onClick={handleDecrement}
              aria-disabled={isLoading}
            >
              <Minus className={isLoading ? "text-gray-300" : ""} />
            </InputGroupAddon>
            <InputGroupInput
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="text-center border border-gray-200 w-12"
              min="1"
              type="number"
              aria-disabled={isLoading}
            />
            <InputGroupAddon
              align="inline-end"
              className="pl-3 cursor-pointer hover:bg-gray-50"
              onClick={handleIncrement}
              aria-disabled={isLoading}
            >
              <Plus
                className={`${isLoading ? "text-gray-300" : "text-blue-500"}`}
              />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Всего:</p>
        <span className="text-lg font-medium">{formatPrice(price)}</span>
      </div>
      <div className="pt-4 flex flex-col gap-2">
        <Button
          className="bg-blue-500 text-white w-full hover:bg-blue-600 cursor-pointer"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Загрузка...
            </>
          ) : (
            <>
              <Plus />В корзину
            </>
          )}
        </Button>
        <Button
          className="text-blue-500 w-full cursor-pointer"
          variant="outline"
          disabled={isLoading}
          onClick={() => setIsQuickBuyOpen(true)}
        >
          Купить в 1 клик
        </Button>
      </div>
      <div className="flex pt-4 justify-between items-center">
        <FavoriteButton
          productId={productId}
          showText={true}
          className="text-sm text-gray-600 hover:text-blue-500"
        />

        <button
          className="text-sm text-gray-600 flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer"
          onClick={handleShare}
          disabled={isLoading}
        >
          <Share2 width={16} height={16} className="stroke-gray-600" />
          Поделиться
        </button>
      </div>
      {isQuickBuyOpen && (
        <QuickBuyModal
          productId={productId}
          quantity={quantity}
          productName={name}
          productPrice={price}
          unitName={unitName}
          isOpen={isQuickBuyOpen}
          onClose={() => setIsQuickBuyOpen(false)}
        />
      )}
      <PhoneAuthSheet
        isOpen={isAuthSheetOpen}
        onClose={() => setIsAuthSheetOpen(false)}
      />
    </div>
  );
};
