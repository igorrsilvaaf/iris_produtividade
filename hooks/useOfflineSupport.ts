import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export interface OfflineState {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineTime: number | null
  offlineDuration: number
}

export function useOfflineSupport() {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineTime: null,
    offlineDuration: 0
  })

  const [offlineQueue, setOfflineQueue] = useState<any[]>([])
  
  // Refs para evitar dependências em useEffect
  const offlineStateRef = useRef(offlineState)
  const offlineQueueRef = useRef(offlineQueue)
  
  // Atualizar refs quando estado muda
  useEffect(() => {
    offlineStateRef.current = offlineState
  }, [offlineState])
  
  useEffect(() => {
    offlineQueueRef.current = offlineQueue
  }, [offlineQueue])

  // Detectar mudanças na conectividade
  useEffect(() => {
    const handleOnline = () => {
      const now = Date.now()
      const currentState = offlineStateRef.current
      const duration = currentState.lastOnlineTime ? now - currentState.lastOnlineTime : 0
      
      setOfflineState(prev => ({
        ...prev,
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
        offlineDuration: duration
      }))

      if (currentState.wasOffline) {
        toast.success('Conexão restaurada', {
          description: 'Sincronizando alterações offline...'
        })
      }
    }

    const handleOffline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: false,
        lastOnlineTime: Date.now()
      }))

      toast.warning('Sem conexão', {
        description: 'Trabalhando offline. Alterações serão sincronizadas quando a conexão for restaurada.'
      })
    }

    // Adicionar listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificação periódica da conectividade
    const connectivityCheck = setInterval(async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache'
        })
        
        if (!response.ok && offlineStateRef.current.isOnline) {
          handleOffline()
        }
      } catch (error) {
        if (offlineStateRef.current.isOnline) {
          handleOffline()
        }
      }
    }, 30000) // Verificar a cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(connectivityCheck)
    }
  }, []) // Removido dependências para evitar loop infinito

  // Adicionar operação à queue offline
  const queueOfflineOperation = useCallback((operation: any) => {
    setOfflineQueue(prev => [...prev, {
      ...operation,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }])
  }, [])

  // Processar queue offline quando voltar online
  const processOfflineQueue = useCallback(async () => {
    const currentQueue = offlineQueueRef.current
    if (currentQueue.length === 0) return

    const operations = [...currentQueue]
    setOfflineQueue([])

    for (const operation of operations) {
      try {
        // Aqui você pode processar cada operação
        // Por exemplo, chamar o SyncManager
        console.log('Processando operação offline:', operation)
      } catch (error) {
        console.error('Erro ao processar operação offline:', error)
        // Recolocar na queue se falhar
        setOfflineQueue(prev => [...prev, operation])
      }
    }
  }, [])

  // Processar queue quando voltar online
  useEffect(() => {
    const currentState = offlineStateRef.current
    const currentQueue = offlineQueueRef.current
    if (currentState.isOnline && currentState.wasOffline && currentQueue.length > 0) {
      processOfflineQueue()
    }
  }, [processOfflineQueue])

  // Limpar estado de "was offline" após um tempo
  useEffect(() => {
    const currentState = offlineStateRef.current
    if (currentState.wasOffline && currentState.isOnline) {
      const timer = setTimeout(() => {
        setOfflineState(prev => ({ ...prev, wasOffline: false }))
      }, 5000) // Limpar após 5 segundos online

      return () => clearTimeout(timer)
    }
  }, []) // Removido dependências para evitar loop infinito

  return {
    ...offlineState,
    offlineQueueSize: offlineQueue.length,
    queueOfflineOperation,
    processOfflineQueue,
    clearOfflineQueue: () => setOfflineQueue([])
  }
}

// Hook para detectar mudanças de visibilidade da página
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastVisibleTime, setLastVisibleTime] = useState(Date.now())

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)
      
      if (visible) {
        setLastVisibleTime(Date.now())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Também detectar foco da janela
    const handleFocus = () => {
      setIsVisible(true)
      setLastVisibleTime(Date.now())
    }
    
    const handleBlur = () => {
      setIsVisible(false)
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return {
    isVisible,
    lastVisibleTime,
    timeHidden: isVisible ? 0 : Date.now() - lastVisibleTime
  }
}

// Hook para detectar mudanças de rede
export function useNetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false
  })

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        })
      }
    }

    updateNetworkInfo()

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateNetworkInfo)
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return {
    ...networkInfo,
    isSlowConnection: networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g',
    isFastConnection: networkInfo.effectiveType === '4g' || networkInfo.downlink > 5
  }
}