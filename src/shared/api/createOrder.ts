// shared/api/createOrder.ts
import { apiClient } from "./client";
import { CreateOrderParams, CreateOrderResponse } from "../types/order";

export const createOrder = async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
  const {
    entity_type = "docs_sales",
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    utm_name,
    utm_phone,
    utm_email,
    utm_leadid,
    utm_yclientid,
    utm_gaclientid,
    ref_user,
    city,
    ...body
  } = params;

  const response = await apiClient.post<CreateOrderResponse>("/orders", body, {
    params: {
      entity_type,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      utm_name,
      utm_phone,
      utm_email,
      utm_leadid,
      utm_yclientid,
      utm_gaclientid,
      ref_user,
      city,
    },
  });
  
  return response.data;
};