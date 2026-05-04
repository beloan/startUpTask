"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Shield, ChevronLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Link from "next/link";

import { useAuthStore } from "@/entities/user";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";

export const LoginPopup: React.FC<{ trigger: React.ReactNode }> = ({ trigger }) => {
  const { isAuthenticated, user, login, logout, isLoading, error, requestBuyerSmsCode, verifyBuyerSmsCode, smsPendingPhone, smsCodeSentAt } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState<string | undefined>("");
  const [smsCode, setSmsCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for SMS code resend
  useEffect(() => {
    if (!smsCodeSentAt) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - smsCodeSentAt) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setResendCountdown(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [smsCodeSentAt]);

  const handleRequestSms = async () => {
    const rawPhone = phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 11) return;

    const success = await requestBuyerSmsCode(rawPhone);
    if (success) {
      setStep("code");
      setSmsCode("");
    }
  };

  const handleVerifySmsCode = async () => {
    if (!smsPendingPhone || smsCode.length !== 6) return;

    const success = await verifyBuyerSmsCode(smsPendingPhone, smsCode);
    if (success) {
      setPhone("");
      setSmsCode("");
      setStep("phone");
      setOpen(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setSmsCode("");
  };

  const handleResendSms = async () => {
    const rawPhone = phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 11) return;

    await requestBuyerSmsCode(rawPhone);
    setResendCountdown(60);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setPhone("");
      setSmsCode("");
      setStep("phone");
      setResendCountdown(0);
    }
  };

  if (isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Аккаунт пользователя</DialogTitle>
            <DialogDescription>
              Просмотр профиля и выход из аккаунта.
            </DialogDescription>
          </DialogHeader>
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step === "code" && (
              <button
                onClick={handleBackToPhone}
                className="p-1 hover:bg-gray-100 rounded-md transition"
                disabled={isLoading}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <DialogTitle className="text-center text-2xl text-blue-600 flex-1">
              {step === "phone" ? "Вход по номеру телефона" : "Введите код из SMS"}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Ввод номера телефона и подтверждение по SMS коду.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div
              key="phone-step"
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
                onClick={handleRequestSms}
                disabled={isLoading || (phone?.replace(/\D/g, "").length || 0) < 11}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isLoading ? "Отправка..." : "Получить код"}
              </Button>

              <div className="text-center text-xs text-gray-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Ваши данные защищены
                </p>
                <p>
                  Нажимая &quot;Получить код&quot;, вы соглашаетесь с{" "}
                  <a href="/terms" className="text-blue-400 hover:underline">
                    условиями использования
                  </a>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Код отправлен на номер
                </p>
                <p className="font-semibold text-gray-900">
                  {smsPendingPhone}
                </p>
              </div>

              <Input
                type="text"
                placeholder="000000"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={isLoading}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-semibold"
              />

              <Button
                onClick={handleVerifySmsCode}
                disabled={isLoading || smsCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isLoading ? "Проверка..." : "Подтвердить"}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  {resendCountdown > 0 ? (
                    <>Повторная отправка через {resendCountdown}с</>
                  ) : (
                    <>
                      Не получили код?{" "}
                      <button
                        onClick={handleResendSms}
                        disabled={isLoading}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Отправить заново
                      </button>
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopup;