'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpotifyStore } from "@/lib/stores/spotify-store";
import PersistentMusicPlayer from './persistent-music-player';

export function SpotifyPortal() {
  const [mounted, setMounted] = useState(false);
  const { playlistId } = useSpotifyStore();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Se não estiver montado ou não tiver playlist, não mostrar nada
  // A verificação de isEnabled já é feita dentro do PersistentMusicPlayer
  if (!mounted || !playlistId) return null;

  return createPortal(
    <PersistentMusicPlayer />,
    document.body
  );
} 