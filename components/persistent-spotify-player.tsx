'use client';

import { useState, useEffect } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Settings, Maximize2, Minimize2 } from "lucide-react";
import { useSpotifyStore } from "@/lib/stores/spotify-store";
import type { UserSettings } from "@/lib/settings";

export default function PersistentSpotifyPlayer() {
  const [isCompact, setIsCompact] = useState(false);
  const { playlistId, setPlaylistId, contentType, setContentType } = useSpotifyStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Verificar se os dados da store já estão disponíveis
  const storeReady = playlistId && contentType;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        console.log("PersistentPlayer: Settings carregadas:", data.settings);
        console.log("PersistentPlayer: enable_spotify:", data.settings.enable_spotify);
        console.log("PersistentPlayer: spotify_playlist_url:", data.settings.spotify_playlist_url);
        
        // Se o Spotify estiver desabilitado, limpar o playlistId
        if (!data.settings.enable_spotify) {
          console.log("PersistentPlayer: Spotify desativado, limpando playlistId");
          setPlaylistId(null);
          return;
        }
        
        // Se o Spotify estiver habilitado nas configurações mas não tiver playlistId
        if (data.settings.enable_spotify && data.settings.spotify_playlist_url) {
          try {
            // Tentar extrair o ID e o tipo do conteúdo da URL
            const urlString = data.settings.spotify_playlist_url;
            
            // Determinar o tipo de conteúdo baseado na URL
            let type = '';
            let id = '';
            
            if (urlString.includes('/playlist/')) {
              type = 'playlist';
              id = urlString.split('/playlist/')[1]?.split('?')[0] || '';
            } else if (urlString.includes('/episode/')) {
              type = 'episode';
              id = urlString.split('/episode/')[1]?.split('?')[0] || '';
            } else if (urlString.includes('/track/')) {
              type = 'track';
              id = urlString.split('/track/')[1]?.split('?')[0] || '';
            } else if (urlString.includes('/album/')) {
              type = 'album';
              id = urlString.split('/album/')[1]?.split('?')[0] || '';
            } else if (urlString.includes('/show/')) {
              type = 'show';
              id = urlString.split('/show/')[1]?.split('?')[0] || '';
            }
            
            if (id && type) {
              console.log(`PersistentPlayer: Recuperando ${type} ID:`, id);
              setPlaylistId(id);
              setContentType(type);
            }
          } catch (error) {
            console.error("PersistentPlayer: Erro ao extrair ID da URL do Spotify:", error);
          }
        } else {
          console.log("PersistentPlayer: Spotify ativado mas URL não definida");
        }
      }
    } catch (error) {
      console.error('PersistentPlayer: Erro ao carregar configurações do Spotify:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchSettings();
      
      // Verificar as configurações a cada 3 segundos para garantir que mudanças recentes sejam aplicadas
      const intervalId = setInterval(() => {
        fetchSettings();
      }, 3000);
      
      // Adicionar um listener para o evento customizado de atualização de configurações
      const handleSettingsUpdate = () => {
        console.log("PersistentPlayer: Detectada atualização de configurações");
        fetchSettings();
      };
      
      window.addEventListener('settings-updated', handleSettingsUpdate);
      
      // Também mostrar o estado do store quando montado
      console.log("PersistentPlayer: Estado inicial da store:", { 
        playlistId: useSpotifyStore.getState().playlistId,
        contentType: useSpotifyStore.getState().contentType
      });
      
      // Limpar localStorage do Spotify quando o componente for montado pela primeira vez
      try {
        const spotifyStorage = localStorage.getItem('spotify-storage');
        if (spotifyStorage) {
          const spotifyData = JSON.parse(spotifyStorage);
          console.log("PersistentPlayer: Verificando localStorage do Spotify:", spotifyData);
          
          // Se o enable_spotify for false nos settings, mas temos um playlistId no storage, limpar
          if (settings && settings.enable_spotify === false && spotifyData.state && spotifyData.state.playlistId) {
            console.log("PersistentPlayer: Corrigindo inconsistência no localStorage");
            spotifyData.state.playlistId = null;
            localStorage.setItem('spotify-storage', JSON.stringify(spotifyData));
            // Forçar atualização do estado
            setPlaylistId(null);
          }
        }
      } catch (error) {
        console.error("PersistentPlayer: Erro ao verificar localStorage:", error);
      }
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('settings-updated', handleSettingsUpdate);
      };
    }
  }, [mounted, settings, setPlaylistId]);

  // Efeito adicional para limpar o playlistId quando enable_spotify for falso
  useEffect(() => {
    if (settings && settings.enable_spotify === false && playlistId) {
      console.log("PersistentPlayer: Detectada configuração com Spotify desativado, limpando player");
      setPlaylistId(null);
      
      // Tentar limpar também no localStorage
      try {
        const spotifyStorage = localStorage.getItem('spotify-storage');
        if (spotifyStorage) {
          const spotifyData = JSON.parse(spotifyStorage);
          if (spotifyData.state) {
            spotifyData.state.playlistId = null;
            localStorage.setItem('spotify-storage', JSON.stringify(spotifyData));
            console.log("PersistentPlayer: Spotify limpo no localStorage");
          }
        }
      } catch (err) {
        console.error("PersistentPlayer: Erro ao limpar localStorage:", err);
      }
    }
  }, [settings, playlistId, setPlaylistId]);

  useEffect(() => {
    console.log("PersistentPlayer: Estado atual:", { 
      mounted,
      isLoading,
      settings: !!settings,
      enable_spotify: settings?.enable_spotify,
      contentId: playlistId, 
      contentType,
      storeData: useSpotifyStore.getState()
    });
  }, [isLoading, settings, playlistId, contentType, mounted]);

  // Não exibir nada se não estiver montado ainda
  if (!mounted) return null;
  
  // Não mostrar se as configurações indicarem que o Spotify está desativado
  if (settings && !settings.enable_spotify) {
    console.log("PersistentPlayer: Spotify desativado nas configurações");
    return null;
  }

  // Mostrar o player se: já temos o ID do contenúdo OU está carregando (placeholder)
  return (
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
        {playlistId ? (
          <iframe
            src={`https://open.spotify.com/embed/${contentType || 'playlist'}/${playlistId}?utm_source=generator`}
            width="100%"
            height={isCompact ? "80" : "352"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center h-[352] bg-slate-100 dark:bg-slate-800 rounded-md p-4">
            <div className="text-center">
              <FaSpotify className="text-[#1DB954] text-5xl mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isLoading ? "Carregando Spotify..." : "Adicione uma playlist do Spotify nas configurações"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 