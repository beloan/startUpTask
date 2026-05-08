// app/product/[id]/client-product-page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AddToCart } from "@/feature/add-to-cart";
import { useProductViewHistory } from '@/shared/hooks/use-product-view-history';
import { useProduct } from '@/entities/product';

interface ClientProductPageProps {
  product: any;
  addToCartProps: {
    productId: number;
    unitName: string;
    initialPrice: number;
    initialName: string;
    initialImages: string[];
    quantity?: number
  };
}

export function ClientProductPage({ product, addToCartProps }: ClientProductPageProps) {
  const { addToViewHistory } = useProductViewHistory();
  const searchParams = useSearchParams();
  
  
  const latFromUrl = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
  const lonFromUrl = searchParams.get('lon') ? Number(searchParams.get('lon')) : undefined;
  const addressFromUrl = searchParams.get('address') || undefined;
  const cityFromUrl = searchParams.get('city') || undefined;
  
  
  const [detectedCoords, setDetectedCoords] = useState<{ lat?: number; lon?: number } | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !latFromUrl && !lonFromUrl) {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null && parsed.lon != null) {
            setDetectedCoords({ lat: parsed.lat, lon: parsed.lon });
          }
        }
      } catch (e) {
        
      }
    }
    
    
    const handleDetectedCityUpdated = () => {
      try {
        const detected = sessionStorage.getItem('detected_city');
        if (detected) {
          const parsed = JSON.parse(detected);
          if (parsed.lat != null && parsed.lon != null) {
            setDetectedCoords({ lat: parsed.lat, lon: parsed.lon });
          }
        }
      } catch (e) {
        
      }
    };
    
    window.addEventListener('detectedCityUpdated', handleDetectedCityUpdated as EventListener);
    return () => {
      window.removeEventListener('detectedCityUpdated', handleDetectedCityUpdated as EventListener);
    };
  }, [latFromUrl, lonFromUrl]);
  
  
  const lat = latFromUrl ?? detectedCoords?.lat;
  const lon = lonFromUrl ?? detectedCoords?.lon;
  
  
  const { data: updatedProduct } = useProduct({
    product_id: addToCartProps.productId,
    lat,
    lon,
    address: addressFromUrl,
    city: cityFromUrl,
  });

  useEffect(() => {
    if (product) {
      addToViewHistory(product);
    }
  }, [product, addToViewHistory]);

  
  const currentPrice = updatedProduct?.price ?? addToCartProps.initialPrice;

  const addToCartPropsWithQuantity = {
    ...addToCartProps,
    initialPrice: currentPrice,
    quantity: addToCartProps.quantity || 1,
  };

  return <AddToCart {...addToCartPropsWithQuantity} />;
}