"use client"

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from '@/lib/i18n'

export function ServiceWorkerRegistration() {
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
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

    // Shim para navegadores que não suportam clipboard
    if (!navigator.clipboard) {
      navigator.clipboard = {
        writeText: function(text) {
          // Implementação de fallback que não faz nada e retorna uma promessa resolvida
          console.warn("API Clipboard não é suportada neste navegador");
          return Promise.resolve();
        },
        readText: function() {
          console.warn("API Clipboard não é suportada neste navegador");
          return Promise.resolve("");
        }
      } as any;
    }

    // Verificar permissão de notificação existente
    if ('Notification' in window) {
      // Se já temos permissão, não precisamos fazer nada
      if (Notification.permission === 'granted') {
        console.log('Permissão para notificações já concedida')
      }
      // Se as permissões foram negadas, informar ao usuário
      else if (Notification.permission === 'denied') {
        console.log('Permissão para notificações foi negada pelo usuário')
      }
    } else {
      console.log('Este navegador não suporta notificações desktop')
    }

    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('load', () => {})
    }
  }, [])

  return null
} 