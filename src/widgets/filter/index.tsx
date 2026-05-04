// widget/filter.tsx
"use client";

import { Star, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

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

interface FilterProps {
  products?: any[];
  initialMinPrice?: number;
  initialMaxPrice?: number;
  categories?: string[];
  manufacturers?: string[];
  sellerOptions?: { value: number; label: string }[];
}

export const Filter = ({
  products = [],
  initialMinPrice = 0,
  initialMaxPrice = 100000,
  categories: externalCategories,
  manufacturers: externalManufacturers,
  sellerOptions = [],
}: FilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: globalCategoriesData } = useCategoryTree(true);

  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());

    return {
      min_price: params.has("min_price")
        ? Number(params.get("min_price"))
        : undefined,
      max_price: params.has("max_price")
        ? Number(params.get("max_price"))
        : undefined,
      rating_from: params.has("rating_from")
        ? Number(params.get("rating_from"))
        : undefined,
      rating_to: params.has("rating_to")
        ? Number(params.get("rating_to"))
        : undefined,
      category: params.get("category") || undefined,
      manufacturer: params.get("manufacturer") || undefined,
      in_stock: params.get("in_stock") === "true",
      has_photos: params.get("has_photos") === "true",
      seller_id: params.has("seller_id")
        ? Number(params.get("seller_id"))
        : undefined,
      global_category_id: params.has("global_category_id")
        ? Number(params.get("global_category_id"))
        : undefined,
      section: params.get("section") || undefined,
      realty_type: params.get("realty_type") || undefined,
      deal_type: params.get("deal_type") || undefined,
      rooms_count: params.has("rooms_count")
        ? Number(params.get("rooms_count"))
        : undefined,
    };
  }, [searchParams]);

  const { minProductPrice, maxProductPrice } = useMemo(() => {
    if (!products.length)
      return {
        minProductPrice: initialMinPrice,
        maxProductPrice: initialMaxPrice,
      };

    const prices = products
      .filter((p) => p.price != null && p.price > 0)
      .map((p) => p.price);
    if (!prices.length)
      return {
        minProductPrice: initialMinPrice,
        maxProductPrice: initialMaxPrice,
      };

    return {
      minProductPrice: Math.min(...prices),
      maxProductPrice: Math.max(...prices),
    };
  }, [products, initialMinPrice, initialMaxPrice]);

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    minProductPrice,
    maxProductPrice,
  ]);
  const [localRatingRange, setLocalRatingRange] = useState<[number, number]>([
    0, 5,
  ]);

  useEffect(() => {
    setLocalPriceRange([
      currentFilters.min_price ?? minProductPrice,
      currentFilters.max_price ?? maxProductPrice,
    ]);

    setLocalRatingRange([
      currentFilters.rating_from ?? 0,
      currentFilters.rating_to ?? 5,
    ]);
  }, [currentFilters, minProductPrice, maxProductPrice]);

  const selectedCategories = useMemo(
    () => (currentFilters.category ? currentFilters.category.split(",") : []),
    [currentFilters.category],
  );

  const selectedManufacturers = useMemo(
    () =>
      currentFilters.manufacturer ? currentFilters.manufacturer.split(",") : [],
    [currentFilters.manufacturer],
  );

  const uniqueCategories = useMemo(() => {
    if (externalCategories && externalCategories.length > 0)
      return externalCategories;
    const cats = products
      .map((p) => p.category_name || p.category)
      .filter(Boolean);
    return Array.from(new Set(cats));
  }, [products, externalCategories]);

  const uniqueManufacturers = useMemo(() => {
    if (externalManufacturers && externalManufacturers.length > 0)
      return externalManufacturers;
    const mans = products
      .map((p) => p.manufacturer_name || p.manufacturer)
      .filter(Boolean);
    return Array.from(new Set(mans));
  }, [products, externalManufacturers]);

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

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    300,
  );

  const handlePriceChange = (value: number[]) => {
    const [min, max] = value;
    setLocalPriceRange([min, max]);
    updateUrl({
      min_price: min === minProductPrice ? undefined : min,
      max_price: max === maxProductPrice ? undefined : max,
    });
  };

  const handleHasPhotosChange = (checked: boolean) => {
    updateUrl({ has_photos: checked ? "true" : undefined });
  };

  const handlePriceInputBlur = () => {
    updateUrl({
      min_price:
        localPriceRange[0] === minProductPrice ? undefined : localPriceRange[0],
      max_price:
        localPriceRange[1] === maxProductPrice ? undefined : localPriceRange[1],
    });
  };

  const handleRatingChange = (value: number[]) => {
    const [from, to] = value;
    setLocalRatingRange([from, to]);
    updateUrl({
      rating_from: from === 0 ? undefined : from,
      rating_to: to === 5 ? undefined : to,
    });
  };

  const handleCategoryChange = (values: string[]) => {
    updateUrl({ category: values.length > 0 ? values.join(",") : undefined });
  };

  const handleManufacturerChange = (values: string[]) => {
    updateUrl({
      manufacturer: values.length > 0 ? values.join(",") : undefined,
    });
  };

  const handleInStockChange = (checked: boolean) => {
    updateUrl({ in_stock: checked });
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

  const handleSectionChange = (section: string) => {
    updateUrl({ section: section === "all" ? undefined : section });
  };

  const handleRealtyTypeChange = (realtyType: string) => {
    updateUrl({ realty_type: realtyType === "all" ? undefined : realtyType });
  };

  const handleDealTypeChange = (dealType: string) => {
    updateUrl({ deal_type: dealType === "all" ? undefined : dealType });
  };

  const handleRoomsCountChange = (roomsCount: string) => {
    updateUrl({ rooms_count: roomsCount === "all" ? undefined : Number(roomsCount) });
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.has("sort")) {
      params.set("sort", searchParams.get("sort")!);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (
      currentFilters.min_price !== undefined ||
      currentFilters.max_price !== undefined
    )
      count++;
    if (
      currentFilters.rating_from !== undefined ||
      currentFilters.rating_to !== undefined
    )
      count++;
    if (currentFilters.category) count++;
    if (currentFilters.manufacturer) count++;
    if (currentFilters.in_stock) count++;
    if (currentFilters.global_category_id !== undefined) count++;
    if (currentFilters.has_photos) count++;
    if (currentFilters.seller_id !== undefined) count++;
    if (currentFilters.section) count++;
    if (currentFilters.realty_type) count++;
    if (currentFilters.deal_type) count++;
    if (currentFilters.rooms_count !== undefined) count++;
    return count;
  }, [currentFilters]);

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
          <div>
            <p className="font-medium">Рейтинг</p>
            <Slider
              className="pt-3"
              value={localRatingRange}
              onValueChange={handleRatingChange}
              min={0}
              max={5}
              step={0.5}
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

          <div>
            <div className="flex justify-between items-center">
              <p className="font-medium">Цена</p>
              {currentFilters.min_price !== undefined ||
              currentFilters.max_price !== undefined ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateUrl({ min_price: undefined, max_price: undefined })
                  }
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Сбросить
                </Button>
              ) : null}
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
                      setLocalPriceRange([
                        Math.max(val, minProductPrice),
                        localPriceRange[1],
                      ]);
                    }
                  }}
                  onBlur={handlePriceInputBlur}
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
                      setLocalPriceRange([
                        localPriceRange[0],
                        Math.min(val, maxProductPrice),
                      ]);
                    }
                  }}
                  onBlur={handlePriceInputBlur}
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
              Диапазон: {minProductPrice.toLocaleString("ru-RU")}₽ -{" "}
              {maxProductPrice.toLocaleString("ru-RU")}₽
            </div>
          </div>

          <Separator />

          {isMounted &&
            globalCategoriesData?.result &&
            globalCategoriesData.result.length > 0 && (
              <>
                <div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Глобальная категория</p>
                    {currentFilters.global_category_id !== undefined ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateUrl({ global_category_id: undefined })
                        }
                        className="h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Сбросить
                      </Button>
                    ) : null}
                  </div>
                  <div className="pt-2">
                    <Select
                      value={
                        currentFilters.global_category_id?.toString() || "all"
                      }
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
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
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

          {uniqueCategories.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    Категории ({uniqueCategories.length})
                  </p>
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
                  {uniqueCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          const newCats = checked
                            ? [...selectedCategories, category]
                            : selectedCategories.filter((c) => c !== category);
                          handleCategoryChange(newCats);
                        }}
                      />
                      <span className="truncate">{category}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {
                          products.filter(
                            (p) => (p.category_name || p.category) === category,
                          ).length
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {uniqueManufacturers.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    Производители ({uniqueManufacturers.length})
                  </p>
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
                  {uniqueManufacturers.map((manufacturer) => (
                    <label
                      key={manufacturer}
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded"
                    >
                      <Checkbox
                        checked={selectedManufacturers.includes(manufacturer)}
                        onCheckedChange={(checked) => {
                          const newMans = checked
                            ? [...selectedManufacturers, manufacturer]
                            : selectedManufacturers.filter(
                                (m) => m !== manufacturer,
                              );
                          handleManufacturerChange(newMans);
                        }}
                      />
                      <span className="truncate">{manufacturer}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {
                          products.filter(
                            (p) =>
                              (p.manufacturer_name || p.manufacturer) ===
                              manufacturer,
                          ).length
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {sellerOptions.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    Продавцы ({sellerOptions.length})
                  </p>
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
                      <SelectValue placeholder="Выберите продавца" className="cursor-pointer"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">Все продавцы</SelectItem>
                      {sellerOptions.map((seller) => (
                        <SelectItem key={seller.value} value={seller.value.toString()} className="cursor-pointer">
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

          <>
            <div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Раздел</p>
                {currentFilters.section !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionChange("all")}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Сбросить
                  </Button>
                )}
              </div>
              <div className="pt-2">
                <Select
                  value={currentFilters.section || "all"}
                  onValueChange={handleSectionChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите раздел" className="cursor-pointer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">Все разделы</SelectItem>
                    <SelectItem value="realty" className="cursor-pointer">Недвижимость</SelectItem>
                    <SelectItem value="products" className="cursor-pointer">Товары</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
          </>

          {(currentFilters.section === "realty" || currentFilters.realty_type || currentFilters.deal_type || currentFilters.rooms_count !== undefined) && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Тип недвижимости</p>
                  {currentFilters.realty_type !== undefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRealtyTypeChange("all")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="pt-2">
                  <Select
                    value={currentFilters.realty_type || "all"}
                    onValueChange={handleRealtyTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите тип" className="cursor-pointer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">Любой тип</SelectItem>
                      <SelectItem value="apartment" className="cursor-pointer">Квартира</SelectItem>
                      <SelectItem value="house" className="cursor-pointer">Дом</SelectItem>
                      <SelectItem value="commercial" className="cursor-pointer">Коммерческая</SelectItem>
                      <SelectItem value="land" className="cursor-pointer">Участок</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Сделка</p>
                  {currentFilters.deal_type !== undefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDealTypeChange("all")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="pt-2">
                  <Select
                    value={currentFilters.deal_type || "all"}
                    onValueChange={handleDealTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите тип сделки" className="cursor-pointer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">Любой тип сделки</SelectItem>
                      <SelectItem value="sale" className="cursor-pointer">Продажа</SelectItem>
                      <SelectItem value="rent" className="cursor-pointer">Аренда</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Комнат</p>
                  {currentFilters.rooms_count !== undefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRoomsCountChange("all")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить
                    </Button>
                  )}
                </div>
                <div className="pt-2">
                  <Select
                    value={currentFilters.rooms_count?.toString() || "all"}
                    onValueChange={handleRoomsCountChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Количество комнат" className="cursor-pointer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">Любое</SelectItem>
                      <SelectItem value="1" className="cursor-pointer">1</SelectItem>
                      <SelectItem value="2" className="cursor-pointer">2</SelectItem>
                      <SelectItem value="3" className="cursor-pointer">3</SelectItem>
                      <SelectItem value="4" className="cursor-pointer">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
            </>
          )}

          <div>
            <div className="flex justify-between items-center">
              <p className="font-medium">Наличие фото</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={currentFilters.has_photos === true}
                  onCheckedChange={handleHasPhotosChange}
                />
                Только с фото
                <span className="ml-auto text-xs text-gray-500">
                  {
                    products.filter((p) => p.images && p.images.length > 0)
                      .length
                  }{" "}
                  из {products.length}
                </span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <p className="font-medium">Наличие</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                <Checkbox
                  checked={currentFilters.in_stock}
                  onCheckedChange={handleInStockChange}
                />
                Только в наличии
                <span className="ml-auto text-xs text-gray-500">
                  {products.filter((p) => p.in_stock).length} из{" "}
                  {products.length}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};