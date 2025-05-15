'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useSpotifyStore } from "@/lib/stores/spotify-store";
import type { UserSettings } from "@/lib/settings";

export default function PersistentSpotifyPlayer() {
  const [isCompact, setIsCompact] = useState(false);
  const { playlistId, contentType, isEnabled, position, setPosition } = useSpotifyStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const fetchSettings = async () => {
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
      console.error('PersistentPlayer: Erro ao carregar configurações do Spotify:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [mounted]);

  // Função para iniciar o arrastar
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
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
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
    console.log("PersistentPlayer: Spotify desativado nas configurações");
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

  return (
    <div 
      ref={playerRef}
      className={`${positionClasses} z-50 bg-background border rounded-lg shadow-lg transition-all duration-300 w-[300px] ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{...style, ...(isDragging ? { position: 'fixed', margin: 0 } : {})}}
    >
      <div 
        className={`flex items-center justify-between p-2 border-b handle ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 handle">
          <FaSpotify className="text-[#1DB954] text-xl handle" />
          <span className="font-medium cursor-grab handle">Spotify</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCompact(!isCompact)}
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
          key={playlistId}
          src={`https://open.spotify.com/embed/${contentType || 'playlist'}/${playlistId}?utm_source=generator`}
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
} 