"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ExternalLink,
  Shield,
  Sparkles,
  Store,
  User,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";

import { useAuthStore } from "@/entities/user";

import { getLocationParamsString } from "@/shared/lib/city-utils";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent } from "@/shared/ui/kit/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Separator } from "@/shared/ui/kit/separator";

export const LoginPopup: React.FC<{ trigger: React.ReactNode }> = ({
  trigger,
}) => {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [showPhoneSuggestion, setShowPhoneSuggestion] = useState(false);
  const [useDefaultPhone, setUseDefaultPhone] = useState(false);

  const defaultPhone = "+79995079869";

  const handleLogin = () => {
    const phoneToUse = phone || (useDefaultPhone ? defaultPhone : "");
    if (!phoneToUse) {
      setShowPhoneSuggestion(true);
      return;
    }
    login(phoneToUse, userType);
    resetForm();
  };

  const handleRegister = () => {
    const phoneToUse = phone || (useDefaultPhone ? defaultPhone : "");
    if (!phoneToUse) {
      setShowPhoneSuggestion(true);
      return;
    }
    login(phoneToUse, userType);
    resetForm();
  };

  const handleLogout = () => {
    logout();
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setToken("");
    setMode("login");
    setTestMode(false);
    setShowPhoneSuggestion(false);
    setUseDefaultPhone(false);
  };

  const handleTestAuth = (type: "buyer" | "seller") => {
    const phoneToUse = phone || defaultPhone;
    setPhone(phoneToUse);
    setUserType(type);
    login(phoneToUse, type);
    setTestMode(false);
  };

  const acceptDefaultPhone = () => {
    setPhone(defaultPhone);
    setUseDefaultPhone(true);
    setShowPhoneSuggestion(false);
  };

  const declineDefaultPhone = () => {
    setShowPhoneSuggestion(false);
  };

  if (isAuthenticated) {
    return (
      <Dialog>
        <DialogTrigger asChild className="cursor-pointer">
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="flex flex-col space-y-6"
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12  bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer">
                <div className="w-10 h-10  bg-white flex items-center justify-center cursor-pointer">
                  <span className="text-lg font-bold text-blue-600 cursor-pointer">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-semibold tracking-tight text-gray-900 cursor-pointer">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500 cursor-pointer">
                  {user?.type === "buyer" ? " Покупатель" : "Продавец"}
                </p>
                <Badge variant="outline" className="mt-1 cursor-pointer">
                  {user?.contragent_phone}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer "
              >
                <a
                  href={`/account${getLocationParamsString()}`}
                  className="cursor-pointer"
                >
                  Перейти в личный кабинет
                </a>
              </Button>

              <Separator />

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-300 active:scale-[0.98] cursor-pointer "
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
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-blue-600">
            Вход в систему
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {testMode ? (
            <motion.div
              key="test"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="space-y-6"
            >
              <div className="text-center ">
                <Sparkles className="w-12 h-12 mx-auto text-amber-500 mb-2" />
                <h3 className="text-lg font-semibold ">
                  Быстрый тестовый вход
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Выберите тип аккаунта для демонстрации
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                    userType === "buyer"
                      ? "ring-2 ring-blue-500 shadow-sm"
                      : "hover:border-blue-200"
                  }`}
                  onClick={() => setUserType("buyer")}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12  bg-blue-100 flex items-center justify-center mb-3 transition-all duration-300">
                      <span className="text-blue-600 font-bold">B</span>
                    </div>
                    <h4 className="font-semibold">Покупатель</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Просмотр товаров, покупки, заказы
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                    userType === "seller"
                      ? "ring-2 ring-green-500 shadow-sm"
                      : "hover:border-green-200"
                  }`}
                  onClick={() => setUserType("seller")}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12  bg-green-100 flex items-center justify-center mb-3 transition-all duration-300">
                      <span className="text-green-600 font-bold">S</span>
                    </div>
                    <h4 className="font-semibold">Продавец</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Управление товарами, статистика, заказы
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Input
                type="tel"
                placeholder="7 999 999 99 99"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-center text-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />

              {showPhoneSuggestion && !phone && (
                <div className="border rounded-lg p-4 bg-yellow-50 cursor-pointer">
                  <p className="text-sm font-medium mb-2 cursor-pointer">
                    Использовать стандартный номер?
                  </p>
                  <p className="text-sm text-gray-600 mb-3 cursor-pointer">
                    {defaultPhone}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={acceptDefaultPhone}
                      className="flex-1 bg-green-500 hover:bg-green-600 cursor-pointer"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1 cursor-pointer" />
                      Да
                    </Button>
                    <Button
                      onClick={declineDefaultPhone}
                      className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer "
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1 cursor-pointer" />
                      Нет
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => handleTestAuth("buyer")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer "
                >
                  Войти как покупатель
                </Button>

                <Button
                  onClick={() => handleTestAuth("seller")}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer "
                >
                  Войти как продавец
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setTestMode(false)}
                className="w-full transition-all duration-300 hover:bg-gray-100 active:scale-[0.98] cursor-pointer "
              >
                Вернуться к обычному входу
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="space-y-6"
            >
              <div className="flex gap-3 justify-between mb-3">
                <Button
                  onClick={() => setUserType("buyer")}
                  className={`flex-1 ${userType === "buyer" ? "bg-blue-500 text-white" : "bg-gray-500"} cursor-pointer`}
                >
                  Покупатель
                </Button>
                <Button
                  onClick={() => setUserType("seller")}
                  className={`flex-1 ${userType === "seller" ? "bg-green-500 text-white" : "bg-gray-500"} cursor-pointer`}
                >
                  Продавец
                </Button>
              </div>

              {mode === "login" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Номер телефона"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-4 transition-all duration-300 focus:ring-2 focus:ring-blue-500 "
                    />
                  </div>

                  {showPhoneSuggestion && !phone && (
                    <div className="border rounded-lg p-4 bg-yellow-50 cursor-pointer">
                      <p className="text-sm font-medium mb-2 cursor-pointer">
                        Использовать стандартный номер?
                      </p>
                      <p className="text-sm text-gray-600 mb-3 cursor-pointer">
                        {defaultPhone}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={acceptDefaultPhone}
                          className="flex-1 bg-green-500 hover:bg-green-600 cursor-pointer "
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1 cursor-pointer" />
                          Да
                        </Button>
                        <Button
                          onClick={declineDefaultPhone}
                          className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer "
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1 cursor-pointer" />
                          Нет
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer "
                  >
                    Войти
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userType === "buyer" ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500  "
                      />
                      <Input
                        type="tel"
                        placeholder="Телефон"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500  "
                      />
                    </div>
                  ) : (
                    <div className="mt-5">
                      <Input
                        placeholder="Токен"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 "
                      />

                      <div className="pt-2">
                        <Separator className="my-4" />

                        <h4 className="font-medium mb-3 ">
                          Ресурсы для продавцов
                        </h4>

                        <div className="space-y-2 ">
                          <a
                            href="https://app.tablecrm.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center cursor-pointer">
                              <span className="text-sm font-bold text-blue-600 cursor-pointer">
                                TC
                              </span>
                            </div>
                            <div className="flex-1 cursor-pointer">
                              <p className="text-sm font-medium cursor-pointer">
                                TableCRM
                              </p>
                              <p className="text-xs text-gray-500 cursor-pointer">
                                Управление продажами
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>

                          <a
                            href="https://t.me/productlabpro"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center cursor-pointer">
                              <span className="text-sm font-bold text-blue-600 cursor-pointer">
                                TG
                              </span>
                            </div>
                            <div className="flex-1 cursor-pointer">
                              <p className="text-sm font-medium cursor-pointer">
                                Telegram Bot
                              </p>
                              <p className="text-xs text-gray-500 cursor-pointer">
                                Автоматизация заказов
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPhoneSuggestion && !phone && userType === "buyer" && (
                    <div className="border rounded-lg p-4 bg-yellow-50 cursor-pointer">
                      <p className="text-sm font-medium mb-2 cursor-pointer">
                        Использовать стандартный номер?
                      </p>
                      <p className="text-sm text-gray-600 mb-3 cursor-pointer">
                        {defaultPhone}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={acceptDefaultPhone}
                          className="flex-1 bg-green-500 hover:bg-green-600 cursor-pointer "
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1 cursor-pointer" />
                          Да
                        </Button>
                        <Button
                          onClick={declineDefaultPhone}
                          className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer "
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1 cursor-pointer" />
                          Нет
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer "
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              )}

              <div className="text-center cursor-pointer">
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  onClick={() => setTestMode(true)}
                  className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 active:scale-[0.98] cursor-pointer "
                >
                  Тестовый вход (демо)
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setMode("login")}
                  className={`flex-1 ${mode === "login" ? "bg-blue-500 text-white" : "bg-gray-500"} cursor-pointer `}
                >
                  Вход
                </Button>
                <Button
                  onClick={() => setMode("register")}
                  className={`flex-1 ${mode === "register" ? "bg-blue-500 text-white" : "bg-gray-500"} cursor-pointer `}
                >
                  Регистрация
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 space-y-1 cursor-pointer">
                <p className="flex items-center justify-center gap-1 cursor-pointer">
                  <Shield className="w-3 h-3 cursor-pointer" />
                  Ваши данные защищены
                </p>
                <p className="cursor-pointer">
                  Нажимая &quot;Войти&quot;, вы соглашаетесь с{" "}
                  <a
                    href="/terms"
                    className="text-blue-400 hover:underline transition-colors duration-300 cursor-pointer"
                  >
                    условиями использования
                  </a>
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
