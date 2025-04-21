'use client';

import { useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useSpotifyStore } from "@/lib/stores/spotify-store";

interface SpotifyPlayerProps {
  className?: string;
}

export default function SpotifyPlayer({ className }: SpotifyPlayerProps) {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const { playlistId, setPlaylistId } = useSpotifyStore();

  const handleSavePlaylist = () => {
    if (playlistUrl) {
      // Extrair o ID da playlist da URL do Spotify
      const newPlaylistId = playlistUrl.split('/playlist/')[1]?.split('?')[0];
      if (newPlaylistId) {
        setPlaylistId(newPlaylistId);
        setPlaylistUrl('');
      }
    }
  };

  return (
    <Card className={`mt-6 ${className}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FaSpotify className="text-[#1DB954] text-xl" />
          <CardTitle className="text-lg">Spotify Player</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Cole o link da sua playlist:
            </label>
            <Input
              type="text"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="w-full"
            />
          </div>
          <Button
            onClick={handleSavePlaylist}
            className="w-full bg-[#1DB954] text-white hover:bg-[#1ed760]"
          >
            Salvar Playlist
          </Button>
          {playlistId && (
            <p className="text-sm text-gray-400 text-center">
              Playlist configurada! O player está disponível no canto inferior direito da tela.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 