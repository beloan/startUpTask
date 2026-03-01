"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { useAuthStore } from "@/entities/user";
import { toast } from "sonner";

interface PhoneAuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PhoneAuthSheet = ({ isOpen, onClose, onSuccess }: PhoneAuthSheetProps) => {
  const [phone, setPhone] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const widthRef = useRef(420);

  const THRESHOLD = 0.28;
  const VELOCITY_THRESHOLD = 0.75;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  // Логика перетаскивания (без изменений)
  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return;
    const clientX = e.clientX;
    const now = Date.now();
    const deltaTime = Math.max(now - lastTime.current, 1);
    const deltaX = clientX - lastX.current;
    velocity.current = deltaX / deltaTime;
    lastX.current = clientX;
    lastTime.current = now;
    let newTranslate = clientX - startX.current;
    const maxWidth = widthRef.current;
    if (newTranslate > maxWidth) {
      const overscroll = newTranslate - maxWidth;
      newTranslate = maxWidth + overscroll * 0.38;
    }
    newTranslate = Math.max(0, newTranslate);
    currentTranslate.current = newTranslate;
    if (drawerRef.current) {
      drawerRef.current.style.transform = `translateX(${newTranslate}px)`;
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging.current) return;
    const translate = currentTranslate.current;
    const vel = velocity.current;
    const width = widthRef.current;
    const shouldClose = translate > width * THRESHOLD || vel > VELOCITY_THRESHOLD;
    if (handleRef.current) {
      handleRef.current.releasePointerCapture(e.pointerId);
    }
    handleRef.current?.removeEventListener("pointermove", handlePointerMove);
    handleRef.current?.removeEventListener("pointerup", handlePointerUp);
    handleRef.current?.removeEventListener("pointercancel", handlePointerCancel);
    isDragging.current = false;
    if (shouldClose) {
      onClose();
    } else if (drawerRef.current) {
      drawerRef.current.style.transform = "";
    }
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (handleRef.current) {
      handleRef.current.releasePointerCapture(e.pointerId);
    }
    handleRef.current?.removeEventListener("pointermove", handlePointerMove);
    handleRef.current?.removeEventListener("pointerup", handlePointerUp);
    handleRef.current?.removeEventListener("pointercancel", handlePointerCancel);
    isDragging.current = false;
    if (drawerRef.current) {
      drawerRef.current.style.transform = "";
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType !== "touch") return;
    e.preventDefault();
    e.stopPropagation();
    const rect = drawerRef.current?.getBoundingClientRect();
    widthRef.current = rect?.width || 420;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    velocity.current = 0;
    currentTranslate.current = 0;
    isDragging.current = true;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    target.addEventListener("pointermove", handlePointerMove as EventListener);
    target.addEventListener("pointerup", handlePointerUp as EventListener);
    target.addEventListener("pointercancel", handlePointerCancel as EventListener);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 11) return;

    setIsLoading(true);
    try {
      await login(rawPhone, "buyer");
      toast.success("Вы успешно вошли");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Ошибка входа. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[60] flex flex-col overflow-hidden rounded-l-xl will-change-transform"
          >
            <div
              ref={handleRef}
              onPointerDown={handlePointerDown}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-24 bg-transparent flex items-center justify-center touch-none select-none cursor-grabbing z-50"
              title="Потяните вправо, чтобы закрыть"
            >
              <div className="w-1 h-20 bg-gray-300 rounded-full" />
            </div>
            <div className="flex-1 pt-8 pb-6 px-6 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">Вход по номеру телефона</h2>
              <p className="text-sm text-gray-500 mb-8">
                Мы отправим код подтверждения на указанный номер
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <PhoneInput
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={setPhone}
                  defaultCountry="ru"
                  disabled={isLoading}
                  inputProps={{
                    className: "w-full border-1 border-[#dcdcdc] rounded-r-sm pl-3",
                  }}
                />
                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || (phone?.replace(/\D/g, "").length || 0) < 11}
                >
                  {isLoading ? "Вход..." : "Продолжить"}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};