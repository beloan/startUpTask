"use client";

import { ArrowRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/shared/ui/kit/button";
import { useCategoryTree } from "@/shared/hooks/useCategory";
import { Skeleton } from "@/shared/ui/kit/skeleton";

const Categories = () => {
  const { data: categoriesData, isLoading } = useCategoryTree(true);
  const searchParams = useSearchParams();

  const softGradients = [
    "linear-gradient(135deg, #f9d8d6 0%, #f8e1e7 100%)",
    "linear-gradient(135deg, #dcecfb 0%, #f5e9ff 100%)",
    "linear-gradient(135deg, #fff5d7 0%, #ffdada 100%)",
    "linear-gradient(135deg, #e8f9e9 0%, #d8f3ff 100%)",
    "linear-gradient(135deg, #e3fdfd 0%, #ffe6fa 100%)",
    "linear-gradient(135deg, #f6f3ff 0%, #e4f0ff 100%)",
    "linear-gradient(135deg, #fff0f5 0%, #fef6e4 100%)",
    "linear-gradient(135deg, #f8d3ff 0%, #d6e4ff 100%)",
  ];

  const fallbackImages = [
    "https://i.pinimg.com/736x/cf/32/34/cf32346127928acec861592141cbb0ef.jpg",
    "https://avatars.mds.yandex.net/i?id=b0c69c07ec10d5b2e758cb289fe0a2c71b18b18a-4578426-images-thumbs&n=13", 
    "https://avatars.mds.yandex.net/i?id=bc28e7a0d38060f895eebdb9f18387de13ee7e43-10814916-images-thumbs&n=13",
    "https://avatars.mds.yandex.net/i?id=66af7a8ee56f17385f927f319e8fd3152e75231a-12345336-images-thumbs&n=13",
    "https://avatars.mds.yandex.net/i?id=23c2d2ec9b5abecd729ece4703056e1d9fa93401-2958044-images-thumbs&n=13",
    "https://avatars.mds.yandex.net/i?id=79f0a42787de8f2a35dd9271e0d9e3e912007e6f-5216821-images-thumbs&n=13",
    "https://avatars.mds.yandex.net/i?id=b3211000e686c0146300b4b8e95ff4f9888977ca-10639540-images-thumbs&n=13"
  ];

  if (isLoading) {
    return (
      <section className="pt-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="pt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasProductsInTree = (cat: any): boolean => {
    if (cat.has_products === true) return true;
    if (cat.children && cat.children.length > 0) {
      return cat.children.some((child: any) => {
        if (!child.is_active) return false;
        return hasProductsInTree(child);
      });
    }
    return false;
  };

  const findCategoryByName = (categories: any[], targetName: string): any | null => {
    for (const category of categories) {
      if (String(category.name).toLowerCase() === targetName.toLowerCase()) {
        return category;
      }
      if (category.children?.length) {
        const found = findCategoryByName(category.children, targetName);
        if (found) return found;
      }
    }
    return null;
  };

  const collectSubcategories = (category: any): any[] => {
    if (!category?.children?.length) return [];
    const collected: any[] = [];
    category.children.forEach((child: any) => {
      if (child.is_active && hasProductsInTree(child)) {
        collected.push(child);
      }
      collected.push(...collectSubcategories(child));
    });
    return collected;
  };

  const mainCategories = categoriesData?.result?.filter(
    category => {
      if (!category.is_active || category.parent_id) return false;
      if (category.has_products === true) return true;
      if (!category.children || category.children.length === 0) return false;
      const hasActiveChildrenWithProducts = category.children.some(child => {
        if (!child.is_active) return false;
        return hasProductsInTree(child);
      });
      return hasActiveChildrenWithProducts;
    }
  ) || [];

  const homeAndGardenCategory = findCategoryByName(categoriesData?.result || [], "Для дома и дачи");
  const homeAndGardenSubcategories = homeAndGardenCategory
    ? collectSubcategories(homeAndGardenCategory)
    : [];
  const displayedCategories = (homeAndGardenSubcategories.length > 0
    ? homeAndGardenSubcategories
    : mainCategories).slice(0, 7);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="pt-8">
      <div className="container">
        <div className="flex items-center justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-medium text-lg tracking-tight"
          >
            Популярные категории
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="outline" className="hover:ring-gray-200">
              <Link href="/categories">
                Все категории <ArrowRight width={16} height={16} className="inline"/>
              </Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="pt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
        >
          {displayedCategories.map((category, index) => {
            const gradient = softGradients[index % softGradients.length];
            const categoryUrl = new URLSearchParams();
            categoryUrl.set('global_category_id', category.id.toString());
            const address = searchParams.get('address');
            const sellerId = searchParams.get('seller_id');
            if (address) categoryUrl.set('address', address);
            if (sellerId) categoryUrl.set('seller_id', sellerId);
            
            return (
              <motion.a
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300 } }}
                href={`/products?${categoryUrl.toString()}`}
                style={{ background: gradient }}
                className="relative group flex h-56 items-end p-4 rounded-lg overflow-hidden hover:ring-2 hover:ring-gray-200"
              >
                <div className="flex justify-center absolute inset-0 brightness-75 group-hover:brightness-50 transition-all duration-300">
                  {category.image_url ? (
                    <img
                      src={"https://app.tablecrm.com/api/v1/" + category.image_url}
                      className="w-full object-fill"
                      alt={category.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/airpods.png";
                      }}
                    />
                  ) : (
                    <img
                      src={fallbackImages[index]}
                      className="w-full object-fill"
                      alt={category.name}
                    />
                  )}
                </div>
                <p className="leading-4 pt-3 text-xl tracking-tight relative text-white">
                  {category.name}
                </p>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;