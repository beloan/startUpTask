"use client";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { transformImageUrl } from "@/shared/lib/image-utils";
import { Button } from "@/shared/ui/kit/button";

import { Product, ProductVideo } from "../model";

// ─── типы медиа ────────────────────────────────────────────────────────────────

type MediaItemImage = { kind: "image"; url: string };
type MediaItemVideo = { kind: "video"; url: string; videoType: "youtube" | "vimeo" | "direct"; embedUrl: string };
type MediaItem = MediaItemImage | MediaItemVideo;

// ─── утилиты для видео ────────────────────────────────────────────────────────

function parseVideoUrl(url: string): Omit<MediaItemVideo, "kind"> {
  // YouTube
  const ytMatch =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      url,
      videoType: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      url,
      videoType: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Прямая ссылка на видеофайл
  return { url, videoType: "direct", embedUrl: url };
}

function buildMediaList(images: string[], videos?: ProductVideo[]): MediaItem[] {
  const videoItems: MediaItemVideo[] = (videos ?? []).map((v) => ({
    kind: "video",
    ...parseVideoUrl(v.url),
  }));

  const imageItems: MediaItemImage[] = (images ?? []).map((img) => ({
    kind: "image",
    url: transformImageUrl(img),
  }));

  // Видео идут первыми
  return [...videoItems, ...imageItems];
}

// ─── миниатюра ────────────────────────────────────────────────────────────────

function MediaThumb({
  item,
  active,
  onClick,
}: {
  item: MediaItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative h-16 md:w-20 md:h-20 rounded-md bg-gray-100 overflow-hidden cursor-pointer focus:outline-none transition-all flex-shrink-0 ${
        active
          ? "ring-2 ring-blue-500"
          : "ring-1 ring-gray-200 hover:ring-blue-300"
      }`}
    >
      {item.kind === "image" ? (
        <Image
          src={item.url}
          alt="thumbnail"
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-900">
          <Play size={22} className="text-white fill-white" />
        </div>
      )}
    </button>
  );
}

// ─── встроенный плеер ────────────────────────────────────────────────────────

function VideoPlayer({ item, inModal }: { item: MediaItemVideo; inModal: boolean }) {
  const height = inModal ? "h-full" : "min-h-[300px]";

  if (item.videoType === "direct") {
    return (
      <video
        src={item.embedUrl}
        controls
        className={`w-full ${height} object-contain bg-black`}
        playsInline
      />
    );
  }

  return (
    <iframe
      src={item.embedUrl}
      className={`w-full ${height}`}
      style={{ minHeight: inModal ? undefined : 300 }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      frameBorder="0"
    />
  );
}

type Props = Pick<Product, "images" | "videos">;

export const ProductImages = ({ images, videos }: Props) => {
  const mediaList = buildMediaList(images, videos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const hasMultiple = mediaList.length > 1;
  const current = mediaList[currentIndex];

  const changeWithAnimation = useCallback(
    (newIndex: number, dir: "left" | "right") => {
      if (isTransitioning || mediaList.length === 0) return;
      setIsTransitioning(true);
      setDirection(dir);
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setTimeout(() => {
          setIsTransitioning(false);
          setDirection(null);
        }, 150);
      }, 300);
    },
    [isTransitioning, mediaList.length],
  );

  const next = useCallback(
    (e?: React.MouseEvent) => {
      if (!hasMultiple) return;
      e?.stopPropagation();
      changeWithAnimation(
        currentIndex === mediaList.length - 1 ? 0 : currentIndex + 1,
        "left",
      );
    },
    [currentIndex, mediaList.length, hasMultiple, changeWithAnimation],
  );

  const prev = useCallback(
    (e?: React.MouseEvent) => {
      if (!hasMultiple) return;
      e?.stopPropagation();
      changeWithAnimation(
        currentIndex === 0 ? mediaList.length - 1 : currentIndex - 1,
        "right",
      );
    },
    [currentIndex, mediaList.length, hasMultiple, changeWithAnimation],
  );

  const openModal = (index: number) => {
    // Не открываем модал для видео — плеер уже встроен
    if (mediaList[index]?.kind === "video") {
      setCurrentIndex(index);
      return;
    }
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);
  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX || !hasMultiple) return;
    const d = touchStartX - touchEndX;
    if (Math.abs(d) < 50) return;
    if (d > 0) next();
    else prev();
    setTouchStartX(null);
    setTouchEndX(null);
  }, [touchStartX, touchEndX, hasMultiple, next, prev]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, prev, next, closeModal]);

  if (mediaList.length === 0) return null;

  return (
    <>
      <div className="flex max-w-xl w-full gap-4 flex-col md:flex-row">
        {/* Миниатюры */}
        {mediaList.length > 1 && (
          <div className="grid grid-cols-5 md:flex md:flex-col gap-4 order-2 md:order-1 md:max-h-[500px] md:overflow-y-auto">
            {mediaList.map((item, i) => (
              <MediaThumb
                key={i}
                item={item}
                active={i === currentIndex}
                onClick={() => openModal(i)}
              />
            ))}
          </div>
        )}

        {/* Главная область */}
        <div
          className="relative flex-1 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center min-h-[300px] order-1 md:order-2"
          onTouchStart={current.kind === "image" ? handleTouchStart : undefined}
          onTouchMove={current.kind === "image" ? handleTouchMove : undefined}
          onTouchEnd={current.kind === "image" ? handleTouchEnd : undefined}
        >
          {current.kind === "video" ? (
            <VideoPlayer item={current} inModal={false} />
          ) : (
            <button
              onClick={() => openModal(currentIndex)}
              className="relative w-full h-full focus:outline-none min-h-[400px] group"
            >
              <Image
                src={current.url}
                alt="Product Image"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </button>
          )}

          {/* Стрелки для переключения (только на desktop) */}
          {hasMultiple && (
            <>
              <Button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-8 bg-white/80 hover:bg-white border border-gray-200 text-gray-700 hidden md:flex shadow-sm"
                variant="outline"
                disabled={isTransitioning}
                aria-label="Предыдущее"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-8 bg-white/80 hover:bg-white border border-gray-200 text-gray-700 hidden md:flex shadow-sm"
                variant="outline"
                disabled={isTransitioning}
                aria-label="Следующее"
              >
                <ChevronRight size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Модал — только для изображений */}
      {isModalOpen && current.kind === "image" && (
        <div
          className="fixed inset-0 z-50 bg-black/90"
          onClick={closeModal}
          onTouchEnd={closeModal}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleTouchEnd();
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {mediaList.map((item, index) => {
                if (item.kind !== "image") return null;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                      index === currentIndex
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
                      src={item.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      priority={index === currentIndex}
                    />
                  </div>
                );
              })}
            </div>

            <Button
              onClick={closeModal}
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); closeModal(); }}
              className="absolute top-4 right-4 z-50 size-11 cursor-pointer bg-black/50 border-none text-white hover:scale-110 transition-all"
              variant="outline"
              aria-label="Закрыть"
            >
              <X size={24} />
            </Button>

            {hasMultiple && (
              <>
                <Button
                  onClick={prev}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 size-10 bg-black/50 hover:bg-black/70 border-none text-white hover:scale-110 transition-all hidden md:flex"
                  variant="outline"
                  disabled={isTransitioning}
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  onClick={next}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 size-10 bg-black/50 hover:bg-black/70 border-none text-white hover:scale-110 transition-all hidden md:flex"
                  variant="outline"
                  disabled={isTransitioning}
                >
                  <ChevronRight size={24} />
                </Button>

                {/* Тап-зоны для мобильных */}
                <button
                  onClick={prev}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute left-0 top-1/4 w-1/3 h-1/2 z-40 bg-transparent cursor-pointer focus:outline-none"
                  disabled={isTransitioning}
                />
                <button
                  onClick={next}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute right-0 top-1/4 w-1/3 h-1/2 z-40 bg-transparent cursor-pointer focus:outline-none"
                  disabled={isTransitioning}
                />

                {/* Точки */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {mediaList.map((item, index) => {
                    if (item.kind !== "image") return null;
                    return (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          const dir = index > currentIndex ? "left" : "right";
                          changeWithAnimation(index, dir);
                        }}
                        onTouchEnd={(e) => e.stopPropagation()}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentIndex
                            ? "bg-white scale-110"
                            : "bg-gray-500 hover:bg-gray-300"
                        }`}
                        disabled={isTransitioning}
                      />
                    );
                  })}
                </div>

                <div className="absolute bottom-6 right-6 text-white text-sm bg-black/40 px-3 py-1 rounded-full z-10">
                  {currentIndex + 1} / {mediaList.filter((m) => m.kind === "image").length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};