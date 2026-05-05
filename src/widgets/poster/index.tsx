"use client";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import Image from "next/image";

const Poster = () => {
  const slides = [
    {
      id: 1,
      buttonText: "Смотреть предложения",
      buttonLink: "/products",
      title: "Выгодные предложения каждый день",
      description: "Подборки товаров с быстрым переходом в каталог и удобным поиском.",
    },
    {
      id: 2,
      buttonText: "Заказать еду",
      buttonLink: "/products",
      title: "Быстрый заказ без лишних шагов",
      description: "Соберите заказ в один клик и оформите его на телефоне или с компьютера.",
    },
    {
      id: 3,
      buttonText: "Заказать цветы",
      buttonLink: "/products",
      title: "Товары и подарки для любого повода",
      description: "Каталог адаптирован под быстрый просмотр, подбор и оформление покупки.",
    },
    {
      id: 4,
      buttonText: "Заказать цветы",
      buttonLink: "/products",
      title: "Собирайте покупки быстрее с #быстроИточка",
      description: "Главные предложения, категории и рекомендации в одном экране.",
    },
  ];

  return (
    <section className="py-4 md:py-6 w-full">
      <Swiper
        loop={true}
        slidesPerView={1}
        spaceBetween={14}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 1.3,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 18,
          },
          1280: {
            slidesPerView: 2.3,
            spaceBetween: 18,
          },
        }}
        modules={[Pagination]}
        className="banner-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide className="overflow-hidden" key={slide.id}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="relative h-[220px] md:h-[300px] lg:h-[340px] w-full overflow-hidden border border-white/30 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            >
              <Image
                src={`/poster/${slide.id}.png`}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Poster;