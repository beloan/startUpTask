// widgets/product-list/ui/ProductsList.tsx
"use client";

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { ProductCard } from "@/entities/product/ui";
import { ProductCardSkeleton } from "@/entities/product/ui/product-card-skeleton";
import { Product } from "@/entities/product/model/types";

interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  error: Error | null;
  totalCount: number | null;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
  totalCount,
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "1000px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 text-center py-8">
        <div className="text-red-600 mb-2">Ошибка загрузки продуктов</div>
        <button
          onClick={() => window?.location.reload()}
          className="text-blue-600 hover:underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex-1 text-center py-12">
        <p className="text-gray-500 mb-4">Товары не найдены</p>
        <p className="text-sm text-gray-400">
          Попробуйте изменить параметры фильтрации
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`loader-${index}`}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      )}

      {hasNextPage && <div ref={ref} className="h-10 w-full bg-transparent" />}
    </div>
  );
};

export default ProductsList;