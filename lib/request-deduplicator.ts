/**
 * Sistema de deduplicação de requisições para evitar múltiplas chamadas simultâneas
 * da mesma API endpoint com os mesmos parâmetros
 */

type RequestKey = string
type PendingRequest = {
  promise: Promise<any>
  controller: AbortController
  timestamp: number
}

class RequestDeduplicator {
  private pendingRequests = new Map<RequestKey, PendingRequest>()
  private readonly TTL = 30000 // 30 segundos

  /**
   * Gera uma chave única para a requisição baseada na URL, método e body
   */
  private generateKey(url: string, options: RequestInit = {}): string {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  /**
   * Limpa requisições expiradas
   */
  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.TTL) {
        request.controller.abort()
        this.pendingRequests.delete(key)
      }
    }
  }

  /**
   * Executa uma requisição com deduplicação
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    this.cleanupExpired()
    
    const key = this.generateKey(url, options)
    
    // Se já existe uma requisição pendente, retorna uma cópia clonada
    const existing = this.pendingRequests.get(key)
    if (existing) {
      console.debug(`Deduplicando requisição: ${key}`)
      // Clona a resposta para evitar "body stream already read"
      const response = await existing.promise
      return response.clone()
    }

    // Cria um novo AbortController para esta requisição
    const controller = new AbortController()
    const signal = options.signal
    
    // Se já existe um signal, combina com o nosso
    if (signal) {
      signal.addEventListener('abort', () => {
        controller.abort()
      })
    }

    // Cria a promise da requisição
    const promise = fetch(url, {
      ...options,
      signal: controller.signal
    }).finally(() => {
      // Remove da lista quando completar
      this.pendingRequests.delete(key)
    })

    // Armazena a requisição pendente
    this.pendingRequests.set(key, {
      promise,
      controller,
      timestamp: Date.now()
    })

    return promise
  }

  /**
   * Cancela todas as requisições pendentes
   */
  cancelAll(): void {
    for (const [key, request] of this.pendingRequests.entries()) {
      request.controller.abort()
      console.debug(`Requisição cancelada: ${key}`)
    }
    this.pendingRequests.clear()
  }

  /**
   * Cancela requisições por padrão de URL
   */
  cancelByPattern(pattern: string): void {
    for (const [key, request] of this.pendingRequests.entries()) {
      if (key.includes(pattern)) {
        request.controller.abort()
        this.pendingRequests.delete(key)
        console.debug(`Requisição cancelada por padrão: ${key}`)
      }
    }
  }

  /**
   * Obtém estatísticas das requisições
   */
  getStats(): { pending: number, keys: string[] } {
    return {
      pending: this.pendingRequests.size,
      keys: Array.from(this.pendingRequests.keys())
    }
  }

  /**
   * Limpa todas as requisições (sem cancelar)
   */
  clear(): void {
    this.pendingRequests.clear()
  }
}

// Instância singleton
export const requestDeduplicator = new RequestDeduplicator()

// Função helper para usar o deduplicator
export const deduplicatedFetch = (url: string, options?: RequestInit) => {
  return requestDeduplicator.fetch(url, options)
}

export default RequestDeduplicator