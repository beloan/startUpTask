"use client"
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/kit/button";

const Poster = () => {
  const slides = [
    {
      id: 1,
      image: "https://github.com/Trolozor/images/blob/main/p3.png?raw=true",
      buttonText: "Смотреть предложения",
      buttonLink: "/products"
    },
    {
      id: 2,
      image: "https://github.com/Trolozor/images/blob/main/image.png?raw=true",
      buttonText: "Заказать еду",
      buttonLink: "/products"
    },
    {
      id: 3,
      image: "https://github.com/Trolozor/images/blob/main/p1.png?raw=true",
      buttonText: "Заказать цветы",
      buttonLink: "/products"
    },
    {
      id: 4,
      image: "https://github.com/Trolozor/images/blob/main/p2.png?raw=true",
      buttonText: "Заказать цветы",
      buttonLink: "/products"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const getPrevIndex = (current: number) => {
    return current === 0 ? slides.length - 1 : current - 1;
  };

  const getNextIndex = (current: number) => {
    return current === slides.length - 1 ? 0 : current + 1;
  };

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => {
      if (prev <= 0) return slides.length - 1;
      return prev - 1;
    });
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, slides.length]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => {
      if (prev >= slides.length - 1) return 0;
      return prev + 1;
    });
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 7000);

    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <section className="py-4 w-full">
      <div className="h-[23vh] w-full max-[600px]:h-[13vh] max-[800px]:h-[17vh]">
        <div className="relative h-full rounded-lg overflow-hidden">
          <div className="absolute inset-0 rounded-lg">
            <div className="grid grid-cols-10 gap-4 relative w-full h-full rounded-lg">
              <div className="col-span-2 hidden sm:block h-full overflow-hidden z-0 rounded-lg relative">
                <Image
                    src={slides[getPrevIndex(currentIndex)].image}
                    fill
                    className="object-cover object-right rounded-lg"
                    alt="Previous slide"
                    sizes="20vw"
                  />
                  <button
                    onClick={handlePrevious}
                    className="relative left-0 top-0 w-full h-full z-30 p-3 bg-black/0 "
                    aria-label="Previous slide"
                  ></button>
              </div>

              <div className="col-span-10 sm:col-span-6 max-[630px]:h-20 h-full z-10 relative rounded-lg overflow-hidden">
                <div className="absolute inset-0 rounded-lg transition-opacity duration-500">
                  <Image
                    src={slides[currentIndex].image}
                    fill
                    className="object-cover max-[1340px]:object-fill max-[630px]:object-cover max-h-[750px]:object-fill h-[750px]:object-fill rounded-lg"
                    alt="Current slide"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent rounded-lg" />
                </div>
              </div>
              <div className="col-span-2 hidden sm:block h-full overflow-hidden z-0 rounded-lg relative">
                <Image
                  src={slides[getNextIndex(currentIndex)].image}
                  fill
                  className="object-cover object-left rounded-lg"
                  alt="Next slide"
                  sizes="20vw"
                />
                <button
                  onClick={handleNext}
                  className="relative right-0 top-0 w-full h-full z-30 p-3 bg-black/0 "
                  aria-label="Next slide"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Poster;