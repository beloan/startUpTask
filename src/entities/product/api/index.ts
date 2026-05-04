import axios from "axios";

import { GetProductDto, GetProductsDto, ProductsResponse } from "../model/types";
import { getAddressCookie } from "@/shared/lib/city-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://app.tablecrm.com/api/v1/mp";

const inflightRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { timestamp: number; data: any }>();
const RESPONSE_CACHE_TTL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;

function makeRequestKey(url: string): string {
  return url;
}

async function deduplicatedFetch<T>(url: string): Promise<T> {
  const key = makeRequestKey(url);
  const now = Date.now();

  const cached = responseCache.get(key);
  if (cached && now - cached.timestamp < RESPONSE_CACHE_TTL_MS) {
    return cached.data as T;
  }

  if (inflightRequests.has(key)) {
    return inflightRequests.get(key) as Promise<T>;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const promise = fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Products request failed with status ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      responseCache.set(key, { timestamp: now, data });
      return data;
    })
    .finally(() => {
      clearTimeout(timeoutId);
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, promise);
  return promise;
}

export function getDetectedCityFromResponse(data: any): {
  city: string;
  lat: number;
  lon: number;
} | null {
  try {
    if (
      data?.detected_city &&
      data?.detected_lat != null &&
      data?.detected_lon != null
    ) {
      const city = String(data.detected_city);
      const lat = parseFloat(String(data.detected_lat));
      const lon = parseFloat(String(data.detected_lon));
      if (!Number.isNaN(lat) && !Number.isNaN(lon) && city) {
        return { city, lat, lon };
      }
    }
  } catch {}
  return null;
}

function resolveLocationParams(params: {
  address?: string;
  city?: string;
  lat?: number;
  lon?: number;
}): { address?: string; lat?: number; lon?: number } {
  let { address, lat, lon } = params;
  let addressParam = address;

  if (typeof window !== "undefined" && !addressParam) {
    addressParam = getAddressCookie() || undefined;
  }

  if (
    typeof window !== "undefined" &&
    (!addressParam || lat == null || lon == null)
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const hasUrlParams = urlParams.get("address");

    if (hasUrlParams) {
      try {
        const stored = localStorage.getItem("bystroi_location");
        if (stored) {
          const parsed = JSON.parse(stored) as {
            address?: string;
            lat?: number;
            lon?: number;
            manual?: boolean;
          };
          if (parsed.manual && parsed.address) {
            if (!addressParam) addressParam = parsed.address;
            if (lat == null && parsed.lat != null) lat = parsed.lat;
            if (lon == null && parsed.lon != null) lon = parsed.lon;
          }
        }
      } catch {}
    }
  }

  // Fall back to IP-detected city coords
  if (typeof window !== "undefined" && (lat == null || lon == null)) {
    try {
      const detected = sessionStorage.getItem("detected_city");
      if (detected) {
        const parsed = JSON.parse(detected);
        if (lat == null && parsed.lat != null) lat = parsed.lat;
        if (lon == null && parsed.lon != null) lon = parsed.lon;
      }
    } catch {}
  }

  return { address: addressParam, lat, lon };
}


export const fetchProducts = async (
  params: GetProductsDto
): Promise<ProductsResponse> => {
  try {
    const { address: addressParam, lat, lon } = resolveLocationParams({
      address: params.address,
      city: params.city,
      lat: params.lat,
      lon: params.lon,
    });

    const hasCoordinates = lat != null && lon != null;
    const radiusKm =
      params.radius_km != null && !Number.isNaN(Number(params.radius_km))
        ? Number(params.radius_km)
        : 20;

    const requestParams: Record<string, any> = {
      page: params.page || 1,
      size: params.size || 20,
      section: params.section,
      realty_type: params.realty_type,
      deal_type: params.deal_type,
      rooms_count: params.rooms_count,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      category: params.category,
      manufacturer: params.manufacturer,
      min_price: params.min_price,
      max_price: params.max_price,
      rating_from: params.rating_from,
      rating_to: params.rating_to,
      in_stock: params.in_stock,
      global_category_id: params.global_category_id,
      seller_id: params.seller_id,
      name: params.name,
      apply_radius_filter:
        params.apply_radius_filter ?? hasCoordinates,
      radius_km: hasCoordinates ? radiusKm : undefined,
    };

    if (addressParam) requestParams.address = addressParam;
    if (lat != null) requestParams.lat = lat;
    if (lon != null) requestParams.lon = lon;

    // Remove undefined keys to keep URL clean
    Object.keys(requestParams).forEach((k) => {
      if (requestParams[k] === undefined || requestParams[k] === null) {
        delete requestParams[k];
      }
    });

    const url = new URL(`${API_BASE_URL}/products`);
    Object.entries(requestParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    const fetchData = await deduplicatedFetch<ProductsResponse>(url.toString());

    const detectedCity = getDetectedCityFromResponse(fetchData);
    if (detectedCity && typeof window !== "undefined") {
      sessionStorage.setItem("detected_city", JSON.stringify(detectedCity));
      window.dispatchEvent(new CustomEvent("detectedCityUpdated"));
    }

    return fetchData;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchDetectedCity = async (): Promise<{
  city: string;
  lat: number;
  lon: number;
} | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: { size: 1 },
      headers: { "Content-Type": "application/json" },
    });
    return getDetectedCityFromResponse(response.data);
  } catch (error) {
    console.error("Error fetching detected city:", error);
    return null;
  }
};

export const fetchProduct = async (params: GetProductDto) => {
  try {
    const { address: addressParam, lat, lon } = resolveLocationParams({
      address: params.address,
      city: params.city,
      lat: params.lat,
      lon: params.lon,
    });

    const requestParams: { lat?: number; lon?: number; address?: string } = {};
    if (lat != null) requestParams.lat = lat;
    if (lon != null) requestParams.lon = lon;
    if (addressParam) requestParams.address = addressParam;

    const response = await axios.get(
      `${API_BASE_URL}/products/${params.product_id}`,
      {
        params: Object.keys(requestParams).length > 0 ? requestParams : undefined,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const fetchProductServer = async (
  id: string,
  lat?: number,
  lon?: number,
  address?: string,
  city?: string
) => {
  try {
    const addressParam = address || city;
    const params = new URLSearchParams();
    if (lat != null) params.append("lat", String(lat));
    if (lon != null) params.append("lon", String(lon));
    if (addressParam) params.append("address", addressParam);

    const url = `${API_BASE_URL}/products/${id}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json();
  } catch (error) {
    console.error("Error fetching product on server:", error);
    return null;
  }
};