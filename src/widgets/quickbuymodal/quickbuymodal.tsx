"use client";

import { CheckCircle2, LockIcon, Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { sendYandexGoal } from "@/shared/lib/analytics";
import { useDataUser } from "@/shared/hooks/useDataUser";
import { useCreateOrder } from "@/shared/hooks/useOrders";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";

interface QuickBuyModalProps {
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  unitName?: string;
  warehouseId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const QuickBuyModal = ({
  productId,
  quantity: initialQuantity,
  productName,
  productPrice,
  unitName = "шт.",
  warehouseId,
  isOpen,
  onClose,
}: QuickBuyModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    quantity: initialQuantity,
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const userDataAuth = useDataUser();
  const createOrderMutation = useCreateOrder();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsPrefilling(true);
    setIsSuccess(false);

    let savedData: { name?: string; phone?: string; address?: string } = {};

    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("user_delivery_data");
        if (raw) {
          savedData = JSON.parse(raw);
        }

        const locationRaw = localStorage.getItem("bystroi_location");
        if (locationRaw) {
          const locationStored = JSON.parse(locationRaw) as { address?: string };
          savedData.address = savedData.address || locationStored.address || "";
        }
      }
    } catch (error) {
      // ignore prefill errors
    }

    setFormData({
      name: userDataAuth?.name || savedData.name || "",
      phone: userDataAuth?.contragent_phone || savedData.phone || "",
      address: userDataAuth?.address || savedData.address || "",
      quantity: initialQuantity,
    });

    setIsPrefilling(false);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [initialQuantity, isOpen, userDataAuth]);

  const handleDecreaseQuantity = () => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity - 1),
    }));
  };

  const handleIncreaseQuantity = () => {
    setFormData((prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(value) && value >= 1 && value <= 99) {
      setFormData((prev) => ({ ...prev, quantity: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = (userDataAuth?.contragent_phone || formData.phone || "").trim();
    const address = formData.address.trim();

    if (!name) {
      toast.error("Введите имя");
      return;
    }

    if (!phone) {
      toast.error("Введите номер телефона");
      return;
    }

    if (!address) {
      toast.error("Введите адрес доставки");
      return;
    }

    try {
      localStorage.setItem(
        "user_delivery_data",
        JSON.stringify({
          name,
          phone,
          address,
        }),
      );
    } catch (error) {
      // ignore storage errors
    }

    const goods = [
      {
        nomenclature_id: productId,
        quantity: formData.quantity,
        ...(warehouseId && { warehouse_id: warehouseId }),
        is_from_cart: false,
      },
    ];

    const delivery = {
      address,
      recipient: {
        name,
        surname: "",
        phone,
      },
    };

    createOrderMutation.mutate(
      {
        goods,
        delivery,
        contragent_phone: phone,
        additional_data: [],
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          sendYandexGoal("quick_buy_success", {
            product_id: productId,
            product_name: productName,
            quantity: formData.quantity,
            price: productPrice,
          });
          toast.success("Заказ оформлен!");
          closeTimerRef.current = setTimeout(() => {
            onClose();
            router.push("/thank-you?source=quick-buy");
          }, 2200);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || "Не удалось оформить заказ");
        },
      },
    );
  };

  const totalPrice = productPrice * formData.quantity;
  const isLoading = isPrefilling || createOrderMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[85vh] overflow-y-auto p-1 sm:p-4 overflow-x-hidden">
        <DialogHeader className="px-0">
          <DialogTitle className="text-base sm:text-lg">Купить в 1 клик</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Заявка принята</h3>
            <p className="text-sm text-gray-500">Мы свяжемся с вами для подтверждения заказа</p>
            <Button type="button" variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg p-3 mb-3">
              <p className="font-medium truncate text-sm mb-3">{productName}</p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:w-40">
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="quantity" className="text-sm whitespace-nowrap text-gray-600">
                      Количество:
                    </Label>
                  </div>

                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleDecreaseQuantity}
                      className="h-10 w-10 sm:h-8 sm:w-8 cursor-pointer rounded-none rounded-l-md border-gray-300 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      <Minus width={16} height={16} />
                    </Button>

                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      max="99"
                      value={formData.quantity}
                      onChange={handleQuantityInputChange}
                      className="h-10 sm:h-8 text-center rounded-none border-x-0 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      disabled={isLoading}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleIncreaseQuantity}
                      className="h-10 w-10 sm:h-8 sm:w-8 cursor-pointer rounded-none rounded-r-md border-gray-300 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      <Plus width={16} height={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                  <span className="text-lg sm:text-xl text-black-600">
                    {totalPrice.toLocaleString("ru-RU")}₽
                  </span>
                  <span className="text-xs text-gray-500">
                    {productPrice.toLocaleString("ru-RU")}₽/<span className="text-sm text-gray-500">{unitName}</span>
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="name" className="text-sm">
                    Имя *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="Иван"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone" className="text-sm">
                    Номер телефона *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+7 999 123 45 67"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="address" className="text-sm">
                    Адрес доставки *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    required
                    placeholder="ул. Пушкина, д. Колотушкина"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Оформление...
                  </>
                ) : (
                  `Купить за ${totalPrice.toLocaleString("ru-RU")}₽`
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">
                  Стоимость доставки и налоги рассчитываются при оформлении заказа.
                </p>
                <div className="flex items-center justify-center gap-1">
                  <LockIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">Ваши данные защищены</span>
                </div>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBuyModal;