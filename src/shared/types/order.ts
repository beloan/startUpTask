// shared/types/order.ts
import { UtmParams } from "./utm";

export interface CreateOrderDto {
  goods: Array<{
    nomenclature_id: number;
    warehouse_id?: number;
    quantity: number;
    is_from_cart: boolean;
  }>;
  delivery: {
    address: string;
    delivery_date?: number;
    delivery_price?: number;
    recipient: {
      name: string;
      surname: string;
      phone: string;
    };
    note?: string;
  };
  contragent_phone: string;
  client_lat?: number;
  client_lon?: number;
  additional_data?: Array<Record<string, any>>;
}

export interface CreateOrderParams extends CreateOrderDto, UtmParams {
  entity_type?: "docs_sales" | "view_events" | "favorites";
  city?: string;
}

export interface CreateOrderResponse {
  message: string;
  processing_time_ms: number;
  cart_cleared?: boolean;
}