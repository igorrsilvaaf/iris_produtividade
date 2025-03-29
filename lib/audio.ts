// Singleton para gerenciar áudio no aplicativo
export class AudioService {
  private static instance: AudioService
  private audioElements: Map<string, HTMLAudioElement> = new Map()
  private soundEnabled = true

  private constructor() {
    // Inicializar com sons padrão
    this.preloadSounds()
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  private preloadSounds(): void {
    const sounds = ["default", "bell", "chime", "digital"]

    sounds.forEach((sound) => {
      try {
        const audio = new Audio(`/sounds/${sound}.mp3`)
        audio.preload = "auto"
        this.audioElements.set(sound, audio)
      } catch (error) {
        console.error(`Failed to preload sound: ${sound}`, error)
      }
    })
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled
  }

  public async playSound(sound: string): Promise<void> {
    if (!this.soundEnabled) return

    try {
      let audio = this.audioElements.get(sound)

      if (!audio) {
        // Se o som não foi pré-carregado, crie um novo elemento de áudio
        audio = new Audio(`/sounds/${sound}.mp3`)
        this.audioElements.set(sound, audio)
      }

      // Reiniciar o áudio se já estiver tocando
      audio.pause()
      audio.currentTime = 0

      // Reproduzir o som
      await audio.play()
    } catch (error) {
      console.error(`Failed to play sound: ${sound}`, error)
    }
  }

  public loadSoundSettings(settings: { enable_sound: boolean; notification_sound: string }): void {
    this.soundEnabled = settings.enable_sound
  }
}

// Função auxiliar para usar o serviço de áudio no lado do cliente
export function useAudio(): AudioService {
  // Verificar se estamos no lado do cliente
  if (typeof window !== "undefined") {
    return AudioService.getInstance()
  }

  // Retornar uma implementação vazia para o lado do servidor
  return {
    setSoundEnabled: () => {},
    playSound: async () => {},
    loadSoundSettings: () => {},
  } as AudioService
}

