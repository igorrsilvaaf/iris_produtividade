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
  const isProduction = process.env.NODE_ENV === 'production'

  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    if (!('serviceWorker' in navigator)) return
    
    if (isProduction && window.isSecureContext) {
      try {
        navigator.serviceWorker
          .register('/service-worker.js')
          .catch((error) => {
            console.error('Erro ao registrar Service Worker:', error)
          })
      } catch (error) {
        console.error('Erro ao inicializar Service Worker:', error)
      }
    } else {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => registration.unregister())
        })
        .catch(() => {})
      if (window.caches && caches.keys) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {})
      }
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
  }, [isClient, isProduction])

  return null
} 