// app/seller/statistics/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Eye, MousePointer, ShoppingCart, TrendingUp, Users, Package, 
  Calendar, Filter, Download, RefreshCw, DollarSign 
} from 'lucide-react';

import { useSellerStatistics } from '@/entities/statistics/model/hooks';
import { useAuthStore } from '@/entities/user';
import { Button } from '@/shared/ui/kit/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/kit/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Badge } from '@/shared/ui/kit/badge';
import { Label } from '@/shared/ui/kit/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/kit/select';
import { getLocationParamsString } from '@/shared/lib/city-utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SellerStatisticsPage() {
  const { user } = useAuthStore();
  const [days, setDays] = useState(30);
  const [dateRange, setDateRange] = useState(() => {
    const now = Date.now();
      return {
      start: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date(now).toISOString().split('T')[0]
      };
  });

  const cashbox_id = user?.type === 'seller' ? 113 : null;

  const { data: statistics, isLoading, refetch } = useSellerStatistics(cashbox_id || 113, days);

  if (!user || user.type !== 'seller') {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
            <Users className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Доступ запрещен</h1>
          <p className="text-gray-600">Эта страница доступна только для продавцов</p>
          <Button asChild>
            <a href={`/account${getLocationParamsString()}`}>Вернуться в личный кабинет</a>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  const dailyData = statistics?.daily_stats || [];
  const popularProducts = statistics?.popular_products || [];

  const conversionData = [
    { name: 'Просмотры', value: statistics?.total_views || 0 },
    { name: 'Клики', value: statistics?.total_clicks || 0 },
    { name: 'В корзину', value: statistics?.total_add_to_cart || 0 },
    { name: 'Покупки', value: statistics?.total_purchases || 0 },
  ];

  const productConversionData = popularProducts.map(product => ({
    name: product.product_name.substring(0, 15) + (product.product_name.length > 15 ? '...' : ''),
    conversion: product.conversion,
    views: product.views,
    purchases: product.purchases,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Статистика продавца</h1>
              <p className="text-gray-600 mt-2">
                Анализ эффективности ваших товаров за последние {days} дней
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="days" className="text-sm">Период:</Label>
                <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
                  <SelectTrigger className="w-32 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='cursor-pointer'>
                    <SelectItem value="7" className='cursor-pointer'>7 дней</SelectItem>
                    <SelectItem value="30" className='cursor-pointer'>30 дней</SelectItem>
                    <SelectItem value="90" className='cursor-pointer'>90 дней</SelectItem>
                    <SelectItem value="180" className='cursor-pointer'>180 дней</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="cursor-pointer" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2 cursor-pointer" />
                Обновить
              </Button>
              
              <Button variant="outline" className='cursor-pointer'>
                <Download className="w-4 h-4 mr-2 cursor-pointer" />
                Экспорт
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Всего просмотров</p>
                  <p className="text-2xl font-bold mt-2">{statistics?.total_views?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% за месяц</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Клики по товарам</p>
                  <p className="text-2xl font-bold mt-2">{statistics?.total_clicks?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8% за месяц</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <MousePointer className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Добавлено в корзину</p>
                  <p className="text-2xl font-bold mt-2">{statistics?.total_add_to_cart?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 15% за месяц</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Конверсия</p>
                  <p className="text-2xl font-bold mt-2">{statistics?.conversion_rate?.toFixed(1) || 0}%</p>
                  <p className="text-xs text-green-600 mt-1">↑ 1.2% за месяц</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="conversion">Конверсия</TabsTrigger>
            <TabsTrigger value="revenue">Доход</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Активность по дням</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#0088FE" name="Просмотры" />
                        <Line type="monotone" dataKey="clicks" stroke="#00C49F" name="Клики" />
                        <Line type="monotone" dataKey="purchases" stroke="#FF8042" name="Покупки" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Распределение конверсии</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={conversionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {conversionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по товарам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Товар</th>
                          <th className="text-left py-3 px-4">Просмотры</th>
                          <th className="text-left py-3 px-4">Клики</th>
                          <th className="text-left py-3 px-4">Покупки</th>
                          <th className="text-left py-3 px-4">Конверсия</th>
                          <th className="text-left py-3 px-4">CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {popularProducts.map((product, index) => (
                          <tr key={product.product_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium">{product.product_name}</div>
                              <div className="text-sm text-gray-500">ID: {product.product_id}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 text-gray-400 mr-2" />
                                {product.views.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <MousePointer className="w-4 h-4 text-gray-400 mr-2" />
                                {product.clicks.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Package className="w-4 h-4 text-gray-400 mr-2" />
                                {product.purchases.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={product.conversion > 5 ? "default" : product.conversion > 2 ? "outline" : "destructive"}>
                                {product.conversion.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                {((product.clicks / product.views) * 100).toFixed(1)}%
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productConversionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="conversion" name="Конверсия (%)" fill="#0088FE" />
                        <Bar dataKey="views" name="Просмотры" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion">
            <Card>
              <CardHeader>
                <CardTitle>Анализ конверсии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700">Воронка продаж</h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span>Просмотры → Клики</span>
                          <span className="font-medium">
                            {statistics?.total_views && statistics?.total_clicks 
                              ? ((statistics.total_clicks / statistics.total_views) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Клики → Корзина</span>
                          <span className="font-medium">
                            {statistics?.total_clicks && statistics?.total_add_to_cart 
                              ? ((statistics.total_add_to_cart / statistics.total_clicks) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Корзина → Покупки</span>
                          <span className="font-medium">
                            {statistics?.total_add_to_cart && statistics?.total_purchases 
                              ? ((statistics.total_purchases / statistics.total_add_to_cart) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700">Средние показатели</h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span>CTR</span>
                          <span className="font-medium">
                            {statistics?.total_views && statistics?.total_clicks 
                              ? ((statistics.total_clicks / statistics.total_views) * 100).toFixed(1) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Средняя конверсия</span>
                          <span className="font-medium">{statistics?.conversion_rate?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Стоимость клика</span>
                          <span className="font-medium">~5.2₽</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700">Оптимизация</h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Высокая конверсия: {statistics?.popular_products?.[0]?.product_name || 'Нет данных'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Низкая конверсия: требуется оптимизация</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span>Высокий CTR: {statistics?.popular_products?.[1]?.product_name || 'Нет данных'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Анализ доходов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Раздел доходов находится в разработке</p>
                  <p className="text-sm mt-2">В ближайшее время здесь появится детальная аналитика по доходам</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Рекомендации для роста
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold mb-2">Улучшите изображения</h4>
                <p className="text-sm text-gray-600">
                  Товары с качественными фото имеют на 40% выше конверсию
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold mb-2">Оптимизируйте описания</h4>
                <p className="text-sm text-gray-600">
                  Добавьте ключевые слова и преимущества товаров
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-semibold mb-2">Анализируйте конкурентов</h4>
                <p className="text-sm text-gray-600">
                  Следите за ценами и предложениями в вашей категории
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}