"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  GetProductsDto,
  SortBy,
  SortOrder,
  SortType,
} from "@/entities/product";

export const useProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParams = useMemo(() => {
    const params: Partial<GetProductsDto> = {};

    try {
      // Устанавливаем сортировку по умолчанию, если не указана
      if (searchParams.has("sort")) {
        const sortValue = searchParams.get("sort");
        switch (sortValue) {
          case "popular":
            params.sort_by = "total_sold";
            params.sort_order = "desc";
            break;
          case "new":
            params.sort_by = "created_at";
            params.sort_order = "desc";
            break;
          case "expensive":
            params.sort_by = "price";
            params.sort_order = "desc";
            break;
          case "cheap":
            params.sort_by = "price";
            params.sort_order = "asc";
            break;
          case "interesting":
            params.sort_by = "rating";
            params.sort_order = "desc";
            break;
        }
      } else {
        // Сортировка по умолчанию
        params.sort_by = "total_sold";
        params.sort_order = "desc";
      }

      if (searchParams.has("category")) {
        params.category = searchParams.get("category")!;
      }
      if (searchParams.has("manufacturer")) {
        params.manufacturer = searchParams.get("manufacturer")!;
      }
      if (searchParams.has("min_price")) {
        params.min_price = Number(searchParams.get("min_price"));
      }
      if (searchParams.has("max_price")) {
        params.max_price = Number(searchParams.get("max_price"));
      }
      if (searchParams.has("rating_from")) {
        params.rating_from = Number(searchParams.get("rating_from"));
      }
      if (searchParams.has("rating_to")) {
        params.rating_to = Number(searchParams.get("rating_to"));
      }
      if (searchParams.has("in_stock")) {
        params.in_stock = searchParams.get("in_stock") === "true";
      }
      if (searchParams.has("has_photos")) {
        params.has_photos = searchParams.get("has_photos") === "true";
      }
      if (searchParams.has("seller_name")) {
        params.seller_name = searchParams.get("seller_name")!;
      }
      if (searchParams.has("seller_id")) {
        params.seller_id = Number(searchParams.get("seller_id"));
      }
      if (searchParams.has("global_category_id")) {
        params.global_category_id = Number(
          searchParams.get("global_category_id"),
        );
      }
      // Приоритет у address, если его нет - используем city (как с адресом)
      if (searchParams.has("address")) {
        params.address = searchParams.get("address")!;
      } else if (searchParams.has("city")) {
        // Передаем полное название города напрямую из URL (как с адресом)
        params.city = searchParams.get("city")!;
      }
      if (searchParams.has("seller_id")) {
        params.seller_id = Number(searchParams.get("seller_id"));
      }
      // Координаты для выбора ближайшей цены
      // Сначала проверяем URL, если нет - берем из sessionStorage (автоматически определенный город)
      if (searchParams.has("lat")) {
        const lat = Number(searchParams.get("lat"));
        if (!Number.isNaN(lat)) {
          params.lat = lat;
        }
      } else if (typeof window !== "undefined") {
        // Если координат нет в URL, проверяем sessionStorage (автоматически определенный город)
        try {
          const detected = sessionStorage.getItem("detected_city");
          if (detected) {
            const parsed = JSON.parse(detected);
            if (parsed.lat != null) {
              params.lat = parsed.lat;
            }
          }
        } catch (e) {
          // Игнорируем ошибки
        }
      }

      if (searchParams.has("lon")) {
        const lon = Number(searchParams.get("lon"));
        if (!Number.isNaN(lon)) {
          params.lon = lon;
        }
      } else if (typeof window !== "undefined") {
        // Если координат нет в URL, проверяем sessionStorage (автоматически определенный город)
        try {
          const detected = sessionStorage.getItem("detected_city");
          if (detected) {
            const parsed = JSON.parse(detected);
            if (parsed.lon != null) {
              params.lon = parsed.lon;
            }
          }
        } catch (e) {
          // Игнорируем ошибки
        }
      }
    } catch (error) {
      console.error("Error parsing search params:", error);
      // В случае ошибки устанавливаем сортировку по умолчанию
      params.sort_by = "total_sold";
      params.sort_order = "desc";
    }

    return params;
  }, [searchParams]);

  const updateUrlWithFilters = useCallback(
    (newFilters: Record<string, string | number | boolean | undefined>) => {
      try {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === undefined || value === "" || value === null) {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        });

        const currentSort = searchParams.get("sort") || "popular";
        newParams.set("sort", currentSort);

        router.push(`/products?${newParams.toString()}`, { scroll: false });
      } catch (error) {
        console.error("Error updating URL with filters:", error);
      }
    },
    [router, searchParams],
  );

  const resetFilters = useCallback(() => {
    const newParams = new URLSearchParams();

    const currentSort = searchParams.get("sort");
    if (currentSort) {
      newParams.set("sort", currentSort);
    }

    router.push(`/products?${newParams.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const applySort = useCallback(
    (sortType: SortType) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("sort", sortType);
      router.push(`/products?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (
        key === "category" ||
        key === "manufacturer" ||
        key === "seller_name"
      ) {
        if (value) {
          const currentValues = newParams.get(key)?.split(",") || [];
          const newValues = currentValues.filter((v) => v !== value);
          if (newValues.length > 0) {
            newParams.set(key, newValues.join(","));
          } else {
            newParams.delete(key);
          }
        } else {
          newParams.delete(key);
        }
      } else if (key === "price") {
        newParams.delete("min_price");
        newParams.delete("max_price");
      } else if (key === "rating") {
        newParams.delete("rating_from");
        newParams.delete("rating_to");
      } else if (key === "global_category_id") {
        newParams.delete("global_category_id");
      } else if (key === "has_photos") {
        newParams.delete("has_photos");
      } else {
        newParams.delete(key);
      }
      if (key === "seller_id") {
        newParams.delete("seller_id");
      }

      router.push(`/products?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const currentSortType = useMemo(() => {
    const sort = searchParams.get("sort");
    return (sort as SortType) || "popular";
  }, [searchParams]);

  return {
    currentParams,
    currentSortType,
    applySort,
    updateUrlWithFilters,
    resetFilters,
    removeFilter,
  };
};
