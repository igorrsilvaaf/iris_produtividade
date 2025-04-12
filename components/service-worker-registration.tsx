"use client"

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from '@/lib/i18n'

export function ServiceWorkerRegistration() {
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    // Verificar se o navegador suporta Service Workers
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration)
          })
          .catch(error => {
            console.error('Erro ao registrar Service Worker:', error)
          })
      })

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
    } else {
      console.log('Service Workers não são suportados neste navegador')
    }

    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('load', () => {})
    }
  }, [])

  return null
} 