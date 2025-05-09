'use client';

import { PomodoroTimer } from "@/components/pomodoro-timer";
import { FlipClock } from "@/components/flip-clock";
import { useTranslation } from "@/lib/i18n";
import { usePomodoroStore, type TimerMode } from "@/lib/stores/pomodoro-store";
import { getPomodoroModeStyles } from "@/lib/pomodoro-utils";
import React, { useEffect } from "react";

interface RightColumnProps {
  initialSettings: {
    pomodoro_work_minutes: number;
    pomodoro_break_minutes: number;
    pomodoro_long_break_minutes: number;
    pomodoro_cycles: number;
    enable_sound: boolean;
    notification_sound: string;
    pomodoro_sound: string;
    enable_desktop_notifications: boolean;
    enable_flip_clock?: boolean;
    flip_clock_size?: string;
    flip_clock_color?: string;
    language?: string;
  };
}

export function RightColumn({ initialSettings }: RightColumnProps) {
  const { t } = useTranslation();
  const pomodoroStore = usePomodoroStore();
  const currentMode = pomodoroStore.mode;

  useEffect(() => {
    if (initialSettings) {
      pomodoroStore.updateSettings({
        workMinutes: initialSettings.pomodoro_work_minutes,
        shortBreakMinutes: initialSettings.pomodoro_break_minutes,
        longBreakMinutes: initialSettings.pomodoro_long_break_minutes,
        longBreakInterval: initialSettings.pomodoro_cycles,
        enableSound: initialSettings.enable_sound,
        notificationSound: initialSettings.notification_sound,
        pomodoroSound: initialSettings.pomodoro_sound,
        enableDesktopNotifications: initialSettings.enable_desktop_notifications,
      });
    }
  }, [initialSettings, pomodoroStore.updateSettings]);

  const { timerTextColorClass, activeTabStyleClass } = getPomodoroModeStyles(currentMode);
  const transitionClasses = "transition-colors duration-300 ease-in-out";

  return (
    <div className="space-y-6">
      <PomodoroTimer 
        selectedTaskId={null}
        fullScreen={false}
        timerTextColorClass={`${timerTextColorClass} ${transitionClasses}`}
        activeTabStyleClass={activeTabStyleClass}
      />
      {initialSettings.enable_flip_clock && (
        <FlipClock 
          size={initialSettings.flip_clock_size} 
          color={initialSettings.flip_clock_color} 
        />
      )}
    </div>
  );
} 