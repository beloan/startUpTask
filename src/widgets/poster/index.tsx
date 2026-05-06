"use client";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Poster = () => {
  const slides = [
    {
      id: 1,
      image: "/poster/1.png",
    },
    {
      id: 2,
      image: "/poster/2.png",
    },
    {
      id: 3,
      image: "/poster/3.png",
    },
    {
      id: 4,
      image: "/poster/4.png",
    },
  ];

  return (
    <section className="py-4 w-full h-52 flex">
      <Swiper
        slidesPerView={2.4}
        spaceBetween={16}
        slidesOffsetAfter={16}
        slidesOffsetBefore={16}
        loop={true}
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
            slidesPerView: 2.3,
            spaceBetween: 12,
          },
        }}
        modules={[Pagination]}
      >
        {slides.map((slide) => (
          <SwiperSlide className="rounded-lg overflow-hidden" key={slide.id}>
            <img
              src={slide.image}
              className="w-full h-full object-cover object-left"
              loading="eager"
              fetchPriority="high"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Poster;