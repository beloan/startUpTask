// shared/hooks/useOrders.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContragentPhone } from "./useContragentPhone";
import { createOrder } from "../api/createOrder";
import { CreateOrderParams } from "../types/order";
import { useUtmParams } from "./useUtmParams";
import { Cart } from "../types/cart";
import { cartKeys } from "@/entities/cart/model/hooks";
import { getCityFromStorage } from "../lib/utmStorage";

type OrderMutationVariables = Omit<CreateOrderParams, 'contragent_phone'> & { contragent_phone?: string };

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const hookContragentPhone = useContragentPhone();
  const { utmParams } = useUtmParams();
  const city = getCityFromStorage();

  return useMutation({
    mutationFn: async (orderData: OrderMutationVariables) => {
      const phone = orderData.contragent_phone || hookContragentPhone;
      return createOrder({
        ...orderData,
        contragent_phone: phone,
        city,
        ...utmParams,
      });
    },
    onSuccess: (response) => {
      if (response.cart_cleared) {
        const cartQueryKey = cartKeys.cartWithPhone(hookContragentPhone);
        const emptyCart: Cart = {
          contragent_phone: hookContragentPhone,
          goods: [],
          total_count: "0",
        };
        queryClient.setQueryData(cartQueryKey, emptyCart);
      } else {
        queryClient.invalidateQueries({ queryKey: cartKeys.root });
      }
    },
    onError: (error) => {
      console.error("Ошибка при создании заказа:", error);
    },
  });
};