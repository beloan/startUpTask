"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, Package,Settings,
  BarChart, TrendingUp, Eye,
  Shield, LogOut, Store, Award, Link
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
            <Link href='/'>На главную</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isSeller = user.type === 'seller';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-8 mt-3">
        {}
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
          {}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {}
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

                  {}
                  <h2 className="text-xl font-bold cursor-pointer">{user.name}</h2>
                  {user.company_name && (
                    <p className="text-gray-700 font-medium cursor-pointer">{user.company_name}</p>
                  )}
                  
                  <div className="mt-4 space-y-3 w-full">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                      <Phone className="w-4 h-4 text-gray-400 cursor-pointer" />
                      <span className="text-sm cursor-pointer">{user.contragent_phone}</span>
                    </div>
                    
                    {user.email && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                        <Mail className="w-4 h-4 text-gray-400 cursor-pointer" />
                        <span className="text-sm cursor-pointer">{user.email}</span>
                      </div>
                    )}
                    
                    {user.address && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                        <MapPin className="w-4 h-4 text-gray-400 cursor-pointer" />
                        <span className="text-sm cursor-pointer">{user.address}</span>
                      </div>
                    )}
                    
                    {user.registration_date && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                        <Calendar className="w-4 h-4 text-gray-400 cursor-pointer" />
                        <span className="text-sm cursor-pointer">
                          С {new Date(user.registration_date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {}
                  <div className="space-y-2 w-full">
                    <Button variant="outline" className="w-full justify-start cursor-pointer">
                      <Settings className="w-4 h-4 mr-2 cursor-pointer" />
                      Настройки профиля
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start cursor-pointer">
                      <Shield className="w-4 h-4 mr-2 cursor-pointer" />
                      Безопасность
                    </Button>
                    
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

          {}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500 font-medium pr-4">Просмотры</p>
                              <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                              <Eye className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-green-600 font-medium">↑ 12% за месяц</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500 font-medium pr-4">Продажи</p>
                              <p className="text-2xl font-bold">{stats.sales}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                              <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-green-600 font-medium">↑ 8% за месяц</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500 font-medium pr-4">Избранное</p>
                              <p className="text-2xl font-bold">{stats.favorites}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                              <Award className="w-6 h-6 text-amber-600" />
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-green-600 font-medium">↑ 15% за месяц</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500 font-medium pr-4">Конверсия</p>
                              <p className="text-2xl font-bold">{stats.conversion}%</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                              <BarChart className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-green-600 font-medium">↑ 1.2% за месяц</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 cursor-pointer">
                          <BarChart className="w-5 h-5 cursor-pointer" />
                          Детальная статистика по товарам
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium cursor-pointer">Просмотры по дням (последние 7 дней)</h3>
                              <Badge className="cursor-pointer">За неделю</Badge>
                            </div>
                            <div className="space-y-2">
                              {[180, 220, 190, 250, 210, 240, 230].map((value, index) => (
                                <div key={index} className="flex items-center gap-3 cursor-pointer">
                                  <span className="text-sm text-gray-500 w-20 cursor-pointer">
                                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index]}
                                  </span>
                                  <Progress value={(value / 300) * 100} className="flex-1 cursor-pointer" />
                                  <span className="text-sm font-medium cursor-pointer">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-3 cursor-pointer">Самые популярные товары</h3>
                            <div className="space-y-2">
                              {[
                                { name: 'Смартфон Premium', views: 450, sales: 23 },
                                { name: 'Наушники Pro', views: 320, sales: 18 },
                                { name: 'Часы Smart', views: 280, sales: 15 },
                              ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                  <div>
                                    <p className="font-medium cursor-pointer">{item.name}</p>
                                    <p className="text-sm text-gray-500 cursor-pointer">{item.views} просмотров</p>
                                  </div>
                                  <Badge variant="outline" className="cursor-pointer">{item.sales} продаж</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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