import { ListParams, Warehouse } from "@/shared/types";

export type ProductVideo = {
  id: number;
  url: string;
  description?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: number;
  name: string;
  description_short?: string;
  description_long?: string;
  code?: string;
  unit_name?: string;
  cashbox_id?: number;
  category_name?: string;
  manufacturer_name?: string;
  price: number;
  old_price?: number;
  previous_price?: number;
  price_change_percent?: number;
  price_type?: string;
  price_address?: string;
  price_latitude?: number;
  price_longitude?: number;
  created_at?: string;
  updated_at?: string;
  images: string[];
  videos?: ProductVideo[];
  barcodes?: string[];
  type?: string;
  seller_id?: number;
  distance?: number;
  listing_pos?: number;
  listing_page?: number;
  is_ad_pos?: boolean;
  tags?: string[];
  variations?: any[];
  current_amount?: number;
  seller_name?: string;
  seller_photo?: string;
  seller_description?: string;
  total_sold?: number;
  sales_count?: number;
  view_count?: number;
  views_count?: number;
  total_views?: number;
  rating?: number;
  avg_rating?: number;
  reviews_count?: number;
  available_warehouses?: Array<{
    warehouse_id: number;
    organization_id: number;
    warehouse_name: string;
    warehouse_address: string;
    latitude: number;
    longitude: number;
    distance_to_client: number;
    current_amount: number;
  }>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  nomenclatures?: any[];
  processing_time_ms?: number;
};

export type SortBy = "price" | "name" | "total_sold" | "rating" | "created_at" | "updated_at";
export type SortOrder = "asc" | "desc";
export type SortType = "popular" | "new" | "expensive" | "cheap" | "interesting";


export interface GetProductsDto {
  phone?: string;
  size?: number;
  name?: string;
  section?: string;
  realty_type?: string;
  deal_type?: string;
  rooms_count?: number;
  lat?: number;
  lon?: number;
  radius_km?: number;
  sort_by?: SortBy;
  sort_order?: SortOrder;
  category?: string;
  manufacturer?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  rating_from?: number;
  rating_to?: number;
  sort_type?: SortType;
  page?: number;
  global_category_id?: number;
  city?: string;
  address?: string;
  seller_id?: number;
  seller_name?: string;
  has_photos?: boolean;
  apply_radius_filter?: boolean;
}

export interface GetProductDto {
  product_id: number;
  lat?: number;
  lon?: number;
  address?: string;
  city?: string;
}

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  brands?: string[];
  category?: string;
  inStock?: boolean;
}

export type SortOption = {
  value: string;
  label: string;
  sort_by: SortBy;
  sort_order: SortOrder;
};

export interface ProductsResponse {
  result: Product[];
  count: number;
  page: number;
  size: number;
  sellers?: Array<{ id: number; name: string }>;
  processing_time_ms?: number;
  detected_city?: string;
  detected_lat?: number;
  detected_lon?: number;
}