"use client"

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from '@/lib/i18n'

declare global {
  interface Window {
    safeClipboardWrite?: (text: string) => Promise<void>;
  }
}

export function ServiceWorkerRegistration() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    if ("serviceWorker" in navigator) {
      try {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log(
              "Service Worker registrado com sucesso:",
              registration.scope
            );
          })
          .catch((error) => {
            console.error("Erro ao registrar Service Worker:", error);
          });
      } catch (error) {
        console.error("Erro ao inicializar Service Worker:", error);
      }
    } else {
      console.log("Service Workers não são suportados neste navegador.");
    }

    const safeClipboardWrite = async (text: string): Promise<void> => {
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
      } else {
        console.warn("API Clipboard não é suportada neste navegador");
        return Promise.resolve();
      }
    };

    window.safeClipboardWrite = safeClipboardWrite;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        console.log('Permissão para notificações já concedida')
      }
      else if (Notification.permission === 'denied') {
        console.log('Permissão para notificações foi negada pelo usuário')
      }
    } else {
      console.log('Este navegador não suporta notificações desktop')
    }

    return () => {
      window.removeEventListener('load', () => {})
    }
  }, [isClient])

  return null
} 