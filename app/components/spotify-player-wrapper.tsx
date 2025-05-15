'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSpotifyStore } from "@/lib/stores/spotify-store";

// Importar o componente PersistentSpotifyPlayer dinamicamente para evitar problemas de SSR
const PersistentSpotifyPlayer = dynamic(
  () => import('@/components/persistent-spotify-player'),
  { ssr: false }
);

export default function SpotifyPlayerWrapper() {
  const [isEnabled, setIsEnabled] = useState(false);
  const { playlistId, setPlaylistId } = useSpotifyStore();
  
  useEffect(() => {
    // Verificar se o Spotify está habilitado nas configurações
    async function checkSpotifySettings() {
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
    }
    
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
  }, [playlistId, setPlaylistId]);
  
  // Só renderizar o player se estiver habilitado
  if (!isEnabled) {
    console.log("SpotifyPlayerWrapper: Spotify desabilitado, não renderizando player");
    return null;
  }
  
  return <PersistentSpotifyPlayer />;
} 