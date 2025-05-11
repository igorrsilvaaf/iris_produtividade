import { type TimerMode } from "@/lib/stores/pomodoro-store";

export const getPomodoroModeStyles = (mode: TimerMode) => {
  switch (mode) {
    case "work":
      return {
        timerTextColorClass: "text-red-500",
        activeTabClasses: "text-red-500 border-red-500",
        playButtonClasses: "bg-red-500 text-primary-foreground hover:bg-red-600 border-red-600",
        progressIndicatorClass: "bg-red-500",
      };
    case "shortBreak":
      return {
        timerTextColorClass: "text-emerald-500",
        activeTabClasses: "text-emerald-500 border-emerald-500",
        playButtonClasses: "bg-emerald-500 text-primary-foreground hover:bg-emerald-600 border-emerald-600",
        progressIndicatorClass: "bg-emerald-500",
      };
    case "longBreak":
      return {
        timerTextColorClass: "text-sky-500",
        activeTabClasses: "text-sky-500 border-sky-500",
        playButtonClasses: "bg-sky-500 text-primary-foreground hover:bg-sky-600 border-sky-600",
        progressIndicatorClass: "bg-sky-500",
      };
    default:
      return {
        timerTextColorClass: "", 
        activeTabClasses: "text-foreground border-transparent",
        playButtonClasses: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
        progressIndicatorClass: "bg-primary",
      };
  }
}; 