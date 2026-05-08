// shared/ui/mobile-sheet.tsx
"use client";

import { Grip, Heart, Menu, ShoppingBag, User, Home, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/kit/sheet";
import { useCategoryTree } from "@/shared/hooks/useCategory";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useCart } from "@/entities/cart/model/hooks";
import { getLocationParamsString } from "@/shared/lib/city-utils";

export const MobileSheet = () => {
  const pathname = usePathname();
  // Показываем только категории с актуальными товарами
  const { data: categoryTreeData, isLoading } = useCategoryTree(true);
  const { data: cartData } = useCart();
  const cartItemsCount = cartData?.goods?.length || 0;

  const mainCategories = categoryTreeData?.result?.filter(
    category => {
      // Показываем только активные главные категории
      if (!category.is_active || category.parent_id) {
        return false;
      }
      
      // Если у категории есть флаг has_products === true, показываем её
      if (category.has_products === true) {
        return true;
      }
      
      // Если у категории нет дочерних категорий и has_products не true, не показываем
      if (!category.children || category.children.length === 0) {
        return false;
      }
      
      // Функция для проверки, есть ли у категории или её дочерних категорий товары
      const hasProductsInTree = (cat: typeof category): boolean => {
        // Если у категории есть флаг has_products === true, есть товары
        if (cat.has_products === true) {
          return true;
        }
        
        // Если у категории есть дочерние категории, проверяем их рекурсивно
        if (cat.children && cat.children.length > 0) {
          return cat.children.some(child => {
            if (!child.is_active) return false;
            return hasProductsInTree(child);
          });
        }
        
        return false;
      };
      
      // Проверяем, есть ли товары в дереве дочерних категорий
      const hasActiveChildrenWithProducts = category.children.some(child => {
        if (!child.is_active) return false;
        return hasProductsInTree(child);
      });
      
      return hasActiveChildrenWithProducts;
    }
  ) || [];

  const isActive = (path: string) => pathname === path;

  return (
    <Sheet>
      <SheetTrigger asChild className="flex md:hidden">
        <Button variant="ghost" size="icon" className="relative">
          <Menu width={20} height={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="tracking-tight text-2xl font-bold text-blue-600">
              Меню
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
              
                </Button>
              </Link>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1">
            <Link href="/">
              <Button 
                variant={isActive("/") ? "secondary" : "ghost"} 
                className="w-full justify-start text-lg h-12"
              >
                <Home className="w-5 h-5 mr-3" />
                Главная
              </Button>
            </Link>
            
            <Link href="/categories">
              <Button 
                variant={isActive("/categories") ? "secondary" : "ghost"} 
                className="w-full justify-start text-lg h-12"
              >
                <Grip className="w-5 h-5 mr-3" />
                Каталог товаров
              </Button>
            </Link>
            
            <div className="px-4 py-2">
              <h3 className="font-medium text-gray-500 text-sm mb-2">Категории</h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {mainCategories.slice(0, 8).map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?global_category_id=${category.id}`}
                      className="block py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md px-2 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                  {mainCategories.length > 8 && (
                    <Link
                      href="/categories"
                      className="block py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md px-2 transition-colors"
                    >
                      Все категории →
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            <Link href="/favorites">
              <Button 
                variant={isActive("/favorites") ? "secondary" : "ghost"} 
                className="w-full justify-start text-lg h-12"
              >
                <Heart className="w-5 h-5 mr-3" />
                Избранное
              </Button>
            </Link>
            
            <Link href="/rating">
              <Button 
                variant={isActive("/reviews") ? "secondary" : "ghost"} 
                className="w-full justify-start text-lg h-12"
              >
                <Star className="w-5 h-5 mr-3" />
                Отзывы и рейтинги
              </Button>
            </Link>
            
            <Link href={`/account${getLocationParamsString()}`}>
              <Button 
                variant={isActive("/account") ? "secondary" : "ghost"} 
                className="w-full justify-start text-lg h-12"
              >
                <User className="w-5 h-5 mr-3" />
                Личный кабинет
              </Button>
            </Link>
            
            <Separator />
          
          </nav>
        </div>
        
        <SheetFooter className="border-t pt-4">
          <div className="w-full space-y-3">
            <div className="text-center text-sm text-gray-500">
              <p>Есть вопросы? Звоните!</p>
              <a href="tel:+79998887766" className="text-blue-600 font-semibold">
                +7 (999) 888-77-66
              </a>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};