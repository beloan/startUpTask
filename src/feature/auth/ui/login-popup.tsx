"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ExternalLink,
  Shield,
  Sparkles,
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
import { Separator } from "@/shared/ui/kit/separator";

export const LoginPopup: React.FC<{ trigger: React.ReactNode }> = ({
  trigger,
}) => {
  const { isAuthenticated, user, login, logout, isLoading, error } =
    useAuthStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [showPhoneSuggestion, setShowPhoneSuggestion] = useState(false);
  const [useDefaultPhone, setUseDefaultPhone] = useState(false);

  const defaultPhone = "+79995079869";

  const handleLogin = async () => {
    if (userType === "seller") {
      // Продавец входит по токену
      if (!token.trim()) {
        // Можно показать ошибку валидации
        return;
      }
      await login("", "seller", token);
    } else {
      // Покупатель входит по телефону
      const phoneToUse = phone || (useDefaultPhone ? defaultPhone : "");
      if (!phoneToUse) {
        setShowPhoneSuggestion(true);
        return;
      }
      await login(phoneToUse, "buyer");
    }
    // Если ошибки нет — закрываем диалог
    if (!error) {
      setOpen(false);
      resetForm();
    }
  };

  const handleRegister = async () => {
    // Регистрация доступна только для покупателей
    if (userType === "seller") {
      // Для продавца регистрация не предусмотрена, можно показать сообщение
      return;
    }
    const phoneToUse = phone || (useDefaultPhone ? defaultPhone : "");
    if (!phoneToUse) {
      setShowPhoneSuggestion(true);
      return;
    }
    await login(phoneToUse, "buyer");
    if (!error) {
      setOpen(false);
      resetForm();
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
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
    if (type === "seller") {
      // Для теста продавца используем токен (можно захардкодить тестовый)
      const testToken = token || "af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77";
      login("", "seller", testToken);
    } else {
      const phoneToUse = phone || defaultPhone;
      login(phoneToUse, "buyer");
    }
    setTestMode(false);
    if (!error) {
      setOpen(false);
      resetForm();
    }
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center rounded-full">
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full">
                  <span className="text-lg font-bold text-blue-600">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-semibold tracking-tight text-gray-900">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.type === "buyer" ? "Покупатель" : "Продавец"}
                </p>
                <Badge variant="outline" className="mt-1">
                  {user?.contragent_phone || "—"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <a href={`/account${getLocationParamsString()}`}>
                  Перейти в личный кабинет
                </a>
              </Button>

              <Separator />

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-blue-600">
            Вход в систему
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {testMode ? (
            <motion.div
              key="test"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto text-amber-500 mb-2" />
                <h3 className="text-lg font-semibold">Быстрый тестовый вход</h3>
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
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mb-3">
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
                    <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded-full mb-3">
                      <span className="text-green-600 font-bold">S</span>
                    </div>
                    <h4 className="font-semibold">Продавец</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Управление товарами, статистика, заказы
                    </p>
                  </CardContent>
                </Card>
              </div>

              {userType === "buyer" ? (
                <Input
                  type="tel"
                  placeholder="Телефон для теста"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-center text-lg"
                />
              ) : (
                <Input
                  placeholder="Токен кассы (можно оставить пустым для тестового)"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="text-center text-lg"
                />
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => handleTestAuth(userType)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setTestMode(false)}
                className="w-full"
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
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex gap-3 justify-between mb-3">
                <Button
                  onClick={() => setUserType("buyer")}
                  className={`flex-1 ${
                    userType === "buyer"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Покупатель
                </Button>
                <Button
                  onClick={() => setUserType("seller")}
                  className={`flex-1 ${
                    userType === "seller"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Продавец
                </Button>
              </div>

              {userType === "buyer" ? (
                // Логика для покупателя
                <>
                  {mode === "login" ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Номер телефона"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      {showPhoneSuggestion && !phone && (
                        <div className="border rounded-lg p-4 bg-yellow-50">
                          <p className="text-sm font-medium mb-2">
                            Использовать стандартный номер?
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {defaultPhone}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={acceptDefaultPhone}
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Да
                            </Button>
                            <Button
                              onClick={declineDefaultPhone}
                              className="flex-1 bg-red-500 hover:bg-red-600"
                              variant="destructive"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Нет
                            </Button>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                      >
                        {isLoading ? "Вход..." : "Войти"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Input
                        type="tel"
                        placeholder="Телефон"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      {showPhoneSuggestion && !phone && (
                        <div className="border rounded-lg p-4 bg-yellow-50">
                          <p className="text-sm font-medium mb-2">
                            Использовать стандартный номер?
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {defaultPhone}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={acceptDefaultPhone}
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Да
                            </Button>
                            <Button
                              onClick={declineDefaultPhone}
                              className="flex-1 bg-red-500 hover:bg-red-600"
                              variant="destructive"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Нет
                            </Button>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                      >
                        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                // Логика для продавца — только вход по токену
                <div className="space-y-4">
                  <Input
                    placeholder="Токен кассы"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600"
                  >
                    {isLoading ? "Вход..." : "Войти как продавец"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Введите токен, полученный в личном кабинете TableCRM
                  </p>
                </div>
              )}

              {/* Переключатель режимов только для покупателя */}
              {userType === "buyer" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setMode("login")}
                    className={`flex-1 ${
                      mode === "login"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Вход
                  </Button>
                  <Button
                    onClick={() => setMode("register")}
                    className={`flex-1 ${
                      mode === "register"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Регистрация
                  </Button>
                </div>
              )}

              <div className="text-center">
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  onClick={() => setTestMode(true)}
                  className="w-full border-amber-200 text-amber-600 hover:bg-amber-50"
                >
                  Тестовый вход (демо)
                </Button>
              </div>

              {/* Ресурсы для продавцов (всегда видны, если выбран seller) */}
              {userType === "seller" && (
                <div className="pt-2">
                  <h4 className="font-medium mb-3">Ресурсы для продавцов</h4>
                  <div className="space-y-2">
                    <a
                      href="https://app.tablecrm.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">TC</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">TableCRM</p>
                        <p className="text-xs text-gray-500">
                          Управление продажами
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                    <a
                      href="https://t.me/productlabpro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">TG</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Telegram Bot</p>
                        <p className="text-xs text-gray-500">
                          Автоматизация заказов
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-gray-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Ваши данные защищены
                </p>
                <p>
                  Нажимая &quot;Войти&quot;, вы соглашаетесь с{" "}
                  <a
                    href="/terms"
                    className="text-blue-400 hover:underline"
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