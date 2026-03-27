import axios from "axios";

import { GetProductDto, GetProductsDto } from "../model/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://app.tablecrm.com/api/v1/mp";

/**
 * Извлекает автоматически определенный город из тела JSON ответа
 * Бэкенд возвращает detected_city, detected_lat, detected_lon в теле ответа
 */
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
  } catch (error) {
    console.error("Error parsing detected city from response body:", error);
  }

  return null;
}

export const fetchProducts = async (params: GetProductsDto) => {
  try {
    let addressParam = params.address || params.city;
    let lat = params.lat;
    let lon = params.lon;

    if (
      (!addressParam || lat == null || lon == null) &&
      typeof window !== "undefined"
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUrlParams = urlParams.get("address") || urlParams.get("city");

      if (hasUrlParams) {
        try {
          const storageKey = "bystroi_location";
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored) as {
              address?: string;
              city?: string;
              lat?: number;
              lon?: number;
              manual?: boolean;
            };

            if (parsed.manual && (parsed.address || parsed.city)) {
              if (!addressParam) {
                addressParam = parsed.address || parsed.city;
              }
              if (lat == null && parsed.lat != null) {
                lat = parsed.lat;
              }
              if (lon == null && parsed.lon != null) {
                lon = parsed.lon;
              }
            }
          }
        } catch (e) {}
      }
    }

    const requestParams: any = {
      page: params.page || 1,
      size: params.size || 20,
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
    };

    if (addressParam) {
      requestParams.address = addressParam;
    }

    if (lat != null) {
      requestParams.lat = lat;
    } else if (typeof window !== "undefined") {
      try {
        const detected = sessionStorage.getItem("detected_city");
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null) {
            requestParams.lat = parsed.lat;
          }
        }
      } catch (e) {}
    }

    if (lon != null) {
      requestParams.lon = lon;
    } else if (typeof window !== "undefined") {
      try {
        const detected = sessionStorage.getItem("detected_city");
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lon != null) {
            requestParams.lon = parsed.lon;
          }
        }
      } catch (e) {}
    }

    Object.keys(requestParams).forEach((key) => {
      if (requestParams[key] === undefined) {
        delete requestParams[key];
      }
    });

    const url = new URL(`${API_BASE_URL}/products`);
    Object.entries(requestParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const fetchResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const fetchData = await fetchResponse.json();

    const detectedCity = getDetectedCityFromResponse(fetchData);
    if (detectedCity) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("detected_city", JSON.stringify(detectedCity));

        window.dispatchEvent(new CustomEvent("detectedCityUpdated"));
      }
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    return getDetectedCityFromResponse(response.data);
  } catch (error) {
    console.error("Error fetching detected city:", error);
    return null;
  }
};

export const fetchProduct = async (params: GetProductDto) => {
  try {
    let addressParam = params.address || params.city;
    let lat = params.lat;
    let lon = params.lon;

    if (
      (!addressParam || lat == null || lon == null) &&
      typeof window !== "undefined"
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUrlParams = urlParams.get("address") || urlParams.get("city");

      if (hasUrlParams) {
        try {
          const storageKey = "bystroi_location";
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored) as {
              address?: string;
              city?: string;
              lat?: number;
              lon?: number;
              manual?: boolean;
            };

            if (parsed.manual && (parsed.address || parsed.city)) {
              if (!addressParam) {
                addressParam = parsed.address || parsed.city;
              }
              if (lat == null && parsed.lat != null) {
                lat = parsed.lat;
              }
              if (lon == null && parsed.lon != null) {
                lon = parsed.lon;
              }
            }
          }
        } catch (e) {}
      }
    }

    if ((lat == null || lon == null) && typeof window !== "undefined") {
      try {
        const detected = sessionStorage.getItem("detected_city");
        if (detected) {
          const parsed = JSON.parse(detected);
          if (lat == null && parsed.lat != null) {
            lat = parsed.lat;
          }
          if (lon == null && parsed.lon != null) {
            lon = parsed.lon;
          }
        }
      } catch (e) {}
    }

    const requestParams: { lat?: number; lon?: number; address?: string } = {
      lat: lat,
      lon: lon,
      address: addressParam,
    };

    Object.keys(requestParams).forEach((key) => {
      if (requestParams[key as keyof typeof requestParams] === undefined) {
        delete requestParams[key as keyof typeof requestParams];
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/products/${params.product_id}`,
      {
        params:
          Object.keys(requestParams).length > 0 ? requestParams : undefined,
      },
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
  city?: string,
) => {
  try {
    const addressParam = address || city;

    const params = new URLSearchParams();
    if (lat != null) {
      params.append("lat", String(lat));
    }
    if (lon != null) {
      params.append("lon", String(lon));
    }
    if (addressParam) {
      params.append("address", addressParam);
    }

    const url = `${API_BASE_URL}/products/${id}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching product on server:", error);
    return null;
  }
};
