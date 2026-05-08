import { Star } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/kit/avatar";
import { Button } from "@/shared/ui/kit/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";

const Rating = () => {
  const rating = [
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
    {
      info: {
        avatar: "https://github.com/shadcn.png",
        name: "Ozon",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, voluptatibus autem, ipsum doloribus aliquid quam deserunt debitis nihil assumenda incidunt nam reprehenderit corporis laborum voluptate nostrum iure ut ducimus aperiam.",
      },
      rating: {
        rate: 4.8,
        count: 1111,
        review: 400,
      },
      date: "",
    },
  ];

  return (
    <div>
      <section className="py-4 md:py-12">
        <div className="container">
          <div className="flex gap-2 md:items-center md:justify-between flex-col md:flex-row">
            <h1 className="text-lg tracking-tight font-medium">
              Рейтинг цветочных магазинов Казани
            </h1>
            <Select value="week">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="yesterday">Вчера</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="year">За год</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="border border-gray-200 rounded-md mt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40 md:w-lg">Инфо</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Заказы</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Детали</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rating.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <div className="flex gap-2 w-40 md:w-lg overflow-hidden">
                        <Avatar className="size-8">
                          <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-medium">{item.info.name}</p>
                          <span className="text-xs text-gray-500 truncate">
                            {item.info.description}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-xl md:text-3xl">4.9</p>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-0.5 pt-2">
                            <Star
                              width={16}
                              height={16}
                              strokeWidth={1}
                              fill="gold"
                              stroke="gold"
                            />
                            <Star
                              width={16}
                              height={16}
                              strokeWidth={1}
                              fill="gold"
                              stroke="gold"
                            />
                            <Star
                              width={16}
                              height={16}
                              strokeWidth={1}
                              fill="gold"
                              stroke="gold"
                            />
                            <Star
                              width={16}
                              height={16}
                              strokeWidth={1}
                              fill="gold"
                              stroke="gold"
                            />
                            <Star
                              width={16}
                              height={16}
                              strokeWidth={1}
                              fill="gold"
                              stroke="gold"
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            233 отзыва
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-500">
                          Всего:{" "}
                          <strong className="text-black font-medium">
                            3332
                          </strong>
                        </p>
                        <p className="text-gray-500">
                          Выполнено:{" "}
                          <strong className="text-green-600 font-medium">
                            1102
                          </strong>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-500">
                          Регистация:{" "}
                          <strong className="text-black font-medium">
                            12 Июля 2019
                          </strong>
                        </p>
                        <p className="text-gray-500">
                          Последний заказ:{" "}
                          <strong className="text-black font-medium">
                            8 Ноября 2026
                          </strong>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button className="ml-auto flex" variant="outline">
                        Подробнее
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rating;
