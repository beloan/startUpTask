// shared/hooks/useOrders.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContragentPhone } from "./useContragentPhone";
import { createOrder } from "../api/createOrder";
import { CreateOrderParams } from "../types/order";
import { useUtmParams } from "./useUtmParams";
import { Cart } from "../types/cart";
import { cartKeys } from "@/entities/cart/model/hooks";
import { getCityFromStorage } from "../lib/utmStorage";

export const useCreateOrder = () => {

  const queryClient = useQueryClient();
  const contragentPhone = useContragentPhone();
  const { utmParams } = useUtmParams();
  const city = getCityFromStorage();

  return useMutation({
    mutationFn: async (orderData: Omit<CreateOrderParams, "contragent_phone">) => {
      return createOrder({
        ...orderData,
        contragent_phone: contragentPhone,
        city,
        ...utmParams,
      });
    },
    onSuccess: (response) => {
      // Если корзина очищена на бэкенде, обновляем локальное состояние
      if (response.cart_cleared) {
        const cartQueryKey = cartKeys.cartWithPhone(contragentPhone);
        const emptyCart: Cart = {
          contragent_phone: contragentPhone,
          goods: [],
          total_count: "0",
        };
        queryClient.setQueryData(cartQueryKey, emptyCart);
      } else {
        // Иначе просто инвалидируем кеш, чтобы запросить актуальное состояние
        queryClient.invalidateQueries({ queryKey: cartKeys.root });
      }
    },
    onError: (error) => {
      console.error("Ошибка при создании заказа:", error);
    },
  });
};