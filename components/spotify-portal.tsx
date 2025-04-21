'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpotifyStore } from "@/lib/stores/spotify-store";
import { FaSpotify } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

export function SpotifyPortal() {
  const [mounted, setMounted] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { playlistId } = useSpotifyStore();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !playlistId) return null;

  const player = (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg transition-all duration-300 w-[300px]">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <FaSpotify className="text-[#1DB954] text-xl" />
          <span className="font-medium">Spotify</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCompact(!isCompact)}
          >
            {isCompact ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-2">
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
          width="100%"
          height={isCompact ? "80" : "352"}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-md"
        />
      </div>
    </div>
  );

  return createPortal(player, document.body);
} 