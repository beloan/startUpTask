type GoalPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

export function sendYandexGoal(goalName: string, payload: GoalPayload = {}) {
  if (typeof window === "undefined") return;

  try {
    const ym = window.ym;
    if (typeof ym !== "function") return;

    if (Object.keys(payload).length > 0) {
      ym(107009951, "reachGoal", goalName, payload);
    } else {
      ym(107009951, "reachGoal", goalName);
    }
  } catch (error) {
    console.error("Failed to send Yandex goal:", error);
  }
}