"use client";

import { Star, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { useMarketplaceFilters } from "@/shared/hooks/useProductFilters";
import { useCategoryTree } from "@/shared/hooks/useCategory";
import { Button } from "@/shared/ui/kit/button";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/kit/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { Separator } from "@/shared/ui/kit/separator";
import { Slider } from "@/shared/ui/kit/slider";
import { FilterSkeleton } from "./skeleton";

export const Filter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Получаем фильтры с бэкенда
  const { data: filters, isLoading: filtersLoading } = useMarketplaceFilters();
  const { data: globalCategoriesData } = useCategoryTree(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Текущие фильтры из URL
  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      min_price: params.has("min_price") ? Number(params.get("min_price")) : undefined,
      max_price: params.has("max_price") ? Number(params.get("max_price")) : undefined,
      rating_from: params.has("rating_from") ? Number(params.get("rating_from")) : undefined,
      rating_to: params.has("rating_to") ? Number(params.get("rating_to")) : undefined,
      category: params.get("category") || undefined,
      manufacturer: params.get("manufacturer") || undefined,
      in_stock: params.get("in_stock") === "true",
      has_photos: params.get("has_photos") === "true",
      seller_id: params.has("seller_id") ? Number(params.get("seller_id")) : undefined,
      global_category_id: params.has("global_category_id") ? Number(params.get("global_category_id")) : undefined,
    };
  }, [searchParams]);

  // Границы цен и рейтингов из API
  const minProductPrice = filters?.min_price ?? 0;
  const maxProductPrice = filters?.max_price ?? 100000;
  const minRating = filters?.min_rating ?? 0;
  const maxRating = filters?.max_rating ?? 5;

  // Локальное состояние для слайдеров
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([minProductPrice, maxProductPrice]);
  const [localRatingRange, setLocalRatingRange] = useState<[number, number]>([minRating, maxRating]);

  // Синхронизация локального состояния с URL
  useEffect(() => {
    setLocalPriceRange([
      currentFilters.min_price ?? minProductPrice,
      currentFilters.max_price ?? maxProductPrice,
    ]);
    setLocalRatingRange([
      currentFilters.rating_from ?? minRating,
      currentFilters.rating_to ?? maxRating,
    ]);
  }, [currentFilters, minProductPrice, maxProductPrice, minRating, maxRating]);

  // Список выбранных категорий (локальные)
  const selectedCategories = useMemo(
    () => (currentFilters.category ? currentFilters.category.split(",") : []),
    [currentFilters.category]
  );

  // Список выбранных производителей
  const selectedManufacturers = useMemo(
    () => (currentFilters.manufacturer ? currentFilters.manufacturer.split(",") : []),
    [currentFilters.manufacturer]
  );

  // Данные из API для отображения списков
  const localCategories = filters?.local_categories || [];
  const manufacturers = filters?.manufacturers || []; // если бэкенд отдаёт manufacturers
  const sellers = filters?.sellers || [];

  // Формирование опций для селекта продавцов
  const sellerOptions = useMemo(
    () => sellers.map((s: any) => ({ value: s.id, label: s.name })),
    [sellers]
  );

  // Обновление URL с debounce
  const updateUrl = useDebouncedCallback(
    (newParams: Record<string, string | number | boolean | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === "" ||
          value === false ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
        } else if (value === true) {
          params.set(key, "true");
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    300
  );

  // Обработчики изменений
  const handlePriceChange = (value: number[]) => {
    const [min, max] = value;
    setLocalPriceRange([min, max]);
    updateUrl({
      min_price: min === minProductPrice ? undefined : min,
      max_price: max === maxProductPrice ? undefined : max,
    });
  };

  const handleRatingChange = (value: number[]) => {
    const [from, to] = value;
    setLocalRatingRange([from, to]);
    updateUrl({
      rating_from: from === minRating ? undefined : from,
      rating_to: to === maxRating ? undefined : to,
    });
  };

  const handleCategoryChange = (values: string[]) => {
    updateUrl({ category: values.length > 0 ? values.join(",") : undefined });
  };

  const handleManufacturerChange = (values: string[]) => {
    updateUrl({ manufacturer: values.length > 0 ? values.join(",") : undefined });
  };

  const handleGlobalCategoryChange = (categoryId: string) => {
    updateUrl({
      global_category_id: categoryId === "all" ? undefined : Number(categoryId),
    });
  };

  const handleSellerChange = (sellerId: string) => {
    updateUrl({
      seller_id: sellerId === "all" ? undefined : Number(sellerId),
    });
  };

  const handleInStockChange = (checked: boolean) => {
    updateUrl({ in_stock: checked });
  };

  const handleHasPhotosChange = (checked: boolean) => {
    updateUrl({ has_photos: checked ? "true" : undefined });
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.has("sort")) {
      params.set("sort", searchParams.get("sort")!);
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Подсчёт активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentFilters.min_price !== undefined || currentFilters.max_price !== undefined) count++;
    if (currentFilters.rating_from !== undefined || currentFilters.rating_to !== undefined) count++;
    if (currentFilters.category) count++;
    if (currentFilters.manufacturer) count++;
    if (currentFilters.in_stock) count++;
    if (currentFilters.global_category_id !== undefined) count++;
    if (currentFilters.has_photos) count++;
    if (currentFilters.seller_id !== undefined) count++;
    return count;
  }, [currentFilters]);

  if (filtersLoading) {
    return <FilterSkeleton />
  }

  return (
    <aside className="md:max-w-2xs w-full md:border border-gray-200 rounded-md md:p-4 h-fit">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="font-medium pb-4 pl-4 md:p-0 leading-4">Фильтр</p>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetFilters}
          className="text-blue-600 hover:text-blue-700"
          disabled={activeFiltersCount === 0}
        >
          Сбросить все
        </Button>
      </div>

      <div className="h-[80dvh] overflow-y-auto md:overflow-y-visible px-4 md:p-0 md:h-auto">
        <div className="text-sm flex flex-col gap-4 pt-4">
          {/* Рейтинг */}
          <div>
            <p className="font-medium">Рейтинг</p>
            <Slider
              className="pt-3"
              value={localRatingRange}
              onValueChange={handleRatingChange}
              min={minRating}
              max={maxRating}
              step={1}
            />
            <ul className="flex justify-between pt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <li key={star} className="flex items-center gap-1">
                  <Star width={12} height={12} fill="gold" color="gold" />
                  <p className="text-xs">{star}</p>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2 text-xs">
              <span>От: {localRatingRange[0].toFixed(1)}</span>
              <span>До: {localRatingRange[1].toFixed(1)}</span>
            </div>
          </div>

          <Separator />

          {/* Цена */}
          <div>
            <div className="flex justify-between items-center">
              <p className="font-medium">Цена</p>
              {(currentFilters.min_price !== undefined || currentFilters.max_price !== undefined) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateUrl({ min_price: undefined, max_price: undefined })}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Сбросить
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <InputGroup className="bg-gray-50">
                <InputGroupAddon>От</InputGroupAddon>
                <InputGroupInput
                  className="h-7"
                  type="number"
                  value={localPriceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) {
                      setLocalPriceRange([Math.max(val, minProductPrice), localPriceRange[1]]);
                    }
                  }}
                  onBlur={() =>
                    updateUrl({
                      min_price: localPriceRange[0] === minProductPrice ? undefined : localPriceRange[0],
                      max_price: localPriceRange[1] === maxProductPrice ? undefined : localPriceRange[1],
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="bg-gray-50">
                <InputGroupAddon>До</InputGroupAddon>
                <InputGroupInput
                  className="h-7"
                  type="number"
                  value={localPriceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) {
                      setLocalPriceRange([localPriceRange[0], Math.min(val, maxProductPrice)]);
                    }
                  }}
                  onBlur={() =>
                    updateUrl({
                      min_price: localPriceRange[0] === minProductPrice ? undefined : localPriceRange[0],
                      max_price: localPriceRange[1] === maxProductPrice ? undefined : localPriceRange[1],
                    })
                  }
                />
              </InputGroup>
            </div>
            <Slider
              className="pt-3"
              value={localPriceRange}
              onValueChange={handlePriceChange}
              min={minProductPrice}
              max={maxProductPrice}
              step={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              Диапазон: {minProductPrice.toLocaleString("ru-RU")}₽ - {maxProductPrice.toLocaleString("ru-RU")}₽
            </div>
          </div>

          <Separator />

          {/* Глобальная категория */}
          {isMounted && globalCategoriesData?.result && globalCategoriesData.result.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Глобальная категория</p>
                  {currentFilters.global_category_id !== undefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateUrl({ global_category_id: undefined })}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="pt-2">
                  <Select
                    value={currentFilters.global_category_id?.toString() || "all"}
                    onValueChange={handleGlobalCategoryChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {globalCategoriesData.result
                        .filter((cat) => !cat.parent_id)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Локальные категории (из API) */}
          {localCategories.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Категории ({localCategories.length})</p>
                  {selectedCategories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategoryChange([])}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2 max-h-40 overflow-y-auto">
                  {localCategories.map((cat: any) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat.name)}
                        onCheckedChange={(checked) => {
                          const newCats = checked
                            ? [...selectedCategories, cat.name]
                            : selectedCategories.filter((c) => c !== cat.name);
                          handleCategoryChange(newCats);
                        }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Производители (если API их отдаёт) */}
          {manufacturers.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Производители ({manufacturers.length})</p>
                  {selectedManufacturers.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManufacturerChange([])}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2 max-h-40 overflow-y-auto">
                  {manufacturers.map((man: any) => (
                    <label
                      key={man.id}
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded"
                    >
                      <Checkbox
                        checked={selectedManufacturers.includes(man.name)}
                        onCheckedChange={(checked) => {
                          const newMans = checked
                            ? [...selectedManufacturers, man.name]
                            : selectedManufacturers.filter((m) => m !== man.name);
                          handleManufacturerChange(newMans);
                        }}
                      />
                      <span className="truncate">{man.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Продавцы */}
          {sellerOptions.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Продавцы ({sellerOptions.length})</p>
                  {currentFilters.seller_id !== undefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSellerChange("all")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="pt-2">
                  <Select
                    value={currentFilters.seller_id?.toString() || "all"}
                    onValueChange={handleSellerChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите продавца" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все продавцы</SelectItem>
                      {sellerOptions.map((seller : any) => (
                        <SelectItem key={seller.value} value={seller.value.toString()}>
                          {seller.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Наличие фото */}
          <div>
            <p className="font-medium">Наличие фото</p>
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={currentFilters.has_photos === true}
                  onCheckedChange={handleHasPhotosChange}
                />
                Только с фото
              </label>
            </div>
          </div>

          {/* Наличие (в наличии) */}
          <div>
            <p className="font-medium">Наличие</p>
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={currentFilters.in_stock === true}
                  onCheckedChange={handleInStockChange}
                />
                Только в наличии
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};