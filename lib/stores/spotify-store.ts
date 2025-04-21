import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SpotifyState {
  playlistId: string | null
  setPlaylistId: (id: string | null) => void
}

export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set) => ({
      playlistId: null,
      setPlaylistId: (id) => set({ playlistId: id }),
    }),
    {
      name: "spotify-storage",
    }
  )
) 