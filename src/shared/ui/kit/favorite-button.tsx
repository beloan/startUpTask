"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

import { useAddToFavorites, useRemoveFromFavorites, useIsFavorite } from "@/shared/hooks/useFavorites";
import { useDataUser } from "@/shared/hooks/useDataUser";
import { PhoneAuthSheet } from "@/feature/auth/phone-auth-sheet";

interface FavoriteButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  isInitiallyActive?: boolean;
}

export const FavoriteButton = ({
  productId,
  size = "md",
  showText = false,
  className = "",
  isInitiallyActive = false,
}: FavoriteButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const { isFavorite, favoriteId } = useIsFavorite(productId);
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  const [isAnimating, setIsAnimating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const dataUser = useDataUser();

  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);

  const performAddToFavorites = async () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      await addToFavoritesMutation.mutateAsync(productId);
    } catch (error) {
      console.error("Ошибка при добавлении в избранное:", error);
      toast.error("Не удалось добавить в избранное");
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dataUser) {
      setIsAuthSheetOpen(true);
      return;
    }

    setIsPending(true);

    const currentIsFavorite = isFavorite;

    if (currentIsFavorite) {
      setIsDeactivating(true);
    } else {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }

    try {
      if (currentIsFavorite && favoriteId) {
        await removeFromFavoritesMutation.mutateAsync(favoriteId);
      } else {
        await addToFavoritesMutation.mutateAsync(productId);
      }
    } catch (error) {
      console.error("Ошибка при изменении избранного:", error);
    } finally {
      setIsPending(false);
      setIsDeactivating(false);
    }
  };

  const handleAuthSuccess = async () => {
    await performAddToFavorites();
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const isLoading = isPending || addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;

  return (
    <>
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={!showText ? cn(
          "relative rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer",
          sizeClasses[size],
          className
        ) : cn(
          "relative rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
          sizeClasses[size],
          className
        )}
        aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      >
        <Heart
          className={cn(
            "absolute transition-all duration-300",
            isFavorite
              ? "fill-red-700 text-red-700 scale-100"
              : "fill-transparent text-gray-400 scale-100",
            isDeactivating && "scale-0",
            isAnimating && "animate-ping"
          )}
          size={size === "sm" ? 16 : size === "md" ? 20 : 24}
        />

        <Heart
          className={cn(
            "absolute transition-all duration-300",
            "text-gray-400",
            isDeactivating ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
          size={size === "sm" ? 16 : size === "md" ? 20 : 24}
          fill="none"
        />

        {showText && (
          <span className="text-sm text-gray-600 cursor-pointer hover:text-blue-500 hover:scale-100 absolute left-5 top-1.5 w-26">
            В избранное
          </span>
        )}

        {isAnimating && (
          <div className="absolute inset-0 rounded-full bg-red-700/20 animate-ping" />
        )}

        <style jsx>{`
          @keyframes ping {
            0% {
              transform: scale(0.8);
              opacity: 0.8;
            }
            100% {
              transform: scale(1.2);
              opacity: 0;
            }
          }
          .animate-ping {
            animation: ping 0.6s cubic-bezier(0, 0, 0.2, 1);
          }
        `}</style>
      </button>

      <PhoneAuthSheet
        isOpen={isAuthSheetOpen}
        onClose={() => setIsAuthSheetOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};