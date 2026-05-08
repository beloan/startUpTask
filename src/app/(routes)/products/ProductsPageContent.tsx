// app/(routes)/products/ProductsPageContent.tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import React from "react";

import { fetchProducts } from "@/entities/product/api";
import {
  GetProductsDto,
  Product,
  SortBy,
  SortOrder,
} from "@/entities/product/model/types";

import { useProductFilters } from "@/feature/products-filter/hooks/useProductFilters";
import ActiveFilters from "@/feature/products-filter/ui/active-filters";

import { Filter } from "@/widgets/filter";
import ProductsList from "@/widgets/product-list";

import { useCategoryTree } from "@/shared/hooks/useCategory";
import { BreadcrumbsDemo } from "@/shared/ui/breadcrumbs";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

type SortOption = {
  value: string;
  label: string;
  sort_by: SortBy;
  sort_order: SortOrder;
};

const sortOptions: SortOption[] = [
  {
    value: "popular",
    label: "Популярное",
    sort_by: "total_sold",
    sort_order: "desc",
  },
  { value: "new", label: "Новинки", sort_by: "created_at", sort_order: "desc" },
  {
    value: "expensive",
    label: "Дорогие",
    sort_by: "price",
    sort_order: "desc",
  },
  { value: "cheap", label: "Дешевые", sort_by: "price", sort_order: "asc" },
  {
    value: "interesting",
    label: "Интересные",
    sort_by: "rating",
    sort_order: "desc",
  },
];

// Defined outside component to prevent recreation on every render
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const headingVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const toolbarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

function ProductsContent() {
  const { currentSortType, applySort, currentParams } = useProductFilters();
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { data: categoryTreeData } = useCategoryTree(true);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const sellerId = searchParams.get("seller_id");

  const isMounted = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      isMounted.current = true;
      setIsReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const finalParams = useMemo(() => {
    const params = { ...currentParams };
    if (q) {
      params.name = q;
    }
    if (sellerId) {
      params.seller_id = Number(sellerId);
    }
    return params;
  }, [currentParams, sellerId, q]);

  const selectedSort =
    sortOptions.find((opt) => opt.value === currentSortType) || sortOptions[0];

  const listParams: Partial<GetProductsDto> = useMemo(
    () => ({
      ...finalParams,
      sort_by: selectedSort.sort_by,
      sort_order: selectedSort.sort_order,
    }),
    [finalParams, selectedSort.sort_by, selectedSort.sort_order],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["products-infinite", listParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts({
        ...listParams,
        page: pageParam,
        size: 20,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * lastPage.size < lastPage.count) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (data?.pages?.[0]?.count !== undefined) {
      setTotalCount(data.pages[0].count);
    }
  }, [data]);

  const allProducts = useMemo(() => {
    return data?.pages.flatMap((page) => page.result) ?? [];
  }, [data]);

  const sellerMap = useMemo(() => {
    const map: Record<number, string> = {};
    const sellers = data?.pages?.[0]?.sellers;
    if (sellers) {
      sellers.forEach((s) => {
        map[s.id] = s.name;
      });
    }
    return map;
  }, [data]);

  const categoryName = useMemo(() => {
    if (currentParams.category) return currentParams.category;
    if (currentParams.global_category_id && categoryTreeData?.result) {
      const findCategoryById = (categories: any[], id: number): any | null => {
        for (const category of categories) {
          if (category.id === id) return category;
          if (category.children?.length) {
            const found = findCategoryById(category.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      const category = findCategoryById(
        categoryTreeData.result,
        currentParams.global_category_id,
      );
      return category?.name || null;
    }
    return null;
  }, [
    currentParams.category,
    currentParams.global_category_id,
    categoryTreeData,
  ]);

  return (
    <div className="py-2 pb-12">
      <div className="container">
        <BreadcrumbsDemo
          isProduct={false}
          categoryName={categoryName || null}
        />
        <div className="flex flex-col gap-2 md:flex-row md:justify-between">
          <motion.h1
            variants={headingVariants}
            initial="hidden"
            animate={isReady ? "visible" : "hidden"}
            className="text-lg font-medium tracking-tight"
          >
            {q ? `Результаты поиска: "${q}" ` : categoryName || "Категория"}(
            {totalCount !== null ? totalCount : "..."})
          </motion.h1>

          <motion.div
            variants={toolbarVariants}
            initial="hidden"
            animate={isReady ? "visible" : "hidden"}
            className="flex gap-2 pb-4"
          >
            <Select value={currentSortType} onValueChange={applySort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild className="md:hidden">
                <Button variant="outline" className="font-normal">
                  <SlidersHorizontal />
                  Фильтр
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0">
                <DialogTitle></DialogTitle>
                <Filter />
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        <ActiveFilters onFiltersChange={() => {}} sellerMap={sellerMap} />

        <div className="flex pt-4 relative">
          <div className="hidden md:block w-80">
            <Filter />
          </div>

          {/*
           * FIX: Replaced whileInView (broken on back-navigation) with animate.
           * The container was starting at opacity:0 (initial="hidden") and the
           * IntersectionObserver sometimes didn't fire when the element was already
           * fully in the viewport at paint-time, leaving cards invisible until scroll.
           */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isReady ? "visible" : "hidden"}
            className="flex-1"
          >
            <ProductsList
              products={allProducts}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage ?? false}
              fetchNextPage={fetchNextPage}
              error={error}
              totalCount={totalCount}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-2 pb-12">
          <div className="container">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Загрузка...</div>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
