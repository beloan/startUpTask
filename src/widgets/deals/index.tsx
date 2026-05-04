"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Product, useProducts, fetchProducts } from '@/entities/product';
import { ProductCard } from '@/entities/product';
import { ProductCardSkeleton } from '@/entities/product/ui/product-card-skeleton';
import { Button } from '@/shared/ui/kit/button';

type DealsSortMode = 'latest' | 'rating';

const getSortParams = (mode: DealsSortMode) =>
  mode === 'rating'
    ? { sort_by: 'rating' as const, sort_order: 'desc' as const }
    : { sort_by: 'created_at' as const, sort_order: 'desc' as const };

export const Deals = () => {
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const sortMode: DealsSortMode = 'latest';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sellerId = searchParams.get('seller_id');
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const sellerParams = useMemo(() => {
    const baseParams: any = {
      size: 1,
      sort_by: 'total_sold' as const,
      sort_order: 'desc' as const,
    };
    if (address) baseParams.address = address;
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
  }, [address, sellerId, lat, lon]);

  const { data: sellerData } = useQuery({
    queryKey: ["products", "seller_check", sellerParams],
    queryFn: () => fetchProducts(sellerParams),
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000,
  });

  const hasSellerProducts = sellerData && sellerData.count > 0 && sellerData.result?.length > 0;

  const params = useMemo(() => {
    const sortParams = getSortParams(sortMode);
    const baseParams: any = {
      size: 20,
      sort_by: sortParams.sort_by,
      sort_order: sortParams.sort_order,
    };
    if (address) baseParams.address = address;
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
  }, [address, sellerId, hasSellerProducts, lat, lon, sortMode]);

  const { data, isLoading } = useProducts(params);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-medium text-lg tracking-tight"
          >
            Лучшие предложения для вас
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="outline" className="hidden md:flex cursor-pointer" asChild>
              <Link href={`/products?${searchParams.toString()}`}>
                Все предложения
                <ArrowRight width={16} height={16} className="inline ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="pt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCardSkeleton />
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              {!isMobile && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
                >
                  {data?.result?.slice(0, 12).map((product: Product, index: number) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 scrollbar-hide"
                >
                  {data?.result?.slice(0, 12).map((product: Product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex-shrink-0 w-40"
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>

        <div className="md:hidden pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="outline" asChild className="w-full">
              <Link href={`/products?${searchParams.toString()}`}>
                Все предложения
                <ArrowRight width={16} height={16} className="ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Deals;