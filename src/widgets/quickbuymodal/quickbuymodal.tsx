"use client";

import { LockIcon, Loader2, Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Textarea } from "@/shared/ui/kit/textarea";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { useDataUser } from "@/shared/hooks/useDataUser";

interface QuickBuyModalProps {
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  unitName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const QuickBuyModal = ({
  productId,
  quantity,
  productName,
  productPrice,
  unitName = "шт.",
  isOpen,
  onClose,
}: QuickBuyModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    quantity: 1,
    address: "",
    note: "",
    isAnotherPerson: false,
    recipientName: "",
    recipientPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const userDataAuth = useDataUser();
  const searchParams = useSearchParams();

  const handleDecreaseQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity - 1)
    }));
  };

  const handleIncreaseQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantity: prev.quantity + 1
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setFormData(prev => ({ ...prev, quantity: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.setItem("user_delivery_data", JSON.stringify(formData));

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 1500);
  };
  
  useEffect(() => {
    const addressFromUrl = searchParams.get("address");
    const cityFromUrl = searchParams.get("city");
    const hasUrlParams = addressFromUrl || cityFromUrl;
    
    let addressFromStorage = "";
    if (hasUrlParams && typeof window !== 'undefined') {
      try {
        const locationRaw = localStorage.getItem("bystroi_location");
        if (locationRaw) {
          const locationStored = JSON.parse(locationRaw) as { address?: string };
          addressFromStorage = locationStored.address || "";
        }
      } catch (error) {
        console.error("Error reading localStorage:", error);
      }
    }
    
    let ipDetectedAddress = "";
    if (!hasUrlParams && typeof window !== 'undefined') {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.city) {
            ipDetectedAddress = parsed.city;
          }
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    }

    if (userDataAuth) {
      setFormData(prev => ({
        ...prev,
        name: userDataAuth!.name,
        phone: userDataAuth!.contragent_phone,
        address: addressFromUrl || cityFromUrl || addressFromStorage || ipDetectedAddress || userDataAuth!.address || "",
      }));
    } else {
      const savedData = localStorage.getItem("user_delivery_data");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            name: parsedData!.name,
            phone: parsedData!.contragent_phone,
            address: addressFromUrl || cityFromUrl || addressFromStorage || ipDetectedAddress || parsedData!.address || "",
          }));
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
        }
      } else {
        setFormData(prev => ({
          ...prev,
          address: addressFromUrl || cityFromUrl || addressFromStorage || ipDetectedAddress || "",
        }));
      }
    }
  }, [searchParams, userDataAuth]);

  const totalPrice = productPrice * formData.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[85vh] overflow-y-auto p-1 sm:p-4 overflow-x-hidden">
        <DialogHeader className="px-0">
          <DialogTitle className="text-base sm:text-lg">Купить в 1 клик</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="text-green-500 text-4xl mb-3">✓</div>
            <h3 className="text-lg font-semibold mb-2">Заявка принята!</h3>
          </div>
        ) : (
          <>
            <div className="border rounded-lg p-3 mb-3">
              <p className="font-medium truncate text-sm mb-3">{productName}</p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="quantity" className="text-sm whitespace-nowrap text-gray-600">
                      Количество:
                    </Label>
                    
                  </div>

                  <div className="flex items-center w-full">
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
                      className="flex-1 h-10 sm:h-8 text-center rounded-none border-x-0 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                
                <div className="flex flex-col mt-2 sm:mt-0">
                  <div className="flex flex-col text-center mt-0 sm:mt-6 sm:flex-row items-center gap-1">
                    <span className="text-lg text-center sm:text-xl text-black-600">
                      {totalPrice.toLocaleString('ru-RU')}₽
                    </span>
                    <span className="text-xs text-center text-gray-500">
                      {productPrice.toLocaleString('ru-RU')}₽/<span className="text-sm text-gray-500">{unitName}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="name" className="text-sm">Имя *</Label>
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
                  <Label htmlFor="phone" className="text-sm">Номер телефона *</Label>
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
                  <Label htmlFor="address" className="text-sm">Адрес доставки *</Label>
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="note" className="text-sm">Примечание к заказу</Label>
                  <Textarea
                    id="note"
                    rows={2}
                    placeholder="Дополнительные пожелания"
                    value={formData.note}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm min-h-[80px]"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAnotherPerson"
                  checked={formData.isAnotherPerson}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, isAnotherPerson: !!checked }));
                  }}
                  disabled={isLoading}
                  className="cursor-pointer h-4 w-4"
                />
                <Label htmlFor="isAnotherPerson" className="cursor-pointer text-sm">
                  Заказ оформляется для другого человека
                </Label>
              </div>
              
              {formData.isAnotherPerson && (
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="recipientName" className="text-sm">Имя получателя *</Label>
                    <Input
                      id="recipientName"
                      type="text"
                      required
                      placeholder="Петр"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="recipientPhone" className="text-sm">Номер телефона получателя *</Label>
                    <Input
                      id="recipientPhone"
                      type="tel"
                      required
                      placeholder="+7 999 765 43 21"
                      value={formData.recipientPhone}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}
              
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
                  `Купить за ${totalPrice.toLocaleString('ru-RU')}₽`
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