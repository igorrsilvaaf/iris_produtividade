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
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { playlistId, setPlaylistId } = useSpotifyStore();

  const handleSavePlaylist = () => {
    if (playlistUrl) {
      // Extrair o ID da playlist da URL do Spotify
      const newPlaylistId = playlistUrl.split('/playlist/')[1]?.split('?')[0];
      if (newPlaylistId) {
        setPlaylistId(newPlaylistId);
        setIsConfigOpen(false);
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configurações</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isConfigOpen ? (
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
          </div>
        ) : playlistId ? (
          <iframe
            src={`https://open.spotify.com/embed/playlist/${playlistId}`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-md"
          />
        ) : (
          <div className="text-center text-gray-400 py-8">
            Configure sua playlist do Spotify clicando no ícone de configuração
          </div>
        )}
      </CardContent>
    </Card>
  );
} 