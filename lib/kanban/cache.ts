import { CacheEntry } from '../types/kanban'

export class KanbanCache {
  private cache = new Map<string, CacheEntry>()
  private readonly defaultTTL = 30000 // 30 segundos
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Limpeza automática a cada 60 segundos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  set(key: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium') {
    const ttl = this.getTTLByPriority(priority)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      priority
    }

    this.cache.set(key, entry)
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar se expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Invalidar cache por padrão regex
  invalidateByPattern(pattern: RegExp) {
    const keysToDelete: string[] = []
    
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    return keysToDelete.length
  }

  // Invalidar cache por prefixo
  invalidateByPrefix(prefix: string) {
    const keysToDelete: string[] = []
    
    for (const [key] of this.cache) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    return keysToDelete.length
  }

  // Invalidação seletiva por tipo de operação
  invalidateTaskRelated() {
    return this.invalidateByPattern(/^(tasks|kanban-cards|user-tasks)/)
  }

  // Invalidação seletiva por colunas
  invalidateColumnRelated() {
    return this.invalidateByPattern(/^(columns|kanban-columns)/)
  }

  // Invalidação inteligente baseada em contexto
  smartInvalidate(context: 'task-update' | 'column-update' | 'user-change' | 'full-refresh') {
    switch (context) {
      case 'task-update':
        return this.invalidateTaskRelated()
      case 'column-update':
        return this.invalidateColumnRelated()
      case 'user-change':
        return this.invalidateByPattern(/^user-/)
      case 'full-refresh':
        this.clear()
        return this.cache.size
      default:
        return 0
    }
  }

  // Atualizar TTL de uma entrada existente
  updateTTL(key: string, newTTL: number): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    entry.ttl = newTTL
    entry.timestamp = Date.now()
    this.cache.set(key, entry)
    return true
  }

  // Obter estatísticas do cache
  getStats() {
    const now = Date.now()
    let expired = 0
    let valid = 0
    const priorityCount = { high: 0, medium: 0, low: 0 }

    for (const [, entry] of this.cache) {
      if (this.isExpired(entry)) {
        expired++
      } else {
        valid++
        priorityCount[entry.priority]++
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      priorityCount,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // Limpeza de entradas expiradas
  private cleanup() {
    const keysToDelete: string[] = []
    
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.debug(`Cache cleanup: removidas ${keysToDelete.length} entradas expiradas`)
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private getTTLByPriority(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high':
        return 120000 // 2 minutos (aumentado)
      case 'medium':
        return 60000 // 1 minuto (aumentado de 30s)
      case 'low':
        return 30000 // 30 segundos (aumentado de 15s)
      default:
        return 60000 // Default aumentado
    }
  }

  private estimateMemoryUsage(): number {
    // Estimativa simples do uso de memória
    let size = 0
    
    for (const [key, entry] of this.cache) {
      size += key.length * 2 // String UTF-16
      size += JSON.stringify(entry.data).length * 2
      size += 32 // Overhead da entrada
    }

    return size
  }

  // Destruir cache e limpar interval
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Instância singleton do cache
export const kanbanCache = new KanbanCache()