"use client";

import { Search, Filter, ChevronDown, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { useInView } from "react-intersection-observer";

import { ProductCard } from "@/entities/product";
import { ProductCardSkeleton } from "@/entities/product/ui/product-card-skeleton";

import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Badge } from "@/shared/ui/kit/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

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
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: category,
    minPrice: minPrice,
    maxPrice: maxPrice,
    inStock: false,
    ratingFrom: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer для триггера загрузки следующей страницы
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    setFilters({
      category: category,
      minPrice: minPrice,
      maxPrice: maxPrice,
      inStock: false,
      ratingFrom: 0,
    });
  }, [category, minPrice, maxPrice]);

  const sortOptions = [
    { value: "price_desc", label: "Дороже" },
    { value: "price_asc", label: "Дешевле" },
    { value: "total_sold", label: "Популярное" },
    { value: "newest", label: "Новое" },
  ];

  // Сброс и загрузка при изменении параметров поиска
  useEffect(() => {
    if (query) {
      setPage(1);
      setProducts([]);
      searchProducts();
      loadCategories();
    }
  }, [query, category, minPrice, maxPrice, sortBy]);

  // Загрузка следующей страницы при изменении номера страницы
  useEffect(() => {
    if (query && page > 1) {
      searchProducts();
    }
  }, [page]);

  // Автоматическая подгрузка при достижении триггера
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const loadCategories = async () => {
    try {
      const response = await fetch(
        "https://app.tablecrm.com/api/v1/mp/categories/"
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.result?.map((cat: any) => cat.name) || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const filterProductsByQuery = (products: any[], query: string) => {
    if (!query.trim()) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category_name?.toLowerCase().includes(lowerQuery) ||
        product.manufacturer_name?.toLowerCase().includes(lowerQuery)
    );
  };

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
        `https://app.tablecrm.com/api/v1/mp/products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let newProducts = data.result || [];

      if (query) {
        newProducts = filterProductsByQuery(newProducts, query);
      }

      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => {
          const combined = [...prev, ...newProducts];
          return query ? filterProductsByQuery(combined, query) : combined;
        });
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

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const urlParams: any = { q: query };
    if (newFilters.category) urlParams.category = newFilters.category;
    if (newFilters.minPrice) urlParams.min_price = newFilters.minPrice;
    if (newFilters.maxPrice) urlParams.max_price = newFilters.maxPrice;
    if (sortBy !== "relevance") urlParams.sort_by = sortBy;

    updateUrl(urlParams);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      ratingFrom: 0,
    });
    updateUrl({ q: query });
    setPage(1);
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
        <div className="lg:w-64 space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-lg">Фильтры</h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Сбросить
                </Button>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2 text-gray-700">Категория</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-800 truncate">
                      {filters.category || "Все категории"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-52 max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md"
                  align="start"
                >
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("category", "")}
                    className="flex items-center px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`flex items-center w-full ${
                        !filters.category
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span>Все категории</span>
                    </div>
                  </DropdownMenuItem>

                  <div className="border-t border-gray-100 my-1" />

                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => handleFilterChange("category", cat)}
                      className="flex items-center px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`flex items-center w-full ${
                          filters.category === cat
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}

                  {categories.length === 0 && (
                    <div className="px-3 py-3 text-center">
                      <p className="text-gray-400 text-sm">Нет категорий</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Цена</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="От"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="До"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
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
                      onClick={() => handleFilterChange("category", "")}
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
                        handleFilterChange("minPrice", "");
                        handleFilterChange("maxPrice", "");
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
            // Скелетоны при первой загрузке
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Список товаров без анимации */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-5">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {/* Скелетоны подгрузки следующей страницы */}
              {loading && page > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={`loader-${i}`} />
                  ))}
                </div>
              )}

              {/* Триггер для бесконечной прокрутки */}
              {hasMore && !loading && (
                <div ref={loadMoreRef} className="h-10 w-full" />
              )}
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