import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "@/entities/product/api";

export const useMarketplaceFilters = () => {
  return useQuery({
    queryKey: ["marketplace-filters"],
    queryFn: fetchFilters,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};