'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Função para calcular a cor de texto baseada na cor de fundo
function getContrastColor(hexColor: string) {
  // Se não houver cor ou for inválida, retornar preto
  if (!hexColor || !hexColor.startsWith('#')) {
    return '#000000';
  }
  
  // Converter hex para RGB
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 7) {
    r = parseInt(hexColor.substring(1, 3), 16);
    g = parseInt(hexColor.substring(3, 5), 16);
    b = parseInt(hexColor.substring(5, 7), 16);
  } else if (hexColor.length === 4) {
    r = parseInt(hexColor.substring(1, 2), 16) * 17;
    g = parseInt(hexColor.substring(2, 3), 16) * 17;
    b = parseInt(hexColor.substring(3, 4), 16) * 17;
  }
  
  // Calcular luminância
  // Fórmula YIQ: https://24ways.org/2010/calculating-color-contrast/
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Retornar branco ou preto dependendo da luminância
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

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
  const textColor = getContrastColor(clockColor);

  return (
    <div className="flex flex-col items-center w-full" data-testid="flip-clock">
      <div className={`flex items-center justify-center gap-2 flex-wrap ${selectedSize.container}`}>
        {/* Hours */}
        <div className="flex flex-col items-center m-2" data-testid="flip-clock-hours">
          <span className={`${selectedSize.tickMark} text-gray-500 mb-1`}>{t.tick}</span>
          <Card className={`${selectedSize.card} flex items-center justify-center relative overflow-hidden shadow-md mb-1`} 
                style={{ backgroundColor: clockColor, color: textColor }}>
            <CardContent className="p-0 flex items-center justify-center w-full h-full">
              <div className="text-center">{time.hours}</div>
            </CardContent>
          </Card>
          <span className={`${selectedSize.tickMark} text-gray-500 mt-1`}>{t.hours}</span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center m-2" data-testid="flip-clock-minutes">
          <span className={`${selectedSize.tickMark} text-gray-500 mb-1`}>{t.tick}</span>
          <Card className={`${selectedSize.card} flex items-center justify-center relative overflow-hidden shadow-md mb-1`}
                style={{ backgroundColor: clockColor, color: textColor }}>
            <CardContent className="p-0 flex items-center justify-center w-full h-full">
              <div className="text-center">{time.minutes}</div>
            </CardContent>
          </Card>
          <span className={`${selectedSize.tickMark} text-gray-500 mt-1`}>{t.minutes}</span>
        </div>

        {/* Seconds (optional) */}
        {showSeconds && (
          <div className="flex flex-col items-center m-2" data-testid="flip-clock-seconds">
            <span className={`${selectedSize.tickMark} text-gray-500 mb-1`} data-testid="flip-clock-seconds-tick">{t.tick}</span>
            <Card className={`${selectedSize.card} flex items-center justify-center relative overflow-hidden shadow-md mb-1`}
                  style={{ backgroundColor: clockColor, color: textColor }}>
              <CardContent className="p-0 flex items-center justify-center w-full h-full">
                <div className="text-center">{time.seconds}</div>
              </CardContent>
            </Card>
            <span className={`${selectedSize.tickMark} text-gray-500 mt-1`} data-testid="flip-clock-seconds-label">{t.seconds}</span>
          </div>
        )}
      </div>
    </div>
  );
} 