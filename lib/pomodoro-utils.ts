import { type TimerMode } from "@/lib/stores/pomodoro-store";

export const getPomodoroModeStyles = (mode: TimerMode) => {
  switch (mode) {
    case "work":
      return {
        timerTextColorClass: "text-rose-500",
        activeTabStyleClass: "[&>[data-state=active]]:text-rose-500 [&>[data-state=active]]:border-b-2 [&>[data-state=active]]:border-rose-500",
      };
    case "shortBreak":
      return {
        timerTextColorClass: "text-emerald-500",
        activeTabStyleClass: "[&>[data-state=active]]:text-emerald-500 [&>[data-state=active]]:border-b-2 [&>[data-state=active]]:border-emerald-500",
      };
    case "longBreak":
      return {
        timerTextColorClass: "text-sky-500",
        activeTabStyleClass: "[&>[data-state=active]]:text-sky-500 [&>[data-state=active]]:border-b-2 [&>[data-state=active]]:border-sky-500",
      };
    default:
      return {
        timerTextColorClass: "", 
        activeTabStyleClass: "", 
      };
  }
}; 