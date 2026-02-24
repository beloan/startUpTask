import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="pt-4 md:pt-12 w-full text-gray-500 border-t border-t-gray-300">
      <div className="container">
        <div className="flex flex-col lg:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">
          <div className="md:max-w-96">
            <a
              className="tracking-tight text-blue-600 text-2xl font-medium"
              href="/"
            >
              #БыстроИточка
            </a>
            <p className="pt-2 text-sm tracking-tight">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
          </div>
          <div className="flex-1 flex items-start flex-col md:flex-row lg:justify-end gap-6 md:gap-12 lg:gap-20">
            <div>
              <h2 className="font-medium mb-5 text-gray-800">
                Популярные категории
              </h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#">Категория</a>
                </li>
                <li>
                  <a href="#">Категория</a>
                </li>
                <li>
                  <a href="#">Категория</a>
                </li>
                <li>
                  <a href="#">Категория</a>
                </li>
                <li>
                  <a href="#">Категория</a>
                </li>
                <li>
                  <a href="#">Категория</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-medium mb-5 text-gray-800">Компания</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#">Главная</a>
                </li>
                <li>
                  <a href="#">Про нас</a>
                </li>
                <li>
                  <a href="#">Contact us</a>
                </li>
                <li>
                  <a href="#">Privacy policy</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-medium mb-5 text-gray-800">
                Свяжитесь с нами
              </h2>
              <div className="text-sm space-y-2">
                <p>+32 000 000 00 </p>
                <p>contact@example.com</p>
              </div>
            </div>
          </div>
        </div>
        <p className="pt-4 text-center text-xs pb-5">
          © 2026 #БыстроИточка. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
