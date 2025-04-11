"use client"

import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

// Mapeamento de nomes de sons para URLs
export const SOUND_URLS = {
  default: "/sounds/pomodoro.mp3",
  bell: "/sounds/bell.mp3",
  chime: "/sounds/chime.mp3",
  digital: "/sounds/digital.mp3",
  success: "/sounds/chime.mp3", // Usar chime como som de sucesso por enquanto
}

// Hook para reproduzir sons com tratamento de erros simplificado
export function useAudioPlayer() {
  const { toast } = useToast()
  const { t } = useTranslation()

  const playSound = async (soundName: string): Promise<void> => {
    try {
      // Verificar se o som existe no mapeamento
      const soundUrl = SOUND_URLS[soundName as keyof typeof SOUND_URLS]
      if (!soundUrl) {
        console.error(`Sound not found: ${soundName}`)
        return
      }

      // Usar um elemento de áudio simples
      const audio = new Audio(soundUrl)

      // Definir volume baixo para evitar sustos
      audio.volume = 0.4

      // Reproduzir o som sem esperar
      audio.play().catch((e) => {
        console.error("Browser blocked autoplay:", e)
      })
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  return { playSound }
}

