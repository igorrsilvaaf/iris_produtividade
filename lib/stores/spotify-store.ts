import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SpotifyState {
  playlistId: string | null
  contentType: string
  setPlaylistId: (id: string | null) => void
  setContentType: (type: string) => void
}

export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set) => ({
      playlistId: null,
      contentType: 'playlist',
      setPlaylistId: (id) => set({ playlistId: id }),
      setContentType: (type) => set({ contentType: type }),
    }),
    {
      name: "spotify-storage",
    }
  )
) 