"use client";

import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { useProductFilters } from "../hooks/useProductFilters";
import { useCategoryTree } from "@/shared/hooks/useCategory";

interface ActiveFiltersProps {
  onFiltersChange?: () => void;
  sellerMap?: Record<number, string>;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ onFiltersChange, sellerMap = {} }) => {
  const { currentParams, removeFilter, resetFilters } = useProductFilters();
  const { data: globalCategoriesData } = useCategoryTree(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeFilters = [];

  if (currentParams.category) {
    const categories = currentParams.category.split(',');
    categories.forEach(cat => {
      activeFilters.push({
        key: "category",
        value: cat,
        label: `Категория: ${cat}`
      });
    });
  }

  if (currentParams.manufacturer) {
    const manufacturers = currentParams.manufacturer.split(',');
    manufacturers.forEach(man => {
      activeFilters.push({
        key: "manufacturer",
        value: man,
        label: `Производитель: ${man}`
      });
    });
  }

  if (currentParams.min_price !== undefined || currentParams.max_price !== undefined) {
    const min = currentParams.min_price || "0";
    const max = currentParams.max_price || "∞";
    activeFilters.push({
      key: "price",
      value: `${min}-${max}`,
      label: `Цена: ${min}₽ - ${max}₽`
    });
  }

  if (currentParams.rating_from !== undefined || currentParams.rating_to !== undefined) {
    const from = currentParams.rating_from || 0;
    const to = currentParams.rating_to || 5;
    activeFilters.push({
      key: "rating",
      value: `${from}-${to}`,
      label: `Рейтинг: ${from} - ${to}`
    });
  }

  if (currentParams.in_stock) {
    activeFilters.push({
      key: "in_stock",
      value: "true",
      label: "Только в наличии"
    });
  }

  if (currentParams.has_photos) {
    activeFilters.push({
      key: "has_photos",
      value: "true",
      label: "Только с фото"
    });
  }

  if (currentParams.seller_name) {
    const sellers = currentParams.seller_name.split(',');
    sellers.forEach(seller => {
      activeFilters.push({
        key: "seller_name",
        value: seller,
        label: `Продавец: ${seller}`
      });
    });
  }

  if (currentParams.global_category_id !== undefined) {
    // На сервере всегда показываем ID, чтобы избежать ошибки гидратации
    // На клиенте после монтирования показываем имя категории, если оно загружено
    const categoryName = isMounted && globalCategoriesData?.result
      ? globalCategoriesData.result.find(
          cat => cat.id === currentParams.global_category_id
        )?.name || `ID: ${currentParams.global_category_id}`
      : `ID: ${currentParams.global_category_id}`;
    
    activeFilters.push({
      key: "global_category_id",
      value: currentParams.global_category_id.toString(),
      label: `Глобальная категория: ${categoryName}`
    });
  }

  if (currentParams.seller_id !== undefined && sellerMap[currentParams.seller_id]) {
    activeFilters.push({
      key: "seller_id",
      value: currentParams.seller_id.toString(),
      label: `Продавец: ${sellerMap[currentParams.seller_id]}`
    });
  } else if (currentParams.seller_id !== undefined) {
    activeFilters.push({
      key: "seller_id",
      value: currentParams.seller_id.toString(),
      label: `Продавец ID: ${currentParams.seller_id}`
    });
  }

  const handleRemoveFilter = (filterKey: string, filterValue?: string) => {
    removeFilter(filterKey, filterValue);
    if (onFiltersChange) {
      onFiltersChange();
    }
  };

  const handleResetAll = () => {
    resetFilters();
    if (onFiltersChange) {
      onFiltersChange();
    }
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-50 rounded-md">
      <span className="text-sm font-medium">Активные фильтры:</span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${filter.value}-${index}`}
          variant="secondary"
          className="px-3 py-1 text-sm flex items-center gap-1"
        >
          <span>{filter.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-transparent"
            onClick={() => handleRemoveFilter(filter.key, filter.value)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

export default ActiveFilters;