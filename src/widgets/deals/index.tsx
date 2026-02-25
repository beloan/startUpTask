// widgets/product/deals.tsx
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { Product, useProducts, fetchProducts } from '@/entities/product';
import { ProductCard } from '@/entities/product';
import { ProductCardSkeleton } from '@/entities/product/ui/product-card-skeleton';
import { Button } from '@/shared/ui/kit/button';

export const Deals = () => {
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sellerId = searchParams.get('seller_id');
  const address = searchParams.get('address');
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // Проверяем наличие товаров у селлера
  const sellerParams = useMemo(() => {
    const baseParams: any = {
      size: 1,
      sort_by: 'total_sold' as const,
      sort_order: 'desc' as const,
    };
    if (address) baseParams.address = address;
    else if (city) baseParams.city = city;
    if (sellerId) baseParams.seller_id = Number(sellerId);
    if (lat) {
      const latNum = Number(lat);
      if (!Number.isNaN(latNum)) baseParams.lat = latNum;
    } else if (typeof window !== 'undefined') {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null) baseParams.lat = parsed.lat;
        }
      } catch (e) {}
    }
    if (lon) {
      const lonNum = Number(lon);
      if (!Number.isNaN(lonNum)) baseParams.lon = lonNum;
    } else if (typeof window !== 'undefined') {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lon != null) baseParams.lon = parsed.lon;
        }
      } catch (e) {}
    }
    return baseParams;
  }, [address, city, sellerId, lat, lon]);

  const { data: sellerData } = useQuery({
    queryKey: ["products", "seller_check", sellerParams],
    queryFn: () => fetchProducts(sellerParams),
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000,
  });

  const hasSellerProducts = sellerData && sellerData.count > 0 && sellerData.result?.length > 0;

  // Параметры для основного запроса
  const params = useMemo(() => {
    const baseParams: any = {
      size: 20,
      sort_by: 'total_sold' as const,
      sort_order: 'desc' as const,
    };
    if (address) baseParams.address = address;
    else if (city) baseParams.city = city;
    if (sellerId && hasSellerProducts) {
      baseParams.seller_id = Number(sellerId);
    }
    if (lat) {
      const latNum = Number(lat);
      if (!Number.isNaN(latNum)) baseParams.lat = latNum;
    } else if (typeof window !== 'undefined') {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null) baseParams.lat = parsed.lat;
        }
      } catch (e) {}
    }
    if (lon) {
      const lonNum = Number(lon);
      if (!Number.isNaN(lonNum)) baseParams.lon = lonNum;
    } else if (typeof window !== 'undefined') {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lon != null) baseParams.lon = parsed.lon;
        }
      } catch (e) {}
    }
    return baseParams;
  }, [address, city, sellerId, hasSellerProducts, lat, lon]);

  const { data, isLoading } = useProducts(params);

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg tracking-tight">
            Лучшие предложения для вас
          </h2>
          <Button variant="outline" className="hidden md:flex cursor-pointer" asChild>
            <Link href={`/products?${searchParams.toString()}`}>
              Все предложения
              <ArrowRight width={16} height={16} className="inline ml-1" />
            </Link>
          </Button>
        </div>

        <div className="pt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              {/* Десктоп — сетка */}
              {!isMobile && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {data?.result?.slice(0, 12).map((product: Product, index: number) => (
                    <ProductCard key={product.id} {...product} />
                  )) || []}
                </div>
              )}

              {/* Мобильные — горизонтальный скролл */}
              {isMobile && (
                <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                  {data?.result?.slice(0, 12).map((product: Product) => (
                    <div key={product.id} className="flex-shrink-0 w-40">
                      <ProductCard {...product} />
                    </div>
                  )) || []}
                </div>
              )}
            </>
          )}
        </div>

        {/* Кнопка для мобильных — теперь кликабельная */}
        <div className="md:hidden pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link href={`/products?${searchParams.toString()}`}>
              Все предложения
              <ArrowRight width={16} height={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Deals;