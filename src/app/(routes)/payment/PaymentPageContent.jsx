"use client";
import { LockIcon, X, CheckCircle, AlertCircle, LocateIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCart } from "@/entities/cart/model/hooks";
import { useCartItems } from "@/entities/cart/model/hooks";
import { useCreateOrder } from "@/shared/hooks/useOrders";
import { CartItem } from "@/entities/cart/ui/cart-item";
import { useContragentPhone } from "@/shared/hooks/useContragentPhone";
import { Button } from "@/shared/ui/kit/button";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Separator } from "@/shared/ui/kit/separator";
import { Textarea } from "@/shared/ui/kit/textarea";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useDataUser } from "@/shared/hooks/useDataUser";
import { Suspense } from "react";

interface UserData {
  name: string;
  phone: string;
  address?: string;
}

const DEFAULT_COORDINATES = {
  lat: 55.7558,
  lon: 37.6173,
};

interface OrderModalData {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
  orderDetails?: {
    userData: {
      name: string;
      phone: string;
      address: string;
      coordinates?: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
  };
  error?: string;
}

function PaymentContent() {
  const contragentPhone = useContragentPhone();
  const { data: cart, isLoading: isCartLoading, error: cartError } = useCart();
  const { 
    items, 
    isLoading: areItemsLoading, 
    hasError, 
    totalPrice 
  } = useCartItems(cart?.goods || []);
  const createOrderMutation = useCreateOrder();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    isAnotherPerson: false,
    recipientName: "",
    recipientPhone: "",
  });
  
  // ПРОСТОЙ ПОДХОД: Отдельное состояние для адреса, которое управляется только из URL/sessionStorage
  const [addressValue, setAddressValue] = useState<string>('');
  const addressSourceRef = useRef<'url' | 'ip' | 'manual' | null>(null); // Отслеживаем источник адреса

  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [orderModal, setOrderModal] = useState<OrderModalData>({
    isOpen: false,
    isSuccess: false,
    title: "",
    message: "",
  });
  const userDataAuth = useDataUser();
  const searchParams = useSearchParams();
  const addressManuallyEntered = useRef(false); // Флаг, что адрес был введен пользователем вручную
  const isFormInitialized = useRef(false); // Флаг, что форма была инициализирована
  const isUpdatingFromUrl = useRef(false); // Флаг, что адрес обновляется программно из URL

  

  const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'ru-RU',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Ошибка при получении адреса');
      }
      
      const data = await response.json();
      
      if (data.address) {
        const addressComponents = [];
        
        if (data.address.road) addressComponents.push(`ул. ${data.address.road}`);
        if (data.address.house_number) addressComponents.push(`д. ${data.address.house_number}`);
        if (data.address.city) addressComponents.push(data.address.city);
        if (data.address.country) addressComponents.push(data.address.country);
        
        return addressComponents.join(', ') || 'Адрес не найден';
      }
      
      return 'Адрес не найден';
    } catch (error) {
      console.error('Ошибка при получении адреса:', error);
      return 'Не удалось определить адрес';
    }
  };

  const handleGeolocationClick = async () => {
    setIsGeolocationLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (position.coords.accuracy && position.coords.accuracy > 200) {
          setGeoError("Геолокация неточная. Введите адрес вручную.");
          setIsGeolocationLoading(false);
          return;
        }
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        
        setCoordinates(coords);
        
        try {
          const address = await getAddressFromCoordinates(coords.lat, coords.lon);
          
          // Помечаем, что адрес был введен пользователем (через геолокацию)
          addressManuallyEntered.current = true;
          
          // ВАЖНО: НЕ обновляем formData.address напрямую здесь
          // Адрес обновится автоматически через useEffect, когда URL изменится
          // setFormData(prev => ({
          //   ...prev,
          //   address: address,
          // }));
          // ВАЖНО: НЕ обновляем userDataAuth.address, чтобы не вызывать пересчет
          // if (userDataAuth) {
          //   userDataAuth.address = address;
          // }
          
          // Сохраняем адрес в localStorage и обновляем URL
          try {
            const storageKey = 'bystroi_location';
            const existing = localStorage.getItem(storageKey);
            const parsed = existing ? JSON.parse(existing) as { 
              address?: string; 
              city?: string; 
              lat?: number; 
              lon?: number;
              manual?: boolean;
            } : {};
            
            localStorage.setItem(storageKey, JSON.stringify({
              ...parsed,
              address: address,
              city: undefined,
              lat: coords.lat,
              lon: coords.lon,
              manual: true, // Геолокация тоже считается вручную введенным адресом
            }));
            
            // Обновляем URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('address', address);
            newParams.set('lat', String(coords.lat));
            newParams.set('lon', String(coords.lon));
            newParams.delete('city');
            const newUrl = `${window.location.pathname}?${newParams.toString()}`;
            router.push(newUrl, { scroll: false });
          } catch (error) {
            console.error("Error saving geolocation address:", error);
          }
        } catch (error) {
          console.error("Ошибка при получении адреса:", error);
          setGeoError("Не удалось определить адрес. Введите вручную.");
        } finally {
          setIsGeolocationLoading(false);
        }
      },
      (error) => {
        console.error("Ошибка геолокации:", error);
        setIsGeolocationLoading(false);
        
        let errorMessage = "Не удалось получить местоположение";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Доступ к геолокации запрещен. Разрешите доступ в настройках браузера";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Информация о местоположении недоступна";
            break;
          case error.TIMEOUT:
            errorMessage = "Время запроса геолокации истекло";
            break;
        }
        setGeoError(errorMessage);
        
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  //Вычисляем адрес напрямую из URL или sessionStorage
  // НЕ используем formData.address для адреса, используем отдельное состояние
  // Вычисляем адрес для формы на основе URL параметров
  useEffect(() => {
    const addressFromUrl = searchParams.get("address");
    const cityFromUrl = searchParams.get("city");
    const hasUrlParams = addressFromUrl || cityFromUrl;
    
    // ВАЖНО: Если параметров нет в URL - удаляем localStorage ПЕРЕД чтением адреса
    if (!hasUrlParams && typeof window !== 'undefined') {
      try {
        // Удаляем localStorage СРАЗУ, чтобы другие компоненты не могли его прочитать
        localStorage.removeItem('bystroi_location');
        if (userDataAuth?.address) {
          userDataAuth.address = '';
        }
      } catch (e) {
        // Игнорируем ошибки
      }
    }
    
    let newAddress: string;
    let source: 'url' | 'ip' | 'manual';
    if (hasUrlParams) {
      // Если есть параметры в URL - используем их
      addressManuallyEntered.current = true;
      newAddress = addressFromUrl || cityFromUrl || '';
      source = 'url';
    } else {
      // Если параметров нет в URL - используем ТОЛЬКО IP-определенный город
      addressManuallyEntered.current = false;
      if (typeof window !== 'undefined') {
        try {
          const detected = sessionStorage.getItem('detected_city');
          if (detected) {
            const parsed = JSON.parse(detected);
            if (parsed.city) {
              newAddress = parsed.city;
              source = 'ip';
            } else {
              newAddress = '';
              source = 'ip';
            }
          } else {
            newAddress = '';
            source = 'ip';
          }
        } catch (e) {
          newAddress = '';
          source = 'ip';
        }
      } else {
        newAddress = '';
        source = 'ip';
      }
    }
    
    // ВСЕГДА обновляем адрес СИНХРОННО, без задержки
    // Это гарантирует, что адрес установится до того, как другие эффекты смогут его перезаписать
    addressSourceRef.current = source;
    setAddressValue(newAddress);
    setFormData(prev => ({
      ...prev,
      address: newAddress,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // ТОЛЬКО searchParams
  
  // Инициализация формы (имя и телефон) - только один раз
  // ВАЖНО: НЕ обновляем адрес здесь, адрес управляется отдельно через addressForForm
  useEffect(() => {
    if (isFormInitialized.current) {
      return;
    }
    
    if (userDataAuth) {
      setFormData(prev => ({
        ...prev,
        name: userDataAuth!.name,
        phone: userDataAuth!.contragent_phone,
        // ВАЖНО: НЕ обновляем address здесь, он управляется через addressForForm
      }));
    } else {
      const savedData = localStorage.getItem('user_delivery_data');
      let userData: UserData = { name: "", phone: "", address: "" };
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          userData = {
            name: parsedData.name || "",
            phone: parsedData.phone || "",
            address: "", // НЕ используем адрес из user_delivery_data
          };
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
      setFormData(prev => ({
        ...prev,
        name: userData.name,
        phone: userData.phone,
        // ВАЖНО: НЕ обновляем address здесь, он управляется через addressForForm
      }));
    }
    
    isFormInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDataAuth]); // Инициализируем только один раз
  
  // ЗАЩИТА: Если адрес был установлен из IP или URL, не позволяем другим эффектам его перезаписать
  useEffect(() => {
    // Если адрес был установлен из IP или URL, но formData.address отличается - синхронизируем
    if (addressSourceRef.current === 'ip' || addressSourceRef.current === 'url') {
      if (formData.address !== addressValue) {
        setFormData(prev => ({
          ...prev,
          address: addressValue,
        }));
      }
    }
  }, [addressValue, formData.address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    if (id === 'address') {
      // Для адреса обновляем отдельное состояние
      setAddressValue(value);
    }
    
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Если пользователь вручную вводит адрес - сохраняем его в bystroi_location с флагом manual: true и обновляем URL
    if (id === 'address' && typeof window !== 'undefined') {
      const addressValue = value.trim();
      
      // Помечаем, что адрес был введен пользователем вручную
      if (addressValue) {
        addressManuallyEntered.current = true;
      } else {
        addressManuallyEntered.current = false;
      }
      
      try {
        const storageKey = 'bystroi_location';
        const existing = localStorage.getItem(storageKey);
        const parsed = existing ? JSON.parse(existing) as { 
          address?: string; 
          city?: string; 
          lat?: number; 
          lon?: number;
          manual?: boolean;
        } : {};
        
        if (addressValue) {
          // Сохраняем вручную введенный адрес ТОЛЬКО если пользователь действительно ввел его вручную
          // (не из IP-определенного города)
          const isIpDetectedCity = (() => {
            try {
              const detected = sessionStorage.getItem('detected_city');
              if (detected) {
                const parsed = JSON.parse(detected);
                return parsed.city === addressValue;
              }
            } catch (e) {
              // Игнорируем ошибки
            }
            return false;
          })();
          
          // Обновляем URL с параметрами адреса ПЕРВЫМ, чтобы параметры появились в URL
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.set('address', addressValue);
          newParams.delete('city'); // Удаляем город, если введен конкретный адрес
          if (coordinates) {
            newParams.set('lat', String(coordinates.lat));
            newParams.set('lon', String(coordinates.lon));
          } else if (parsed.lat != null && parsed.lon != null) {
            newParams.set('lat', String(parsed.lat));
            newParams.set('lon', String(parsed.lon));
          }
          const newUrl = `${window.location.pathname}?${newParams.toString()}`;
          router.push(newUrl, { scroll: false });
          
          // Сохраняем в localStorage ТОЛЬКО после обновления URL (когда параметры уже есть в URL)
          // И только если это не IP-определенный город
          if (!isIpDetectedCity) {
            localStorage.setItem(storageKey, JSON.stringify({
              ...parsed,
              address: addressValue,
              city: undefined, // Очищаем город, если введен конкретный адрес
              manual: true, // Флаг, что адрес введен вручную
            }));
          }
        } else {
          // Если адрес пустой, удаляем его из URL и localStorage
          localStorage.removeItem(storageKey);
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.delete('address');
          const newUrl = `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
          router.push(newUrl, { scroll: false });
        }
      } catch (error) {
        console.error("Error saving address to localStorage:", error);
      }
    }
  };

  const closeModal = () => {
    setOrderModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("user_delivery_data", JSON.stringify(formData));
    
    // Сохраняем вручную введенный адрес в bystroi_location с флагом manual: true
    if (formData.address && formData.address.trim() && typeof window !== 'undefined') {
      try {
        const storageKey = 'bystroi_location';
        const existing = localStorage.getItem(storageKey);
        const parsed = existing ? JSON.parse(existing) as { 
          address?: string; 
          city?: string; 
          lat?: number; 
          lon?: number;
          manual?: boolean;
        } : {};
        
        // Сохраняем адрес из формы как вручную введенный
        localStorage.setItem(storageKey, JSON.stringify({
          ...parsed,
          address: formData.address.trim(),
          city: undefined, // Очищаем город, если введен конкретный адрес
          lat: coordinates?.lat || parsed.lat,
          lon: coordinates?.lon || parsed.lon,
          manual: true, // Флаг, что адрес введен вручную
        }));
      } catch (error) {
        console.error("Error saving address to localStorage:", error);
      }
    }
    
    if (!cart || items.length === 0) {
      setOrderModal({
        isOpen: true,
        isSuccess: false,
        title: "Ошибка оформления",
        message: "Не удалось оформить заказ",
        error: "Корзина пуста",
      });
      return;
    }

    if (!formData.name || !formData.phone) {
      setOrderModal({
        isOpen: true,
        isSuccess: false,
        title: "Ошибка оформления",
        message: "Не удалось оформить заказ",
        error: "Заполните обязательные поля: имя и телефон",
      });
      return;
    }

    let finalLat: number | undefined;
    let finalLon: number | undefined;

    if (coordinates) {
      finalLat = coordinates.lat;
      finalLon = coordinates.lon;
    } else {
      finalLat = DEFAULT_COORDINATES.lat;
      finalLon = DEFAULT_COORDINATES.lon;
    }

    const orderData = {
      goods: cart.goods.map(good => ({
        nomenclature_id: good.nomenclature_id,
        warehouse_id: good.warehouse_id,
        quantity: good.quantity || 1,
        is_from_cart: true,
      })),
      delivery: {
        address: formData.address || "Адрес не указан",
        delivery_date: Math.floor(Date.now() / 1000) + 86400,
        delivery_price: 0,
        recipient: {
          name: formData.isAnotherPerson ? formData.recipientName : formData.name,
          surname: "",
          phone: formData.isAnotherPerson ? formData.recipientPhone : formData.phone,
        },
        note: formData.note,
      },
      contragent_phone: contragentPhone || formData.phone,
      client_lat: finalLat,
      client_lon: finalLon,
      additional_data: [{
        geolocation_source: coordinates ? "browser" : "default",
        geolocation_timestamp: new Date().toISOString(),
      }],
    };

    try {
      await createOrderMutation.mutateAsync(orderData);
      
      let streetAddress = "Не удалось определить адрес";
      if (finalLat && finalLon) {
        try {
          streetAddress = await getAddressFromCoordinates(finalLat, finalLon);
        } catch (error) {
          console.error("Ошибка при получении адреса:", error);
          streetAddress = formData.address || "Адрес не указан";
        }
      } else {
        streetAddress = formData.address || "Адрес не указан";
      }

      setOrderModal({
        isOpen: true,
        isSuccess: true,
        title: "Заказ успешно оформлен!",
        message: "Спасибо за ваш заказ.",
        orderDetails: {
          userData: {
            name: formData.isAnotherPerson ? formData.recipientName : formData.name,
            phone: formData.isAnotherPerson ? formData.recipientPhone : formData.phone,
            address: streetAddress,
            coordinates: finalLat && finalLon 
              ? `Широта: ${finalLat.toFixed(6)}, Долгота: ${finalLon.toFixed(6)}` 
              : undefined,
          },
          items: items.map(item => ({
            name: item.product?.name || `Товар #${item.nomenclature_id}`,
            quantity: item.quantity || 1,
            price: item.product?.price || 0,
          })),
          totalPrice,
        },
      });
      
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      setOrderModal({
        isOpen: true,
        isSuccess: false,
        title: "Ошибка оформления",
        message: "Произошла ошибка при оформлении заказа",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  };

  const isLoading = isCartLoading || areItemsLoading || createOrderMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col">
      {orderModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className={`p-4 md:p-6 ${orderModal.isSuccess ? 'bg-green-50' : 'bg-red-50'} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {orderModal.isSuccess ? (
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                  )}
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    {orderModal.title}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                </button>
              </div>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                {orderModal.message}
              </p>
            </div>
            <div className="p-4 md:p-6">
              {orderModal.isSuccess && orderModal.orderDetails ? (
                <>
                  <div className="mb-4 md:mb-6">
                    <h3 className="mb-2 md:mb-3 text-base md:text-lg font-medium text-gray-900">
                      Данные покупателя
                    </h3>
                    <div className="space-y-1 md:space-y-2 rounded-lg border border-gray-200 p-3 md:p-4">
                      <div className="flex flex-col md:flex-row md:justify-between gap-1">
                        <span className="text-sm md:text-base text-gray-600">Имя:</span>
                        <span className="font-medium text-sm md:text-base">{orderModal.orderDetails.userData.name}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-1">
                        <span className="text-sm md:text-base text-gray-600">Телефон:</span>
                        <span className="font-medium text-sm md:text-base">{orderModal.orderDetails.userData.phone}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-1">
                        <span className="text-sm md:text-base text-gray-600">Адрес доставки:</span>
                        <span className="font-medium text-sm md:text-base text-right">{orderModal.orderDetails.userData.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <h3 className="mb-2 md:mb-3 text-base md:text-lg font-medium text-gray-900">
                      Состав заказа
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      {orderModal.orderDetails.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border border-gray-200 p-2 md:p-3 gap-2"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm md:text-base">{item.name}</h4>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                            <div className="text-right">
                              <div className="text-xs md:text-sm text-gray-600">Количество</div>
                              <div className="font-medium text-sm md:text-base">{item.quantity} шт.</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs md:text-sm text-gray-600">Стоимость</div>
                              <div className="font-medium text-sm md:text-base">{item.price.toLocaleString("ru-RU")} ₽</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-lg font-medium text-gray-900">Итого:</span>
                      <span className="text-xl md:text-2xl font-bold text-blue-600">
                        {orderModal.orderDetails.totalPrice.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 md:py-8">
                  <AlertCircle className="mx-auto h-12 w-12 md:h-16 md:w-16 text-red-500 mb-3 md:mb-4" />
                  <h3 className="mb-2 text-base md:text-lg font-medium text-gray-900">
                    {orderModal.error || "Произошла ошибка"}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                    Пожалуйста, попробуйте еще раз или обратитесь в поддержку.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                {orderModal.isSuccess ? (
                  <>
                    <Button
                      onClick={closeModal}
                      variant="outline"
                      className="flex-1 cursor-pointer text-sm md:text-base"
                    >
                      Закрыть
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer text-sm md:text-base"
                    >
                      Перейти к заказам
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={closeModal}
                    className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-sm md:text-base"
                  >
                    Попробовать снова
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 container px-4">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-lg md:text-xl font-medium tracking-tight py-3 md:py-4">Оформление заказа</h1>
          <div className="flex flex-col lg:grid lg:grid-cols-7 gap-4 md:gap-8">
            <form onSubmit={handleSubmit} className="lg:col-span-3">
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name" className="text-sm md:text-base">Имя *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="Иван"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-sm md:text-base">Номер телефона *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+7 999 123 45 67"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address" className="text-sm md:text-base">Адрес доставки</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGeolocationClick}
                        disabled={isGeolocationLoading || isLoading}
                        className="h-8 w-8 p-0 relative top-11 z-10 cursor-pointer"
                        title="Определить мое местоположение"
                      >
                        <LocateIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder="ул. Пушкина, д. Колотушкина (не обязательно)"
                      value={addressValue}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="pr-10 h-10 md:h-11 text-sm md:text-base"
                    />
                  </div>
                {geoError && (
                  <p className="text-xs text-red-600 mt-1">
                    {geoError}
                  </p>
                )}
                  <p className="text-xs text-gray-500 mt-1">
                    Нажмите на иконку локации для автоматического определения адреса
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="note" className="text-sm md:text-base">Примечание к заказу</Label>
                  <Textarea
                    id="note"
                    rows={3}
                    placeholder="Дополнительные пожелания"
                    value={formData.note}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm md:text-base min-h-[80px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAnotherPerson"
                    className="cursor-pointer h-4 w-4"
                    checked={formData.isAnotherPerson}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, isAnotherPerson: !!checked }));
                    }}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isAnotherPerson" className="text-sm md:text-base cursor-pointer">
                    Заказ оформляется для другого человека
                  </Label>
                </div>
                {formData.isAnotherPerson && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="recipientName" className="text-sm md:text-base">Имя получателя *</Label>
                      <Input
                        id="recipientName"
                        type="text"
                        required
                        placeholder="Петр"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-10 md:h-11 text-sm md:text-base"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="recipientPhone" className="text-sm md:text-base">Номер телефона получателя *</Label>
                      <Input
                        id="recipientPhone"
                        type="tel"
                        required
                        placeholder="+7 999 765 43 21"
                        value={formData.recipientPhone}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-10 md:h-11 text-sm md:text-base"
                      />
                    </div>
                  </>
                )}
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer h-11 md:h-12 text-sm md:text-base font-medium" 
                  disabled={isLoading || items.length === 0}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Оформление заказа...
                    </>
                  ) : (
                    `Оформить заказ за ${totalPrice.toLocaleString("ru-RU")}₽`
                  )}
                </Button>
                <div className="flex justify-center items-center text-gray-400 gap-1 pb-4 md:pb-0">
                  <LockIcon width={14} height={14} className="md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm text-center">
                    Ваши данные защищены
                  </span>
                </div>
              </div>
            </form>
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-2">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-2">
                        <div className="rounded-md border border-gray-100 w-20 h-20 md:w-24 md:h-24 p-2">
                          <Skeleton className="w-full h-full" />
                        </div>
                        <div className="py-1 flex-1">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24 md:w-32" />
                            <Skeleton className="h-4 w-12 md:w-16" />
                          </div>
                          <Skeleton className="h-3 w-20 md:w-24 mt-1" />
                          <div className="flex justify-between items-center gap-2 pt-2">
                            <Skeleton className="h-8 w-24 md:w-32" />
                            <Skeleton className="h-8 w-12 md:w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartError ? (
                  <div className="text-center py-4 text-red-500 text-sm md:text-base">
                    Ошибка загрузки корзины
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm md:text-base">
                    Корзина пуста
                  </div>
                ) : (
                  <>
                    {items.map((item, index) => (
                      <React.Fragment key={`${item.nomenclature_id}-${item.warehouse_id || 'no-warehouse'}`}>
                        <CartItem item={item} />
                        {index < items.length - 1 && <Separator className="my-3 md:my-4" />}
                      </React.Fragment>
                    ))}
                    
                    <div className="mt-4 md:mt-0 pt-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="tracking-tight font-medium text-sm md:text-base">Всего</p>
                          <span className="tracking-tight font-medium text-sm md:text-base">{totalPrice.toLocaleString("ru-RU")}₽</span>
                        </div>
                        <p className="text-xs md:text-sm/tight text-gray-500 tracking-tight pt-2">
                          Стоимость доставки и налоги рассчитываются <br />
                          при оформлении заказа.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <PaymentContent />
    </Suspense>
  );
}