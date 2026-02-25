// features/recommendation/ui/recommendation.tsx
"use client";

import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { useProductViewHistory } from '@/shared/hooks/use-product-view-history';
import { Product, useProducts, fetchProducts } from '@/entities/product';
import { ProductCard } from '@/entities/product/ui/product-card';
import { ProductCardSkeleton } from '@/entities/product/ui/product-card-skeleton';
import { Button } from '@/shared/ui/kit/button';

const DEFAULT_RECOMMENDATIONS = {
  size: 20,
  sort_by: 'total_sold' as const,
  sort_order: 'desc' as const,
};

export const Recommendation = () => {
  const searchParams = useSearchParams();
  const { getRecommendationsParams, viewedProducts } = useProductViewHistory();
  const [params, setParams] = useState<any>(DEFAULT_RECOMMENDATIONS);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sellerId = searchParams.get('seller_id');
  const address = searchParams.get('address');
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const { data, isLoading } = useProducts(params);

  useEffect(() => {
    const recommendationParams = getRecommendationsParams();
    let baseParams: any;
    if (recommendationParams) {
      baseParams = { ...recommendationParams };
      setFallbackMode(false);
    } else {
      baseParams = { ...DEFAULT_RECOMMENDATIONS };
      setFallbackMode(false);
    }

    if (address) baseParams.address = address;
    else if (city) baseParams.city = city;

    if (sellerId && hasSellerProducts) {
      baseParams.seller_id = Number(sellerId);
    } else if (sellerId && hasSellerProducts === false) {
      delete baseParams.seller_id;
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

    setParams(baseParams);
  }, [searchParams, getRecommendationsParams, viewedProducts, hasSellerProducts, address, city, sellerId, lat, lon]);

  useEffect(() => {
    if (!isLoading && data?.result?.length === 0 && !fallbackMode) {
      const recommendationParams = getRecommendationsParams();
      if (recommendationParams?.category) {
        const fallbackParams: any = {
          category: recommendationParams.category,
          size: 20,
          sort_by: 'total_sold' as const,
          sort_order: 'desc' as const,
        };
        if (address) fallbackParams.address = address;
        else if (city) fallbackParams.city = city;
        if (lat) {
          const latNum = Number(lat);
          if (!Number.isNaN(latNum)) fallbackParams.lat = latNum;
        }
        if (lon) {
          const lonNum = Number(lon);
          if (!Number.isNaN(lonNum)) fallbackParams.lon = lonNum;
        }
        setParams(fallbackParams);
        setFallbackMode(true);
      }
    }
  }, [data, isLoading, fallbackMode, getRecommendationsParams, address, city, lat, lon]);

  useEffect(() => {
    if (!isLoading && data?.result?.length === 0 && fallbackMode) {
      const finalParams: any = { ...DEFAULT_RECOMMENDATIONS };
      if (address) finalParams.address = address;
      else if (city) finalParams.city = city;
      if (lat) {
        const latNum = Number(lat);
        if (!Number.isNaN(latNum)) finalParams.lat = latNum;
      }
      if (lon) {
        const lonNum = Number(lon);
        if (!Number.isNaN(lonNum)) finalParams.lon = lonNum;
      }
      setParams(finalParams);
    }
  }, [data, isLoading, fallbackMode, address, city, lat, lon]);

  if (!data?.result?.length && !isLoading) {
    return null;
  }

  const title = fallbackMode
    ? "Рекомендуемые товары"
    : "Рекомендации по основным вашим просмотрам";

  return (
    <section className="pt-8">
      <div className="container">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg tracking-tight">{title}</h2>
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
              {/* Десктопная версия — сетка */}
              {!isMobile && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {data?.result?.slice(0, 12).map((product: Product, index: number) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      position={index + 1}
                      page={1}
                      isRecommendation={true}
                    />
                  ))}
                </div>
              )}

              {/* Мобильная версия — горизонтальный скролл */}
              {isMobile && (
                <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 scrollbar-hide">
                  {data?.result?.slice(0, 12).map((product: Product, index: number) => (
                    <div key={product.id} className="flex-shrink-0 w-40">
                      <ProductCard
                        {...product}
                        position={index + 1}
                        page={1}
                        isRecommendation={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Кнопка "Все рекомендации" для мобильных — теперь кликабельная */}
        <div className="pt-4 block md:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href={`/products?${searchParams.toString()}`}>
              Все рекомендации
              <ArrowRight width={16} height={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Recommendation;