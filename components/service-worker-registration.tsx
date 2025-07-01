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

          })
          .catch((error) => {
            console.error("Erro ao registrar Service Worker:", error);
          });
      } catch (error) {
        console.error("Erro ao inicializar Service Worker:", error);
      }
    } else {

    }

    const safeClipboardWrite = async (text: string): Promise<void> => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text)
          return true
        } catch (err) {
          return false
        }
      } else {
        return false
      }
    };

    window.safeClipboardWrite = safeClipboardWrite;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {

      }
      else if (Notification.permission === 'denied') {

      }
    } else {

    }

    return () => {
      window.removeEventListener('load', () => {})
    }
  }, [isClient])

  return null
} 