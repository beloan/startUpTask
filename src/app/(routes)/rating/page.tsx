import { Building2, Star } from "lucide-react";
import type { Metadata } from "next";
import React from "react";

import { fetchProducts } from "@/entities/product/api";
import { StructuredData } from "@/feature/structured-data/structured-data";
import { MapPreview } from "@/shared/ui/map-preview";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import { Button } from "@/shared/ui/kit/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";

export const metadata: Metadata = {
  title: "Рейтинг магазинов и селлеров",
  description: "Рейтинг магазинов и селлеров с показателями качества, продажами и отзывами клиентов.",
  alternates: {
    canonical: "/rating",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Рейтинг магазинов и селлеров | БыстроИточка",
    description: "Рейтинг магазинов и селлеров с показателями качества, продажами и отзывами клиентов.",
    url: "https://bystroi.ru/rating",
    images: ["/favicon.ico"],
  },
  twitter: {
    title: "Рейтинг магазинов и селлеров",
    description: "Рейтинг магазинов и селлеров с показателями качества, продажами и отзывами клиентов.",
    images: ["/favicon.ico"],
  },
};

interface RatingPageProps {
  searchParams: Promise<{ region?: string; city?: string }>;
}

type SellerInfo = {
  sellerId: number;
  name: string;
  rating: number;
  reviews: number;
  sales: number;
  lat?: number;
  lon?: number;
  city: string;
  region: string;
  address?: string;
};

type ParsedLocation = {
  city: string;
  region: string;
};

function cleanPart(value?: string): string {
  return value?.trim().replace(/^г\.?\s*/i, "").replace(/^город\s+/i, "") || "";
}

function parseLocation(address?: string, fallbackCity?: string): ParsedLocation {
  const parts = (address || "")
    .split(",")
    .map((part) => cleanPart(part))
    .filter(Boolean);

  const city = parts[0] || cleanPart(fallbackCity) || "Не указан";

  const secondPart = parts[1] || "";
  const region =
    secondPart && !/^(россия|russia|ru)$/i.test(secondPart) ? secondPart : city === "Не указан" ? "Не указан" : "Россия";

  return { city, region };
}

export default async function Rating({ searchParams }: RatingPageProps) {
  const params = await searchParams;
  const selectedRegion = params.region || "all";
  const selectedCity = params.city || "all";

  const data = await fetchProducts({ size: 100, sort_by: "total_sold", sort_order: "desc" });
  const products = data?.result || [];
  const detectedCity = cleanPart(data?.detected_city);

  const sellerMap = new Map<number, SellerInfo>();

  products.forEach((product: any) => {
    if (!product.seller_id || !product.seller_name) return;

    const warehouse = product.available_warehouses?.[0];
    const lat = product.price_latitude ?? warehouse?.latitude;
    const lon = product.price_longitude ?? warehouse?.longitude;
    const address = product.price_address ?? warehouse?.warehouse_address;
    const parsedLocation = parseLocation(address, product.city || detectedCity);

    const prev = sellerMap.get(product.seller_id);
    sellerMap.set(product.seller_id, {
      sellerId: product.seller_id,
      name: product.seller_name,
      rating: product.avg_rating ?? product.rating ?? prev?.rating ?? 0,
      reviews: product.reviews_count ?? prev?.reviews ?? 0,
      sales: (product.sales_count ?? product.total_sold ?? 0) + (prev?.sales ?? 0),
      lat,
      lon,
      city: parsedLocation.city,
      region: parsedLocation.region,
      address,
    });
  });

  const sellers = Array.from(sellerMap.values()).sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.sales !== a.sales) return b.sales - a.sales;
    return a.name.localeCompare(b.name, "ru");
  });
  const regions = Array.from(new Set(sellers.map((seller) => seller.region))).filter(Boolean);
  const cities = Array.from(
    new Set(
      sellers
        .filter((seller) => selectedRegion === "all" || seller.region === selectedRegion)
        .map((seller) => seller.city),
    ),
  ).filter(Boolean);

  const filteredSellers = sellers.filter((seller) => {
    if (selectedRegion !== "all" && seller.region !== selectedRegion) return false;
    if (selectedCity !== "all" && seller.city !== selectedCity) return false;
    return true;
  });

  const mapPoints = filteredSellers
    .filter((seller) => seller.lat != null && seller.lon != null)
    .map((seller) => ({
      id: seller.sellerId,
      name: seller.name,
      lat: Number(seller.lat),
      lon: Number(seller.lon),
      address: seller.address,
    }));

  const mapCenter = mapPoints.length
    ? {
        lat: mapPoints.reduce((sum, point) => sum + point.lat, 0) / mapPoints.length,
        lon: mapPoints.reduce((sum, point) => sum + point.lon, 0) / mapPoints.length,
      }
    : { lat: 55.751244, lon: 37.618423 };

  return (
    <>
      <StructuredData
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Главная", url: "https://bystroi.ru" },
            { name: "Рейтинг магазинов", url: "https://bystroi.ru/rating" },
          ],
        }}
      />
      <section className="py-4 md:py-12">
        <div className="container">
          <div className="flex gap-2 md:items-center md:justify-between flex-col md:flex-row">
            <h1 className="text-lg tracking-tight font-medium">Карта селлеров по регионам и городам</h1>
            <form className="flex gap-2" method="get">
              <select
                name="region"
                defaultValue={selectedRegion}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="all">Все регионы</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <select
                name="city"
                defaultValue={selectedCity}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="all">Все города</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline">
                Применить
              </Button>
            </form>
          </div>

          <div className="border border-gray-200 rounded-md mt-8 overflow-hidden">
            <div className="h-[420px]">
              <MapPreview
                lat={mapCenter.lat}
                lon={mapCenter.lon}
                locations={mapPoints}
                zoom={mapPoints.length > 0 ? 9 : 6}
                summaryTitle="Селлеры на карте"
                summarySubtitle={`${mapPoints.length} селлеров с координатами`}
                pointsLegendLabel="Селлеры"
                centerPointLabel="Центр выбранной области"
                centerLegendLabel="Центр"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-md mt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40 md:w-lg">Инфо</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Заказы</TableHead>
                  <TableHead>Локация</TableHead>
                  <TableHead className="text-right">Детали</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.map((item) => (
                  <TableRow key={item.sellerId}>
                    <TableCell>
                      <div className="flex gap-2 w-40 md:w-lg overflow-hidden">
                        <Avatar className="size-8">
                          <AvatarImage src="https://github.com/shadcn.png" alt={item.name} />
                          <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-medium">{item.name}</p>
                          <span className="text-xs text-gray-500 truncate">Селлер #{item.sellerId}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-xl md:text-3xl">{item.rating.toFixed(1)}</p>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-0.5 pt-2">
                            {Array.from({ length: 5 }).map((_, index) => {
                              const isFilled = index < Math.round(item.rating);
                              return (
                                <Star
                                  key={index}
                                  width={16}
                                  height={16}
                                  strokeWidth={1}
                                  fill={isFilled ? "gold" : "none"}
                                  stroke={isFilled ? "gold" : "gray"}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500">{item.reviews} отзывов</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-gray-500">
                          Всего: <strong className="text-black font-medium">{item.sales}</strong>
                        </p>
                        <p className="text-gray-500">
                          Выполнено: <strong className="text-green-600 font-medium">{Math.round(item.sales * 0.92)}</strong>
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-gray-500">
                          Регион: <strong className="text-black font-medium">{item.region}</strong>
                        </p>
                        <p className="text-gray-500">
                          Город: <strong className="text-black font-medium">{item.city}</strong>
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button className="ml-auto flex" variant="outline" disabled>
                        Подробнее
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredSellers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Селлеры по выбранным фильтрам не найдены
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </>
  );
}
