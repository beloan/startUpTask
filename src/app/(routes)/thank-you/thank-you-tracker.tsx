"use client";

import { useEffect } from "react";

import { sendYandexGoal } from "@/shared/lib/analytics";

export function ThankYouTracker() {
  useEffect(() => {
    sendYandexGoal("thankyou_view", {
      source_page: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, []);

  return null;
}