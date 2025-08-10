import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = typeof hex === "string" ? hex.trim().toLowerCase() : "";
  const match = /^#([0-9a-f]{6})$/i.exec(normalized);
  if (!match) return null;
  const intVal = parseInt(match[1], 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return { r, g, b };
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

export function getTailwindBgClassForHex(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "bg-gray-500";
  const { h, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hue = clamp(h, 0, 360);
  const shade = l > 0.75 ? 700 : l > 0.6 ? 600 : l < 0.25 ? 400 : 500;
  if (hue < 15 || hue >= 345) return `bg-red-${shade}`;
  if (hue < 35) return `bg-orange-${shade}`;
  if (hue < 55) return `bg-amber-${shade}`;
  if (hue < 85) return `bg-lime-${shade}`;
  if (hue < 150) return `bg-green-${shade}`;
  if (hue < 185) return `bg-teal-${shade}`;
  if (hue < 210) return `bg-cyan-${shade}`;
  if (hue < 235) return `bg-sky-${shade}`;
  if (hue < 255) return `bg-blue-${shade}`;
  if (hue < 275) return `bg-indigo-${shade}`;
  if (hue < 305) return `bg-violet-${shade}`;
  if (hue < 330) return `bg-purple-${shade}`;
  if (hue < 345) return `bg-pink-${shade}`;
  return "bg-gray-500";
}
