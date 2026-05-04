"use client";

import { Clock8, Flame, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";

import { fetchProducts } from "@/entities/product/api";

import { transformImageUrl } from "@/shared/lib/image-utils";
import { Badge } from "@/shared/ui/kit/badge";
import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category_name?: string;
  manufacturer_name?: string;
}

interface SearchResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface SearchSuggestionsProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: () => void;
  onClose: () => void;
  onSelect?: () => void;
  onSuggestionSearch: (query: string) => void;
}

export const SearchSuggestions = ({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onClose,
  onSelect,
  onSuggestionSearch,
}: SearchSuggestionsProps) => {
  const [searchResults, setSearchResults] = useState<SearchResult>({
    products: [],
    loading: false,
    error: null,
  });
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loadingPopular, setLoadingPopular] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allPopularQueries = useMemo(
    () => [
      "iPhone 14", "iPhone 15", "Apple MacBook Pro", "MacBook Air",
      "AirPods Pro", "AirPods Max", "Samsung Galaxy S23", "Samsung Galaxy Z Fold",
      "Ноутбуки", "Игровые ноутбуки", "Смартфоны", "Планшеты", "Наушники",
      "Телевизоры", "Холодильники", "Стиральные машины", "Пылесосы",
      "Микроволновки", "Кофемашины", "Электросамокаты", "Смарт-часы",
      "Фитнес-браслеты", "Игровые приставки", "PlayStation 5", "Xbox Series X",
      "Видеокарты", "Процессоры", "Мониторы", "Клавиатуры", "Мышки",
      "Коврики для мыши", "Веб-камеры", "Колонки", "Зарядные устройства",
      "Power Bank", "Чехлы для телефона", "Защитные стекла", "Кабели USB-C",
    ],
    [],
  );

  const randomPopularQueries = useMemo(() => {
    const shuffled = [...allPopularQueries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [allPopularQueries]);

  // Загрузка популярных товаров
  useEffect(() => {
    if (!isClient) return;
    const load = async () => {
      setLoadingPopular(true);
      try {
        const detected = typeof window !== "undefined"
          ? sessionStorage.getItem("detected_city")
          : null;
        const parsed = detected ? JSON.parse(detected) : null;
        const data = await fetchProducts({
          size: 6,
          sort_by: "total_sold",
          sort_order: "desc",
          lat: parsed?.lat,
          lon: parsed?.lon,
          apply_radius_filter: true,
          radius_km: 20,
        });
        setPopularProducts(data.result || []);
      } catch (error) {
        console.error("Ошибка загрузки популярных товаров:", error);
      } finally {
        setLoadingPopular(false);
      }
    };
    load();
  }, [isClient]);

  // Загрузка истории и недавно просмотренных
  useEffect(() => {
    if (!isClient) return;
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
    const savedRecentlyViewed = localStorage.getItem("productViewHistory");
    if (savedRecentlyViewed) {
      try {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      } catch (e) {}
    }
  }, [isClient]);

  const saveToRecentlyViewed = (product: Product) => {
    if (typeof window === "undefined") return;
    const updatedViewed = [
      product,
      ...recentlyViewed.filter((item) => item.id !== product.id),
    ].slice(0, 6);
    setRecentlyViewed(updatedViewed);
    localStorage.setItem("productViewHistory", JSON.stringify(updatedViewed));
  };

  const performSearch = useCallback(async (query: string) => {
    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearchResults((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const detected = typeof window !== "undefined"
        ? sessionStorage.getItem("detected_city")
        : null;
      const parsed = detected ? JSON.parse(detected) : null;

      const data = await fetchProducts({
        size: 20,
        sort_by: "name",
        sort_order: "desc",
        name: query.trim() || undefined,
        lat: parsed?.lat,
        lon: parsed?.lon,
        apply_radius_filter: true,
        radius_km: 20,
      });
      if (controller.signal.aborted) return;
      const products = data.result || [];
      setSearchResults({
        products: products.slice(0, 10),
        loading: false,
        error: null,
      });
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Ошибка поиска товаров:", error);
      setSearchResults({
        products: [],
        loading: false,
        error: "Ошибка при поиске товаров. Попробуйте позже.",
      });
    }
  }, []);

  // Debounce ввода
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], loading: false, error: null });
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, performSearch]);

  const handleHistoryClick = (query: string) => {
    onSuggestionSearch(query);
    onClose();
    if (onSelect) onSelect();
  };

  const handlePopularQueryClick = (query: string) => {
    onSuggestionSearch(query);
    onClose();
    if (onSelect) onSelect();
  };

  const handleProductClick = (product: Product) => {
    saveToRecentlyViewed(product);
    onClose();
    if (onSelect) onSelect();
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-3xl shadow-lg">
      {searchQuery && (
        <>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium tracking-tight">
                Результаты поиска &quot;{searchQuery}&quot;
              </p>
              {searchResults.loading && (
                <div className="text-sm text-gray-500">Поиск...</div>
              )}
            </div>

            {searchResults.error ? (
              <div className="text-red-500 text-sm py-2">
                {searchResults.error}
              </div>
            ) : searchResults.loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                ))}
              </div>
            ) : searchResults.products.length > 0 ? (
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.id}`}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={
                              product.images?.[0]
                                ? transformImageUrl(product.images[0])
                                : undefined
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center">
                            Нет фото
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-blue-600">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {product.manufacturer_name || product.category_name}
                        </p>
                      </div>
                      <div className="text-sm font-semibold">
                        ₽{product.price}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-center py-4">
                По запросу &quot;{searchQuery}&quot; ничего не найдено
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {!searchQuery && (
        <>
          <div className="p-4">
            <div className="flex items-center gap-1 mb-2">
              <p className="font-medium tracking-tight">Популярные запросы</p>
              <Flame width={16} height={16} className="text-amber-400" />
            </div>
            <div className="flex gap-1 pt-2 flex-wrap">
              {randomPopularQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularQueryClick(query)}
                  className="inline-flex items-center"
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    {query}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {searchHistory.length > 0 && !searchQuery && (
        <>
          <div className="pt-4">
            <div className="px-4">
              <p className="font-medium tracking-tight">История поиска</p>
            </div>
            <ul className="pt-2 flex flex-col">
              {searchHistory.slice(0, 7).map((query, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleHistoryClick(query)}
                    className="flex items-center gap-3 px-4 cursor-pointer hover:bg-gray-100 py-2 w-full text-left"
                  >
                    <Clock8 className="text-gray-400" width={16} height={16} />
                    <p className="tracking-tight text-sm truncate">{query}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
        </>
      )}

      {!searchQuery && (
        <div className="p-4 w-full">
          <p className="font-medium tracking-tight">Популярные товары</p>
          <div className="grid grid-cols-6 gap-2 pt-4">
            {loadingPopular ? (
              <div className="col-span-6 gap-2 flex justify-between py-12 mx-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : popularProducts.length > 0 ? (
              popularProducts.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => handleProductClick(product)}
                  className="rounded-md hover:bg-gray-100 p-2 hover:ring-1 hover:ring-gray-100 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-md bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img
                        src={
                          product.images?.[0]
                            ? transformImageUrl(product.images[0])
                            : undefined
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">Нет фото</div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate w-full">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.price.toLocaleString("ru-RU")}₽
                  </p>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-4">
                Нет популярных товаров
              </div>
            )}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && !searchQuery && (
        <>
          <Separator />
          <div className="p-4">
            <p className="font-medium tracking-tight">Недавно просмотренные</p>
            <div className="grid grid-cols-6 gap-2 pt-4">
              {recentlyViewed.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => handleProductClick(product)}
                  className="rounded-md hover:bg-gray-100 p-2 hover:ring-1 hover:ring-gray-100 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-md bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img
                        src={
                          product.images?.[0]
                            ? transformImageUrl(product.images[0])
                            : undefined
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">Нет фото</div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate w-full">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.price.toLocaleString("ru-RU")}₽
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};