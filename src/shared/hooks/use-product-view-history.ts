// shared/hooks/use-product-view-history.ts
"use client";

import { useCallback, useState, useEffect } from 'react';
import { Product } from '@/entities/product/model/types';

const MAX_VIEWED_ITEMS = 10;
const STORAGE_KEY = 'productViewHistory';

export interface ViewedProduct extends Pick<Product, 
  'id' | 'name' | 'price' | 'images' | 'category_name' | 'manufacturer_name' | 'rating' | 'total_sold'
> {}

export const useProductViewHistory = () => {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadViewedProducts = useCallback(() => {
    if (!isClient) {
      setIsLoading(false);
      return;
    }
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        setViewedProducts(Array.isArray(parsed) ? parsed : []);
      } else {
        setViewedProducts([]);
      }
    } catch (error) {
      setViewedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    loadViewedProducts();
  }, [loadViewedProducts]);

  const addToViewHistory = useCallback((product: Product) => {
    if (!isClient) return;
    
    try {
      const viewedProduct: ViewedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        category_name: product.category_name,
        manufacturer_name: product.manufacturer_name,
        rating: product.rating,
        total_sold: product.total_sold,
      };


      setViewedProducts(prev => {
        const filtered = prev.filter(item => item.id !== product.id);
        const newHistory = [viewedProduct, ...filtered].slice(0, MAX_VIEWED_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
    }
  }, [isClient]);

  const clearHistory = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEY);
    setViewedProducts([]);
  }, []);

  const getRecommendationsParams = useCallback(() => {
    if (isLoading) {
      return null;
    }

    if (viewedProducts.length === 0) {
      return null;
    }


    const categories = viewedProducts
      .map(p => p.category_name)
      .filter((cat): cat is string => !!cat && typeof cat === 'string');

    const prices = viewedProducts
      .map(p => p.price)
      .filter((price): price is number => price != null && price > 0);

    if (prices.length === 0) {
      return null;
    }

    const categoryFrequency: Record<string, number> = {};
    categories.forEach(cat => {
      categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
    });

    const mostFrequentCategory = Object.keys(categoryFrequency).reduce(
      (a, b) => categoryFrequency[a] > categoryFrequency[b] ? a : b,
      ''
    );

    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = avgPrice * 0.3;

    const params = {
      category: mostFrequentCategory || undefined,
      min_price: Math.max(0, Math.floor(avgPrice - priceRange)),
      max_price: Math.ceil(avgPrice + priceRange),
      size: 20,
      sort_by: 'total_sold' as const,
      sort_order: 'desc' as const,
    };

    return params;
  }, [viewedProducts, isLoading]);

  const getViewedProducts = useCallback(() => {
    return viewedProducts;
  }, [viewedProducts]);

  return {
    viewedProducts,
    isLoading,
    addToViewHistory,
    clearHistory,
    getRecommendationsParams,
    getViewedProducts,
  };
};