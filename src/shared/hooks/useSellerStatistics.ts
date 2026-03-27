// shared/hooks/useSellersList.ts
import { useQuery } from "@tanstack/react-query";

export interface SellerItem {
  id: number;
  name: string;
  description?: string;
  photo?: string;
  total_products?: number;
}

export const useSellersList = (search?: string, limit: number = 500) => {
  return useQuery({
    queryKey: ["sellers_list", search, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", String(limit));

      const response = await fetch(
        `https://app.tablecrm.com/api/v1/mp/sellers/?${params.toString()}`,
        { cache: "force-cache" }
      );
      if (!response.ok) throw new Error("Failed to fetch sellers");
      const data = await response.json();
      return data.sellers as SellerItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};