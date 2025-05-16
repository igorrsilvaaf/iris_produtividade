import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Position {
  x: string;
  y: string;
}

interface MusicPlayerState {
  playlistId: string | null
  contentType: string
  playerType: 'spotify' | 'deezer'
  isEnabled: boolean
  position: Position | null
  setPlaylistId: (id: string | null) => void
  setContentType: (type: string) => void
  setPlayerType: (type: 'spotify' | 'deezer') => void
  setIsEnabled: (enabled: boolean) => void
  setPosition: (position: Position) => void
  reset: () => void
}

export const useSpotifyStore = create<MusicPlayerState>()(
  persist(
    (set) => ({
      playlistId: null,
      contentType: 'playlist',
      playerType: 'spotify',
      isEnabled: true,
      position: null,
      setPlaylistId: (id) => set({ playlistId: id }),
      setContentType: (type) => set({ contentType: type }),
      setPlayerType: (type) => set({ playerType: type }),
      setIsEnabled: (enabled) => set({ isEnabled: enabled }),
      setPosition: (position) => set({ position }),
      reset: () => set({ 
        playlistId: null, 
        contentType: 'playlist',
        playerType: 'spotify',
        isEnabled: false, 
        position: null 
      })
    }),
    {
      name: "spotify-storage",
    }
  )
) 