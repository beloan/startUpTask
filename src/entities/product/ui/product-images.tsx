"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { transformImageUrl } from "@/shared/lib/image-utils";
import { Button } from "@/shared/ui/kit/button";

import { Product } from "../model";

type Props = Pick<Product, "images">;

export const ProductImages = ({ images }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const transformedImages = images?.map((img) => transformImageUrl(img)) || [];
  const hasMultipleImages = transformedImages.length > 1;

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setIsModalOpen(false);
  }, []);

  const changeImageWithAnimation = useCallback(
    (newIndex: number, dir: "left" | "right") => {
      if (isTransitioning || transformedImages.length === 0) return;

      setIsTransitioning(true);
      setDirection(dir);

      setTimeout(() => {
        setCurrentImageIndex(newIndex);
        setTimeout(() => {
          setIsTransitioning(false);
          setDirection(null);
        }, 150);
      }, 300);
    },
    [isTransitioning, transformedImages.length],
  );

  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      if (!hasMultipleImages) return;
      e?.stopPropagation();
      const newIndex =
        currentImageIndex === transformedImages.length - 1
          ? 0
          : currentImageIndex + 1;
      changeImageWithAnimation(newIndex, "left");
    },
    [
      currentImageIndex,
      transformedImages.length,
      hasMultipleImages,
      changeImageWithAnimation,
    ],
  );

  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      if (!hasMultipleImages) return;
      e?.stopPropagation();
      const newIndex =
        currentImageIndex === 0
          ? transformedImages.length - 1
          : currentImageIndex - 1;
      changeImageWithAnimation(newIndex, "right");
    },
    [
      currentImageIndex,
      transformedImages.length,
      hasMultipleImages,
      changeImageWithAnimation,
    ],
  );

  const handleThumbnailClick = (index: number, e: React.MouseEvent) => {
    if (index === currentImageIndex) return;
    e.stopPropagation();
    const dir = index > currentImageIndex ? "left" : "right";
    changeImageWithAnimation(index, dir);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button[aria-label="Закрыть"]')) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button[aria-label="Закрыть"]')) return;
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX || !hasMultipleImages) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0) nextImage();
    else prevImage();
    setTouchStartX(null);
    setTouchEndX(null);
  }, [touchStartX, touchEndX, hasMultipleImages, nextImage, prevImage]);


  const handleModalBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current) closeModal();
    },
    [closeModal],
  );

  const handleModalBackgroundTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (modalRef.current && e.target === modalRef.current) closeModal(e);
    },
    [closeModal],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen || !hasMultipleImages) return;
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") closeModal();
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isModalOpen, hasMultipleImages, prevImage, nextImage, closeModal]);

  return (
    <>
      <div className="flex max-w-xl w-full gap-4 flex-col md:flex-row">
        <div className="grid grid-cols-5 md:flex md:flex-col gap-4 order-2 md:order-1 md:max-h-[500px]">
          {transformedImages.map((item, id) => (
            <button
              key={id}
              className={`relative h-16 md:w-20 md:h-20 rounded-md bg-gray-50 overflow-hidden cursor-pointer focus:outline-none transition-all flex-shrink-0 ${
                id === currentImageIndex
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-gray-200 hover:ring-blue-300"
              }`}
              onClick={() => openModal(id)}
            >
              <Image
                src={item}
                alt={`Product thumbnail ${id + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div
          className={`relative ${
            hasMultipleImages ? "flex-1" : "w-full"
          } bg-gray-50 rounded-md overflow-hidden flex items-center justify-center min-h-[300px] cursor-pointer group order-1 md:order-2`}
        >
          <button
            onClick={() => openModal(0)}
            className="relative w-full h-full focus:outline-none min-h-[400px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={
                transformedImages[currentImageIndex] ||
                "https://picsum.photos/800/600"
              }
              alt="Product Image"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {isModalOpen && transformedImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90"
          onClick={closeModal} 
          onTouchEnd={closeModal}  
        >
          <div
            className="relative w-300 h-full m-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}            
            onTouchStart={handleTouchStart}                
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => {
              e.stopPropagation();                        
              handleTouchEnd();                               
            }}
          >
            <div className="relative w-300 h-full flex items-center justify-center overflow-hidden">
              {transformedImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                    index === currentImageIndex
                      ? direction === "left"
                        ? isTransitioning
                          ? "translate-x-full opacity-0"
                          : "translate-x-0 opacity-100"
                        : direction === "right"
                          ? isTransitioning
                            ? "-translate-x-full opacity-0"
                            : "translate-x-0 opacity-100"
                          : "translate-x-0 opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-contain w-10"
                    sizes="50vw"
                    priority={index === currentImageIndex}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
              onClick={closeModal}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal(e);
              }}
              className="absolute top-4 right-4 z-50 size-11 cursor-pointer bg-black/50 border-none text-white transition-all duration-200 hover:scale-110"
              variant="outline"
              aria-label="Закрыть"
            >
              <X size={24} />
            </Button>

            {hasMultipleImages && (
              <>
                <Button
                  onClick={prevImage}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 size-10 bg-black/50 hover:bg-black/70 border-none text-white transition-all duration-200 hover:scale-110 hidden md:flex"
                  variant="outline"
                  aria-label="Предыдущее изображение"
                  disabled={isTransitioning}
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  onClick={nextImage}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 size-10 bg-black/50 hover:bg-black/70 border-none text-white transition-all duration-200 hover:scale-110 hidden md:flex"
                  variant="outline"
                  aria-label="Следующее изображение"
                  disabled={isTransitioning}
                >
                  <ChevronRight size={24} />
                </Button>

                <button
                  onClick={prevImage}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute left-0 top-35 bottom-0 w-1/3 z-40 h-1/2 bg-transparent cursor-pointer focus:outline-none"
                  aria-label="Предыдущее изображение (нажать слева)"
                  disabled={isTransitioning}
                />
                <button
                  onClick={nextImage}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute right-0 top-35 bottom-0 w-1/3 h-1/2 z-40 bg-transparent cursor-pointer focus:outline-none"
                  aria-label="Следующее изображение (нажать справа)"
                  disabled={isTransitioning}
                />

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {transformedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleThumbnailClick(index, e)}
                      onTouchEnd={(e) => e.stopPropagation()}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white scale-110"
                          : "bg-gray-500 hover:bg-gray-300"
                      }`}
                      aria-label={`Перейти к изображению ${index + 1}`}
                      disabled={isTransitioning}
                    />
                  ))}
                </div>

                <div className="absolute bottom-6 right-6 text-white text-sm bg-black/40 px-3 py-1 rounded-full z-10">
                  {currentImageIndex + 1} / {transformedImages.length}
                </div>
              </>
            )}
        </div>
      )}
    </>
  );
};