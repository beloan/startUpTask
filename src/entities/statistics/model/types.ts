// entities/statistics/model/types.ts
import { UtmParams } from "@/shared/types/utm";

export interface ViewEvent extends UtmParams {
  entity_type: 'nomenclature';
  entity_id: number;
  listing_pos?: number;
  listing_page?: number;
  event: 'view' | 'click';
  contragent_phone: string;
  created_at?: string;
  city?: string;
}

export interface ViewEventResponse {
  success: boolean;
  message: string;
}

export interface GetViewEventsParams {
  cashbox_id: number;
  from_time?: string;
  to_time?: string;
  contragent_phone?: string;
  entity_type?: string;
  event?: 'view' | 'click';
}

export interface ViewEventInfo extends UtmParams {
  entity_id: number;
  entity_type: string;
  event: string;
  contragent_phone: string;
  created_at: string;
  listing_pos?: number;
  listing_page?: number;
}

export interface SellerStatistics {
  total_views: number;
  total_clicks: number;
  total_recommendations: number;
  total_add_to_cart: number;
  total_purchases: number;
  conversion_rate: number;
  popular_products: Array<{
    product_id: number;
    product_name: string;
    views: number;
    clicks: number;
    purchases: number;
    sales_count?: number;
    rating?: number;
    conversion: number;
  }>;
  daily_stats: Array<{
    date: string;
    views: number;
    clicks: number;
    purchases: number;
  }>;
}