"use client"
import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";

import SubscribeNewsletter from "@/feature/subscribe-newsletter/ui/subscribe-newsletter";
import { Metadata } from 'next';

import Categories from "@/widgets/categories";
import Deals from "@/widgets/deals";
import Poster from "@/widgets/poster";
import Recommendation from "@/widgets/recommendations";



const Main = () => {
  return (
    <div className="flex flex-col">
      <Poster />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <Suspense fallback={<div>Загрузка категорий...</div>}>
          <Categories />
        </Suspense>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Suspense fallback={<div>Загрузка рекомендаций...</div>}>
          <Recommendation />
        </Suspense>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <SubscribeNewsletter />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Suspense fallback={<div>Загрузка предложений...</div>}>
          <Deals />
        </Suspense>
      </motion.div>
    </div>
  );
};

export default Main;