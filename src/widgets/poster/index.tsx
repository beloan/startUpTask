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
    <section className="py-4 md:py-6 relative left-1/2 right-1/2 -translate-x-1/2 w-screen overflow-hidden">
      <Swiper
        loop={true}
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          1280: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
        }}
        modules={[Pagination]}
        className="banner-swiper w-screen"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            className="overflow-hidden w-screen"
            style={{ width: "100vw" }}
            key={slide.id}
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="relative w-screen overflow-hidden"
              style={{ height: "min(60vh, clamp(220px, 34vw, 420px))", maxHeight: "80vh" }}
            >
              <Image
                src={`/poster/${slide.id}.png`}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw"
                className="object-cover object-center"
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Poster;