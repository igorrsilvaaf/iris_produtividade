import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Position {
  x: string;
  y: string;
}

interface SpotifyState {
  playlistId: string | null
  contentType: string
  isEnabled: boolean
  position: Position | null
  setPlaylistId: (id: string | null) => void
  setContentType: (type: string) => void
  setIsEnabled: (enabled: boolean) => void
  setPosition: (position: Position) => void
  reset: () => void
}

export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set) => ({
      playlistId: null,
      contentType: 'playlist',
      isEnabled: true,
      position: null,
      setPlaylistId: (id) => set({ playlistId: id }),
      setContentType: (type) => set({ contentType: type }),
      setIsEnabled: (enabled) => set({ isEnabled: enabled }),
      setPosition: (position) => set({ position }),
      reset: () => set({ 
        playlistId: null, 
        contentType: 'playlist', 
        isEnabled: false, 
        position: null 
      })
    }),
    {
      name: "spotify-storage",
    }
  )
) 