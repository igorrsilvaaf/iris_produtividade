"use client";

import { useEffect, useRef } from "react";
import { useSpotifyStore } from "@/lib/stores/spotify-store";

export function SpotifyCleanup({ children }: { children: React.ReactNode }) {
  const cleanupDone = useRef(false);
  
  // Limpar o estado do Spotify quando o componente for montado
  useEffect(() => {
    if (cleanupDone.current) return;
    
    // Obter o estado atual diretamente da store
    const spotifyStore = useSpotifyStore.getState();
    
    // Executar a limpeza
    spotifyStore.reset();
    
    // Limpar localStorage diretamente para garantir
    try {
      localStorage.removeItem('spotify-storage');
    } catch (e) {
      console.error("Erro ao limpar spotify-storage:", e);
    }
    
    // Marcar que a limpeza já foi feita
    cleanupDone.current = true;
  }, []); // Sem dependências para executar apenas uma vez
  
  // Apenas renderiza os children
  return <>{children}</>;
} 