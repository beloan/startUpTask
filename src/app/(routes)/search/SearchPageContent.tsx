"use client";

import {Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { ProductCard } from "@/entities/product";
import { ProductCardSkeleton } from "@/entities/product/ui/product-card-skeleton";

import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { Filter } from "@/widgets/filter";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const sortBy = searchParams.get("sort_by") || "relevance";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const sellerId = searchParams.get("seller_id") || "";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "1000px",
  });

  
  useEffect(() => {
    if (query) {
      setPage(1);
      setProducts([]);
      searchProducts();
    }
  }, [query, category, minPrice, maxPrice, sortBy, address, city, sellerId, lat, lon]);

  
  useEffect(() => {
    if (query && page > 1) {
      searchProducts();
    }
  }, [page]);

  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const sortOptions = [
    { value: "price_desc", label: "Дороже" },
    { value: "price_asc", label: "Дешевле" },
    { value: "total_sold", label: "Популярное" },
    { value: "newest", label: "Новое" },
  ];

  const clearSearch = () => {
    setSearchInput("");
    router.push("/search");
  };

  const searchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "20",
      });

      if (query) {
        params.append("name", query);
      }

      if (category) {
        params.append("category", category);
      }

      if (minPrice) {
        params.append("min_price", minPrice);
      }

      if (maxPrice) {
        params.append("max_price", maxPrice);
      }

      switch (sortBy) {
        case "price_asc":
          params.append("sort_by", "price");
          params.append("sort_order", "asc");
          break;
        case "price_desc":
          params.append("sort_by", "price");
          params.append("sort_order", "desc");
          break;
        case "total_sold":
          params.append("sort_by", "total_sold");
          params.append("sort_order", "desc");
          break;
        case "newest":
          params.append("sort_by", "created_at");
          params.append("sort_order", "desc");
          break;
      }

      if (address) {
        params.append("address", address);
      } else if (city) {
        params.append("city", city);
      }

      if (sellerId) {
        params.append("seller_id", sellerId);
      }

      if (lat) {
        params.append("lat", lat);
      } else if (typeof window !== "undefined") {
        try {
          const detected = sessionStorage.getItem("detected_city");
          if (detected) {
            const parsed = JSON.parse(detected);
            if (parsed.lat != null) {
              params.append("lat", String(parsed.lat));
            }
          }
        } catch (e) {}
      }

      if (lon) {
        params.append("lon", lon);
      } else if (typeof window !== "undefined") {
        try {
          const detected = sessionStorage.getItem("detected_city");
          if (detected) {
            const parsed = JSON.parse(detected);
            if (parsed.lon != null) {
              params.append("lon", String(parsed.lon));
            }
          }
        } catch (e) {}
      }

      const response = await fetch(
        `https://app.tablecrm.com/api/v1/mp/products?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let newProducts = data.result || [];

      
      
      
      

      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      setTotalResults((prev) => {
        if (page === 1) {
          return newProducts.length;
        } else {
          return prev + newProducts.length;
        }
      });

      setHasMore((data.result?.length || 0) >= 20);
    } catch (error) {
      console.error("Ошибка поиска товаров:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      updateUrl({ q: searchInput.trim(), page: "1" });
      setPage(1);
    }
  };

  const handleSortChange = (value: string) => {
    updateUrl({ sort_by: value, q: query });
    setPage(1);
  };

  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();

    if (params.q) {
      newParams.set("q", params.q);
    } else if (query) {
      newParams.set("q", query);
    }

    Object.keys(params).forEach((key) => {
      if (key !== "q" && params[key]) {
        newParams.set(key, params[key]);
      }
    });

    router.push(`/search?${newParams.toString()}`);
  };

  const handleClearFilters = () => {
    
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setPage(1);
  };

  
  const { minProductPrice, maxProductPrice, uniqueCategories, uniqueManufacturers, uniqueSellers } = useMemo(() => {
    const prices = products.filter(p => p.price != null && p.price > 0).map(p => p.price);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 10000;

    const cats = products.map(p => p.category_name || p.category).filter(Boolean);
    const mans = products.map(p => p.manufacturer_name || p.manufacturer).filter(Boolean);
    const sellers = products.map(p => p.seller_name).filter(Boolean);

    return {
      minProductPrice: min,
      maxProductPrice: max,
      uniqueCategories: Array.from(new Set(cats)),
      uniqueManufacturers: Array.from(new Set(mans)),
      uniqueSellers: Array.from(new Set(sellers)),
    };
  }, [products]);

  const hasActiveFilters = category || minPrice || maxPrice;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {query ? `Результаты поиска: "${query}"` : "Поиск товаров"}
        </h1>
        {totalResults > 0 && (
          <p className="text-gray-600 mt-2">Найдено {totalResults} товаров</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Левая колонка с фильтром */}
        <div className="lg:w-80 space-y-4">
          <Filter
            products={products}
            initialMinPrice={minProductPrice}
            initialMaxPrice={maxProductPrice}
            categories={uniqueCategories}
            manufacturers={uniqueManufacturers}
            sellers={uniqueSellers}
          />
        </div>

        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 w-full sm:max-w-md"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-4 w-full"
                  />
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
                  >
                    <X className="w-4 h-4 cursor-pointer" />
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортировка:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Выберите сортировку" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {category && (
                  <Badge variant="secondary" className="gap-1">
                    Категория: {category}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("category");
                        router.push(`/search?${params.toString()}`);
                        setPage(1);
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="gap-1">
                    Цена: {minPrice || "0"} - {maxPrice || "∞"}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("min_price");
                        params.delete("max_price");
                        router.push(`/search?${params.toString()}`);
                        setPage(1);
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {loading && page === 1 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-5">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {loading && page > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={`loader-${i}`} />
                  ))}
                </div>
              )}

              {hasMore && !loading && <div ref={ref} className="h-10 w-full" />}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                {query ? "Ничего не найдено" : "Введите поисковый запрос"}
              </h3>
              <p className="text-gray-600 mb-6">
                {query
                  ? "Попробуйте изменить запрос или использовать другие фильтры"
                  : "Найдите товары по названию, категории или производителю"}
              </p>
              {query && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="cursor-pointer"
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}