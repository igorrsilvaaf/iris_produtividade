'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FlipClockProps {
  showSeconds?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  language?: string;
}

export function FlipClock({ 
  showSeconds = true, 
  size = 'medium', 
  color = '#ff5722',
  language = 'pt'
}: FlipClockProps) {
  const [time, setTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      setTime({
        hours,
        minutes,
        seconds,
      });
    };

    // Update time immediately and then every second
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Size mappings
  const sizeClasses = {
    small: {
      container: 'p-1',
      card: 'h-18 w-24 text-2xl',
      tickMark: 'text-xs',
    },
    medium: {
      container: 'p-2',
      card: 'h-24 w-32 text-4xl',
      tickMark: 'text-sm',
    },
    large: {
      container: 'p-3',
      card: 'h-32 w-44 text-6xl',
      tickMark: 'text-base',
    },
  };

  const translations = {
    en: {
      tick: 'Tick',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds'
    },
    pt: {
      tick: '',
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos'
    }
  };

  const t = translations[language as 'en' | 'pt'] || translations.pt;
  const currentSize = size || 'medium';
  const selectedSize = sizeClasses[currentSize as keyof typeof sizeClasses];
  const clockColor = color || '#ff5722';

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`flex items-center justify-center gap-2 flex-wrap ${selectedSize.container}`}>
        {/* Hours */}
        <div className="flex flex-col items-center m-2">
          <span className={`${selectedSize.tickMark} text-gray-500 mb-1`}>{t.tick}</span>
          <Card className={`${selectedSize.card} flex items-center justify-center relative overflow-hidden shadow-md mb-1`} 
                style={{ backgroundColor: clockColor, color: '#fff' }}>
            <CardContent className="p-0 flex items-center justify-center w-full h-full">
              <div className="text-center">{time.hours}</div>
            </CardContent>
          </Card>
          <span className={`${selectedSize.tickMark} text-gray-500 mt-1`}>{t.hours}</span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center m-2">
          <span className={`${selectedSize.tickMark} text-gray-500 mb-1`}>{t.tick}</span>
          <Card className={`${selectedSize.card} flex items-center justify-center relative overflow-hidden shadow-md mb-1`}
                style={{ backgroundColor: clockColor, color: '#fff' }}>
            <CardContent className="p-0 flex items-center justify-center w-full h-full">
              <div className="text-center">{time.minutes}</div>
            </CardContent>
          </Card>
          <span className={`${selectedSize.tickMark} text-gray-500 mt-1`}>{t.minutes}</span>
        </div>

        {/* Seconds (optional) */}
        {showSeconds && (
          <div className="flex flex-col items-center m-2">
            <span className={`${selectedSize.tickMark} text-gray-500 mb-1`}>{t.tick}</span>
            <Card className={`${selectedSize.card} flex items-center justify-center relative overflow-hidden shadow-md mb-1`}
                  style={{ backgroundColor: clockColor, color: '#fff' }}>
              <CardContent className="p-0 flex items-center justify-center w-full h-full">
                <div className="text-center">{time.seconds}</div>
              </CardContent>
            </Card>
            <span className={`${selectedSize.tickMark} text-gray-500 mt-1`}>{t.seconds}</span>
          </div>
        )}
      </div>
    </div>
  );
} 