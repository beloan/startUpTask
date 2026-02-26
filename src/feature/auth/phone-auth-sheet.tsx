// components/auth/phone-auth-sheet.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/kit/sheet";
import { useAuthStore } from "@/entities/user";
import { toast } from "sonner";

interface PhoneAuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PhoneAuthSheet = ({ isOpen, onClose, onSuccess }: PhoneAuthSheetProps) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoading(true);
    try {
      // Здесь можно добавить реальную проверку номера (например, через API)
      // Пока используем мок-логин
      login(phone, "buyer");
      toast.success("Вы успешно вошли");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Ошибка входа. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto w-100 m-auto p-6 mb-5 rounded-lg">
        <SheetHeader>
          <SheetTitle>Вход по номеру телефона</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Вход..." : "Продолжить"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};