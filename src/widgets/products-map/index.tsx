"use client";

import Link from "next/link";
import React, { useMemo } from "react";

import { Product } from "@/entities/product/model/types";
import { getLocationParamsString } from "@/shared/lib/city-utils";
import { MapPreview } from "@/shared/ui/map-preview";

interface ProductsMapProps {
  products: Product[];
  fallbackLat?: number;
  fallbackLon?: number;
}

type MapPoint = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
};

const DEFAULT_CENTER = {
  lat: 55.751244,
  lon: 37.618423,
};

export const ProductsMap: React.FC<ProductsMapProps> = ({
  products,
  fallbackLat,
  fallbackLon,
}) => {
  const mapPoints = useMemo<MapPoint[]>(() => {
    const points: MapPoint[] = [];

    products.forEach((product) => {
      const latFromProduct =
        typeof product.price_latitude === "number" ? product.price_latitude : undefined;
      const lonFromProduct =
        typeof product.price_longitude === "number" ? product.price_longitude : undefined;

      const warehouse = product.available_warehouses?.[0];
      const latFromWarehouse = warehouse?.latitude;
      const lonFromWarehouse = warehouse?.longitude;

      const lat = latFromProduct ?? latFromWarehouse;
      const lon = lonFromProduct ?? lonFromWarehouse;

      if (lat == null || lon == null) return;

      points.push({
        id: product.id,
        name: product.name,
        lat,
        lon,
        address:
          product.price_address ||
          warehouse?.warehouse_address ||
          (typeof product.price === "number"
            ? `Цена: ${product.price.toLocaleString("ru-RU")}₽`
            : undefined),
      });
    });

    return points;
  }, [products]);

  const center = useMemo(() => {
    if (mapPoints.length > 0) {
      const latAvg = mapPoints.reduce((sum, p) => sum + p.lat, 0) / mapPoints.length;
      const lonAvg = mapPoints.reduce((sum, p) => sum + p.lon, 0) / mapPoints.length;
      return { lat: latAvg, lon: lonAvg };
    }

    if (fallbackLat != null && fallbackLon != null) {
      return { lat: fallbackLat, lon: fallbackLon };
    }

    return DEFAULT_CENTER;
  }, [mapPoints, fallbackLat, fallbackLon]);

  return (
    <section className="mb-6">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-[480px]">
          <MapPreview
            lat={center.lat}
            lon={center.lon}
            locations={mapPoints}
            zoom={mapPoints.length > 0 ? 11 : 10}
            summaryTitle="Товары на карте"
            summarySubtitle={`${mapPoints.length} товаров с координатами`}
            pointsLegendLabel="Товары"
            centerPointLabel="Текущий центр поиска"
            centerLegendLabel="Центр поиска"
          />
        </div>
      </div>

      {mapPoints.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {products.slice(0, 12).map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}${getLocationParamsString()}`}
              className="text-xs px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              {product.name}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
