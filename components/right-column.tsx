'use client';

import { PomodoroTimer } from "@/components/pomodoro-timer";

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
  };
}

export function RightColumn({ initialSettings }: RightColumnProps) {
  return (
    <div>
      <PomodoroTimer initialSettings={initialSettings} />
    </div>
  );
} 