"use client"

import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { useRef, useEffect } from "react"

// Mapeamento de nomes de sons para URLs
export const SOUND_URLS = {
  none: "", // Nenhum som
  pomodoro: "/sounds/pomodoro.mp3", 
  default: "/sounds/default.mp3",
  bell: "/sounds/bell.mp3",
  chime: "/sounds/chime.mp3",
  digital: "/sounds/digital.mp3",
  ding: "/sounds/ding.mp3",
  notification: "/sounds/notification.mp3",
}

export function useAudioPlayer() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Pré-carregar os sons para melhor performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    Object.entries(SOUND_URLS).forEach(([name, url]) => {
      if (!audioCache.current.has(name) && url) { 
        try {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.load();
          audioCache.current.set(name, audio);
        } catch (error) {
          console.error(`Failed to preload sound: ${name}`, error);
        }
      }
    });

    return () => {
      audioCache.current.clear();
    };
  }, []);

  const playSound = async (soundName: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
      const validSoundName = Object.keys(SOUND_URLS).includes(soundName) ? soundName : 'pomodoro';
      
      if (validSoundName === 'none') {

        return;
      }
      
      const soundUrl = SOUND_URLS[validSoundName as keyof typeof SOUND_URLS];
      

      
      let audio = audioCache.current.get(validSoundName);
      
      if (!audio) {
        audio = new Audio(soundUrl);
        audioCache.current.set(validSoundName, audio);
      }

      audio.currentTime = 0;
      audio.volume = 0.6; 

      try {
        await audio.play();
      } catch (playError) {
        console.error("Browser blocked autoplay, trying again with user interaction:", playError);
        
        toast({
          title: t("Sound could not play"),
          description: t("Your browser may be blocking autoplay."),
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  return { playSound }
}

