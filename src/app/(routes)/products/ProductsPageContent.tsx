// app/(routes)/products/ProductsPageContent.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
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

function ProductsContent() {
  const { currentSortType, applySort, currentParams } = useProductFilters();
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { data: categoryTreeData } = useCategoryTree(true);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const sellerId = searchParams.get("seller_id");
  const address = searchParams.get("address");
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", finalParams],
    queryFn: () =>
      fetchProducts({
        ...finalParams,
        page: 1,
        size: 100,
      }),
  });
  const firstPage = (productsData as any)?.pages?.[0] || productsData;
  const products = firstPage?.result || [];
  const sellers = firstPage?.sellers || [];

  const sellerOptions = useMemo(() => {
    return sellers.map((s: any) => ({ value: s.id, label: s.name }));
  }, [sellers]);

  const selectedSort =
    sortOptions.find((opt) => opt.value === currentSortType) || sortOptions[0];

  const listParams: Partial<GetProductsDto> = {
    ...finalParams,
    sort_by: selectedSort.sort_by,
    sort_order: selectedSort.sort_order,
  };

  const categoryName = useMemo(() => {
    if (currentParams.category) {
      return currentParams.category;
    }
    if (currentParams.global_category_id && categoryTreeData?.result) {
      const findCategoryById = (categories: any[], id: number): any | null => {
        for (const category of categories) {
          if (category.id === id) {
            return category;
          }
          if (category.children && category.children.length > 0) {
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

  const { minPrice, maxPrice, categories, manufacturers } = useMemo(() => {
    const productsWithPrice = products.filter((p: Product) => p.price != null);

    const min =
      productsWithPrice.length > 0
        ? Math.min(...productsWithPrice.map((p: Product) => p.price))
        : 0;

    const max =
      productsWithPrice.length > 0
        ? Math.max(...productsWithPrice.map((p: Product) => p.price))
        : 10000;

    const uniqueCategories = Array.from(
      new Set(
        products
          .filter((p: Product) => p.category_name)
          .map((p: Product) => p.category_name as string)
          .filter(Boolean),
      ),
    );

    const uniqueManufacturers = Array.from(
      new Set(
        products
          .filter((p: Product) => p.manufacturer_name)
          .map((p: Product) => p.manufacturer_name as string)
          .filter(Boolean),
      ),
    );

    return {
      minPrice: min,
      maxPrice: max,
      categories: uniqueCategories as string[],
      manufacturers: uniqueManufacturers as string[],
    };
  }, [products]);

  return (
    <div className="py-2 pb-12">
      <div className="container">
        <BreadcrumbsDemo
          isProduct={false}
          categoryName={categoryName || null}
        />
        <div className="flex flex-col gap-2 md:flex-row md:justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-lg font-medium tracking-tight"
          >
            {q ? `Результаты поиска: "${q}" ` : categoryName || "Категория"}(
            {totalCount !== null ? totalCount : "..."})
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
                <Filter
                  products={products}
                  initialMinPrice={minPrice}
                  initialMaxPrice={maxPrice}
                  categories={categories}
                  manufacturers={manufacturers}
                  sellerOptions={sellerOptions}
                />
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
        <ActiveFilters onFiltersChange={() => {}} />
        <div className="flex pt-4 relative">
          <div className="hidden md:block w-80">
            <Filter
              products={products}
              initialMinPrice={minPrice}
              initialMaxPrice={maxPrice}
              categories={categories}
              manufacturers={manufacturers}
              sellerOptions={sellerOptions}
            />
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex-1"
          >
            <ProductsList
              params={listParams}
              onTotalCountChange={setTotalCount}
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