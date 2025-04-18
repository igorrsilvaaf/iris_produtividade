"use client"

import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { useRef, useEffect } from "react"

// Mapeamento de nomes de sons para URLs
export const SOUND_URLS = {
  none: "", // Nenhum som
  pomodoro: "/sounds/pomodoro.mp3", // Som padrão do pomodoro
  default: "/sounds/default.mp3",
  bell: "/sounds/bell.mp3",
  chime: "/sounds/chime.mp3",
  digital: "/sounds/digital.mp3",
  ding: "/sounds/ding.mp3",
  notification: "/sounds/notification.mp3",
}

// Hook para reproduzir sons com tratamento de erros simplificado
export function useAudioPlayer() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Pré-carregar os sons para melhor performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    Object.entries(SOUND_URLS).forEach(([name, url]) => {
      if (!audioCache.current.has(name) && url) { // Só carrega se tiver URL (ignora 'none')
        try {
          const audio = new Audio(url);
          audio.preload = "auto";
          // Apenas tentar carregar os metadados para evitar erros de reprodução automática
          audio.load();
          audioCache.current.set(name, audio);
        } catch (error) {
          console.error(`Failed to preload sound: ${name}`, error);
        }
      }
    });

    return () => {
      // Limpar cache de áudio quando o componente for desmontado
      audioCache.current.clear();
    };
  }, []);

  const playSound = async (soundName: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
      // Verificar se o som existe no mapeamento
      const validSoundName = Object.keys(SOUND_URLS).includes(soundName) ? soundName : 'pomodoro';
      
      // Se for "nenhum", não tocar som
      if (validSoundName === 'none') {
        console.log('Som desativado: nenhum som será tocado');
        return;
      }
      
      const soundUrl = SOUND_URLS[validSoundName as keyof typeof SOUND_URLS];
      
      console.log(`Tocando som: ${validSoundName}, URL: ${soundUrl}`);
      
      // Tentar usar o áudio do cache primeiro
      let audio = audioCache.current.get(validSoundName);
      
      // Se não estiver no cache, criar novo
      if (!audio) {
        audio = new Audio(soundUrl);
        audioCache.current.set(validSoundName, audio);
      }

      // Redefinir o áudio para garantir que possa ser reproduzido novamente
      audio.currentTime = 0;
      audio.volume = 0.6; // Aumentar um pouco o volume para melhor audibilidade

      try {
        await audio.play();
      } catch (playError) {
        console.error("Browser blocked autoplay, trying again with user interaction:", playError);
        
        // Em caso de erro de reprodução, podemos notificar o usuário sobre problemas de permissão
        // Isso é especialmente útil em navegadores que bloqueiam a reprodução automática
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

