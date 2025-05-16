'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSpotifyStore } from "@/lib/stores/spotify-store";

// Importar o componente PersistentMusicPlayer dinamicamente para evitar problemas de SSR
const PersistentMusicPlayer = dynamic(
  () => import('@/components/persistent-music-player'),
  { ssr: false }
);

export default function SpotifyPlayerWrapper() {
  const [isEnabled, setIsEnabled] = useState(false);
  const { playlistId, setPlaylistId } = useSpotifyStore();
  
  // Usar useCallback para prevenção de re-renders desnecessários
  const checkSpotifySettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        console.log("SpotifyPlayerWrapper: Verificando configurações:", data.settings.enable_spotify);
        
        if (data.settings && data.settings.enable_spotify) {
          setIsEnabled(true);
        } else {
          setIsEnabled(false);
        }
      }
    } catch (error) {
      console.error("SpotifyPlayerWrapper: Erro ao verificar configurações:", error);
      setIsEnabled(false);
    }
  }, []);
  
  useEffect(() => {
    // Verificação inicial ao montar o componente
    checkSpotifySettings();
    
    // Adicionar listener para evento de atualização de configurações
    const handleSettingsUpdate = () => {
      console.log("SpotifyPlayerWrapper: Detectada atualização de configurações");
      checkSpotifySettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [checkSpotifySettings]);
  
  // Só renderizar o player se estiver habilitado
  if (!isEnabled) {
    console.log("SpotifyPlayerWrapper: Spotify desabilitado, não renderizando player");
    return null;
  }
  
  return <PersistentMusicPlayer />;
} 