'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FaSpotify, FaDeezer } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useSpotifyStore } from "@/lib/stores/spotify-store";
import type { UserSettings } from "@/lib/settings";

export default function PersistentMusicPlayer() {
  // Todos os hooks no nível superior do componente, organizados por tipo
  // State hooks
  const [isCompact, setIsCompact] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Ref hooks
  const playerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks - garantir que são chamados no nível superior
  const { playlistId, contentType, playerType, isEnabled, position, setPosition } = useSpotifyStore();

  console.log('[PersistentMusicPlayer] Renderizando. Playlist ID:', playlistId, 'Content Type:', contentType, 'Player Type:', playerType, 'Enabled:', isEnabled);

  // Mounting effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Inicializar a posição padrão se não estiver definida
  useEffect(() => {
    if (!position && playlistId && isEnabled) {
      setPosition({ x: 'right-4', y: 'bottom-4' });
    }
  }, [position, setPosition, playlistId, isEnabled]);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        console.log("PersistentPlayer: Settings carregadas:", data.settings);
        console.log("PersistentPlayer: enable_spotify:", data.settings.enable_spotify);
      }
    } catch (error) {
      console.error('PersistentPlayer: Erro ao carregar configurações do player de música:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchSettings();
      
      const handleSettingsUpdate = () => {
        console.log("PersistentPlayer: Detectada atualização de configurações");
        fetchSettings();
      };
      
      window.addEventListener('settings-updated', handleSettingsUpdate);
      
      return () => {
        window.removeEventListener('settings-updated', handleSettingsUpdate);
      };
    }
  }, [mounted, fetchSettings]);

  // Função para iniciar o arrastar com mouse
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    
    if (e.target === e.currentTarget || 
        (e.target as HTMLElement).tagName === 'SPAN' ||
        (e.target as HTMLElement).className?.includes('handle')) {
      
      setIsDragging(true);
      
      // Calcular o offset entre o ponto clicado e o canto superior esquerdo do elemento
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      // Impedir seleção de texto durante o arrasto
      document.body.style.userSelect = 'none';
    }
  }, []);

  // Função para iniciar o arrastar com toque
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    
    if (e.target === e.currentTarget || 
        (e.target as HTMLElement).tagName === 'SPAN' ||
        (e.target as HTMLElement).className?.includes('handle')) {
      
      setIsDragging(true);
      
      // Calcular o offset entre o ponto tocado e o canto superior esquerdo do elemento
      const touch = e.touches[0];
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      
      // Impedir comportamentos padrão como scroll
      e.preventDefault();
      
      // Impedir seleção de texto durante o arrasto
      document.body.style.userSelect = 'none';
    }
  }, []);

  // Adicionar e remover event listeners para arrastar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !playerRef.current) return;
      
      const rect = playerRef.current.getBoundingClientRect();
      
      // Calcular nova posição baseada no movimento do mouse e no offset inicial
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;
      
      // Limitar posição aos limites da janela
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      const boundedLeft = Math.max(0, Math.min(newLeft, maxX));
      const boundedTop = Math.max(0, Math.min(newTop, maxY));
      
      // Atualizar posição do elemento
      playerRef.current.style.left = `${boundedLeft}px`;
      playerRef.current.style.top = `${boundedTop}px`;
      playerRef.current.style.right = 'auto';
      playerRef.current.style.bottom = 'auto';
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !playerRef.current) return;
      
      // Prevenir o comportamento padrão (rolagem da página)
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = playerRef.current.getBoundingClientRect();
      
      // Calcular nova posição baseada no movimento do toque e no offset inicial
      const newLeft = touch.clientX - dragOffset.x;
      const newTop = touch.clientY - dragOffset.y;
      
      // Limitar posição aos limites da janela
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      const boundedLeft = Math.max(0, Math.min(newLeft, maxX));
      const boundedTop = Math.max(0, Math.min(newTop, maxY));
      
      // Atualizar posição do elemento
      playerRef.current.style.left = `${boundedLeft}px`;
      playerRef.current.style.top = `${boundedTop}px`;
      playerRef.current.style.right = 'auto';
      playerRef.current.style.bottom = 'auto';
    };
    
    const handleMouseUp = () => {
      if (isDragging && playerRef.current) {
        setIsDragging(false);
        
        // Restaurar seleção de texto
        document.body.style.userSelect = '';
        
        // Salvar a posição final
        const rect = playerRef.current.getBoundingClientRect();
        setPosition({
          x: `left-[${Math.round(rect.left)}px]`,
          y: `top-[${Math.round(rect.top)}px]`
        });
      }
    };
    
    const handleTouchEnd = () => {
      if (isDragging && playerRef.current) {
        setIsDragging(false);
        
        // Restaurar seleção de texto
        document.body.style.userSelect = '';
        
        // Salvar a posição final
        const rect = playerRef.current.getBoundingClientRect();
        setPosition({
          x: `left-[${Math.round(rect.left)}px]`,
          y: `top-[${Math.round(rect.top)}px]`
        });
      }
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
    
    return undefined;
  }, [isDragging, dragOffset, setPosition]);

  // Não exibir nada se não estiver montado ainda
  if (!mounted) return null;
  
  // Não mostrar se isEnabled for falso (toggled off)
  if (!isEnabled) {
    console.log("PersistentPlayer: Player desativado pelo isEnabled");
    return null;
  }
  
  // Não mostrar se as configurações indicarem que o Spotify está desativado
  if (settings && !settings.enable_spotify) {
    console.log("PersistentPlayer: Música desativada nas configurações");
    return null;
  }

  // Adicionado: Se não tiver playlistId, não mostrar nada, pois a configuração é externa
  if (!playlistId) {
    console.log("PersistentPlayer: No playlistId, not rendering iframe.");
    return null;
  }

  // Preparar classes CSS para posicionamento
  let style = {};
  let positionClasses = 'fixed';
  
  if (position) {
    // Se temos uma posição personalizada, aplicar diretamente via style para maior precisão
    if (position.x.startsWith('left-[') && position.y.startsWith('top-[')) {
      // Extrair valores numéricos das classes
      const leftMatch = position.x.match(/left-\[(\d+)px\]/);
      const topMatch = position.y.match(/top-\[(\d+)px\]/);
      
      if (leftMatch && topMatch) {
        style = {
          left: `${leftMatch[1]}px`,
          top: `${topMatch[1]}px`,
          right: 'auto',
          bottom: 'auto'
        };
      }
    } else {
      // Usar classes Tailwind para posicionamento
      positionClasses = `fixed ${position.x} ${position.y}`;
    }
  } else {
    // Posição padrão
    positionClasses = 'fixed bottom-4 right-4';
  }

  // Configuração específica para o player (Spotify ou Deezer)
  const playerConfig = {
    spotify: {
      icon: <FaSpotify className="text-[#1DB954] text-xl handle" />,
      name: "Spotify",
      iframeSrc: `https://open.spotify.com/embed/${contentType || 'playlist'}/${playlistId}?utm_source=generator`,
      height: isCompact ? "80" : "352"
    },
    deezer: {
      icon: <FaDeezer className="text-[#00C7F2] text-xl handle" />,
      name: "Deezer",
      iframeSrc: `https://widget.deezer.com/widget/dark/${contentType || 'playlist'}/${playlistId}`,
      height: isCompact ? "80" : "350"
    }
  };

  // Seleciona a configuração baseada no tipo de player
  const currentPlayer = playerType === 'deezer' ? playerConfig.deezer : playerConfig.spotify;

  return (
    <div 
      ref={playerRef}
      className={`${positionClasses} z-50 bg-background border rounded-lg shadow-lg transition-all duration-300 w-[300px] ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{...style, ...(isDragging ? { position: 'fixed', margin: 0 } : {})}}
    >
      <div 
        className={`flex items-center justify-between p-2 border-b handle ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2 handle">
          {currentPlayer.icon}
          <span className="font-medium cursor-grab handle">{currentPlayer.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setIsCompact(!isCompact);
            }}
            title={isCompact ? "Expandir Player" : "Minimizar Player"}
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
          key={`${playerType}-${playlistId}`}
          src={currentPlayer.iframeSrc}
          width="100%"
          height={currentPlayer.height}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-md transition-all duration-300"
        />
      </div>
    </div>
  );
}