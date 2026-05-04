"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PhoneInput } from "react-international-phone";
import { ChevronLeft } from "lucide-react";
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
  const [smsCode, setSmsCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { requestBuyerSmsCode, verifyBuyerSmsCode, isLoading, error, smsPendingPhone, smsCodeSentAt } = useAuthStore();

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

  // Countdown timer for SMS code resend
  useEffect(() => {
    if (!smsCodeSentAt) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - smsCodeSentAt) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setResendCountdown(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [smsCodeSentAt]);

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

  const handleRequestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 11) return;

    const success = await requestBuyerSmsCode(rawPhone);
    if (success) {
      setStep("code");
      setSmsCode("");
      toast.success("Код отправлен на номер");
    } else {
      toast.error(useAuthStore.getState().error || "Не удалось отправить код");
    }
  };

  const handleVerifySmsCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsPendingPhone || smsCode.length !== 6) return;

    const success = await verifyBuyerSmsCode(smsPendingPhone, smsCode);
    if (success) {
      toast.success("Вы успешно вошли");
      onSuccess?.();
      handleClose();
    } else {
      toast.error(useAuthStore.getState().error || "Неверный код");
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setSmsCode("");
  };

  const handleResendSms = async () => {
    const rawPhone = phone?.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 11) return;

    await requestBuyerSmsCode(rawPhone);
    setResendCountdown(60);
    toast.success("Код отправлен заново");
  };

  const handleClose = () => {
    onClose();
    setPhone("");
    setSmsCode("");
    setStep("phone");
    setResendCountdown(0);
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
              handleClose();
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
              <div className="flex items-center gap-2 mb-4">
                {step === "code" && (
                  <button
                    onClick={handleBackToPhone}
                    className="p-1 hover:bg-gray-100 rounded-md transition"
                    disabled={isLoading}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {step === "phone" ? "Вход по номеру телефона" : "Введите код из SMS"}
                  </h2>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md mb-4">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === "phone" ? (
                  <motion.form
                    key="phone-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleRequestSms}
                    className="space-y-4"
                  >
                    <p className="text-sm text-gray-500">
                      Мы отправим код подтверждения на указанный номер
                    </p>
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
                      {isLoading ? "Отправка..." : "Получить код"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="code-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleVerifySmsCode}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Код отправлен на номер
                      </p>
                      <p className="font-semibold text-gray-900">
                        {smsPendingPhone}
                      </p>
                    </div>

                    <Input
                      type="text"
                      placeholder="000000"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isLoading}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-semibold"
                    />

                    <Button
                      type="submit"
                      className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading || smsCode.length !== 6}
                    >
                      {isLoading ? "Проверка..." : "Подтвердить"}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        {resendCountdown > 0 ? (
                          <>Повторная отправка через {resendCountdown}с</>
                        ) : (
                          <>
                            Не получили код?{" "}
                            <button
                              type="button"
                              onClick={handleResendSms}
                              disabled={isLoading}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Отправить заново
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
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