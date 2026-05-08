"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import { Button } from "@/shared/ui/kit/button";
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
  const [isMobile, setIsMobile] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);      
  const currentTranslate = useRef(0);
  const lastPos = useRef(0);       
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const sizeRef = useRef(420);

  const THRESHOLD = 0.28;
  const VELOCITY_THRESHOLD = 0.75;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return;

    const clientPos = isMobile ? e.clientY : e.clientX;
    const now = Date.now();
    const deltaTime = Math.max(now - lastTime.current, 1);
    const deltaPos = clientPos - lastPos.current;
    velocity.current = deltaPos / deltaTime;
    lastPos.current = clientPos;
    lastTime.current = now;

    let newTranslate = clientPos - startPos.current;
    const maxSize = sizeRef.current;
    if (newTranslate > maxSize) {
      const overscroll = newTranslate - maxSize;
      newTranslate = maxSize + overscroll * 0.38;
    }
    newTranslate = Math.max(0, newTranslate);
    currentTranslate.current = newTranslate;

    if (drawerRef.current) {
      const translateProp = isMobile ? `translateY(${newTranslate}px)` : `translateX(${newTranslate}px)`;
      drawerRef.current.style.transform = translateProp;
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging.current) return;

    const translate = currentTranslate.current;
    const vel = velocity.current;
    const maxSize = sizeRef.current;
    const shouldClose = translate > maxSize * THRESHOLD || vel > VELOCITY_THRESHOLD;

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
    if (isMobile) {
      sizeRef.current = rect?.height || window.innerHeight * 0.9;
    } else {
      sizeRef.current = rect?.width || 420;
    }

    const clientPos = isMobile ? e.clientY : e.clientX;
    startPos.current = clientPos;
    lastPos.current = clientPos;
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
    const rawPhone = "+" + phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 12) return;

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

  const drawerVariants = {
    hidden: isMobile ? { y: "100%" } : { x: "100%" },
    visible: isMobile ? { y: 0 } : { x: 0 },
    exit: isMobile ? { y: "100%" } : { x: "100%" },
  };

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
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />

          <motion.div
            key="drawer"
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "fixed bg-white shadow-2xl z-[60] overflow-hidden will-change-transform",
              isMobile
                ? "bottom-0 left-0 w-full rounded-t-xl"
                : "top-0 right-0 h-full w-full max-w-[420px] rounded-l-xl"
            )}
            style={isMobile ? { maxHeight: "90vh" } : {}}
          >
            {/* Универсальная ручка для перетаскивания */}
            <div
              ref={handleRef}
              onPointerDown={handlePointerDown}
              className={cn(
                "absolute bg-transparent flex items-center justify-center touch-none select-none cursor-grab z-50",
                isMobile
                  ? "top-0 left-1/2 -translate-x-1/2 w-24 h-10"
                  : "left-0 top-1/2 -translate-y-1/2 w-10 h-24"
              )}
              title={isMobile ? "Потяните вниз, чтобы закрыть" : "Потяните вправо, чтобы закрыть"}
            >
              <div
                className={cn(
                  "bg-gray-300 rounded-full",
                  isMobile ? "w-20 h-1" : "w-1 h-20"
                )}
              />
            </div>

            {/* Контент */}
            <div className={cn("overflow-y-auto", isMobile ? "pt-12 pb-6 px-4" : "pt-8 pb-6 px-6")}>
              <h2 className="text-xl font-semibold mb-2">Вход по номеру телефона</h2>
              <p className="text-sm text-gray-500 mb-4">
                Мы отправим код подтверждения на указанный номер
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PhoneInput
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={setPhone}
                  defaultCountry="ru"
                  disabled={isLoading}
                  countrySelectorStyleProps={{
                    buttonStyle: { paddingLeft: "7px", paddingRight: "2px" },
                  }}
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

// Вспомогательная функция для условных классов
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};