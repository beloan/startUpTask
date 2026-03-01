"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, Package,
  BarChart, TrendingUp, Eye,
  LogOut, Store, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthStore } from '@/entities/user';
import { Button } from '@/shared/ui/kit/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/kit/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Badge } from '@/shared/ui/kit/badge';
import { Separator } from '@/shared/ui/kit/separator';
import { Progress } from '@/shared/ui/kit/progress';

export default function AccountPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    sales: 0,
    favorites: 0,
    conversion: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      if (user?.type === 'seller') {
        setStats({
          views: 1234,
          sales: 56,
          favorites: 89,
          conversion: 4.5,
        });
      }
      setIsLoading(false);
    }, 500);
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto space-y-6 mb-10 mt-10 h-167">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400 cursor-pointer" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Доступ ограничен</h1>
          <p className="text-gray-600">Пожалуйста, войдите в систему чтобы получить доступ к личному кабинету</p>
          <Button asChild className="cursor-pointer">
            <a href="/">На главную</a>
          </Button>
        </div>
      </div>
    );
  }

  const isSeller = user.type === 'seller';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-8 mt-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Личный кабинет {isSeller && 'продавца'}
          </h1>
          <p className="text-gray-600 mt-2 cursor-pointer">
            {isSeller 
              ? 'Управляйте товарами, отслеживайте статистику и анализируйте продажи'
              : 'Отслеживайте заказы, управляйте профилем и получайте персональные предложения'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - профиль */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Аватар */}
                  <div className="relative mb-4 cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-blue-600 cursor-pointer" />
                        )}
                      </div>
                    </div>
                    {isSeller && (
                      <div className="absolute -bottom-2 -right-2 cursor-pointer">
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600">
                          <Store className="w-3 h-3 mr-1 cursor-pointer" />
                          Продавец
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Имя заменено на роль */}
                  <h2 className="text-xl font-bold cursor-pointer">
                    {isSeller ? 'Продавец' : 'Покупатель'}
                  </h2>
                  {user.company_name && (
                    <p className="text-gray-700 font-medium cursor-pointer">{user.company_name}</p>
                  )}
                  
                  <div className="mt-4 space-y-3 w-full">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                      <Phone className="w-4 h-4 text-gray-400 cursor-pointer" />
                      <span className="text-sm cursor-pointer">{user.contragent_phone}</span>
                    </div>           
                    
                    {user.address && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                        <MapPin className="w-4 h-4 text-gray-400 cursor-pointer" />
                        <span className="text-sm cursor-pointer">{user.address}</span>
                      </div>
                    )}
                  
                  </div>

                  <Separator className="my-4" />

                  {/* Только кнопка выхода */}
                  <div className="space-y-2 w-full">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2 cursor-pointer" />
                      Выйти
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - вкладки (без изменений) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue={isSeller ? "stats" : "orders"} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                {isSeller ? (
                  <>
                    <TabsTrigger value="stats" className="cursor-pointer">Статистика</TabsTrigger>
                    <TabsTrigger value="products" className="cursor-pointer">Товары</TabsTrigger>
                    <TabsTrigger value="orders" className="cursor-pointer">Заказы</TabsTrigger>
                    <TabsTrigger value="analytics" className="cursor-pointer">Аналитика</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="orders" className="cursor-pointer">Заказы</TabsTrigger>
                    <TabsTrigger value="favorites" className="cursor-pointer">Избранное</TabsTrigger>
                    <TabsTrigger value="addresses" className="cursor-pointer">Адреса</TabsTrigger>
                    <TabsTrigger value="settings" className="cursor-pointer">Настройки</TabsTrigger>
                  </>
                )}
              </TabsList>

              {isSeller ? (
                <>
                  <TabsContent value="stats" className="space-y-6">
                    {/* ... содержимое статистики (без изменений) ... */}
                  </TabsContent>

                  <TabsContent value="products">
                    <Card>
                      <CardHeader>
                        <CardTitle className="cursor-pointer">Управление товарами</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 cursor-pointer">Раздел в разработке</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="orders">
                    <Card>
                      <CardHeader>
                        <CardTitle className="cursor-pointer">Заказы</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 cursor-pointer">Раздел в разработке</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <CardTitle className="cursor-pointer">Расширенная аналитика</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 cursor-pointer">Раздел в разработке</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              ) : (
                <>
                  <TabsContent value="orders">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 cursor-pointer">
                          <ShoppingBag className="w-5 h-5 cursor-pointer" />
                          Мои заказы
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4 cursor-pointer" />
                          <h3 className="text-lg font-semibold mb-2 cursor-pointer">Заказов пока нет</h3>
                          <p className="text-gray-600 mb-4 cursor-pointer">
                            Совершите первую покупку и она появится здесь
                          </p>
                          <Button asChild className="cursor-pointer">
                            <a href="/products">Перейти к покупкам</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="favorites">
                    <Card>
                      <CardHeader>
                        <CardTitle className="cursor-pointer">Избранное</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 cursor-pointer">Раздел в разработке</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="addresses">
                    <Card>
                      <CardHeader>
                        <CardTitle className="cursor-pointer">Адреса доставки</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 cursor-pointer">Раздел в разработке</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card>
                      <CardHeader>
                        <CardTitle className="cursor-pointer">Настройки аккаунта</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 cursor-pointer">Раздел в разработке</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}