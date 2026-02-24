import { Skeleton } from "@/shared/ui/kit/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden h-72 rounded-lg border border-gray-100 shadow-sm flex items-end">
      <div className="flex flex-col gap-3 p-3 relative z-10 mt-auto flex-1 w-full">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 bg-black/10" />
          <Skeleton className="h-3 w-1/2 bg-black/10" />
          <Skeleton className="h-5 w-1/4 bg-black/10" />
        </div>

        <Skeleton className="h-10 w-full rounded-md bg-black/10" />
      </div>
    </div>
  );
};
