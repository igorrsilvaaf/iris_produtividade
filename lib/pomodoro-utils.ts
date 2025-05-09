import { type TimerMode } from "@/lib/stores/pomodoro-store";

export const getPomodoroModeStyles = (mode: TimerMode) => {
  switch (mode) {
    case "work":
      return {
        timerTextColorClass: "text-rose-500",
        activeTabClasses: "text-rose-500 border-rose-500",
      };
    case "shortBreak":
      return {
        timerTextColorClass: "text-emerald-500",
        activeTabClasses: "text-emerald-500 border-emerald-500",
      };
    case "longBreak":
      return {
        timerTextColorClass: "text-sky-500",
        activeTabClasses: "text-sky-500 border-sky-500",
      };
    default:
      return {
        timerTextColorClass: "", 
        activeTabClasses: "text-foreground border-transparent",
      };
  }
}; 