"use client";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";

const Poster = () => {
  const slides = [
    {
      id: 1,
      buttonText: "Смотреть предложения",
      buttonLink: "/products",
    },
    {
      id: 2,
      buttonText: "Заказать еду",
      buttonLink: "/products",
    },
    {
      id: 3,
      buttonText: "Заказать цветы",
      buttonLink: "/products",
    },
    {
      id: 4,
      buttonText: "Заказать цветы",
      buttonLink: "/products",
    },
  ];

  return (
    <section className="py-4 w-full h-52 flex">
      <Swiper
        loop={true}
        slidesPerView={2.4}
        spaceBetween={16}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 12,
          },
          1024: {
            slidesPerView: 2.4,
            spaceBetween: 12,
          },
        }}
        modules={[Pagination]}
      >
        {slides.map((slide) => (
          <SwiperSlide className="rounded-lg overflow-hidden" key={slide.id}>
            <motion.img
              src={`/poster/${slide.id}.png`}
              className="w-full h-full object-cover object-left"
              loading="eager"
              fetchPriority="high"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Poster;