"use client"
import { Calendar, Hand, Gift, Mail, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import Link from "next/link";

const SubscribeNewsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("https://user-agent.cc/hook/9VRykWNozDCaz0cfb2ZF6RcZgfLR5x", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Спасибо за подписку! Проверьте вашу почту.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage("Произошла ошибка. Попробуйте позже.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Ошибка соединения. Проверьте интернет.");
    }
  };

  return (
    <section className="pt-8">
      <div className="container">
        <div className="relative isolate overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl py-8 md:py-12 shadow-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          
          <div className="relative px-4 md:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-2 lg:items-center">
              <div className="max-w-xl lg:max-w-lg">
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Gift className="w-4 h-4" />
                  Специальные предложения
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Первыми узнавайте о скидках
                </h2>
                <p className="pt-2 text-base text-gray-600">
                  Подпишитесь на рассылку и получайте эксклюзивные предложения, 
                  персональные скидки и информацию о новинках первыми. Никакого спама.
                </p>
                
                <div className="pt-6">
                  <form onSubmit={handleSubmit} className="flex max-w-md gap-x-3">
                    <div className="flex-1">
                      <label htmlFor="email-address" className="sr-only">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email-address"
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Ваш email"
                          autoComplete="email"
                          className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                          disabled={status === "loading"}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-600 w-37 hover:bg-blue-700 cursor-pointer"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : 
                        "Подписаться"
                      }
                     
                    </Button>
                  </form>
                  
                  {message && (
                    <p className={`mt-3 text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>
                      {message}
                    </p>
                  )}
                  
                  <p className="mt-3 text-xs text-gray-500">
                    Подписываясь, вы соглашаетесь с{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      политикой конфиденциальности
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg border border-blue-100">
                  <div className="inline-flex p-2 bg-blue-100 rounded-lg mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Еженедельные подборки
                  </h3>
                  <p className="text-sm text-gray-600">
                    Лучшие товары недели, подборки по категориям и полезные советы по выбору.
                  </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg border border-blue-100">
                  <div className="inline-flex p-2 bg-green-100 rounded-lg mb-3">
                    <Hand className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Только полезное
                  </h3>
                  <p className="text-sm text-gray-600">
                    Никакого спама. Только релевантные предложения и важные обновления.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscribeNewsletter;