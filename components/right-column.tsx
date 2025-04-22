'use client';

import { PomodoroTimer } from "@/components/pomodoro-timer";
import { FlipClock } from "@/components/flip-clock";
import { useTranslation } from "@/lib/i18n";

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
  const { language } = useTranslation();
  const showFlipClock = initialSettings.enable_flip_clock !== false;
  const clockSize = initialSettings.flip_clock_size || 'medium';
  const clockColor = initialSettings.flip_clock_color || '#ff5722';
  const userLanguage = initialSettings.language || language || 'pt';

  return (
    <div className="flex flex-col space-y-6">
      <PomodoroTimer initialSettings={initialSettings} />
      
      {showFlipClock && (
        <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 overflow-hidden">
          <h3 className="text-lg font-medium mb-4 text-center">
            {userLanguage === 'en' ? 'Current Time' : 'Hora Atual'}
          </h3>
          <div className="flex justify-center w-full overflow-x-auto py-2">
            <FlipClock 
              showSeconds={true}
              size={clockSize as 'small' | 'medium' | 'large'}
              color={clockColor}
              language={userLanguage}
            />
          </div>
        </div>
      )}
    </div>
  );
} 