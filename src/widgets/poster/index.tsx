"use client";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
          <SwiperSlide className="rounded-3xl overflow-hidden" key={slide.id}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="relative h-[220px] md:h-[300px] lg:h-[340px] w-full overflow-hidden rounded-3xl border border-white/30 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            >
              <Image
                src={`/poster/${slide.id}.png`}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
              <div className="absolute inset-0 flex items-end md:items-center">
                <div className="max-w-xl p-5 md:p-8 text-white">
                  <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
                    Баннерное предложение
                  </p>
                  <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm md:text-base text-white/85">
                    {slide.description}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Poster;