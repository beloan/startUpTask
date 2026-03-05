"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Shield } from "lucide-react";
import React, { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Link from "next/link";

import { useAuthStore } from "@/entities/user";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";

export const LoginPopup: React.FC<{ trigger: React.ReactNode }> = ({ trigger }) => {
  const { isAuthenticated, user, login, logout, isLoading, error } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState<string | undefined>("");

  const handleLogin = async () => {
    const rawPhone = phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 11) return;

    await login(rawPhone, "buyer");
    if (!error) {
      setPhone("");
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  if (isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center rounded-full">
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full">
                  <span className="text-lg font-bold text-blue-600">
                    {user?.name?.charAt(0) || "?"}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-semibold tracking-tight text-gray-900">
                  {user?.name || "Пользователь"}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.type === "buyer" ? "Покупатель" : "Продавец"}
                </p>
              </div>
            </div>

            <div className="space-y-2 flex justify-between">
              <Link href="/account" passHref>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setOpen(false)}
                >
                  Личный кабинет
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className=" border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Выйти из аккаунта
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-blue-600">
            Вход по номеру телефона
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <PhoneInput
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={setPhone}
              defaultCountry="ru"
              disabled={isLoading}
              countrySelectorStyleProps={{
                buttonStyle: { paddingLeft: "7px", paddingRight: "2px" },
              }}
              inputProps={{
                className: "w-full border-1 border-[#dcdcdc] rounded-r-sm pl-3",
              }}
            />

            <Button
              onClick={handleLogin}
              disabled={isLoading || (phone?.replace(/\D/g, "").length || 0) < 11}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isLoading ? "Вход..." : "Продолжить"}
            </Button>

            <div className="text-center text-xs text-gray-400 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Ваши данные защищены
              </p>
              <p>
                Нажимая &quot;Продолжить&quot;, вы соглашаетесь с{" "}
                <a href="/terms" className="text-blue-400 hover:underline">
                  условиями использования
                </a>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopup;