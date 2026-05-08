// entities/statistics/model/hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as statsApi from "../api";
import { GetViewEventsParams, SellerStatistics } from "./types";
import { useContragentPhone } from "@/shared/hooks/useContragentPhone";
import { useUtmParams } from "@/shared/hooks/useUtmParams";
import { getCityFromStorage } from "@/shared/lib/utmStorage";

export const statisticsKeys = {
  root: ["statistics"] as const,
  sellerStats: (cashbox_id: number, days?: number) => 
    [...statisticsKeys.root, "seller", cashbox_id, days] as const,
  viewEvents: (params: GetViewEventsParams) => 
    [...statisticsKeys.root, "view-events", params] as const,
};

export const useCreateViewEvent = () => {
  const contragentPhone = useContragentPhone();
  const queryClient = useQueryClient();
  const { utmParams } = useUtmParams();
  const city = getCityFromStorage();

  return useMutation({
    mutationFn: (data: {
      entity_type: "nomenclature";
      entity_id: number;
      listing_pos?: number;
      listing_page?: number;
      event: 'view' | 'click';
    }) => 
      statsApi.createViewEvent({
        ...data,
        contragent_phone: contragentPhone,
        city,
        ...utmParams,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statisticsKeys.root });
    },
    onError: (error) => {
      console.error("Ошибка при отправке события:", error);
    },
  });
};

export const useSellerStatistics = (cashbox_id: number, days: number = 30) => {
  return useQuery<SellerStatistics>({
    queryKey: statisticsKeys.sellerStats(cashbox_id, days),
    queryFn: () => statsApi.getSellerStatistics(cashbox_id, days),
    enabled: !!cashbox_id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useViewEvents = (params: GetViewEventsParams) => {
  return useQuery({
    queryKey: statisticsKeys.viewEvents(params),
    queryFn: () => statsApi.getViewEvents(params),
    enabled: !!params.cashbox_id,
  });
};

export const useTrackEvent = () => {
  const createViewEventMutation = useCreateViewEvent();

  const trackView = (productId: number, listing_pos?: number, listing_page?: number) => {
    createViewEventMutation.mutate({
      entity_type: 'nomenclature',
      entity_id: productId,
      listing_pos,
      listing_page,
      event: 'view'
    });
  };

  const trackClick = (productId: number, listing_pos?: number, listing_page?: number) => {
    createViewEventMutation.mutate({
      entity_type: 'nomenclature',
      entity_id: productId,
      listing_pos,
      listing_page,
      event: 'click'
    });
  };

  const trackAddToCart = (productId: number) => {
    createViewEventMutation.mutate({
      entity_type: 'nomenclature',
      entity_id: productId,
      event: 'click'
    });
  };

  const trackPurchase = (productId: number) => {
    createViewEventMutation.mutate({
      entity_type: 'nomenclature',
      entity_id: productId,
      event: 'click'
    });
  };

  const trackRecommendationView = (productId: number, position: number) => {
    createViewEventMutation.mutate({
      entity_type: 'nomenclature',
      entity_id: productId,
      listing_pos: position,
      event: 'view',
    });
  };

  return {
    trackView,
    trackClick,
    trackAddToCart,
    trackPurchase,
    trackRecommendationView,
    isLoading: createViewEventMutation.isPending,
  };
};