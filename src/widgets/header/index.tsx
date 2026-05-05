"use client";

import { MessageCircle } from "lucide-react";
import React from "react";

import { LoginPopup } from "@/feature/auth";

import { Button } from "@/shared/ui/kit/button";

export const Header = () => {
  const supportUrl = "https://qrrun.ru/qr/82a4f13l";

  return (
    <header className="fixed w-full top-0 z-50 border-b border-gray-100 bg-white">
      <div className="container">
        <div className="flex items-center justify-end gap-4 py-3">
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-normal tracking-tight text-gray-700 hover:text-blue-600"
            title="Поддержка"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Поддержка</span>
          </a>
          <LoginPopup
            trigger={
              <Button
                variant="link"
                className="text-sm font-normal p-0 h-auto tracking-tight text-gray-700 cursor-pointer"
              >
                Вход в систему
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
};